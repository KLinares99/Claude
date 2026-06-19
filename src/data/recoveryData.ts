export interface RecoveryPillar {
  title: string;
  icon: string;
  score: number;
  description: string;
  protocols: string[];
  citation: string;
  color: string;
}

export const recoveryPillars: RecoveryPillar[] = [
  {
    title: 'Sleep',
    icon: '💤',
    score: 9,
    description: 'The single highest-ROI recovery tool. Growth hormone (GH) peaks during deep sleep — this is when muscle and connective tissue rebuild.',
    protocols: [
      'Target 8-9 hours for athletes (vs 7 for sedentary adults)',
      'Keep consistent sleep/wake times to anchor circadian rhythm',
      'Sleep in a cool, dark room: 65-68°F (18-20°C) is optimal',
      'Avoid screens 60 min before bed — blue light suppresses melatonin',
      'Track morning resting HR and HRV to gauge overnight recovery quality'
    ],
    citation: 'Milewski et al. (2014) — Athletes sleeping <8 hrs/night had 1.7× higher injury risk',
    color: 'from-indigo-600 to-violet-700'
  },
  {
    title: 'Nutrition Timing',
    icon: '🍽️',
    score: 8,
    description: 'Post-run anabolic window: protein + carbs within 30-60 min maximizes glycogen resynthesis and muscle protein synthesis simultaneously.',
    protocols: [
      '20-40g leucine-rich protein within 30 min post-run',
      '0.8-1.2 g/kg carbohydrates in the first 2 hours post-effort',
      'Tart cherry juice: 30ml twice daily reduces DOMS by 20-30% (Bell et al. 2014)',
      'Omega-3s: 2-4g EPA/DHA daily for systemic inflammation control',
      'Vitamin D: 2000-5000 IU daily (deficiency impairs recovery and increases injury risk)'
    ],
    citation: 'Ivy & Portman (2004) — Nutrient Timing: The Future of Sports Nutrition',
    color: 'from-amber-600 to-orange-700'
  },
  {
    title: 'Active Recovery',
    icon: '🚴',
    score: 7,
    description: 'Low-intensity Z1 movement on recovery days improves blood flow, accelerates lactate clearance, and maintains mobility without adding stress.',
    protocols: [
      '20-40 min easy cycling, swimming, or brisk walking (HR < 120)',
      'Yoga or mobility work targeting hip flexors, calves, and IT band',
      'Foam rolling: 60-90 sec per muscle group, not rolling bone/joint',
      'Cold water immersion at 50-59°F for 10-15 min post hard effort',
      'Compression garments for 2-4 hrs post-race or hard workout'
    ],
    citation: 'Barnett (2006) — Active recovery accelerates blood lactate clearance vs passive rest',
    color: 'from-emerald-600 to-green-700'
  },
  {
    title: 'Heart Rate Variability (HRV)',
    icon: '💓',
    score: 8,
    description: 'HRV measures variation between heartbeats. Higher HRV = better autonomic recovery. Track daily to objectively guide training intensity decisions.',
    protocols: [
      'Measure HRV first thing in the morning, supine before rising',
      'Apps: HRV4Training, Elite HRV, Whoop, Garmin Body Battery',
      'If HRV >5% below 7-day baseline → downgrade to Z1-Z2 only',
      'If HRV trending upward over 3+ days → green light for quality session',
      'Compare against resting HR: HRV down + HR up = significant fatigue signal'
    ],
    citation: 'Plews et al. (2013) — HRV-guided training improves endurance performance over fixed schedules',
    color: 'from-rose-600 to-red-700'
  },
  {
    title: 'Strength Training',
    icon: '🏋️',
    score: 7,
    description: 'Two strength sessions per week reduce running injury risk by up to 50% and improve running economy by 2-8% via improved neuromuscular efficiency.',
    protocols: [
      'Hip thrusts, single-leg RDLs, Bulgarian split squats (3×8 heavy)',
      'Eccentric calf raises: 3×15 per leg off a step (Alfredson protocol)',
      'Copenhagen adductor plank: 3×20s each side for groin/hip health',
      'Heavy loads (>80% 1RM) produce greatest running economy gains',
      'Schedule on same day as quality runs to keep easy days truly easy'
    ],
    citation: 'Lauersen et al. (2014) — Strength training reduces overuse injury risk by ~50%',
    color: 'from-sky-600 to-blue-700'
  }
];

export const hrvData = [
  { day: 'Mon', hrv: 72, baseline: 73 },
  { day: 'Tue', hrv: 65, baseline: 73 },
  { day: 'Wed', hrv: 58, baseline: 73 },
  { day: 'Thu', hrv: 68, baseline: 73 },
  { day: 'Fri', hrv: 75, baseline: 73 },
  { day: 'Sat', hrv: 80, baseline: 73 },
  { day: 'Sun', hrv: 77, baseline: 73 }
];

export const sleepStages = [
  { stage: 'Deep Sleep', pct: 20, color: '#6366f1', benefit: 'GH release, tissue repair' },
  { stage: 'REM Sleep', pct: 25, color: '#8b5cf6', benefit: 'Motor learning, memory consolidation' },
  { stage: 'Light Sleep', pct: 50, color: '#a78bfa', benefit: 'Transition, body maintenance' },
  { stage: 'Awake', pct: 5, color: '#475569', benefit: 'Normal — minimize disruptions' }
];
