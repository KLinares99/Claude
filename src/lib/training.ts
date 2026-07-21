/**
 * Weight-training data + the live lift session.
 *
 * Saved workout templates and finished logs live in the main store
 * (storage.ts → data.training). The *in-progress* workout is a module-level
 * singleton like the GPS tracker — timer and logged sets survive tab
 * switches, and a snapshot in localStorage survives a full reload.
 */
import { mutateStore, uid, type RunnerData } from './storage';

// ---- persisted types (stored in runner:v1 under data.training) --------------

/** One exercise slot inside a saved workout template. */
export interface TemplateExercise {
  exId: string;
  name: string;         // denormalized so custom entries work too
  sets: number;
  reps: string;
}

/** A reusable workout the user built (or generated from a split day). */
export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  createdAt: string;
}

export interface LoggedSet {
  reps: number;
  weight: number;       // lbs; 0 = bodyweight
}

export interface LoggedExercise {
  exId: string;
  name: string;
  sets: LoggedSet[];
}

/** A finished workout session. */
export interface WorkoutLog {
  id: string;
  date: string;         // ISO datetime the session started
  name: string;
  seconds: number;      // total session time
  exercises: LoggedExercise[];
}

export function emptyTraining(): { templates: WorkoutTemplate[]; logs: WorkoutLog[] } {
  return { templates: [], logs: [] };
}

/** Total volume (lbs lifted) in a log — Σ reps × weight. */
export function logVolume(log: WorkoutLog): number {
  let v = 0;
  for (const e of log.exercises) for (const s of e.sets) v += s.reps * s.weight;
  return Math.round(v);
}

export function totalSets(log: WorkoutLog): number {
  return log.exercises.reduce((n, e) => n + e.sets.length, 0);
}

// ---- template CRUD (thin wrappers over the main store) ----------------------

export function saveTemplate(t: Omit<WorkoutTemplate, 'id' | 'createdAt'> & { id?: string }): WorkoutTemplate {
  const full: WorkoutTemplate = {
    id: t.id ?? uid(),
    name: t.name,
    exercises: t.exercises,
    createdAt: new Date().toISOString()
  };
  mutateStore((d: RunnerData) => {
    const i = d.training.templates.findIndex((x) => x.id === full.id);
    if (i >= 0) d.training.templates[i] = { ...full, createdAt: d.training.templates[i].createdAt };
    else d.training.templates.push(full);
    return d;
  });
  return full;
}

export function deleteTemplate(id: string) {
  mutateStore((d) => {
    d.training.templates = d.training.templates.filter((t) => t.id !== id);
    return d;
  });
}

export function deleteLog(id: string) {
  mutateStore((d) => {
    d.training.logs = d.training.logs.filter((l) => l.id !== id);
    return d;
  });
}

// ---- live session store ------------------------------------------------------

export interface LiftSessionState {
  active: boolean;
  name: string;
  startedAt: number | null;
  elapsed: number;            // seconds, wall-clock derived
  entries: LoggedExercise[];  // sets logged so far
  planned: TemplateExercise[];// remaining plan (informational)
}

const SNAPSHOT_KEY = 'runner:activeLift';

const idleSession: LiftSessionState = {
  active: false, name: '', startedAt: null, elapsed: 0, entries: [], planned: []
};

let session: LiftSessionState = { ...idleSession };
let ticker: number | null = null;
let listeners: Array<() => void> = [];

function emit() { listeners.forEach((l) => l()); }

function set(patch: Partial<LiftSessionState>) {
  session = { ...session, ...patch };
  emit();
}

function snapshot() {
  try {
    if (!session.active) { localStorage.removeItem(SNAPSHOT_KEY); return; }
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({
      name: session.name, startedAt: session.startedAt,
      entries: session.entries, planned: session.planned
    }));
  } catch { /* ignore */ }
}

function startTicker() {
  if (ticker !== null) return;
  ticker = window.setInterval(() => {
    if (!session.active || !session.startedAt) return;
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
    if (elapsed !== session.elapsed) set({ elapsed });
  }, 1000);
}

function stopTicker() {
  if (ticker !== null) { clearInterval(ticker); ticker = null; }
}

// recover an in-progress session after a reload
try {
  const raw = localStorage.getItem(SNAPSHOT_KEY);
  if (raw) {
    const s = JSON.parse(raw) as { name: string; startedAt: number; entries: LoggedExercise[]; planned: TemplateExercise[] };
    if (s?.startedAt) {
      session = {
        active: true, name: s.name || 'Workout', startedAt: s.startedAt,
        elapsed: Math.floor((Date.now() - s.startedAt) / 1000),
        entries: s.entries ?? [], planned: s.planned ?? []
      };
      startTicker();
    }
  }
} catch { /* ignore */ }

export function liftSubscribe(fn: () => void): () => void {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
}

export function liftGet(): LiftSessionState {
  return session;
}

export function liftStart(name: string, planned: TemplateExercise[]) {
  session = {
    active: true, name: name || 'Workout', startedAt: Date.now(),
    elapsed: 0, entries: [], planned
  };
  emit();
  startTicker();
  snapshot();
}

/** Add an exercise slot to the in-progress session's plan. */
export function liftAddPlanned(t: TemplateExercise) {
  if (session.planned.some((p) => p.exId === t.exId)) return;
  set({ planned: [...session.planned, t] });
  snapshot();
}

/** Add one logged set to an exercise (creates the entry on first set). */
export function liftLogSet(exId: string, name: string, setData: LoggedSet) {
  const entries = [...session.entries];
  const i = entries.findIndex((e) => e.exId === exId);
  if (i >= 0) entries[i] = { ...entries[i], sets: [...entries[i].sets, setData] };
  else entries.push({ exId, name, sets: [setData] });
  set({ entries });
  snapshot();
}

export function liftRemoveSet(exId: string, setIndex: number) {
  const entries = session.entries
    .map((e) => (e.exId === exId ? { ...e, sets: e.sets.filter((_, i) => i !== setIndex) } : e))
    .filter((e) => e.sets.length > 0);
  set({ entries });
  snapshot();
}

/** Finish → persist as a WorkoutLog (if any sets were logged) and reset. */
export function liftFinish(): WorkoutLog | null {
  if (!session.active) return null;
  let saved: WorkoutLog | null = null;
  if (session.entries.length > 0) {
    saved = {
      id: uid(),
      date: new Date(session.startedAt ?? Date.now()).toISOString(),
      name: session.name,
      seconds: Math.floor((Date.now() - (session.startedAt ?? Date.now())) / 1000),
      exercises: session.entries
    };
    const log = saved;
    mutateStore((d) => {
      d.training.logs.push(log);
      d.training.logs.sort((a, b) => a.date.localeCompare(b.date));
      return d;
    });
  }
  liftDiscard();
  return saved;
}

export function liftDiscard() {
  stopTicker();
  session = { ...idleSession };
  try { localStorage.removeItem(SNAPSHOT_KEY); } catch { /* ignore */ }
  emit();
}
