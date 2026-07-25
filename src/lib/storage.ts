/**
 * RUNNER data store.
 * One namespaced object in localStorage (`runner:v1`). Old INVINCIBLE data
 * (`forge:v1`) is migrated on first load: GPS runs and manual loop logs both
 * become Activities, so no history is lost.
 */
import { useCallback, useEffect, useState } from 'react';
import { RACE_DISTANCES, type LatLng, type Sport } from './run';
import type { FoodEntry, NutritionProfile, SavedMeal } from './nutrition';
import type { WorkoutTemplate, WorkoutLog } from './training';

export const STORAGE_KEY = 'runner:v1';
const LEGACY_KEY = 'forge:v1';

export interface Split {
  miles: number;   // usually 1.0; the final split may be partial (e.g. 0.4)
  seconds: number; // time spent in this split
}

export interface Activity {
  id: string;
  date: string;        // ISO datetime of when the activity started
  name: string;
  sport: Sport;        // run | ride | walk (legacy data defaults to run)
  seconds: number;     // moving time
  miles: number;
  route: LatLng[];     // empty for manual entries
  splits: Split[];     // empty for manual entries
  source: 'gps' | 'manual';
  note: string;
}

export interface RunnerData {
  activities: Activity[];
  training: {
    templates: WorkoutTemplate[];  // saved/built workouts
    logs: WorkoutLog[];            // finished sessions
  };
  nutrition: {
    entries: FoodEntry[];
    meals: SavedMeal[];                  // saved custom meals / favorites
    profile: NutritionProfile | null;   // null until goals onboarding is done
    apiKey: string;                      // user's own Anthropic key (device-only)
  };
  settings: {
    name: string;
    photo: string;      // data URL of the user's avatar ('' = initial tile)
    accent: string;     // accent/brand color id (see lib/theme)
    weightLbs: number;
    weeklyGoalMiles: number;
    runBpm: number;
    walkBpm: number;
  };
}

export function defaultData(): RunnerData {
  return {
    activities: [],
    training: { templates: [], logs: [] },
    nutrition: { entries: [], meals: [], profile: null, apiKey: '' },
    settings: { name: 'Runner', photo: '', accent: 'green', weightLbs: 175, weeklyGoalMiles: 10, runBpm: 170, walkBpm: 120 }
  };
}

// ---- legacy migration ----------------------------------------------------

interface LegacyGpsRun { id: string; date: string; seconds: number; miles: number; route: LatLng[]; note: string }
interface LegacyRun { id: string; date: string; seconds: number; note: string }
interface LegacyData {
  runs?: LegacyRun[];
  gpsRuns?: LegacyGpsRun[];
  settings?: { runBpm?: number; walkBpm?: number; weightLbs?: number; name?: string };
}

function migrateLegacy(): RunnerData | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const old = JSON.parse(raw) as LegacyData;
    const base = defaultData();
    const activities: Activity[] = [];
    for (const r of old.runs ?? []) {
      if (r.id.startsWith('seed-')) continue; // drop demo seed data
      activities.push({
        id: `mig-${r.id}`, date: `${r.date}T12:00:00`, name: 'Loop Run', sport: 'run',
        seconds: r.seconds, miles: 3.2, route: [], splits: [], source: 'manual', note: r.note ?? ''
      });
    }
    for (const g of old.gpsRuns ?? []) {
      activities.push({
        id: `mig-${g.id}`, date: `${g.date}T12:00:00`, name: 'Run', sport: 'run',
        seconds: g.seconds, miles: g.miles, route: g.route ?? [], splits: [], source: 'gps', note: g.note ?? ''
      });
    }
    activities.sort((a, b) => a.date.localeCompare(b.date));
    return {
      activities,
      training: base.training,
      nutrition: base.nutrition,
      settings: {
        ...base.settings,
        name: old.settings?.name ?? base.settings.name,
        weightLbs: old.settings?.weightLbs ?? base.settings.weightLbs,
        runBpm: old.settings?.runBpm ?? base.settings.runBpm,
        walkBpm: old.settings?.walkBpm ?? base.settings.walkBpm
      }
    };
  } catch {
    return null;
  }
}

// ---- load / save -----------------------------------------------------------

