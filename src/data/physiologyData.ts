export const vo2MaxNorms = [
  { age: '20-29', excellent: 52.5, good: 46.4, average: 38.4, poor: 35.0, color: '#0ea5e9' },
  { age: '30-39', excellent: 51.5, good: 43.9, average: 35.4, poor: 31.8, color: '#6366f1' }
];

export const hrZoneChart = [
  { zone: 'Z1', pct: 15, color: '#6ee7b7' },
  { zone: 'Z2', pct: 50, color: '#34d399' },
  { zone: 'Z3', pct: 10, color: '#fbbf24' },
  { zone: 'Z4', pct: 8, color: '#fb923c' },
  { zone: 'Z5', pct: 7, color: '#f87171' },
  { zone: 'Rest', pct: 10, color: '#475569' }
];

export const weeklyLoadModel = [
  { week: 'Wk 1', load: 100, type: 'Base' },
  { week: 'Wk 2', load: 110, type: 'Build' },
  { week: 'Wk 3', load: 120, type: 'Build' },
  { week: 'Wk 4', load: 80, type: 'Recovery' },
  { week: 'Wk 5', load: 125, type: 'Build' },
  { week: 'Wk 6', load: 135, type: 'Build' },
  { week: 'Wk 7', load: 145, type: 'Build' },
  { week: 'Wk 8', load: 90, type: 'Recovery' }
];

export const runningEconomyFactors = [
  { factor: 'Cadence', optimal: '170-180 spm', impact: 'High', tip: 'Increase cadence ~5-10% to reduce ground contact time and injury risk' },
  { factor: 'Ground Contact Time', optimal: '200-250 ms', impact: 'High', tip: 'Shorter GCT = better elastic energy return from tendons' },
  { factor: 'Vertical Oscillation', optimal: '6-8 cm', impact: 'Medium', tip: 'Minimize vertical bounce — energy wasted going up, not forward' },
  { factor: 'Stride Length', optimal: 'Self-selected at cadence', impact: 'Medium', tip: 'Overstriding = braking force. Land under your center of mass' },
  { factor: 'Trunk Lean', optimal: '5-10 degrees forward', impact: 'Medium', tip: 'Slight forward lean from the ankles activates hip extension' }
];

export const injuryRates = [
  { injury: "Runner's Knee (PFPS)", pct: 28, prevention: 'Hip strengthening, reduce weekly mileage increase' },
  { injury: 'IT Band Syndrome', pct: 22, prevention: 'Glute medius strengthening, foam rolling TFL' },
  { injury: 'Shin Splints (MTSS)', pct: 20, prevention: 'Gradual volume increase, calf eccentric work' },
  { injury: 'Plantar Fasciitis', pct: 15, prevention: 'Calf stretching, foot strengthening, proper footwear' },
  { injury: 'Achilles Tendinopathy', pct: 10, prevention: 'Eccentric heel drops (Alfredson protocol), load management' },
  { injury: 'Stress Fractures', pct: 5, prevention: 'Vitamin D + calcium, avoid >10%/week volume increase' }
];

export const scienceStats = [
  { stat: '80%', label: 'of training should be easy (Z1-Z2)', source: 'Seiler 2009' },
  { stat: '10%', label: 'max weekly mileage increase rule', source: 'Hreljac 2005' },
  { stat: '180', label: 'minus your age = MAF heart rate', source: 'Maffetone Method' },
  { stat: '3:1', label: 'weeks build to 1 week recovery ratio', source: 'Bompa Periodization' }
];
