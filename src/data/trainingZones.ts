export interface Zone {
  id: number;
  name: string;
  label: string;
  hrPct: [number, number];
  color: string;
  bgColor: string;
  paceAdjust: string;
  purpose: string;
  weeklyVolumePct: number;
  rpe: string;
  adaptations: string[];
  sessions: string[];
}

export const zones: Zone[] = [
  {
    id: 1,
    name: 'Recovery',
    label: 'Z1',
    hrPct: [50, 60],
    color: '#6ee7b7',
    bgColor: 'bg-emerald-900/30',
    paceAdjust: '> Easy +90s/mi',
    purpose: 'Active recovery, blood flow, injury prevention',
    weeklyVolumePct: 15,
    rpe: '1-2 / 10',
    adaptations: ['Capillary density', 'Fat oxidation efficiency', 'Mitochondrial maintenance'],
    sessions: ['Easy jog between hard days', '20-40 min shakeout run']
  },
  {
    id: 2,
    name: 'Aerobic Base',
    label: 'Z2',
    hrPct: [60, 72],
    color: '#34d399',
    bgColor: 'bg-green-900/30',
    paceAdjust: 'Easy pace +60s/mi',
    purpose: 'Aerobic engine, fat metabolism, endurance foundation',
    weeklyVolumePct: 50,
    rpe: '3-4 / 10',
    adaptations: ['Mitochondrial biogenesis', 'Fat oxidation', 'Cardiac stroke volume', 'Slow-twitch fiber development'],
    sessions: ['Long runs (60-120 min)', 'Easy daily mileage', 'Maffetone 180-age HR cap']
  },
  {
    id: 3,
    name: 'Tempo / Threshold',
    label: 'Z3',
    hrPct: [72, 82],
    color: '#fbbf24',
    bgColor: 'bg-amber-900/30',
    paceAdjust: 'Marathon pace to Tempo',
    purpose: 'Lactate threshold elevation, metabolic efficiency',
    weeklyVolumePct: 10,
    rpe: '5-6 / 10',
    adaptations: ['Lactate clearance rate', 'Running economy at race pace', 'Aerobic enzyme activity'],
    sessions: ['20-40 min continuous tempo', 'Cruise intervals (5x5 min at threshold)', 'Marathon pace long run segments']
  },
  {
    id: 4,
    name: 'Sub-Threshold',
    label: 'Z4',
    hrPct: [82, 92],
    color: '#fb923c',
    bgColor: 'bg-orange-900/30',
    paceAdjust: '10K to half-marathon pace',
    purpose: 'Lactate threshold ceiling, high-intensity aerobic power',
    weeklyVolumePct: 8,
    rpe: '7-8 / 10',
    adaptations: ['VO2 max stimulus', 'Blood lactate tolerance', 'Type IIa fiber aerobic capacity'],
    sessions: ['4x8 min at 10K effort', 'Yasso 800s', '2x20 min cruise intervals']
  },
  {
    id: 5,
    name: 'VO2 Max',
    label: 'Z5',
    hrPct: [92, 100],
    color: '#f87171',
    bgColor: 'bg-red-900/30',
    paceAdjust: '3K-5K pace',
    purpose: 'Maximum oxygen uptake, neuromuscular power',
    weeklyVolumePct: 7,
    rpe: '9-10 / 10',
    adaptations: ['Cardiac output ceiling', 'Mitochondrial density', 'VO2 max', 'Running economy at speed'],
    sessions: ['5x1000m @ 5K pace', '10x400m', 'Hill repeats (60-90s)', 'Norwegian threshold doubles']
  }
];

export const polarizedSplit = {
  easy: 80,
  moderate: 0,
  hard: 20,
  citation: 'Seiler & Tonnessen (2009) — "Intervals, Thresholds, and Long Slow Distance"',
  summary: 'Elite endurance athletes spend ~80% of training below ventilatory threshold 1 (Zone 1-2) and ~20% above threshold 2 (Zone 4-5). This polarized model outperforms threshold-heavy training for VO2 max development.'
};
