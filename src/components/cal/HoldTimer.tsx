import { useEffect, useRef, useState } from 'react';
import { Play, Square, Check, Lock } from 'lucide-react';
import Ring from '../ui/Ring';
import { fmtClock } from '../../lib/run';
import { fanfare, beep } from '../../lib/audio';
import { useWakeLock } from '../../lib/useWakeLock';

export default function HoldTimer({
  target,
  onLog
}: {
  target: number;
  onLog: (value: number) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(0);
  const wake = useWakeLock();
  const hitTarget = useRef(false);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next === target && !hitTarget.current) {
          hitTarget.current = true;
          fanfare();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, target]);

  function start() {
    hitTarget.current = false;
    setElapsed(0);
    setRunning(true);
    beep(1200, 1, 0.0001); // unlock audio
    void wake.acquire();
  }

  function stop() {
    setRunning(false);
    void wake.release();
    setBest((b) => Math.max(b, elapsed));
  }

  const pct = Math.min(1, elapsed / target);
  const reached = elapsed >= target;
  const loggable = best > 0 || elapsed > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <Ring pct={pct} size={220} stroke={14} color={reached ? '#5fc48a' : '#37b6c4'}>
        <div className="stat-num text-5xl text-white">{fmtClock(elapsed)}</div>
        <div className="text-xs text-forge-dim mt-1">target {fmtClock(target)}</div>
        {best > 0 && <div className="text-[11px] text-forge-gold mt-1 nums">best {fmtClock(best)}</div>}
      </Ring>

      <div className="flex items-center gap-3">
        {running ? (
          <button className="btn-primary w-32" onClick={stop}>
            <Square size={18} /> Stop
          </button>
        ) : (
          <button className="btn-primary w-32" onClick={start}>
            <Play size={18} /> Hold
          </button>
        )}
        <span
          className={`w-11 h-11 rounded-full flex items-center justify-center border ${
            wake.active ? 'border-forge-green text-forge-green' : 'border-forge-border text-forge-dim'
          }`}
        >
          <Lock size={16} />
        </span>
      </div>

      <button
        className="btn-ghost w-full disabled:opacity-40"
        disabled={running || !loggable}
        onClick={() => onLog(Math.max(best, elapsed))}
      >
        <Check size={18} /> Log {fmtClock(Math.max(best, elapsed))} hold
      </button>
    </div>
  );
}
