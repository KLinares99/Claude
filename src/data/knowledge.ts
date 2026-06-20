// Science library content — citation-driven. Running content ported from the
// Running Hub; calisthenics content is new.

export interface StatCard {
  stat: string;
  label: string;
  source: string;
}

export const runStats: StatCard[] = [
  { stat: '80%', label: 'of training should be easy (Z1–Z2)', source: 'Seiler 2009' },
  { stat: '10%', label: 'max weekly mileage increase rule', source: 'Hreljac 2005' },
  { stat: '180−age', label: 'MAF aerobic heart-rate cap', source: 'Maffetone Method' },
  { stat: '3:1', label: 'build-to-recovery week ratio', source: 'Bompa Periodization' }
];

export interface HRZone {
  label: string;
  name: string;
  pct: string;
  rpe: string;
  color: string;
}

export const hrZones: HRZone[] = [
  { label: 'Z1', name: 'Recovery', pct: '50–60% HRmax', rpe: '1–2 / 10', color: '#5fc48a' },
  { label: 'Z2', name: 'Aerobic Base', pct: '60–72% HRmax', rpe: '3–4 / 10', color: '#5fc48a' },
  { label: 'Z3', name: 'Tempo / Threshold', pct: '72–82% HRmax', rpe: '5–6 / 10', color: '#f2c46a' },
  { label: 'Z4', name: 'Sub-Threshold', pct: '82–92% HRmax', rpe: '7–8 / 10', color: '#e8a14b' },
  { label: 'Z5', name: 'VO₂ Max', pct: '92–100% HRmax', rpe: '9–10 / 10', color: '#d9695f' }
];

export const polarized = {
  easy: 80,
  hard: 20,
  citation: 'Seiler & Tønnessen (2009)',
  summary:
    'Elite endurance athletes spend ~80% of training below ventilatory threshold 1 (Z1–Z2) and ~20% above threshold 2 (Z4–Z5). This polarized model beats threshold-heavy training for VO₂ max development.'
};

export const economyFactors = [
  { factor: 'Cadence', optimal: '170–180 spm', impact: 'High', tip: 'Raise cadence ~5–10% to cut ground contact + injury risk' },
  { factor: 'Ground Contact', optimal: '200–250 ms', impact: 'High', tip: 'Shorter GCT = more elastic return from tendons' },
  { factor: 'Vertical Oscillation', optimal: '6–8 cm', impact: 'Medium', tip: 'Less bounce — energy forward, not up' },
  { factor: 'Stride Length', optimal: 'Self-selected', impact: 'Medium', tip: 'Land under your center of mass — no overstriding' },
  { factor: 'Trunk Lean', optimal: '5–10° forward', impact: 'Medium', tip: 'Lean from the ankles to engage hip extension' }
];

// ---- Calisthenics knowledge -------------------------------------------

export const calStats: StatCard[] = [
  { stat: 'GtG', label: 'high frequency, never to failure', source: 'Pavel Tsatsouline' },
  { stat: 'Leverage', label: 'the ladder IS the load', source: 'Convict Conditioning' },
  { stat: 'Fresh', label: 'skills go first — CNS demanding', source: 'Skill-before-fatigue' },
  { stat: '3:1', label: 'build-to-deload week ratio', source: 'Bompa Periodization' }
];

export interface Principle {
  title: string;
  body: string;
  citation: string;
}

export const calPrinciples: Principle[] = [
  {
    title: 'Greasing the Groove',
    body: 'Practice skills often, fresh, and never to failure. Strength is a skill — frequent quality reps wire the pattern. Handstands and levers can be near-daily because they stay sub-maximal.',
    citation: 'Pavel Tsatsouline'
  },
  {
    title: 'Progressive Overload via Leverage',
    body: 'You don\'t add weight — you lengthen the lever. Tuck → advanced tuck → straddle → full each roughly doubles the demand. The progression ladder is your load.',
    citation: 'Convict Conditioning'
  },
  {
    title: 'Skill Before Fatigue',
    body: 'CNS-demanding skill work (kick-ups, transitions, lever holds) goes at the START of a session while you\'re fresh. Strength and conditioning come after.',
    citation: 'Motor-learning / CNS readiness'
  },
  {
    title: 'Push / Pull Balance',
    body: 'Heavy pulling (pull-ups, levers, muscle-up) without matching push (dips, planche, HSPU) breeds shoulder imbalance. FORGE tracks the ratio and flags drift.',
    citation: 'Structural balance — Poliquin'
  },
  {
    title: '3:1 Periodization',
    body: 'Three weeks building skill volume, one week deload. Same model as the running plan — tendons and CNS need the down week as much as muscles do.',
    citation: 'Bompa'
  }
];

export const thresholdTable = [
  { skill: 'Handstand / Levers (holds)', rule: '3 sessions at ≥ target hold', example: 'Tuck FL 3×15s → advance' },
  { skill: 'Muscle-up ladder (reps)', rule: '3 sets × target reps, clean form', example: 'C2B pull-ups 3×6 → advance' },
  { skill: 'Pulls / Dips / Rows', rule: '3 sets × target reps', example: 'Log best set; max auto-tracks' },
  { skill: 'Planche (holds)', rule: '3 sessions at ≥ target hold', example: 'Tuck planche 3×15s → advance' }
];

export const gates = [
  { skill: 'Muscle-Up', gate: '~10–12 strict pull-ups + 10–12 dips' },
  { skill: 'Handstand', gate: 'Wrist prep + shoulder mobility (no strength gate)' },
  { skill: 'Front Lever', gate: 'Scapular pull-ups + solid active hang' },
  { skill: 'Back Lever', gate: 'Comfortable skin-the-cat / German hang' },
  { skill: 'Planche', gate: 'Straight-arm scap strength + solid dips' }
];
