import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Lock } from 'lucide-react';
import Ring from '../ui/Ring';
import { fmtClock, TARGET_SECONDS } from '../../lib/run';
import { Metronome, beep, fanfare } from '../../lib/audio';
import { useWakeLock } from '../../lib/useWakeLock';
import { useForge, withSession } from '../../lib/storage';

interface Phase {
  id: number;
  name: string;
  run: number;   // seconds
  walk: number;  // seconds, 0 = no stops
  desc: string;
}

const PHASES: Phase[] = [
  { id: 1, name: 'Phase 1', run: 5 * 60, walk: 60, desc: 'Run 5:00 / walk 60s' },
  { id: 2, name: 'Phase 2', run: 7 * 60, walk: 45, desc: 'Run 7:00 / walk 45s' },
  { id: 3, name: 'Phase 3', run: 10 * 60, walk: 30, desc: 'Run 10:00 / walk 30s' },
  { id: 4, name: 'Phase 4', run: TARGET_SECONDS, walk: 0, desc: 'Full run, no stops' }
];

type Mode = 'run' | 'walk';

/** Derive mode / segment-remaining / cycle deterministically from elapsed.
 *  Makes the timer a pure function of one counter — no nested setState. */
function derive(phase: Phase, elapsed: number): { mode: Mode; remaining: number; cycle: number; done: boolean } {
  if (phase.walk === 0) {
    const remaining = Math.max(0, phase.run - elapsed);
    return { mode: 'run', remaining, cycle: 1, done: elapsed >= phase.run };
  }
  const cycleLen = phase.run + phase.walk;
  const pos = elapsed % cycleLen;
  const cycle = Math.floor(elapsed / cycleLen) + 1;
  if (pos < phase.run) return { mode: 'run', remaining: phase.run - pos, cycle, done: false };
  return { mode: 'walk', remaining: cycleLen - pos, cycle, done: false };
}

export default function IntervalTimer() {
  const { data, update } = useForge();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const phase = PHASES[phaseIdx];

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [metroOn, setMetroOn] = useState(true);

  const runBpm = data.settings.runBpm;
  const walkBpm = data.settings.walkBpm;

  const { mode, remaining, cycle, done } = derive(phase, elapsed);

  const wake = useWakeLock();
  const metro = useRef<Metronome | null>(null);
  if (!metro.current) metro.current = new Metronome();
  const prevMode = useRef<Mode>('run');
  const loggedRef = useRef(false);

  // main 1s tick — only advances the single elapsed counter
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  // audio cue + completion handling whenever the derived mode/done changes
  useEffect(() => {
    if (!running) return;
    if (done) {
      fanfare();
      setRunning(false);
      void wake.release();
      if (!loggedRef.current) {
        loggedRef.current = true;
        update((d) => withSession(d, 'run'));
      }
      return;
    }
    if (mode !== prevMode.current) {
      beep(mode === 'walk' ? 660 : 990, 200);
      prevMode.current = mode;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, done, running]);

  // metronome: run while active, bpm follows the current mode
  useEffect(() => {
    const m = metro.current!;
    if (running && metroOn && !done) {
      m.setBpm(mode === 'run' ? runBpm : walkBpm);
      m.start();
    } else {
      m.stop();
    }
    return () => m.stop();
  }, [running, metroOn, mode, done, runBpm, walkBpm]);

  function start() {
    beep(1200, 1, 0.0001); // unlock audio context on the gesture
    prevMode.current = derive(phase, elapsed).mode;
    if (elapsed === 0) loggedRef.current = false;
    void wake.acquire();
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function reset() {
    setRunning(false);
    setElapsed(0);
    prevMode.current = 'run';
    loggedRef.current = false;
    void wake.release();
  }
  function selectPhase(i: number) {
    setRunning(false);
    setPhaseIdx(i);
    setElapsed(0);
    prevMode.current = 'run';
    loggedRef.current = false;
  }

  const segTotal = mode === 'run' ? phase.run : phase.walk;
  const ringPct = phase.walk === 0 ? elapsed / phase.run : 1 - remaining / segTotal;
  const ringColor = mode === 'run' ? '#e8a14b' : '#5fc48a';
  const display = phase.walk === 0 ? Math.max(0, phase.run - elapsed) : remaining;

  return (
    <div className="space-y-5">
      {/* phase selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => selectPhase(i)}
            className={`shrink-0 rounded-xl px-3 py-2 text-left border transition-colors ${
              i === phaseIdx ? 'border-forge-teal bg-forge-teal/10' : 'border-forge-border bg-forge-panel'
            }`}
          >
            <div className="text-xs font-bold text-white">{p.name}</div>
            <div className="text-[10px] text-forge-dim whitespace-nowrap">{p.desc}</div>
          </button>
        ))}
      </div>

      {/* the ring */}
      <div className="card flex flex-col items-center">
        <Ring pct={Math.max(0, Math.min(1, ringPct))} size={260} stroke={16} color={ringColor}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: ringColor }}>
            {phase.walk === 0 ? 'RUN' : mode.toUpperCase()}
          </div>
          <div className="stat-num text-6xl text-white mt-1">{fmtClock(display)}</div>
          <div className="text-forge-dim text-xs mt-2">
            {phase.walk === 0 ? 'No stops' : `Cycle ${cycle}`} · Total {fmtClock(elapsed)}
          </div>
        </Ring>

        {/* controls */}
        <div className="flex items-center gap-3 mt-4">
          <button className="btn-ghost w-12 h-12 !p-0 rounded-full" onClick={reset} aria-label="Reset">
            <RotateCcw size={20} />
          </button>
          {running ? (
            <button className="btn-primary w-20 h-14 rounded-2xl" onClick={pause}>
              <Pause size={26} />
            </button>
          ) : (
            <button className="btn-primary w-20 h-14 rounded-2xl" onClick={start}>
              <Play size={26} />
            </button>
          )}
          <span
            className={`w-12 h-12 rounded-full flex items-center justify-center border ${
              wake.active ? 'border-forge-green text-forge-green' : 'border-forge-border text-forge-dim'
            }`}
            aria-label="Wake lock status"
          >
            <Lock size={18} />
          </span>
        </div>
        <div className="text-[11px] text-forge-dim mt-2">
          {wake.supported
            ? wake.active
              ? 'Screen stays awake while running'
              : 'Wake lock ready'
            : 'Wake Lock not supported — background audio needs the native wrapper'}
        </div>
      </div>

      {/* metronome */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title text-base">Cadence Metronome</h2>
            <p className="cite">Auto-switches tempo with run/walk · accent every 4th</p>
          </div>
          <button
            onClick={() => setMetroOn((v) => !v)}
            className={`badge ${metroOn ? 'bg-forge-teal/20 text-forge-teal' : 'bg-forge-border text-forge-dim'}`}
          >
            {metroOn ? 'ON' : 'OFF'}
          </button>
        </div>

        <BpmSlider
          label="Run tempo"
          value={runBpm}
          color="#e8a14b"
          active={mode === 'run' && running}
          onChange={(v) => update((d) => ({ ...d, settings: { ...d.settings, runBpm: v } }))}
        />
        <BpmSlider
          label="Walk tempo"
          value={walkBpm}
          color="#5fc48a"
          active={mode === 'walk' && running}
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
        <span className="text-sm text-slate-300 flex items-center gap-2">
          {label}
          {active && <span className="badge text-[10px]" style={{ background: `${color}22`, color }}>live</span>}
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
