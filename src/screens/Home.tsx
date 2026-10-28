import { useMemo, useState, useSyncExternalStore } from 'react';
import { Flame, Plus, ChevronRight, Heart, Dumbbell, Footprints } from 'lucide-react';
import {
  useStore, weekStats, weekByDay, computeStreak, uid,
  type Activity
} from '../lib/storage';
import { syncSubscribe, syncGet, toggleKudos } from '../lib/sync';
import { logVolume, totalSets, intensityOf, type WorkoutLog } from '../lib/training';
import { fmtClock, fmtRelDate, defaultRunName, SPORTS, sportOf, effortStat, type Sport } from '../lib/run';
import RoutePreview from '../components/ui/RoutePreview';
import SportIcon from '../components/ui/SportIcon';
import Segmented from '../components/ui/Segmented';
import QuoteOfDay from '../components/QuoteOfDay';
import WhatsNew from '../components/WhatsNew';
import ActivityDetail from './ActivityDetail';
import { toast } from '../lib/toast';

type FeedItem = {
  who: string;
  ownerId: string;   // '' when not signed in
  isRemote: boolean; // partner's or a friend's
  date: string;
} & ({ kind: 'run'; a: Activity } | { kind: 'lift'; w: WorkoutLog });

export default function Home() {
  const { data, update } = useStore();
  const sync = useSyncExternalStore(syncSubscribe, syncGet);
  const [open, setOpen] = useState<{ id: string; remote: boolean } | null>(null);
  const [logging, setLogging] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const myId = sync.session?.user.id ?? '';
  const feed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    for (const a of data.activities) {
      items.push({ kind: 'run', a, who: data.settings.name, ownerId: myId, isRemote: false, date: a.date });
    }
    for (const w of data.training.logs) {
      items.push({ kind: 'lift', w, who: data.settings.name, ownerId: myId, isRemote: false, date: w.date });
    }
    for (const a of [...sync.partnerActivities, ...sync.friendActivities]) {
      items.push({ kind: 'run', a, who: a.ownerName, ownerId: a.ownerId, isRemote: true, date: a.date });
    }
    for (const w of sync.friendWorkouts) {
      items.push({ kind: 'lift', w, who: w.ownerName, ownerId: w.ownerId, isRemote: true, date: w.date });
    }
    return items.sort((x, y) => y.date.localeCompare(x.date));
  }, [data.activities, data.training.logs, data.settings.name, sync.partnerActivities, sync.friendActivities, sync.friendWorkouts, myId]);

  const week = weekStats(data.activities);
  const days = weekByDay(data.activities);
  const maxDayMiles = Math.max(...days.map((d) => d.miles), 1);
  const streak = computeStreak(data.activities);
  const goal = data.settings.weeklyGoalMiles;
  const openItem = open
    ? open.remote
      ? [...sync.partnerActivities, ...sync.friendActivities].find((a) => a.id === open.id)
      : data.activities.find((a) => a.id === open.id)
    : null;

  return (
    <>
    <div className="space-y-4">
      {/* release notes — shows once after each update */}
      <WhatsNew />

      {/* quote / tip of the day — inline, once per day, dismissible */}
      <QuoteOfDay />

      {/* weekly snapshot */}
      <div className="card-pad">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold">This Week</h2>
          {streak > 0 && (
            <span className="chip bg-brand-soft text-brand">
              <Flame size={13} /> {streak}-day streak
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <WeekStat label="Distance" value={week.miles.toFixed(1)} unit="mi" />
          <WeekStat label="Time" value={fmtClock(week.seconds)} />
          <WeekStat label="Activities" value={`${week.runs}`} />
        </div>

        {/* 7-day strip — per-day mileage, today highlighted */}
        <div className="grid grid-cols-7 gap-1.5 mt-4">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-full h-16 rounded-lg bg-fill flex items-end overflow-hidden">
                {d.miles > 0 && (
                  <div
                    className="w-full bg-brand rounded-lg transition-all"
                    style={{ height: `${Math.max(14, (d.miles / maxDayMiles) * 100)}%` }}
                    title={`${d.miles.toFixed(1)} mi`}
                  />
                )}
              </div>
              <span
                className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold ${
                  d.isToday ? 'bg-ink text-white' : d.isFuture ? 'text-faint' : 'text-dim'
                }`}
              >
                {d.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-[13px] text-dim mb-1.5 nums">
            <span>Weekly goal</span>
            <span>{week.miles.toFixed(1)} / {goal} mi</span>
          </div>
          <div className="h-1.5 rounded-full bg-fill overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all"
              style={{ width: `${Math.min(1, goal > 0 ? week.miles / goal : 0) * 100}%` }}
            />
          </div>
        </div>

          {/* weekly progress note */}
          {week.runs > 0 && (
            <p className="text-[13px] text-dim mt-2">{weeklyNudge(week.miles, goal, week.runs)}</p>
          )}
      </div>

      {/* feed */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-[20px] font-bold">Activities</h2>
        <button className="flex items-center gap-1 text-[15px] font-medium text-brand active:opacity-60" onClick={() => setLogging(true)}>
          <Plus size={18} /> Log Manually
        </button>
      </div>

      {feed.length === 0 ? (
        <div className="card-pad text-center py-8">
          <span className="w-14 h-14 rounded-full bg-fill text-dim flex items-center justify-center mx-auto mb-3">
            <Footprints size={26} />
          </span>
          <p className="font-semibold">No Activities Yet</p>
          <p className="text-sm text-dim mt-1">Tap Record to track your first run with GPS.</p>
        </div>
      ) : (
        feed.map((item) => {
          const itemId = item.kind === 'run' ? item.a.id : item.w.id;
          const key = `${item.ownerId}:${itemId}`;
          const hearts = sync.kudos[key] ?? [];
          const onHeart = () => {
            if (!item.ownerId) return;
            // celebrate only when giving kudos, not taking it back
            if (!(myId && hearts.includes(myId))) {
              setCelebrate(true);
              window.setTimeout(() => setCelebrate(false), 1400);
            }
            toggleKudos(item.ownerId, itemId);
          };
          const kudosProps = {
            hearts: hearts.length,
            iHearted: !!myId && hearts.includes(myId),
            canHeart: !!myId && item.isRemote,
            onHeart
          };
          return item.kind === 'run' ? (
            <ActivityCard
              key={`${item.isRemote ? 'r' : 'm'}-${itemId}`}
              a={item.a}
              who={item.who}
              photo={item.isRemote ? '' : data.settings.photo}
              isPartner={item.isRemote}
              {...kudosProps}
              onOpen={() => setOpen({ id: item.a.id, remote: item.isRemote })}
            />
          ) : (
            <WorkoutCard
              key={`${item.isRemote ? 'r' : 'm'}-${itemId}`}
              w={item.w}
              who={item.who}
              photo={item.isRemote ? '' : data.settings.photo}
              isPartner={item.isRemote}
              {...kudosProps}
            />
          );
        })
      )}
    </div>

      {/* overlays live outside the space-y container so its sibling
          margins can't offset their fixed positioning */}
      {celebrate && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center pointer-events-none">
          <div className="kudos-pop">
            <Heart size={120} className="text-brand" fill="currentColor" strokeWidth={1.5} />
          </div>
        </div>
      )}

      {openItem && (
        <ActivityDetail activity={openItem} readOnly={open?.remote} onClose={() => setOpen(null)} />
      )}

      {logging && (
        <ManualLogSheet
          onClose={() => setLogging(false)}
          onSave={(a) => {
            update((d) => {
              d.activities.push(a);
              return d;
            });
            setLogging(false);
            toast(`${a.name} logged — ${a.miles.toFixed(2)} mi`);
          }}
        />
      )}
    </>
  );
}

/** Short encouragement based on the week's progress. */
function weeklyNudge(miles: number, goal: number, runs: number): string {
  if (goal > 0 && miles >= goal) return `Weekly goal reached — ${miles.toFixed(1)} mi.`;
  if (goal > 0 && miles >= goal * 0.7) return `${(goal - miles).toFixed(1)} mi to your weekly goal.`;
  if (runs >= 3) return `${runs} activities this week. Keep it going.`;
  if (runs === 2) return 'Two activities down. Keep the rhythm.';
  return 'Good start to the week.';
}

function WeekStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="stat-num text-xl mt-0.5">
        {value}
        {unit && <span className="text-dim text-xs font-bold"> {unit}</span>}
      </div>
    </div>
  );
}

function ActivityCard({
  a, who, photo, isPartner, hearts, iHearted, canHeart, onHeart, onOpen
}: {
  a: Activity;
  who: string;
  photo?: string;
  isPartner: boolean;
  hearts: number;
  iHearted: boolean;
  canHeart: boolean;
  onHeart: () => void;
  onOpen: () => void;
}) {
  return (
    <button className="card card-in w-full text-left overflow-hidden" onClick={onOpen}>
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2.5">
          {photo ? (
            <img src={photo} alt={who} className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <span
              className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm shrink-0 ${
                isPartner ? 'bg-ink text-white' : 'bg-brand text-white'
              }`}
            >
              {who.slice(0, 1).toUpperCase() || 'R'}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{who}</div>
            <div className="text-[13px] text-dim">{fmtRelDate(a.date)}</div>
          </div>
          {(a.sport ?? 'run') !== 'run' && (
            <span className="chip bg-brand-soft text-brand shrink-0">
              <SportIcon sport={a.sport ?? 'run'} size={12} /> {sportOf(a.sport).label}
            </span>
          )}
          <ChevronRight size={18} className="text-faint" />
        </div>
        <div className="font-semibold text-[17px] mt-2.5">{a.name}</div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <CardStat label="Distance" value={`${a.miles.toFixed(2)} mi`} />
          <CardStat
            label={effortStat(a.sport ?? 'run', a.seconds, a.miles).label}
            value={`${effortStat(a.sport ?? 'run', a.seconds, a.miles).value}${effortStat(a.sport ?? 'run', a.seconds, a.miles).unit === 'mph' ? ' mph' : '/mi'}`}
          />
          <CardStat label="Time" value={fmtClock(a.seconds)} />
        </div>
      </div>
      {a.route.length > 1 && (
        <div className="px-4 pb-3">
          <RoutePreview route={a.route} height={120} />
        </div>
      )}
      <KudosRow hearts={hearts} iHearted={iHearted} canHeart={canHeart} onHeart={onHeart} />
    </button>
  );
}

