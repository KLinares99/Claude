import { useMemo, useState } from 'react';
import { Flame, Plus, ChevronRight } from 'lucide-react';
import { useStore, weekStats, computeStreak, uid, type Activity } from '../lib/storage';
import { fmtClock, paceFor, fmtRelDate, defaultRunName } from '../lib/run';
import RoutePreview from '../components/ui/RoutePreview';
import ActivityDetail from './ActivityDetail';
import { toast } from '../lib/toast';

export default function Home() {
  const { data, update } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);

  const feed = useMemo(
    () => [...data.activities].sort((a, b) => b.date.localeCompare(a.date)),
    [data.activities]
  );
  const week = weekStats(data.activities);
  const streak = computeStreak(data.activities);
  const goal = data.settings.weeklyGoalMiles;
  const open = openId ? data.activities.find((a) => a.id === openId) : null;

  return (
    <>
    <div className="space-y-4">
      {/* weekly snapshot */}
      <div className="card-pad">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-base">This week</h2>
          {streak > 0 && (
            <span className="chip bg-brand-soft text-brand">
              <Flame size={13} /> {streak}-day streak
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <WeekStat label="Distance" value={week.miles.toFixed(1)} unit="mi" />
          <WeekStat label="Time" value={fmtClock(week.seconds)} />
          <WeekStat label="Runs" value={`${week.runs}`} />
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-dim mb-1 nums">
            <span>Weekly goal</span>
            <span>{week.miles.toFixed(1)} / {goal} mi</span>
          </div>
          <div className="h-2 rounded-full bg-paper overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all"
              style={{ width: `${Math.min(1, goal > 0 ? week.miles / goal : 0) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* feed */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-black text-base">Activities</h2>
        <button className="chip bg-card border border-line text-ink" onClick={() => setLogging(true)}>
          <Plus size={14} /> Log manually
        </button>
      </div>

      {feed.length === 0 ? (
        <div className="card-pad text-center py-10">
          <div className="text-3xl mb-2">🏃</div>
          <p className="font-bold">No runs yet</p>
          <p className="text-sm text-dim mt-1">Hit Record below to track your first run with GPS.</p>
        </div>
      ) : (
        feed.map((a) => <ActivityCard key={a.id} a={a} who={data.settings.name} onOpen={() => setOpenId(a.id)} />)
      )}
    </div>

      {/* overlays live outside the space-y container so its sibling
          margins can't offset their fixed positioning */}
      {open && <ActivityDetail activity={open} onClose={() => setOpenId(null)} />}

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

function ActivityCard({ a, who, onOpen }: { a: Activity; who: string; onOpen: () => void }) {
  return (
    <button className="card w-full text-left overflow-hidden" onClick={onOpen}>
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-brand text-white font-black flex items-center justify-center text-sm">
            {who.slice(0, 1).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{who}</div>
            <div className="text-[11px] text-dim">{fmtRelDate(a.date)}</div>
          </div>
          <ChevronRight size={18} className="text-faint" />
        </div>
        <div className="font-black text-lg mt-2.5">{a.name}</div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <CardStat label="Distance" value={`${a.miles.toFixed(2)} mi`} />
          <CardStat label="Pace" value={`${paceFor(a.seconds, a.miles)}/mi`} />
          <CardStat label="Time" value={fmtClock(a.seconds)} />
        </div>
      </div>
      {a.route.length > 1 && (
        <div className="px-4 pb-4">
          <RoutePreview route={a.route} />
        </div>
      )}
    </button>
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
  const [name, setName] = useState(defaultRunName());
  const [miles, setMiles] = useState('');
  const [min, setMin] = useState('');
  const [sec, setSec] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const submit = () => {
    const mi = parseFloat(miles || '0');
    const total = parseInt(min || '0', 10) * 60 + parseInt(sec || '0', 10);
    if (mi <= 0 || total <= 0) return;
    onSave({
      id: uid(),
      date: `${date}T12:00:00`,
      name: name.trim() || 'Run',
      seconds: total,
      miles: +mi.toFixed(2),
      route: [],
      splits: [],
      source: 'manual',
      note: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-[480px] p-5 space-y-4 shadow-sheet"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto sm:hidden" />
        <h2 className="text-lg font-black">Log a run</h2>
        <Field label="Name">
          <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} />
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
