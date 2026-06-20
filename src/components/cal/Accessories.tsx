import { useState } from 'react';
import { Minus, Plus, Check, Trophy } from 'lucide-react';
import { useForge, withSession, todayISO } from '../../lib/storage';
import { accessories, type Accessory } from '../../data/calisthenics';
import { nodeState } from '../../lib/cal';
import { fmtClock } from '../../lib/run';

export default function Accessories() {
  const { data } = useForge();
  return (
    <div className="space-y-3">
      <p className="text-sm text-forge-dim px-1">
        Balance loggers — keep push and pull in proportion. Same logic as the running-economy table:
        track the supporting work so nothing dominates.
      </p>
      {accessories.map((a) => (
        <AccessoryRow
          key={a.id}
          accessory={a}
          best={a.maxKey ? data.cal.maxes[a.maxKey] : lastLog(data.cal.nodes[a.id]?.logs)}
        />
      ))}
    </div>
  );
}

function lastLog(logs?: { value: number }[]): number {
  if (!logs || logs.length === 0) return 0;
  return Math.max(...logs.map((l) => l.value));
}

function AccessoryRow({ accessory, best }: { accessory: Accessory; best: number }) {
  const { update } = useForge();
  const [open, setOpen] = useState(false);
  const isHold = accessory.tool === 'hold';
  const [val, setVal] = useState(isHold ? 20 : 8);

  function log() {
    update((d) => {
      const cur = d.cal.nodes[accessory.id] ?? { logs: [], mastered: false };
      cur.logs = [...cur.logs, { date: todayISO(), value: val }];
      d.cal.nodes[accessory.id] = cur;
      if (accessory.maxKey && val > d.cal.maxes[accessory.maxKey]) {
        d.cal.maxes[accessory.maxKey] = val;
      }
      return withSession(d, 'cal');
    });
    setOpen(false);
  }

  return (
    <div className="card-tight">
      <button className="w-full flex items-center justify-between" onClick={() => setOpen((o) => !o)}>
        <div className="text-left">
          <div className="font-bold text-white text-sm flex items-center gap-2">
            {accessory.name}
            <span className="badge text-[10px] bg-forge-border text-forge-dim capitalize">{accessory.category}</span>
          </div>
          <div className="cite mt-0.5">{accessory.citation}</div>
        </div>
        {best > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-forge-gold">
              <Trophy size={13} />
              <span className="stat-num text-sm">{isHold ? fmtClock(best) : best}</span>
            </div>
            <div className="text-[10px] text-forge-dim">{accessory.maxKey ? 'all-time max' : 'best'}</div>
          </div>
        )}
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-forge-border space-y-3">
          <p className="text-xs text-forge-dim">{accessory.note}</p>
          <div className="flex items-center justify-center gap-4">
            <button className="w-11 h-11 rounded-full bg-forge-panel2 border border-forge-border flex items-center justify-center" onClick={() => setVal((v) => Math.max(0, v - (isHold ? 5 : 1)))}>
              <Minus size={20} />
            </button>
            <div className="text-center w-20">
              <div className="stat-num text-3xl text-white">{isHold ? fmtClock(val) : val}</div>
              <div className="text-[10px] text-forge-dim">{isHold ? 'hold' : 'reps'}</div>
            </div>
            <button className="w-11 h-11 rounded-full bg-forge-panel2 border border-forge-border flex items-center justify-center" onClick={() => setVal((v) => v + (isHold ? 5 : 1))}>
              <Plus size={20} />
            </button>
          </div>
          <button className="btn-primary w-full" onClick={log}>
            <Check size={18} /> Log
          </button>
        </div>
      )}
    </div>
  );
}
