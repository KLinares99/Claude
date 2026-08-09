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
    v: 11,
    date: '2026-08-09',
    title: 'Log past workouts',
    points: [
      'Train → History → "Log past": add a workout you did without the app — date, duration, intensity, and optionally the exercises with sets × reps @ weight. It counts in your history, feed and friend sync like any live session.',
      'A little more shine: the active tab gets a soft pill, feed cards settle in gently, and the weekly card wears a subtle green wash.'
    ]
  },
  {
    v: 10,
    date: '2026-08-09',
    title: 'A cleaner Home',
    points: [
      'Home is now your feed: This week up top, then straight into everyone\'s activities — no more scrolling past four dashboards.',
      'Race times moved to the You tab as one card: pick a distance, see your best and the trend with your PR marked.',
      'Nutrition on You is now a compact row — tap it to open the full diary.',
      'Fixed: the "+ Set" button no longer falls off-screen mid-workout, "Marathon" finally fits everywhere, and editing a saved workout no longer duplicates it (deleting now lives inside the editor, away from Start).'
    ]
  },
  {
    v: 9,
    date: '2026-07-24',
    title: 'No more lost distance',
    points: [
      'Swiped to another app mid-run? Phones pause GPS in the background (a platform rule for web apps), but Runner now bridges the gap: when you come back, the distance you covered is credited in a straight line instead of vanishing.',
      'Your time was never lost — the clock is wall-time based and keeps counting no matter what.',
      'A banner shows exactly how much was bridged, and the saved run notes it too, so you always know which miles were GPS-exact.',
      'Bridging is speed-checked per sport, so a GPS glitch can never teleport you a free mile.'
    ]
  },
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
