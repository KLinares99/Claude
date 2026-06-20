import { useState } from 'react';
import { Minus, Plus, Check } from 'lucide-react';

export default function RepLogger({
  target,
  onLog
}: {
  target: number;
  onLog: (value: number) => void;
}) {
  const [reps, setReps] = useState(target);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-5">
        <button
          className="w-14 h-14 rounded-full bg-forge-panel2 border border-forge-border flex items-center justify-center active:scale-95"
          onClick={() => setReps((r) => Math.max(0, r - 1))}
          aria-label="Fewer reps"
        >
          <Minus size={24} />
        </button>
        <div className="text-center w-24">
          <div className="stat-num text-6xl text-white">{reps}</div>
          <div className="text-xs text-forge-dim">reps · best set</div>
        </div>
        <button
          className="w-14 h-14 rounded-full bg-forge-panel2 border border-forge-border flex items-center justify-center active:scale-95"
          onClick={() => setReps((r) => r + 1)}
          aria-label="More reps"
        >
          <Plus size={24} />
        </button>
      </div>
      <button className="btn-primary w-full" onClick={() => onLog(reps)}>
        <Check size={18} /> Log {reps} reps
      </button>
    </div>
  );
}
