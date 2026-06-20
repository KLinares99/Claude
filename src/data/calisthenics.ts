// FORGE calisthenics engine — skill trees + accessory loggers.
// Skills are modeled as progression ladders (the ladder IS the load).

export type ToolType = 'reps' | 'hold';
export type Category = 'pull' | 'push' | 'balance' | 'tension';

export interface SkillNode {
  id: string;               // unique, also the key in cal.nodes
  name: string;
  tool: ToolType;
  target: number;           // reps (per clean set) OR hold seconds
  sets: number;             // clean sets required at target (reps only; holds use 1)
  sessions: number;         // sessions at/above target needed to graduate
  threshold: string;        // human-readable graduation rule
  science: string;
  citation: string;
}

export interface SkillTree {
  id: string;
  name: string;
  icon: string;
  category: Category;
  blurb: string;
  gate: string;
  collapsed?: boolean;      // collapsed by default in the UI
  nodes: SkillNode[];       // ordered ladder, locked -> current -> mastered
}

const HOLD_SESSIONS = 3;
const REP_SESSIONS = 3;

export const trees: SkillTree[] = [
  {
    id: 'muscleup',
    name: 'Muscle-Up',
    icon: '🔥',
    category: 'pull',
    blurb: 'The headline pull skill. Built from explosive pulling power + a clean transition over the bar.',
    gate: 'Gate: ~10–12 strict pull-ups + 10–12 dips before chasing transitions.',
    nodes: [
      {
        id: 'mu-high-pullups',
        name: 'High / Explosive Pull-ups',
        tool: 'reps',
        target: 8,
        sets: 3,
        sessions: REP_SESSIONS,
        threshold: '3 clean sets × 8 reps pulling to lower-chest height',
        science: 'Explosive pulls train the rate of force development needed to clear the bar. Pull to sternum, not chin.',
        citation: 'Convict Conditioning — progressive calisthenics'
      },
      {
        id: 'mu-c2b',
        name: 'Chest-to-Bar Pull-ups',
        tool: 'reps',
        target: 6,
        sets: 3,
        sessions: REP_SESSIONS,
        threshold: '3 clean sets × 6 reps touching chest to bar',
        science: 'Higher pull height shortens the transition gap. Drive elbows down and back.',
        citation: 'Low & Eisenberg — Overcoming Gravity'
      },
      {
        id: 'mu-band',
        name: 'Band-Assisted Transitions',
        tool: 'reps',
        target: 5,
        sets: 3,
        sessions: REP_SESSIONS,
        threshold: '3 sets × 5 smooth banded transitions over the bar',
        science: 'Grooving the transition pattern with reduced load. Fast hands, lean forward as you clear.',
        citation: 'Greasing the Groove — Pavel Tsatsouline'
      },
      {
        id: 'mu-negatives',
        name: 'Negative Muscle-Ups',
        tool: 'reps',
        target: 4,
        sets: 3,
        sessions: REP_SESSIONS,
        threshold: '3 sets × 4 slow (3s+) controlled negatives from the top',
        science: 'Eccentric overload builds the support + lowering strength of the dip portion at the top.',
        citation: 'Eccentric overload — Roig et al. 2009'
      },
      {
        id: 'mu-full',
        name: 'Full Muscle-Up',
        tool: 'reps',
        target: 3,
        sets: 3,
        sessions: REP_SESSIONS,
        threshold: '3 sets × 3 strict muscle-ups, no kip',
        science: 'The whole chain: explosive pull → fast transition → press out. Skill, not just strength.',
        citation: 'Convict Conditioning'
      }
    ]
  },
  {
    id: 'handstand',
    name: 'Handstand',
    icon: '🤸',
    category: 'balance',
    blurb: 'Balance skill — low fatigue, near-daily. Greasing the groove territory.',
    gate: 'No strength gate. Wrist prep + shoulder mobility recommended first.',
    nodes: [
      {
        id: 'hs-wall-plank',
        name: 'Wall Plank (feet on wall)',
        tool: 'hold',
        target: 45,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a tight wall plank ≥ 45s',
        science: 'Builds the straight-body line + shoulder endurance under bodyweight before going inverted.',
        citation: 'GMB / gymnastics-strength progression'
      },
      {
        id: 'hs-pike',
        name: 'Pike Hold (elevated)',
        tool: 'hold',
        target: 30,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a stacked pike ≥ 30s',
        science: 'Loads the shoulders in a near-vertical line and teaches stacking hips over hands.',
        citation: 'Gymnastics-strength progression'
      },
      {
        id: 'hs-c2w',
        name: 'Chest-to-Wall Handstand',
        tool: 'hold',
        target: 30,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a tight chest-to-wall HS ≥ 30s',
        science: 'Forces a true straight line (no banana back) and builds inverted shoulder endurance.',
        citation: 'Greasing the Groove — Pavel'
      },
      {
        id: 'hs-kickup',
        name: 'Kick-up Practice',
        tool: 'reps',
        target: 5,
        sets: 1,
        sessions: REP_SESSIONS,
        threshold: '3 sessions landing 5 controlled kick-ups to balance',
        science: 'Finding the balance point on the way up. Practice fresh — this is CNS / skill work.',
        citation: 'Skill-before-fatigue (CNS)'
      },
      {
        id: 'hs-free',
        name: 'Freestanding Hold',
        tool: 'hold',
        target: 20,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a freestanding HS ≥ 20s',
        science: 'Fingertip pressure controls balance — push the floor away, ribs in.',
        citation: 'Gymnastics-strength progression'
      },
      {
        id: 'hs-hspu',
        name: 'Handstand Push-up (later)',
        tool: 'reps',
        target: 3,
        sets: 3,
        sessions: REP_SESSIONS,
        threshold: '3 sets × 3 full-range HSPU (wall ok)',
        science: 'Vertical pressing strength — counts toward your PUSH volume for balance tracking.',
        citation: 'Overcoming Gravity'
      }
    ]
  },
  {
    id: 'frontlever',
    name: 'Front Lever',
    icon: '➖',
    category: 'tension',
    blurb: 'Straight-body horizontal pull. A total-body tension skill driven by scapular + lat strength.',
    gate: 'Gate: solid scapular pull-ups + active hang. Pulling base helps.',
    nodes: [
      {
        id: 'fl-tuck',
        name: 'Tuck Front Lever',
        tool: 'hold',
        target: 15,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a tuck FL ≥ 15s',
        science: 'Shortest lever — teaches scap depression + posterior pelvic tilt under tension.',
        citation: 'Overcoming Gravity — leverage progression'
      },
      {
        id: 'fl-advtuck',
        name: 'Advanced Tuck FL',
        tool: 'hold',
        target: 12,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding adv-tuck (open hips, flat back) ≥ 12s',
        science: 'Opening the hips lengthens the lever and ~doubles the demand. Keep the back flat.',
        citation: 'Progressive overload via leverage'
      },
      {
        id: 'fl-single',
        name: 'Single-Leg FL',
        tool: 'hold',
        target: 10,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding single-leg FL ≥ 10s (each side)',
        science: 'One extended leg is a big jump in load — alternate legs to stay symmetric.',
        citation: 'Overcoming Gravity'
      },
      {
        id: 'fl-straddle',
        name: 'Straddle FL',
        tool: 'hold',
        target: 8,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a straddle FL ≥ 8s',
        science: 'Wide legs shorten the effective lever vs full — the last step before closing the legs.',
        citation: 'Gymnastics-strength progression'
      },
      {
        id: 'fl-full',
        name: 'Full Front Lever',
        tool: 'hold',
        target: 5,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a full FL ≥ 5s, straight body',
        science: 'Maximum lever. Total-body tension — squeeze glutes, point toes, depress scapula.',
        citation: 'Overcoming Gravity'
      }
    ]
  },
  {
    id: 'backlever',
    name: 'Back Lever',
    icon: '➕',
    category: 'tension',
    blurb: 'Inverted straight-body hold facing the floor. Builds shoulder + bicep tendon resilience.',
    gate: 'Gate: comfortable skin-the-cat / German hang first (tendon prep).',
    nodes: [
      {
        id: 'bl-tuck',
        name: 'Tuck Back Lever',
        tool: 'hold',
        target: 15,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a tuck BL ≥ 15s',
        science: 'Easiest lever position — eases the shoulders + biceps into the open-shoulder load.',
        citation: 'Overcoming Gravity'
      },
      {
        id: 'bl-advtuck',
        name: 'Advanced Tuck BL',
        tool: 'hold',
        target: 12,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding adv-tuck BL ≥ 12s',
        science: 'Hips open, back flat. Watch the biceps — progress slowly to protect the tendon.',
        citation: 'Tendon load management'
      },
      {
        id: 'bl-straddle',
        name: 'Straddle BL',
        tool: 'hold',
        target: 8,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a straddle BL ≥ 8s',
        science: 'Legs wide to cut the lever before full. Keep arms straight, shoulders open.',
        citation: 'Gymnastics-strength progression'
      },
      {
        id: 'bl-full',
        name: 'Full Back Lever',
        tool: 'hold',
        target: 5,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a full BL ≥ 5s, straight body',
        science: 'Straight line facing the floor, arms locked. Big bicep-tendon demand — earn it slowly.',
        citation: 'Overcoming Gravity'
      }
    ]
  },
  {
    id: 'planche',
    name: 'Planche',
    icon: '🛩️',
    category: 'push',
    blurb: 'The headline push skill — straight-body hold parallel to the floor. Optional / long-term.',
    gate: 'Gate: strong straight-arm scap strength + solid dips. This is a long road.',
    collapsed: true,
    nodes: [
      {
        id: 'pl-lean',
        name: 'Planche Lean',
        tool: 'hold',
        target: 20,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a deep planche lean ≥ 20s',
        science: 'Shoulders well past the hands — builds the straight-arm scap protraction strength base.',
        citation: 'Overcoming Gravity'
      },
      {
        id: 'pl-tuck',
        name: 'Tuck Planche',
        tool: 'hold',
        target: 15,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a tuck planche ≥ 15s',
        science: 'Feet off the floor, knees tucked. Protract hard — round the upper back.',
        citation: 'Gymnastics-strength progression'
      },
      {
        id: 'pl-straddle',
        name: 'Straddle Planche',
        tool: 'hold',
        target: 8,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a straddle planche ≥ 8s',
        science: 'Legs extended + wide. A massive strength jump — patience over months, not weeks.',
        citation: 'Overcoming Gravity'
      },
      {
        id: 'pl-full',
        name: 'Full Planche',
        tool: 'hold',
        target: 5,
        sets: 1,
        sessions: HOLD_SESSIONS,
        threshold: '3 sessions holding a full planche ≥ 5s',
        science: 'The summit. Straight body, parallel to the floor, on straight arms.',
        citation: 'Overcoming Gravity'
      }
    ]
  }
];

