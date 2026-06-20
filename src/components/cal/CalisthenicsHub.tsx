import { useState } from 'react';
import { ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import SubTabs from '../ui/SubTabs';
import TreeView from './TreeView';
import NodeScreen from './NodeScreen';
import Accessories from './Accessories';
import { useForge } from '../../lib/storage';
import { trees, type SkillNode, type SkillTree } from '../../data/calisthenics';
import { masteredCount, currentNode, pushPullBalance } from '../../lib/cal';

type Sub = 'skills' | 'balance';

export default function CalisthenicsHub() {
  const [sub, setSub] = useState<Sub>('skills');
  const [openTree, setOpenTree] = useState<SkillTree | null>(null);
  const [openNode, setOpenNode] = useState<SkillNode | null>(null);

  if (openTree && openNode) {
    return (
      <NodeScreen
        node={openNode}
        treeName={openTree.name}
        onBack={() => setOpenNode(null)}
      />
    );
  }
  if (openTree) {
    return (
      <TreeView
        tree={openTree}
        onBack={() => setOpenTree(null)}
        onOpenNode={(n) => setOpenNode(n)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <SubTabs
        active={sub}
        onChange={(s) => setSub(s as Sub)}
        tabs={[
          { id: 'skills', label: 'Skill Trees' },
          { id: 'balance', label: 'Balance' }
        ]}
      />
      {sub === 'skills' ? <TreeList onOpen={setOpenTree} /> : <Accessories />}
    </div>
  );
}

function TreeList({ onOpen }: { onOpen: (t: SkillTree) => void }) {
  const { data } = useForge();
  const bal = pushPullBalance(data);
  const [showOptional, setShowOptional] = useState(false);

  const primary = trees.filter((t) => !t.collapsed);
  const optional = trees.filter((t) => t.collapsed);

  return (
    <div className="space-y-3">
      {/* guidance */}
      <div className="card-tight border-l-2 border-forge-teal">
        <p className="text-sm text-slate-300">
          Skills go <span className="text-forge-teal font-semibold">fresh, first</span> — they're CNS-demanding.
          Practice often, never to failure.
        </p>
        <p className="cite mt-1">— Greasing the Groove, Pavel Tsatsouline</p>
      </div>

      {/* push/pull balance flag */}
      {bal.flag && (
        <div className="card-tight border-l-2 border-forge-red flex gap-2">
          <AlertTriangle size={18} className="text-forge-red shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-white">Push / pull drifting</div>
            <div className="text-xs text-forge-dim nums">{bal.ratioText} (last 14 days)</div>
          </div>
        </div>
      )}

      {primary.map((t) => (
        <TreeCard key={t.id} tree={t} onOpen={onOpen} />
      ))}

      {/* optional trees, collapsed by default */}
      <button
        className="w-full flex items-center justify-center gap-1 text-sm text-forge-dim py-1"
        onClick={() => setShowOptional((v) => !v)}
      >
        {showOptional ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        Optional · long-term skills
      </button>
      {showOptional && optional.map((t) => <TreeCard key={t.id} tree={t} onOpen={onOpen} />)}
    </div>
  );
}

function TreeCard({ tree, onOpen }: { tree: SkillTree; onOpen: (t: SkillTree) => void }) {
  const { data } = useForge();
  const done = masteredCount(data, tree);
  const total = tree.nodes.length;
  const cur = currentNode(data, tree);
  const catColor: Record<string, string> = {
    pull: '#37b6c4',
    push: '#d9695f',
    balance: '#f2c46a',
    tension: '#e8a14b'
  };

  return (
    <button
      onClick={() => onOpen(tree)}
      className="card w-full text-left flex items-center justify-between active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{tree.icon}</span>
        <div>
          <div className="font-bold text-white">{tree.name}</div>
          <div className="text-xs text-forge-dim">
            {cur ? `Next: ${cur.name}` : 'All mastered 🏆'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="stat-num text-lg" style={{ color: catColor[tree.category] }}>
            {done}/{total}
          </div>
          <div className="text-[10px] text-forge-dim capitalize">{tree.category}</div>
        </div>
        <ChevronRight size={18} className="text-forge-dim" />
      </div>
    </button>
  );
}
