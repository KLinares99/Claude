/**
 * Global interval-workout timer — module-level singleton like the GPS
 * tracker, so it keeps counting (and the metronome keeps clicking) when
 * you switch tabs. Wall-clock based, immune to background throttling.
 */
import { Metronome, beep, fanfare } from './audio';
import { acquireWakeLock, releaseWakeLock } from './wakelock';

export interface WorkoutPhase {
  id: number;
  name: string;
  run: number;   // seconds
  walk: number;  // seconds, 0 = no stops
  desc: string;
}

export const WORKOUTS: WorkoutPhase[] = [
  { id: 1, name: 'Starter', run: 5 * 60, walk: 60, desc: 'Run 5:00 / walk 1:00' },
  { id: 2, name: 'Builder', run: 7 * 60, walk: 45, desc: 'Run 7:00 / walk 0:45' },
  { id: 3, name: 'Strong', run: 10 * 60, walk: 30, desc: 'Run 10:00 / walk 0:30' },
  { id: 4, name: 'Tempo 32', run: 32 * 60, walk: 0, desc: '32:00 straight, no stops' }
];

export type IntervalMode = 'run' | 'walk';

export interface IntervalState {
  workoutIdx: number;
  running: boolean;
  elapsed: number;
  metronomeOn: boolean;
  mode: IntervalMode;
  remaining: number;
  cycle: number;
  done: boolean;
}

/** Derive mode / segment-remaining / cycle purely from elapsed seconds. */
export function derive(w: WorkoutPhase, elapsed: number): { mode: IntervalMode; remaining: number; cycle: number; done: boolean } {
  if (w.walk === 0) {
    const remaining = Math.max(0, w.run - elapsed);
    return { mode: 'run', remaining, cycle: 1, done: elapsed >= w.run };
  }
  const cycleLen = w.run + w.walk;
  const pos = elapsed % cycleLen;
  const cycle = Math.floor(elapsed / cycleLen) + 1;
  if (pos < w.run) return { mode: 'run', remaining: w.run - pos, cycle, done: false };
  return { mode: 'walk', remaining: cycleLen - pos, cycle, done: false };
}

let workoutIdx = 0;
let running = false;
let metronomeOn = true;
let activeMs = 0;
let segStart: number | null = null;
let ticker: number | null = null;
let prevMode: IntervalMode = 'run';
let bpm = { run: 170, walk: 120 };

const metro = new Metronome();
let listeners: Array<() => void> = [];
let cached: IntervalState = compute();

function nowElapsed(): number {
  const live = segStart !== null ? Date.now() - segStart : 0;
  return Math.floor((activeMs + live) / 1000);
}

function compute(): IntervalState {
  const w = WORKOUTS[workoutIdx];
  const elapsed = nowElapsed();
  const d = derive(w, elapsed);
  return { workoutIdx, running, elapsed, metronomeOn, ...d };
}

function emit() {
  cached = compute();
  listeners.forEach((l) => l());
}

function syncMetronome(mode: IntervalMode, done: boolean) {
  if (running && metronomeOn && !done) {
    metro.setBpm(mode === 'run' ? bpm.run : bpm.walk);
    if (!metro.running) metro.start();
  } else {
    metro.stop();
  }
}

function tick() {
  const s = compute();
  if (s.done && running) {
    activeMs += segStart !== null ? Date.now() - segStart : 0;
    segStart = null;
    running = false;
    stopTicker();
    metro.stop();
    fanfare();
    void releaseWakeLock();
    emit();
    return;
  }
  if (s.mode !== prevMode) {
    beep(s.mode === 'walk' ? 660 : 990, 200);
    prevMode = s.mode;
    syncMetronome(s.mode, s.done);
  }
  emit();
}

function startTicker() {
  if (ticker !== null) return;
  ticker = window.setInterval(tick, 250);
}

function stopTicker() {
  if (ticker !== null) {
    clearInterval(ticker);
    ticker = null;
  }
}

// ---- public API -------------------------------------------------------------

export function intervalConfigure(runBpm: number, walkBpm: number) {
  bpm = { run: runBpm, walk: walkBpm };
  syncMetronome(cached.mode, cached.done);
}

export function intervalStart() {
  if (running) return;
  beep(1200, 1, 0.0001); // unlock the audio context on the user gesture
  running = true;
  segStart = Date.now();
  prevMode = derive(WORKOUTS[workoutIdx], nowElapsed()).mode;
  startTicker();
  syncMetronome(prevMode, false);
  void acquireWakeLock();
  emit();
}

export function intervalPause() {
  if (!running) return;
  activeMs += segStart !== null ? Date.now() - segStart : 0;
  segStart = null;
  running = false;
  stopTicker();
  metro.stop();
  void releaseWakeLock();
  emit();
}

export function intervalReset() {
  running = false;
  activeMs = 0;
  segStart = null;
  prevMode = 'run';
  stopTicker();
  metro.stop();
  void releaseWakeLock();
  emit();
}

export function intervalSelect(idx: number) {
  workoutIdx = Math.max(0, Math.min(WORKOUTS.length - 1, idx));
  intervalReset();
}

export function intervalToggleMetronome() {
  metronomeOn = !metronomeOn;
  syncMetronome(cached.mode, cached.done);
  emit();
}

// ---- React binding ------------------------------------------------------------

export function intervalSubscribe(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function intervalGet(): IntervalState {
  return cached;
}
