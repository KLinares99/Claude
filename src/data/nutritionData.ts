export interface MacroInfo {
  macro: string;
  amount: string;
  timing: string;
  color: string;
  bgColor: string;
  sources: string[];
  science: string;
}

export const macroNeeds: MacroInfo[] = [
  {
    macro: 'Carbohydrates',
    amount: '6-10 g/kg body weight',
    timing: 'Primary fuel for runs >75 min',
    color: '#f59e0b',
    bgColor: 'bg-amber-900/30',
    sources: ['Oats, rice, sweet potato', 'Bananas, dates, berries', 'Pasta, bread (whole grain)', 'Sports gels (racing/long runs)'],
    science: 'Muscle glycogen is the rate-limiting fuel for runs over 75 min. Target 7-8 g/kg on hard training days. CHO oxidation peaks at ~3-4 g/min during high-intensity running.'
  },
  {
    macro: 'Protein',
    amount: '1.6-2.2 g/kg body weight',
    timing: 'Within 30-60 min post-run',
    color: '#6366f1',
    bgColor: 'bg-violet-900/30',
    sources: ['Chicken breast, turkey', 'Greek yogurt, cottage cheese', 'Eggs, salmon, tuna', 'Whey or casein protein'],
    science: 'Athlete protein needs exceed RDA (0.8 g/kg). Post-exercise MPS peaks with 20-40g leucine-rich protein. Leucine threshold (~3g) triggers muscle protein synthesis (Norton & Layman 2006).'
  },
  {
    macro: 'Fats',
    amount: '1.0-1.5 g/kg body weight',
    timing: 'Not within 2 hrs before a hard run',
    color: '#10b981',
    bgColor: 'bg-emerald-900/30',
    sources: ['Avocado, olive oil', 'Nuts, nut butters', 'Fatty fish (omega-3)', 'Dark chocolate (antioxidants)'],
    science: 'Fats are the dominant fuel at Z1-Z2 intensity. Omega-3s (EPA/DHA) reduce exercise-induced inflammation and support joint health. Target 2-3g combined EPA+DHA daily.'
  }
];

export interface HydrationPhase {
  phase: string;
  amount: string;
  note: string;
}

export const hydrationGuide: HydrationPhase[] = [
  { phase: 'Pre-Run (2 hrs before)', amount: '500-600 ml', note: 'Urine should be pale yellow — not clear, not dark' },
  { phase: 'During (< 60 min)', amount: 'Water only as needed', note: 'No need to fuel short runs; overdrinking is harmful' },
  { phase: 'During (60-90 min)', amount: '150-250 ml per 15-20 min', note: 'Add electrolytes if sweating heavily or in heat' },
  { phase: 'During (> 90 min)', amount: '30-60g carbs per hour', note: 'Gel + water every 30-40 min; practice in training' },
  { phase: 'Post-Run', amount: '1.5× sweat loss', note: 'Weigh before/after: 1 kg lost = 1.5L fluid needed' }
];

export interface RaceNutrition {
  distance: string;
  carbs: string;
  sodium: string;
  strategy: string;
}

export const raceNutritionGuide: RaceNutrition[] = [
  {
    distance: '5K',
    carbs: 'None needed',
    sodium: 'Not needed',
    strategy: 'Well-fed beforehand. Light carb snack 1-2 hrs before. Focus is on pacing, not fueling.'
  },
  {
    distance: '10K',
    carbs: 'Optional gel at mile 4-5',
    sodium: 'Optional',
    strategy: 'Caffeine 45 min before (3-6 mg/kg). One gel mid-race provides psychological and mild physiological benefit.'
  },
  {
    distance: 'Half Marathon',
    carbs: '30-45g/hr (1-2 gels)',
    sodium: '300-600 mg/hr',
    strategy: 'Start fueling at mile 5-6. Gel every 30-40 min. Drink at every aid station. Never skip early fueling.'
  },
  {
    distance: 'Marathon',
    carbs: '60-90g/hr (3-4 gels)',
    sodium: '500-1000 mg/hr',
    strategy: 'Fuel early and often starting at mile 6. Never try new foods on race day. Train gut in training runs.'
  }
];

export const keySupplements = [
  {
    name: 'Caffeine',
    dose: '3-6 mg/kg body weight',
    timing: '45-60 min pre-race',
    evidence: 'Strong',
    note: 'Most evidence-backed ergogenic. Reduces RPE, increases time to exhaustion by 12-15%.'
  },
  {
    name: 'Creatine',
    dose: '3-5 g/day maintenance',
    timing: 'Daily with carbs/protein',
    evidence: 'Strong',
    note: 'Supports strength training adaptations and sprinting. Less direct benefit for pure endurance but supports training quality.'
  },
  {
    name: 'Beetroot / Nitrates',
    dose: '500 ml juice or 6.4 mmol NO3',
    timing: '2-3 hrs before effort',
    evidence: 'Moderate',
    note: 'Improves mitochondrial efficiency and time-to-exhaustion at submaximal efforts. Best for events under 40 min.'
  },
  {
    name: 'Vitamin D',
    dose: '2000-5000 IU/day',
    timing: 'Daily with fatty meal',
    evidence: 'Moderate',
    note: 'Most athletes are deficient. Supports bone health, immune function, and muscle contractility.'
  },
  {
    name: 'Beta-Alanine',
    dose: '3.2-6.4 g/day',
    timing: 'Daily (split doses)',
    evidence: 'Moderate',
    note: 'Buffers muscle acidity at high intensity. Best for efforts of 1-10 min duration (400m-3K runners).'
  }
];
