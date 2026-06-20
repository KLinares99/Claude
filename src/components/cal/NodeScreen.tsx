import { ChevronLeft, Target, FlaskConical, CheckCircle2 } from 'lucide-react';
import { useForge, withSession, todayISO } from '../../lib/storage';
import { nodeState, qualifyingSessions, isMastered } from '../../lib/cal';
import type { SkillNode } from '../../data/calisthenics';
import { fmtClock } from '../../lib/run';
import RepLogger from './RepLogger';
import HoldTimer from './HoldTimer';

export default function NodeScreen({
  node,
  treeName,
  onBack
}: {
  node: SkillNode;
  treeName: string;
  onBack: () => void;
}) {
  const { data, update } = useForge();
  const st = nodeState(data, node.id);
  const mastered = isMastered(data, node);
  const qualifying = qualifyingSessions(st, node);

  function log(value: number) {
    update((d) => {
      const cur = d.cal.nodes[node.id] ?? { logs: [], mastered: false };
      cur.logs = [...cur.logs, { date: todayISO(), value }];
      const q = cur.logs.filter((l) => l.value >= node.target).length;
      if (!cur.mastered && q >= node.sessions) {
        cur.mastered = true;
        cur.masteredDate = todayISO();
      }
      d.cal.nodes[node.id] = cur;
      return withSession(d, 'cal');
    });
  }

  const fmtVal = (v: number) => (node.tool === 'hold' ? fmtClock(v) : `${v} reps`);

  return (
    <div className="space-y-4">
      <button className="flex items-center gap-1 text-forge-dim text-sm" onClick={onBack}>
        <ChevronLeft size={18} /> {treeName}
      </button>

      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-white">{node.name}</h2>
        {mastered && <CheckCircle2 size={22} className="text-forge-gold" />}
      </div>

      {/* mastery progress */}
      <div className="card-tight">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Sessions at target</span>
          <span className="stat-num text-sm text-forge-teal">
            {Math.min(qualifying, node.sessions)}/{node.sessions}
          </span>
        </div>
        <div className="h-2 rounded-full bg-forge-bg overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(1, qualifying / node.sessions) * 100}%`,
              background: mastered ? '#f2c46a' : '#37b6c4'
            }}
          />
        </div>
        {mastered && <div className="text-xs text-forge-gold mt-2">Mastered — next node unlocked 🏆</div>}
      </div>

      {/* the tool */}
      <div className="card">
        {node.tool === 'reps' ? (
          <RepLogger target={node.target} onLog={log} />
        ) : (
          <HoldTimer target={node.target} onLog={log} />
        )}
      </div>

      {/* graduation threshold */}
      <div className="card-tight flex gap-3">
        <Target size={20} className="text-forge-teal shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-white">To graduate</div>
          <div className="text-sm text-forge-dim">{node.threshold}</div>
        </div>
      </div>

      {/* science note */}
      <div className="card-tight flex gap-3">
        <FlaskConical size={20} className="text-forge-orange shrink-0 mt-0.5" />
        <div>
          <div className="text-sm text-slate-300">{node.science}</div>
          <div className="cite mt-1">— {node.citation}</div>
        </div>
      </div>

      {/* history */}
      <div className="card">
        <h3 className="section-title text-base mb-3">Log history</h3>
        {st.logs.length === 0 ? (
          <p className="text-sm text-forge-dim">No entries yet. Log your first set above.</p>
        ) : (
          <div className="space-y-1.5">
            {[...st.logs].reverse().map((l, i) => (
              <div key={i} className="flex items-center justify-between text-sm rounded-lg px-3 py-2 bg-forge-bg/40 border border-forge-border">
                <span className="text-forge-dim">{l.date}</span>
                <span
                  className="stat-num"
                  style={{ color: l.value >= node.target ? '#5fc48a' : '#e2e8f0' }}
                >
                  {fmtVal(l.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