/** Heart pill under a feed card — interactive for others' items, and a
 *  read-only count of received hearts on your own. */
function KudosRow({
  hearts, iHearted, canHeart, onHeart
}: { hearts: number; iHearted: boolean; canHeart: boolean; onHeart: () => void }) {
  if (!canHeart && hearts === 0) return null;
  return (
    <div className="px-4 pb-3 flex items-center gap-2">
      <span
        role={canHeart ? 'button' : undefined}
        aria-label={canHeart ? (iHearted ? 'Remove kudos' : 'Give kudos') : `${hearts} kudos received`}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
          iHearted || (!canHeart && hearts > 0)
            ? 'bg-brand-soft text-brand'
            : 'bg-fill text-dim'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (canHeart) onHeart();
        }}
      >
        <Heart size={14} fill={iHearted || (!canHeart && hearts > 0) ? 'currentColor' : 'none'} />
        {hearts > 0 ? hearts : 'Kudos'}
      </span>
    </div>
  );
}

/** A logged lift session in the feed — sets, volume, time + exercise list. */
function WorkoutCard({
  w, who, photo, isPartner, hearts, iHearted, canHeart, onHeart
}: {
  w: WorkoutLog;
  who: string;
  photo?: string;
  isPartner: boolean;
  hearts: number;
  iHearted: boolean;
  canHeart: boolean;
  onHeart: () => void;
}) {
  const names = w.exercises.map((e) => e.name);
  return (
    <div className="card card-in w-full text-left overflow-hidden">
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2.5">
          {photo ? (
            <img src={photo} alt={who} className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <span
              className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm shrink-0 ${
                isPartner ? 'bg-ink text-white' : 'bg-brand text-white'
              }`}
            >
              {who.slice(0, 1).toUpperCase() || 'R'}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{who}</div>
            <div className="text-[13px] text-dim">{fmtRelDate(w.date)}</div>
          </div>
          <span className="chip bg-brand-soft text-brand shrink-0">
            <Dumbbell size={12} /> Lift
          </span>
        </div>
        <div className="font-semibold text-[17px] mt-2.5 flex items-center gap-2">
          <span className="truncate">{w.name}</span>
          {intensityOf(w.intensity) && (
            <span className="shrink-0 text-[11px] font-semibold text-brand bg-brand-soft rounded-full px-2 py-0.5">
              {intensityOf(w.intensity)?.label} · {intensityOf(w.intensity)?.rpe}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <CardStat label="Sets" value={`${totalSets(w)}`} />
          <CardStat label="Volume" value={`${logVolume(w).toLocaleString()} lb`} />
          <CardStat label="Time" value={fmtClock(w.seconds)} />
        </div>
        {names.length > 0 && (
          <p className="text-xs text-dim mt-2 truncate">
            {names.slice(0, 4).join(' · ')}{names.length > 4 ? ` · +${names.length - 4} more` : ''}
          </p>
        )}
      </div>
      <KudosRow hearts={hearts} iHearted={iHearted} canHeart={canHeart} onHeart={onHeart} />
    </div>
  );
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="stat-num text-base mt-0.5">{value}</div>
    </div>
  );
}

function ManualLogSheet({ onClose, onSave }: { onClose: () => void; onSave: (a: Activity) => void }) {
  const [sport, setSport] = useState<Sport>('run');
  const [name, setName] = useState(defaultRunName());
  const [nameTouched, setNameTouched] = useState(false);
  const [miles, setMiles] = useState('');
  const [min, setMin] = useState('');
  const [sec, setSec] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const pickSport = (sp: Sport) => {
    setSport(sp);
    // keep the default name in step with the sport until the user edits it
    if (!nameTouched) setName(defaultRunName(new Date(), sp));
  };

  const submit = () => {
    const mi = parseFloat(miles || '0');
    const total = parseInt(min || '0', 10) * 60 + parseInt(sec || '0', 10);
    if (mi <= 0 || total <= 0) return;
    onSave({
      id: uid(),
      date: `${date}T12:00:00`,
      name: name.trim() || sportOf(sport).verb,
      sport,
      seconds: total,
      miles: +mi.toFixed(2),
      route: [],
      splits: [],
      source: 'manual',
      note: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/25 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="glass-sheet rounded-t-[32px] sm:rounded-[32px] w-full max-w-[480px] p-5 space-y-4"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-[5px] rounded-full bg-faint/60 mx-auto sm:hidden" />
        <h2 className="text-[17px] font-semibold text-center">Log Activity</h2>
        <Segmented
          value={sport}
          onChange={pickSport}
          options={SPORTS.map((sp) => ({ id: sp.id, label: <><SportIcon sport={sp.id} /> {sp.label}</> }))}
        />
        <Field label="Name">
          <input className="input w-full" value={name} onChange={(e) => { setName(e.target.value); setNameTouched(true); }} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Distance (mi)">
            <input className="input w-full" inputMode="decimal" placeholder="3.1" value={miles} onChange={(e) => setMiles(e.target.value)} />
          </Field>
          <Field label="Date">
            <input className="input w-full" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Time">
          <div className="flex items-center gap-2">
            <input className="input w-20 text-center" inputMode="numeric" placeholder="32" value={min} onChange={(e) => setMin(e.target.value)} />
            <span className="text-dim font-bold">:</span>
            <input className="input w-20 text-center" inputMode="numeric" placeholder="00" value={sec} onChange={(e) => setSec(e.target.value)} />
            <span className="text-xs text-dim">min : sec</span>
          </div>
        </Field>
        <div className="flex gap-2 pt-1">
          <button className="btn-primary flex-1" onClick={submit}>Save</button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label block mb-1">{label}</span>
      {children}
    </label>
  );
}