export function loadData(): RunnerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const migrated = migrateLegacy();
      if (migrated) {
        saveData(migrated);
        return migrated;
      }
      return defaultData();
    }
    const parsed = JSON.parse(raw) as Partial<RunnerData>;
    const base = defaultData();
    const data: RunnerData = {
      // legacy activities predate the sport field — they were all runs
      activities: (parsed.activities ?? base.activities).map((a) => ({ ...a, sport: a.sport ?? 'run' })),
      training: { ...base.training, ...(parsed.training ?? {}) },
      nutrition: { ...base.nutrition, ...(parsed.nutrition ?? {}) },
      settings: { ...base.settings, ...(parsed.settings ?? {}) }
    };
    // One-time flip of installs still on the old orange default to the new
    // green default. Runs once (guarded by a flag) so a later manual choice
    // of orange is never reverted.
    try {
      if (!localStorage.getItem(GREEN_DEFAULT_FLAG)) {
        if (data.settings.accent === 'orange') data.settings.accent = 'green';
        localStorage.setItem(GREEN_DEFAULT_FLAG, '1');
        saveData(data);
      }
    } catch { /* ignore */ }
    return data;
  } catch {
    return defaultData();
  }
}

const GREEN_DEFAULT_FLAG = 'runner:greenDefault';

export function saveData(data: RunnerData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage full / unavailable — fail silently */
  }
}

// ---- React hook (single in-memory source of truth) -------------------------

let listeners: Array<(d: RunnerData) => void> = [];
let changeHooks: Array<() => void> = [];
let memory: RunnerData | null = null;

function getMemory(): RunnerData {
  if (!memory) memory = loadData();
  return memory;
}

/** Read-only snapshot for non-React modules (the sync engine). */
export function getData(): RunnerData {
  return getMemory();
}

/** Fires after any store write — used by the sync engine to schedule a push. */
export function onStoreChange(fn: () => void): () => void {
  changeHooks.push(fn);
  return () => {
    changeHooks = changeHooks.filter((f) => f !== fn);
  };
}

function commit(next: RunnerData) {
  memory = next;
  saveData(next);
  listeners.forEach((l) => l(next));
  changeHooks.forEach((h) => h());
}

/** Imperative store mutation for non-React modules. */
export function mutateStore(mut: (d: RunnerData) => RunnerData) {
  commit(mut(structuredClone(getMemory())));
}

