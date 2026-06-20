import type { ForgeData, NodeState } from './storage';
import { trees, accessories, categoryForNode, type SkillNode, type SkillTree } from '../data/calisthenics';

export type NodeStatus = 'locked' | 'current' | 'mastered';

export function nodeState(data: ForgeData, nodeId: string): NodeState {
  return data.cal.nodes[nodeId] ?? { logs: [], mastered: false };
}

/** How many logged sessions met the node's target (drives graduation). */
export function qualifyingSessions(state: NodeState, node: SkillNode): number {
  return state.logs.filter((l) => l.value >= node.target).length;
}

export function isMastered(data: ForgeData, node: SkillNode): boolean {
  const st = nodeState(data, node.id);
  if (st.mastered) return true;
  return qualifyingSessions(st, node) >= node.sessions;
}

/** Status of every node in a tree: a node is `current` if it's the first
 *  non-mastered node (or the previous node is mastered). */
export function treeStatuses(data: ForgeData, tree: SkillTree): Record<string, NodeStatus> {
  const out: Record<string, NodeStatus> = {};
  let unlockedReached = false;
  for (const node of tree.nodes) {
    if (isMastered(data, node)) {
      out[node.id] = 'mastered';
    } else if (!unlockedReached) {
      out[node.id] = 'current';
      unlockedReached = true;
    } else {
      out[node.id] = 'locked';
    }
  }
  return out;
}

export function masteredCount(data: ForgeData, tree: SkillTree): number {
  return tree.nodes.filter((n) => isMastered(data, n)).length;
}

/** The current (in-progress) node of a tree, if any. */
export function currentNode(data: ForgeData, tree: SkillTree): SkillNode | undefined {
  const statuses = treeStatuses(data, tree);
  return tree.nodes.find((n) => statuses[n.id] === 'current');
}

/** A featured progress line for the dashboard, e.g.
 *  "Front Lever: advanced tuck — 2/3 sessions to straddle". */
export function featuredProgress(data: ForgeData): {
  tree: SkillTree;
  text: string;
} {
  // pick the tree with the most recent log activity, fall back to front lever
  let best: SkillTree = trees.find((t) => t.id === 'frontlever') ?? trees[0];
  let bestDate = '';
  for (const t of trees) {
    for (const n of t.nodes) {
      const st = nodeState(data, n.id);
      const last = st.logs[st.logs.length - 1];
      if (last && last.date > bestDate) {
        bestDate = last.date;
        best = t;
      }
    }
  }
  const cur = currentNode(data, best);
  if (!cur) {
    return { tree: best, text: `${best.name}: all nodes mastered 🏆` };
  }
  const st = nodeState(data, cur.id);
  const q = qualifyingSessions(st, cur);
  return {
    tree: best,
    text: `${best.name}: ${cur.name} — ${q}/${cur.sessions} sessions to advance`
  };
}

/** Push vs pull volume over the last `days` days (counts qualifying logs). */
export function pushPullBalance(data: ForgeData, days = 14): {
  push: number;
  pull: number;
  ratioText: string;
  flag: boolean;
} {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  let push = 0;
  let pull = 0;
  const allIds = [
    ...trees.flatMap((t) => t.nodes.map((n) => n.id)),
    ...accessories.map((a) => a.id)
  ];
  for (const id of allIds) {
    const st = data.cal.nodes[id];
    if (!st) continue;
    const recent = st.logs.filter((l) => new Date(l.date) >= cutoff).length;
    if (recent === 0) continue;
    const cat = categoryForNode(id);
    if (cat === 'push') push += recent;
    else if (cat === 'pull' || cat === 'tension') pull += recent;
  }
  let ratioText = 'No skill volume logged yet';
  let flag = false;
  if (push + pull > 0) {
    if (push === 0) {
      ratioText = `${pull} pull · 0 push`;
      flag = pull >= 3;
    } else {
      const r = pull / push;
      ratioText = `${pull} pull : ${push} push (${r.toFixed(1)}:1)`;
      flag = r > 2 || r < 0.5;
    }
  }
  return { push, pull, ratioText, flag };
}

export function totalMastered(data: ForgeData): number {
  return trees.reduce((sum, t) => sum + masteredCount(data, t), 0);
}
