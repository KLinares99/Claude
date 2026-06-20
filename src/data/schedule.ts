// Merged weekly plan — separate-day split (Kev's choice).
// Run days and skill days never collide.

export type DayType = 'rest' | 'run' | 'skills-pull' | 'skills-push';

export interface DayPlan {
  day: string;
  short: string;
  type: DayType;
  focus: string;
  detail: string;
}

export const weeklyPlan: DayPlan[] = [
  { day: 'Monday', short: 'Mon', type: 'rest', focus: 'Rest / Mobility', detail: 'Wrist prep, shoulder mobility, easy walk. Recover for the week.' },
  { day: 'Tuesday', short: 'Tue', type: 'run', focus: 'RUN — Phase Interval', detail: 'Phase interval run, metronome ON. Run first, breaks scheduled.' },
  { day: 'Wednesday', short: 'Wed', type: 'skills-pull', focus: 'CALISTHENICS — Pull', detail: 'Skills FRESH (handstand + levers) → pull strength (muscle-up ladder, pull-ups).' },
  { day: 'Thursday', short: 'Thu', type: 'run', focus: 'RUN — Easy Z2', detail: 'Easy Z2 loop. Conversational pace, build the aerobic base.' },
  { day: 'Friday', short: 'Fri', type: 'skills-push', focus: 'CALISTHENICS — Push', detail: 'Skills FRESH → push strength (dips, planche) + core/legs.' },
  { day: 'Saturday', short: 'Sat', type: 'run', focus: 'RUN — Push Day', detail: 'Attack the PR. One hard push per week — go for sub-32.' },
  { day: 'Sunday', short: 'Sun', type: 'rest', focus: 'Shakeout / Handstand', detail: 'Easy shakeout OR low-fatigue handstand practice (greasing the groove).' }
];

export const dayTypeMeta: Record<DayType, { label: string; color: string; bg: string }> = {
  rest: { label: 'Rest', color: '#7c93a0', bg: 'rgba(124,147,160,0.14)' },
  run: { label: 'Run', color: '#e8a14b', bg: 'rgba(232,161,75,0.14)' },
  'skills-pull': { label: 'Skills · Pull', color: '#37b6c4', bg: 'rgba(55,182,196,0.14)' },
  'skills-push': { label: 'Skills · Push', color: '#d9695f', bg: 'rgba(217,105,95,0.14)' }
};

// 3:1 periodization (Bompa): weeks 1-3 build, week 4 deload.
export const periodization = [
  { week: 'Wk 1', load: 100, type: 'Build' },
  { week: 'Wk 2', load: 112, type: 'Build' },
  { week: 'Wk 3', load: 124, type: 'Build' },
  { week: 'Wk 4', load: 75, type: 'Deload' }
];

/** Which day-of-week index maps into weeklyPlan (Mon=0). */
export function planForToday(date = new Date()): DayPlan {
  const idx = (date.getDay() + 6) % 7;
  return weeklyPlan[idx];
}

/** Deload week is week 4 of a rolling 4-week cycle from an anchor date. */
export function isDeloadWeek(date = new Date()): boolean {
  const anchor = new Date('2026-01-05'); // a Monday
  const weeks = Math.floor((date.getTime() - anchor.getTime()) / (7 * 24 * 3600 * 1000));
  return ((weeks % 4) + 4) % 4 === 3;
}
