import { useState, useSyncExternalStore } from 'react';
import { HeartHandshake, RefreshCw, LogOut, Loader2, Copy } from 'lucide-react';
import {
  syncSubscribe, syncGet, configureSync, clearSyncConfig,
  signUp, signIn, signOut, linkPartner, syncNow
} from '../lib/sync';
import { toast } from '../lib/toast';

/**
 * Couple Sync card (You tab): connect a Supabase project, create an
 * account, link with your partner via invite code. Once linked, the Home
 * feed shows both people's runs with kudos, and your own runs back up
 * across devices. Nutrition stays private on each device.
 */
export default function CoupleSync() {
  const s = useSyncExternalStore(syncSubscribe, syncGet);

  return (
    <div className="card-pad space-y-3">
      <h2 className="font-black flex items-center gap-2">
        <HeartHandshake size={16} className="text-brand" /> Couple sync
      </h2>
      {!s.configured && <ConfigStep />}
      {s.configured && !s.session && <AuthStep />}
      {s.configured && s.session && <AccountStep />}
      {s.error && <p className="text-xs text-bad">{s.error}</p>}
    </div>
  );
}

function ConfigStep() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  return (
    <div className="space-y-3">
      <p className="text-xs text-dim leading-relaxed">
        Share a feed with your partner and back your runs up across devices. One of you creates a
        free <span className="text-ink font-semibold">Supabase</span> project (instructions in the
        project README), then you both paste the same two values here once. Your nutrition diary
        always stays private on your own device.
      </p>
      <input className="input w-full" placeholder="Project URL — https://xxxx.supabase.co" value={url} onChange={(e) => setUrl(e.target.value)} />
      <input className="input w-full" placeholder="Anon public key — eyJ…" value={key} onChange={(e) => setKey(e.target.value)} />
      <button
        className="btn-primary w-full"
        disabled={!url.trim().startsWith('https://') || key.trim().length < 20}
        onClick={() => {
          configureSync(url, key);
          toast('Server connected — now create your account');
        }}
      >
        Connect
      </button>
    </div>
  );
}

function AuthStep() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    const err = mode === 'signup' ? await signUp(email, password, name) : await signIn(email, password);
    setBusy(false);
    if (err) setError(err);
    else if (mode === 'signup') toast('Account created');
  };

  return (
    <div className="space-y-3">
      <div className="card p-1 grid grid-cols-2 gap-1">
        {(['signup', 'signin'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg py-1.5 text-sm font-bold ${mode === m ? 'bg-ink text-white' : 'text-dim'}`}
          >
            {m === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        ))}
      </div>
      {mode === 'signup' && (
        <input className="input w-full" placeholder="Your name (shown on the feed)" value={name} onChange={(e) => setName(e.target.value)} />
      )}
      <input className="input w-full" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input w-full" type="password" placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-xs text-bad">{error}</p>}
      <button className="btn-primary w-full" disabled={busy || !email.includes('@') || password.length < 8} onClick={submit}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>
      <button className="text-[11px] text-faint underline mx-auto block" onClick={clearSyncConfig}>
        Disconnect server
      </button>
    </div>
  );
}

function AccountStep() {
  const s = useSyncExternalStore(syncSubscribe, syncGet);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const link = async () => {
    setBusy(true);
    setError('');
    const err = await linkPartner(code);
    setBusy(false);
    if (err) setError(err);
    else toast('Linked! Your feeds are now shared 🧡');
  };

  return (
    <div className="space-y-3">
      {s.partnerId ? (
        <div className="bg-brand-soft rounded-xl p-3 text-sm">
          <span className="font-bold">Connected with {s.partnerName || 'your partner'}</span>
          <p className="text-xs text-dim mt-0.5">
            You both see each other's runs on Home and can give kudos. Your own runs also back up
            to the server, so a new phone picks up your history after signing in.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-paper rounded-xl p-3 text-center">
            <div className="label mb-1">Your invite code — send it to your partner</div>
            <div className="flex items-center justify-center gap-2">
              <span className="stat-num text-2xl tracking-[0.2em]">{s.myCode || '······'}</span>
              {s.myCode && (
                <button
                  className="text-dim hover:text-ink p-1"
                  aria-label="Copy invite code"
                  onClick={() => {
                    void navigator.clipboard?.writeText(s.myCode);
                    toast('Code copied');
                  }}
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1 uppercase tracking-widest"
              placeholder="Their code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button className="btn-primary" disabled={busy || code.trim().length < 6} onClick={link}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : 'Link'}
            </button>
          </div>
        </>
      )}
      {error && <p className="text-xs text-bad">{error}</p>}
      <div className="flex gap-2">
        <button className="btn-ghost flex-1" onClick={() => void syncNow()} disabled={s.status === 'syncing'}>
          {s.status === 'syncing' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Sync now
        </button>
        <button className="btn-ghost flex-1" onClick={() => void signOut()}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
      <p className="text-[10px] text-faint text-center">
        Signed in as {s.session?.user.email} {s.status === 'error' ? '· last sync failed' : ''}
      </p>
    </div>
  );
}
