/**
 * In-app release notes. Bump APP_VERSION and prepend an entry whenever a
 * deploy ships something user-visible — Home pops a "What's new" banner once
 * per version (dismissal stored per device).
 */

export interface ChangelogEntry {
  v: number;
  date: string;   // yyyy-mm-dd of the release
  title: string;
  points: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    v: 8,
    date: '2026-07-23',
    title: 'Rides, walks & workout intensity',
    points: [
      'Record now tracks three sports — pick Run, Ride or Walk before you start. Rides show speed (mph), and calories adjust to the sport.',
      'Log rides and walks manually too, and see each sport tagged in the feed.',
      'Workouts now log an intensity (Light → Max, RPE-anchored) when you finish — it shows on the feed and in your history next to duration.',
      'Race PRs and the Progress graph stay runs-only, so a bike ride never inflates your 5K time.'
    ]
  },
  {
    v: 7,
    date: '2026-07-21',
    title: 'Lift days, friends & progress graphs',
    points: [
      'New Train tab — a full weightlifting hub: muscle groups & subgroups, an exercise library with suggested sets, reps and tempo, split presets (PPL, Upper/Lower…), a workout builder, and live logging with a time-under-tension timer.',
      'Progress graph on Home — pick 5K, 10K or any distance and see your times trend over every qualifying run.',
      'Friends! Claim a @username in the You tab, follow each other, and see friends\' runs and workouts in your feed with kudos.',
      'This What\'s new banner — a quick note here whenever the app updates.'
    ]
  },
  {
    v: 6,
    date: '2026-07-17',
    title: 'Green era',
    points: [
      'Green is the new default look (you can still pick any color in the You tab).',
      'Flyover video can export with a transparent background to overlay on your own clips.',
      'Activity maps can switch to satellite view.'
    ]
  }
];

export const APP_VERSION = CHANGELOG[0].v;

const SEEN_KEY = 'runner:seenVersion';

export function unseenChanges(): ChangelogEntry[] {
  try {
    const seen = parseInt(localStorage.getItem(SEEN_KEY) ?? '0', 10) || 0;
    return CHANGELOG.filter((e) => e.v > seen);
  } catch {
    return [];
  }
}

export function markChangesSeen() {
  try { localStorage.setItem(SEEN_KEY, String(APP_VERSION)); } catch { /* ignore */ }
}
