/**
 * INVINCIBLE shared data store.
 * One namespaced object in localStorage (`forge:v1`) used by BOTH engines.
 * Every run log and every calisthenics log also appends to `sessions`,
 * which drives the unified streak + weekly count.
 */
import { useCallback, useEffect, useState } from 'react';

export const STORAGE_KEY = 'forge:v1';

export interface RunEntry {
  id: string;
  date: string;        // ISO date string (yyyy-mm-dd)
  seconds: number;     // total moving time for the 3.2mi loop
  breaks: number;      // number of walk breaks taken
  runFirst: boolean;   // did the "run first" rule hold this session
  note: string;
}

export interface NodeLog {
  date: string;        // ISO date
  value: number;       // reps (best set) or hold seconds (best hold)
}

export interface NodeState {
  logs: NodeLog[];
  mastered: boolean;
  masteredDate?: string;
}

export type SessionType = 'run' | 'cal';

export interface SessionEntry {
  id: string;
  date: string;        // ISO date
  type: SessionType;
}

export interface ForgeData {
  runs: RunEntry[];
  cal: {
    nodes: Record<string, NodeState>;
    maxes: { pullups: number; dips: number; pushups: number };
  };
  sessions: SessionEntry[];
  settings: {
    runBpm: number;
    walkBpm: number;
    weightLbs: number;
    name: string;
  };
}

// ---- seed data ---------------------------------------------------------

// Run history so the chart isn't empty. Listed oldest -> newest.
// 36:50 was the old PR; 32:00 is the current PR.
const SEED_RUN_SECONDS = [
  { s: 37 * 60 + 0, note: 'First timed loop' },
  { s: 38 * 60 + 28, note: 'Humid, legs flat' },
  { s: 40 * 60 + 0, note: 'Easy Z2 day' },
  { s: 36 * 60 + 50, note: 'New PR! Felt strong' },
  { s: 37 * 60 + 30, note: 'Windy back half' },
  { s: 37 * 60 + 0, note: 'Steady' },
  { s: 39 * 60 + 18, note: 'Tired from skills day' },
  { s: 32 * 60 + 0, note: 'Current PR — attacked it' }
];

function seedRuns(): RunEntry[] {
  const today = new Date();
  return SEED_RUN_SECONDS.map((r, i) => {
    const d = new Date(today);
    // space the seed runs roughly every 5 days going back in time
    d.setDate(today.getDate() - (SEED_RUN_SECONDS.length - 1 - i) * 5);
    return {
      id: `seed-run-${i}`,
      date: d.toISOString().slice(0, 10),
      seconds: r.s,
      breaks: i < 5 ? 2 : 0,
      runFirst: true,
      note: r.note
    };
  });
}

function seedSessionsFromRuns(runs: RunEntry[]): SessionEntry[] {
  return runs.map((r) => ({ id: `sess-${r.id}`, date: r.date, type: 'run' as const }));
}

export function defaultData(): ForgeData {
  const runs = seedRuns();
  return {
    runs,
    cal: {
      nodes: {},
      maxes: { pullups: 9, dips: 12, pushups: 25 }
    },
    sessions: seedSessionsFromRuns(runs),
    settings: { runBpm: 170, walkBpm: 120, weightLbs: 175, name: 'Kev' }
  };
}

// ---- load / save -------------------------------------------------------

export function loadData(): ForgeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as Partial<ForgeData>;
    const base = defaultData();
    // shallow-merge with defaults so new fields don't blow up old saves
    return {
      runs: parsed.runs ?? base.runs,
      cal: {
        nodes: parsed.cal?.nodes ?? base.cal.nodes,
        maxes: { ...base.cal.maxes, ...(parsed.cal?.maxes ?? {}) }
      },
      sessions: parsed.sessions ?? base.sessions,
      settings: { ...base.settings, ...(parsed.settings ?? {}) }
    };
  } catch {
    return defaultData();
  }
}

export function saveData(data: ForgeData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage full / unavailable — fail silently */
  }
}

// ---- React hook (single source of truth, kept in sync across tabs) -----

let listeners: Array<(d: ForgeData) => void> = [];
let memory: ForgeData | null = null;

function getMemory(): ForgeData {
  if (!memory) memory = loadData();
  return memory;
}

export function useForge() {
  const [data, setData] = useState<ForgeData>(getMemory);

  useEffect(() => {
    const fn = (d: ForgeData) => setData(d);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);

  const update = useCallback((mut: (d: ForgeData) => ForgeData) => {
    const next = mut(structuredClone(getMemory()));
    memory = next;
    saveData(next);
    listeners.forEach((l) => l(next));
  }, []);

  return { data, update };
}

// ---- helpers -----------------------------------------------------------

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Mark a session for the unified streak. Idempotent per day+type so that
 *  several logs within one workout count as a single session. */
export function withSession(d: ForgeData, type: SessionType, date = todayISO()): ForgeData {
  const exists = d.sessions.some((s) => s.date === date && s.type === type);
  if (!exists) d.sessions.push({ id: uid(), date, type });
  return d;
}

/** Consecutive-day streak ending today (or yesterday if nothing logged today). */
export function computeStreak(sessions: SessionEntry[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const cursor = new Date();
  // allow the streak to be "alive" if today has nothing yet but yesterday does
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Count of sessions in the current week (Mon-Sun). */
export function sessionsThisWeek(sessions: SessionEntry[]): number {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  return sessions.filter((s) => new Date(s.date) >= monday).length;
}