export function useStore() {
  const [data, setData] = useState<RunnerData>(getMemory);

  useEffect(() => {
    const fn = (d: RunnerData) => setData(d);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);

  const update = useCallback((mut: (d: RunnerData) => RunnerData) => {
    commit(mut(structuredClone(getMemory())));
  }, []);

  return { data, update };
}

/** Imperative add — used by the tracker store, which lives outside React. */
export function addActivity(a: Activity) {
  mutateStore((d) => {
    d.activities.push(a);
    return d;
  });
}

// ---- helpers ---------------------------------------------------------------

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function localDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

function mondayOf(d: Date): Date {
  const m = new Date(d);
  m.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  m.setHours(0, 0, 0, 0);
  return m;
}

/** Distance / time / run count for the week containing `now` (Mon–Sun). */
export function weekStats(activities: Activity[], now = new Date()) {
  const start = mondayOf(now);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  const inWeek = activities.filter((a) => {
    const d = new Date(a.date);
    return d >= start && d < end;
  });
  return {
    runs: inWeek.length,
    miles: inWeek.reduce((s, a) => s + a.miles, 0),
    seconds: inWeek.reduce((s, a) => s + a.seconds, 0)
  };
}

/** Per-day breakdown of the current week (Mon–Sun) for the Home dashboard. */
export function weekByDay(activities: Activity[], now = new Date()) {
  const start = mondayOf(now);
  const todayKey = localDay(now.toISOString());
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return labels.map((label, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = localDay(day.toISOString());
    const runs = activities.filter((a) => localDay(a.date) === key);
    return {
      label,
      dateNum: day.getDate(),
      miles: runs.reduce((s, a) => s + a.miles, 0),
      runs: runs.length,
      isToday: key === todayKey,
      isFuture: day > now
    };
  });
}

/** Last `n` weeks of mileage (oldest first) for the profile chart. */
export function weeklyMileage(activities: Activity[], n = 8, now = new Date()) {
  const thisMonday = mondayOf(now);
  const weeks: { label: string; miles: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(thisMonday);
    start.setDate(thisMonday.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const miles = activities
      .filter((a) => {
        const d = new Date(a.date);
        return d >= start && d < end;
      })
      .reduce((s, a) => s + a.miles, 0);
    const label = i === 0 ? 'Now' : start.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
    weeks.push({ label, miles: +miles.toFixed(1) });
  }
  return weeks;
}

/** Consecutive-day run streak ending today (or yesterday). */
export function computeStreak(activities: Activity[]): number {
  if (activities.length === 0) return 0;
  const days = new Set(activities.map((a) => localDay(a.date)));
  const cursor = new Date();
  const key = () => localDay(cursor.toISOString());
  let streak = 0;
  if (!days.has(localDay(new Date().toISOString()))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(key())) return 0;
  }
  while (days.has(localDay(cursor.toISOString()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** All-time totals (all sports) + run-only best efforts, Strava-style. */
export function bestEfforts(activities: Activity[]) {
  const totalMiles = activities.reduce((s, a) => s + a.miles, 0);
  const totalSeconds = activities.reduce((s, a) => s + a.seconds, 0);

  let longest: Activity | null = null;
  let fastestPace: Activity | null = null; // best avg pace, runs >= 1 mi
  let fastestMileSec: number | null = null; // fastest full-mile split

  const runs = activities.filter((a) => (a.sport ?? 'run') === 'run');
  for (const a of runs) {
    if (!longest || a.miles > longest.miles) longest = a;
    if (a.miles >= 1) {
      if (!fastestPace || a.seconds / a.miles < fastestPace.seconds / fastestPace.miles) fastestPace = a;
    }
    for (const s of a.splits) {
      if (s.miles >= 0.995 && (fastestMileSec === null || s.seconds < fastestMileSec)) {
        fastestMileSec = s.seconds;
      }
    }
  }
  return { totalMiles, totalSeconds, count: activities.length, longest, fastestPace, fastestMileSec };
}

export interface RaceBest {
  label: string;
  miles: number;
  seconds: number | null; // best (fastest) projected time, null if never run that far
  exact: boolean;         // true when a run's distance closely matched (not just projected)
}

/**
 * Best effort per standard race distance (5K, 10K, …) for the Home dashboard.
 * A run "unlocks" a distance once it covers at least that far; the time is the
 * fastest run's average pace projected onto the exact distance.
 */
export function raceBests(activities: Activity[]): RaceBest[] {
  return RACE_DISTANCES.map((d) => {
    let bestSec: number | null = null;
    let exact = false;
    for (const a of activities) {
      if ((a.sport ?? 'run') !== 'run') continue; // race PRs are runs only
      if (a.miles <= 0 || a.miles + 0.03 < d.miles) continue;
      const projected = (a.seconds / a.miles) * d.miles;
      if (bestSec === null || projected < bestSec) {
        bestSec = projected;
        exact = Math.abs(a.miles - d.miles) < 0.2;
      }
    }
    return { label: d.label, miles: d.miles, seconds: bestSec, exact };
  });
}

/**
 * Chronological times for one race distance — every run long enough to cover
 * it, with the run's average pace projected onto the exact distance. Feeds
 * the Home progress graph.
 */
export function raceTrend(activities: Activity[], miles: number) {
  return activities
    .filter((a) => (a.sport ?? 'run') === 'run' && a.miles > 0 && a.seconds > 0 && a.miles + 0.03 >= miles)
    .map((a) => ({
      date: a.date,
      name: a.name,
      seconds: Math.round((a.seconds / a.miles) * miles),
      exact: Math.abs(a.miles - miles) < 0.2
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Per-day calorie totals for the current week (Mon–Sun) for the Home dashboard. */
export function weekCalories(entries: FoodEntry[], now = new Date()) {
  const start = mondayOf(now);
  const todayKey = localDay(now.toISOString());
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return labels.map((label, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;
    const calories = entries
      .filter((e) => e.date === key)
      .reduce((s, e) => s + Math.round(e.calories * e.servings), 0);
    return { label, calories, isToday: key === todayKey, isFuture: day > now };
  });
}
