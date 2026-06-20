import { ChevronLeft, Lock, CircleDot, CheckCircle2, ChevronRight } from 'lucide-react';
import { useForge } from '../../lib/storage';
import { treeStatuses } from '../../lib/cal';
import type { SkillTree, SkillNode } from '../../data/calisthenics';
import { fmtClock } from '../../lib/run';

export default function TreeView({
  tree,
  onBack,
  onOpenNode
}: {
  tree: SkillTree;
  onBack: () => void;
  onOpenNode: (node: SkillNode) => void;
}) {
  const { data } = useForge();
  const statuses = treeStatuses(data, tree);

  return (
    <div className="space-y-4">
      <button className="flex items-center gap-1 text-forge-dim text-sm" onClick={onBack}>
        <ChevronLeft size={18} /> All skills
      </button>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tree.icon}</span>
          <h2 className="text-2xl font-black text-white">{tree.name}</h2>
        </div>
        <p className="text-sm text-forge-dim mt-1">{tree.blurb}</p>
        <p className="cite mt-2">{tree.gate}</p>
      </div>

      {/* vertical ladder */}
      <div className="relative pl-1">
        {tree.nodes.map((node, i) => {
          const status = statuses[node.id];
          const last = i === tree.nodes.length - 1;
          const target = node.tool === 'hold' ? fmtClock(node.target) : `${node.target} reps`;
          const color =
            status === 'mastered' ? '#f2c46a' : status === 'current' ? '#37b6c4' : '#3a4f57';
          return (
            <div key={node.id} className="flex gap-3">
              {/* rail + dot */}
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0"
                  style={{ borderColor: color, color, background: status === 'current' ? 'rgba(55,182,196,0.12)' : 'transparent' }}
                >
                  {status === 'mastered' ? (
                    <CheckCircle2 size={18} />
                  ) : status === 'current' ? (
                    <CircleDot size={18} />
                  ) : (
                    <Lock size={15} />
                  )}
                </div>
                {!last && <div className="w-0.5 flex-1 my-1" style={{ background: '#1e333b' }} />}
              </div>

              {/* card */}
              <button
                disabled={status === 'locked'}
                onClick={() => onOpenNode(node)}
                className={`flex-1 mb-3 text-left rounded-xl px-4 py-3 border flex items-center justify-between transition-colors ${
                  status === 'locked'
                    ? 'border-forge-border bg-forge-panel/40 opacity-60'
                    : status === 'mastered'
                    ? 'border-forge-gold/40 bg-forge-gold/10'
                    : 'border-forge-teal/40 bg-forge-teal/10'
                }`}
              >
                <div>
                  <div className="font-bold text-white text-sm">{node.name}</div>
                  <div className="text-xs text-forge-dim nums">
                    target {target} · {node.sessions} sessions
                  </div>
                </div>
                {status !== 'locked' && <ChevronRight size={18} className="text-forge-dim" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
