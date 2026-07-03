import { useEffect, useSyncExternalStore } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import Ring from '../components/ui/Ring';
import { fmtClock } from '../lib/run';
import {
  WORKOUTS, intervalSubscribe, intervalGet, intervalStart, intervalPause,
  intervalReset, intervalSelect, intervalToggleMetronome, intervalConfigure
} from '../lib/intervals';
import { useStore } from '../lib/storage';

/** Interval workouts — run/walk cycles with a cadence metronome.
 *  All timing state lives in the global intervals store, so it survives
 *  tab switches (and keeps clicking while you browse the feed). */
export default function Intervals() {
  const s = useSyncExternalStore(intervalSubscribe, intervalGet);
  const { data, update } = useStore();
  const w = WORKOUTS[s.workoutIdx];

  // keep the metronome tempo in sync with settings
  useEffect(() => {
    intervalConfigure(data.settings.runBpm, data.settings.walkBpm);
  }, [data.settings.runBpm, data.settings.walkBpm]);

  const segTotal = s.mode === 'run' ? w.run : w.walk;
  const ringPct = w.walk === 0 ? s.elapsed / w.run : 1 - s.remaining / Math.max(1, segTotal);
  const ringColor = s.mode === 'run' ? '#FC4C02' : '#16A34A';
  const display = w.walk === 0 ? Math.max(0, w.run - s.elapsed) : s.remaining;

  return (
    <div className="space-y-4">
      {/* workout selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {WORKOUTS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => intervalSelect(i)}
            className={`shrink-0 rounded-xl px-3 py-2 text-left border transition-colors ${
              i === s.workoutIdx ? 'border-brand bg-brand-soft' : 'border-line bg-card'
            }`}
          >
            <div className="text-xs font-bold">{p.name}</div>
            <div className="text-[10px] text-dim whitespace-nowrap">{p.desc}</div>
          </button>
        ))}
      </div>

      {/* the ring */}
      <div className="card-pad flex flex-col items-center py-6">
        <Ring pct={Math.max(0, Math.min(1, ringPct))} size={240} stroke={14} color={ringColor} track="#EFEDE8">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: ringColor }}>
            {s.done ? 'DONE' : w.walk === 0 ? 'RUN' : s.mode.toUpperCase()}
          </div>
          <div className="stat-num text-5xl mt-1">{fmtClock(display)}</div>
          <div className="text-dim text-xs mt-2 nums">
            {w.walk === 0 ? 'No stops' : `Cycle ${s.cycle}`} · Total {fmtClock(s.elapsed)}
          </div>
        </Ring>

        <div className="flex items-center gap-3 mt-5">
          <button className="btn-ghost w-12 h-12 !p-0 rounded-full" onClick={intervalReset} aria-label="Reset">
            <RotateCcw size={20} />
          </button>
          {s.running ? (
            <button className="btn-primary w-20 h-14 rounded-2xl" onClick={intervalPause} aria-label="Pause">
              <Pause size={26} fill="currentColor" />
            </button>
          ) : (
            <button className="btn-primary w-20 h-14 rounded-2xl" onClick={intervalStart} aria-label="Start" disabled={s.done}>
              <Play size={26} fill="currentColor" />
            </button>
          )}
          <span className="w-12 h-12" />
        </div>
      </div>

      {/* metronome */}
      <div className="card-pad space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">Cadence metronome</h2>
            <p className="text-xs text-dim">Auto-switches tempo with run / walk</p>
          </div>
          <button
            onClick={intervalToggleMetronome}
            className={`chip ${s.metronomeOn ? 'bg-brand-soft text-brand' : 'bg-paper text-dim'}`}
          >
            {s.metronomeOn ? 'ON' : 'OFF'}
          </button>
        </div>

        <BpmSlider
          label="Run tempo"
          value={data.settings.runBpm}
          color="#FC4C02"
          active={s.mode === 'run' && s.running}
          onChange={(v) => update((d) => ({ ...d, settings: { ...d.settings, runBpm: v } }))}
        />
        <BpmSlider
          label="Walk tempo"
          value={data.settings.walkBpm}
          color="#16A34A"
          active={s.mode === 'walk' && s.running}
          onChange={(v) => update((d) => ({ ...d, settings: { ...d.settings, walkBpm: v } }))}
        />
      </div>
    </div>
  );
}

function BpmSlider({
  label, value, color, active, onChange
}: { label: string; value: number; color: string; active: boolean; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-ink flex items-center gap-2">
          {label}
          {active && <span className="chip text-[10px]" style={{ background: `${color}1a`, color }}>live</span>}
        </span>
        <span className="stat-num text-sm" style={{ color }}>{value} spm</span>
      </div>
      <input
        type="range"
        min={120}
        max={200}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full"
        style={{ accentColor: color }}
      />
    </div>
  );
}
