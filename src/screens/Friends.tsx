import { useState, useSyncExternalStore } from 'react';
import { Users, AtSign, UserPlus, UserMinus, Loader2, Copy, Check } from 'lucide-react';
import { syncSubscribe, syncGet, setUsername, followUser, unfollowUser } from '../lib/sync';
import { toast } from '../lib/toast';

/**
 * Friends card (You tab) — claim a @username, follow people by theirs, and
 * see who follows you. Followed friends' runs and workouts show up in your
 * Home feed with kudos. Needs an account (Couple sync card) first.
 */
export default function Friends() {
  const s = useSyncExternalStore(syncSubscribe, syncGet);
  if (!s.configured || !s.session) return null;

  return (
    <div className="card-pad space-y-3">
      <h2 className="font-black flex items-center gap-2">
        <Users size={16} className="text-brand" /> Friends
      </h2>
      {!s.friendsReady ? (
        <p className="text-xs text-dim leading-relaxed">
          The server needs a one-time upgrade for friends: open your Supabase dashboard →
          SQL Editor and run <span className="font-semibold text-ink">supabase/schema_v2_friends.sql</span>{' '}
          from the project (it adds usernames, follows and workout sharing). Then pull to refresh here.
        </p>
      ) : (
        <>
          <UsernameRow current={s.myUsername} />
          {s.myUsername && <FollowRow />}
          {s.following.length > 0 && (
            <div>
              <div className="label mb-1">Following ({s.following.length})</div>
              <div className="divide-y divide-line">
                {s.following.map((f) => (
                  <div key={f.id} className="py-2 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-ink text-white font-black text-xs flex items-center justify-center shrink-0">
                      {f.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{f.name}</div>
                      {f.username && <div className="text-[11px] text-dim">@{f.username}</div>}
                    </div>
                    <button
                      className="chip bg-paper text-dim border border-line hover:text-bad"
                      onClick={() => {
                        if (confirm(`Unfollow ${f.name}? Their runs and workouts leave your feed.`)) {
                          void unfollowUser(f.id);
                        }
                      }}
                    >
                      <UserMinus size={13} /> Unfollow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {s.followers.length > 0 && (
            <p className="text-xs text-dim">
              <span className="font-bold text-ink">{s.followers.length} follower{s.followers.length === 1 ? '' : 's'}:</span>{' '}
              {s.followers.map((f) => f.username ? `@${f.username}` : f.name).join(', ')} — they see your runs and workouts in their feed.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function UsernameRow({ current }: { current: string }) {
  const [editing, setEditing] = useState(!current);
  const [value, setValue] = useState(current);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const err = await setUsername(value);
    setBusy(false);
    if (err) toast(err);
    else {
      toast(`You're @${value.toLowerCase().trim()} — share it with friends!`);
      setEditing(false);
    }
  };

  if (!editing && current) {
    return (
      <div className="bg-paper rounded-xl p-3 flex items-center gap-2">
        <AtSign size={16} className="text-brand shrink-0" />
        <span className="flex-1 text-sm font-black">@{current}</span>
        <button
          className="text-dim hover:text-ink p-1"
          aria-label="Copy username"
          onClick={() => { void navigator.clipboard?.writeText(`@${current}`); toast('Username copied'); }}
        >
          <Copy size={15} />
        </button>
        <button className="text-[11px] font-bold text-dim hover:text-ink" onClick={() => { setValue(current); setEditing(true); }}>
          Change
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="label mb-1">Claim your username</div>
      <div className="flex gap-2">
        <div className="input flex-1 flex items-center gap-1 !py-0">
          <AtSign size={14} className="text-faint shrink-0" />
          <input
            className="flex-1 bg-transparent py-2 focus:outline-none lowercase"
            placeholder="yourname"
            value={value}
            maxLength={20}
            onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          />
        </div>
        <button className="btn-primary" disabled={busy || value.trim().length < 3} onClick={() => void save()}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
        </button>
      </div>
      <p className="text-[11px] text-faint mt-1">3–20 characters — letters, numbers, underscore. Friends follow you with this.</p>
    </div>
  );
}

function FollowRow() {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const follow = async () => {
    setBusy(true);
    const err = await followUser(value);
    setBusy(false);
    if (err) toast(err);
    else {
      toast(`Following @${value.replace(/^@/, '').toLowerCase()} 🎉`);
      setValue('');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        className="input flex-1 lowercase"
        placeholder="Follow a friend — @username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && value.trim().length >= 3) void follow(); }}
      />
      <button className="btn-primary" disabled={busy || value.trim().replace(/^@/, '').length < 3} onClick={() => void follow()}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Follow
      </button>
    </div>
  );
}