// Accessory / balance loggers (prevent push-dominant imbalance — same logic
// as the running-economy table). Not ladders; just loggers, some with a max.
export interface Accessory {
  id: string;
  name: string;
  tool: ToolType;
  category: Category;
  maxKey?: 'pullups' | 'dips' | 'pushups'; // tracks an all-time max
  note: string;
  citation: string;
}

export const accessories: Accessory[] = [
  {
    id: 'acc-pullups',
    name: 'Pull-ups',
    tool: 'reps',
    category: 'pull',
    maxKey: 'pullups',
    note: 'Pull base for muscle-up + levers. Log your best set; max updates automatically.',
    citation: 'Progressive overload'
  },
  {
    id: 'acc-dips',
    name: 'Dips',
    tool: 'reps',
    category: 'push',
    maxKey: 'dips',
    note: 'Primary push driver. Balances all the pulling work.',
    citation: 'Push/pull balance'
  },
  {
    id: 'acc-rows',
    name: 'Rows',
    tool: 'reps',
    category: 'pull',
    note: 'Horizontal pull — scapular health + rear delts.',
    citation: 'Push/pull balance'
  },
  {
    id: 'acc-hollow',
    name: 'Hollow-Body Hold',
    tool: 'hold',
    category: 'balance',
    note: 'Core anchor. The straight-body tension that underlies every skill.',
    citation: 'Gymnastics core foundation'
  },
  {
    id: 'acc-pistol',
    name: 'Pistol Squat / Squats',
    tool: 'reps',
    category: 'balance',
    note: 'Leg anchor — single-leg strength + balance. Log pistols (or bodyweight squats).',
    citation: 'Convict Conditioning — the leg ladder'
  }
];

// Push/pull category lookup for any node id (used by the balance indicator).
export function categoryForNode(nodeId: string): Category {
  for (const t of trees) {
    const n = t.nodes.find((x) => x.id === nodeId);
    if (n) {
      // HSPU and planche nodes are PUSH even within balance/push trees
      if (nodeId === 'hs-hspu') return 'push';
      return t.category;
    }
  }
  const a = accessories.find((x) => x.id === nodeId);
  return a?.category ?? 'balance';
}

export function findNode(nodeId: string): SkillNode | undefined {
  for (const t of trees) {
    const n = t.nodes.find((x) => x.id === nodeId);
    if (n) return n;
  }
  return undefined;
}
