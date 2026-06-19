export interface ScheduleDay {
  day: string;
  workout: string;
  type: 'recovery' | 'easy' | 'quality' | 'long' | 'cross';
}

export interface TrainingPlan {
  id: string;
  goal: string;
  level: string;
  weeks: number;
  peakMileage: number;
  description: string;
  keyWorkouts: string[];
  schedule: ScheduleDay[];
  science: string;
  icon: string;
  color: string;
}

export const trainingPlans: TrainingPlan[] = [
  {
    id: '5k-beginner',
    goal: '5K',
    level: 'Beginner',
    weeks: 8,
    peakMileage: 20,
    description: 'Build from 0 to a strong 5K finish using Galloway run/walk principles and aerobic base development.',
    keyWorkouts: ['Run/Walk intervals 20-30 min', 'Easy 30-40 min aerobic run', '2 mile time trial'],
    schedule: [
      { day: 'Mon', workout: 'Rest / Cross-train (bike, swim)', type: 'cross' },
      { day: 'Tue', workout: '20-25 min easy run (Z2)', type: 'easy' },
      { day: 'Wed', workout: 'Strength: hip + glute focus', type: 'cross' },
      { day: 'Thu', workout: '25 min run with 6×1 min pickups', type: 'quality' },
      { day: 'Fri', workout: 'Rest', type: 'recovery' },
      { day: 'Sat', workout: 'Long run 4-6 miles (Z1-Z2)', type: 'long' },
      { day: 'Sun', workout: '20 min easy shakeout', type: 'easy' }
    ],
    science: "Based on Daniels' VDOT system — quality over quantity at this stage. Three quality runs per week with adequate recovery maximizes adaptation without injury risk for new runners.",
    icon: '🏃',
    color: 'from-emerald-600 to-green-700'
  },
  {
    id: '10k-intermediate',
    goal: '10K',
    level: 'Intermediate',
    weeks: 10,
    peakMileage: 35,
    description: 'Hit a new 10K PR with threshold work, progressive long runs, and Lydiard-style aerobic base building.',
    keyWorkouts: ['4-5 mile tempo run', '6×800m at 5K pace', '12-14 mile long run'],
    schedule: [
      { day: 'Mon', workout: 'Easy recovery 4-6 miles (Z1)', type: 'recovery' },
      { day: 'Tue', workout: 'Threshold: 5×1 mile @ 10K pace', type: 'quality' },
      { day: 'Wed', workout: 'Easy 6-8 miles (Z2)', type: 'easy' },
      { day: 'Thu', workout: 'VO2 Max: 6×800m @ 5K effort', type: 'quality' },
      { day: 'Fri', workout: 'Rest or 30 min easy', type: 'recovery' },
      { day: 'Sat', workout: 'Long run 12-14 miles (Z2 + 3 mi at MP)', type: 'long' },
      { day: 'Sun', workout: 'Easy 5-6 miles (Z1-Z2)', type: 'easy' }
    ],
    science: 'Polarized approach: 80% easy aerobic work + 20% high-intensity. Two quality sessions separated by easy days allows full neuromuscular recovery between hard efforts (Seiler 2009).',
    icon: '⚡',
    color: 'from-sky-600 to-blue-700'
  },
  {
    id: 'half-marathon',
    goal: 'Half Marathon',
    level: 'Intermediate',
    weeks: 12,
    peakMileage: 45,
    description: 'Sub-2:00 half marathon blueprint using lactate threshold training and progressive long runs reaching 16 miles.',
    keyWorkouts: ['8-10 mi long tempo', '3×3 mi at HM goal pace', '15-16 mi long run'],
    schedule: [
      { day: 'Mon', workout: 'Rest or 30 min easy (Z1)', type: 'recovery' },
      { day: 'Tue', workout: 'Workout: threshold or VO2 (alternating weeks)', type: 'quality' },
      { day: 'Wed', workout: 'Easy 8-10 miles (Z2)', type: 'easy' },
      { day: 'Thu', workout: 'Workout: 8-10 mi with 4 mi at HM pace', type: 'quality' },
      { day: 'Fri', workout: 'Easy 6 miles (Z1-Z2)', type: 'easy' },
      { day: 'Sat', workout: 'Long run 14-16 miles with last 4 at HM pace', type: 'long' },
      { day: 'Sun', workout: 'Easy 8-10 miles recovery (Z1-Z2)', type: 'easy' }
    ],
    science: 'Research by Billat et al. shows tempo + progressive long run combination maximizes HM performance. 3×3 mile race-pace segments build the neuromuscular pattern at goal speed.',
    icon: '🎯',
    color: 'from-violet-600 to-purple-700'
  },
  {
    id: 'marathon',
    goal: 'Marathon',
    level: 'Advanced',
    weeks: 16,
    peakMileage: 55,
    description: 'Sub-3:30 marathon using Hansons-Brooks principles: cumulative fatigue training that simulates the difficulty of the last 16 miles.',
    keyWorkouts: ['16-18 mi long run', '10-12 mi marathon-pace run', '5×1 mile at 10K pace'],
    schedule: [
      { day: 'Mon', workout: 'Rest or 30 min easy (Z1)', type: 'recovery' },
      { day: 'Tue', workout: 'Speed: 8-10×800m or mile repeats', type: 'quality' },
      { day: 'Wed', workout: 'Easy 8-10 miles (Z2)', type: 'easy' },
      { day: 'Thu', workout: 'Strength: 10-12 mi with 8 at marathon pace', type: 'quality' },
      { day: 'Fri', workout: 'Easy 6-8 miles (Z1-Z2)', type: 'easy' },
      { day: 'Sat', workout: 'Long run 16-20 miles (Z2, last 4 at MP)', type: 'long' },
      { day: 'Sun', workout: 'Easy 8-10 miles (Z1-Z2)', type: 'easy' }
    ],
    science: 'Hansons method: 16-mile long run on tired legs simulates miles 20-26.2. High easy mileage (55 mpw) builds aerobic capacity while 2 quality days drive speed adaptations.',
    icon: '🏅',
    color: 'from-amber-600 to-orange-700'
  }
];
