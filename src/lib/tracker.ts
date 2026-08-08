/**
 * Global GPS run tracker — a module-level singleton, deliberately OUTSIDE
 * React. The timer, the GPS watch, the route and the mile splits all live
 * here, so switching tabs (which unmounts screens) never resets a run.
 *
 * Time is wall-clock based (accumulated active milliseconds), so it also
 * stays correct when the browser throttles timers in a background tab.
 * The in-progress run is snapshotted to localStorage so even a full page
 * reload can recover it (restored in a paused state).
 */
import { haversineMeters, metersToMiles, type LatLng, type Sport } from './run';
import { addActivity, uid, type Activity, type Split } from './storage';
import { defaultRunName } from './run';
import { acquireWakeLock, releaseWakeLock } from './wakelock';

export type TrackerPhase = 'idle' | 'running' | 'paused';

export interface TrackerState {
  phase: TrackerPhase;
  elapsed: number;          // moving seconds
  meters: number;
  route: LatLng[];
  splits: Split[];          // completed full-mile splits
  accuracy: number | null;  // last GPS accuracy (m)
  lastPos: LatLng | null;
  error: string;
  startedAt: number | null; // epoch ms of session start
  restored: boolean;        // true if recovered from a reload
  goalMiles: number | null; // target distance (5K, 10K, …) for est. finish
  sport: Sport;             // what we're recording (run / ride / walk)
  bridgedMeters: number;    // distance credited across GPS gaps (backgrounding)
}

const MIN_MOVE_M = 4;      // ignore jitter below this
const MAX_JUMP_M = 150;    // instant teleports above this need bridging rules
const MAX_ACCURACY_M = 40; // don't trust worse fixes for distance
const BRIDGE_MIN_GAP_S = 15; // a jump only counts as a real gap after this long

/** Fastest believable sustained speed per sport (m/s) for gap bridging. */
const MAX_SPEED: Record<string, number> = { run: 6.5, walk: 3.0, ride: 16 };
const SNAPSHOT_KEY = 'runner:activeRun';

const idleState: TrackerState = {
  phase: 'idle', elapsed: 0, meters: 0, route: [], splits: [],
  accuracy: null, lastPos: null, error: '', startedAt: null, restored: false, goalMiles: null,
  sport: 'run', bridgedMeters: 0
};

let state: TrackerState = { ...idleState };

// internal timing: activeMs accumulates finished running segments;
// segStart marks the start of the current running segment.
let activeMs = 0;
let segStart: number | null = null;
let lastPt: LatLng | null = null;
let lastFixAt: number | null = null; // wall-clock ms of the last counted fix
let watchId: number | null = null;
let ticker: number | null = null;
let mileMark = 1;          // next full mile to record a split at
let splitBaseSec = 0;      // elapsed seconds when the last split closed

let listeners: Array<() => void> = [];

function emit() {
  listeners.forEach((l) => l());
}

function set(patch: Partial<TrackerState>) {
  state = { ...state, ...patch };
  emit();
}

function nowElapsedSec(): number {
  const live = segStart !== null ? Date.now() - segStart : 0;
  return Math.floor((activeMs + live) / 1000);
}

// ---- persistence of the in-progress run ------------------------------------

function snapshot() {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({
      activeMs: activeMs + (segStart !== null ? Date.now() - segStart : 0),
      meters: state.meters,
      route: state.route,
      splits: state.splits,
      startedAt: state.startedAt,
      mileMark,
      splitBaseSec,
      goalMiles: state.goalMiles,
      sport: state.sport,
      bridgedMeters: state.bridgedMeters
    }));
  } catch { /* ignore */ }
}

function clearSnapshot() {
  try { localStorage.removeItem(SNAPSHOT_KEY); } catch { /* ignore */ }
}

function restore() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return;
    const s = JSON.parse(raw) as {
      activeMs: number; meters: number; route: LatLng[]; splits: Split[];
      startedAt: number | null; mileMark: number; splitBaseSec: number; goalMiles?: number | null;
      sport?: Sport; bridgedMeters?: number;
    };
    if (!s || typeof s.activeMs !== 'number' || s.activeMs < 1000) return;
    activeMs = s.activeMs;
    segStart = null;
    lastPt = null;
    mileMark = s.mileMark ?? 1;
    splitBaseSec = s.splitBaseSec ?? 0;
    state = {
      ...idleState,
      phase: 'paused',
      elapsed: Math.floor(activeMs / 1000),
      meters: s.meters ?? 0,
      route: s.route ?? [],
      splits: s.splits ?? [],
      startedAt: s.startedAt ?? Date.now(),
      restored: true,
      goalMiles: s.goalMiles ?? null,
      sport: s.sport ?? 'run',
      bridgedMeters: s.bridgedMeters ?? 0
    };
  } catch { /* ignore */ }
}
restore();

// ---- GPS -------------------------------------------------------------------

function onPosition(pos: GeolocationPosition) {
  const p: LatLng = [pos.coords.latitude, pos.coords.longitude];
  const acc = pos.coords.accuracy;

  const patch: Partial<TrackerState> = { accuracy: acc, lastPos: p, error: '' };

  if (state.phase === 'running' && acc <= MAX_ACCURACY_M) {
    if (lastPt) {
      const d = haversineMeters(lastPt, p);
      if (d >= MIN_MOVE_M && d <= MAX_JUMP_M) {
        acceptFix(p, d, patch, 0);
        return;
      }
      if (d > MAX_JUMP_M) {
        // Big jump. If enough wall time passed (phone was in another app /
        // screen off — browsers suspend GPS then) AND the implied speed is
        // believable for this sport, credit the straight-line distance
        // instead of throwing the whole gap away. Anything faster is a GPS
        // teleport and is still ignored.
        const gapSec = lastFixAt ? (Date.now() - lastFixAt) / 1000 : 0;
        const maxSpeed = MAX_SPEED[state.sport] ?? 6.5;
        if (gapSec >= BRIDGE_MIN_GAP_S && d / gapSec <= maxSpeed) {
          acceptFix(p, d, patch, d);
          return;
        }
      }
      // jitter / teleport — keep the fix for the dot, don't add distance
    } else {
      lastPt = p;
      lastFixAt = Date.now();
      set({ ...patch, route: state.route.length === 0 ? [p] : state.route });
      return;
    }
  }
  set(patch);
}

/** Count a fix: add distance, extend the route, close any crossed splits.
 *  `bridged` > 0 marks the distance as credited across a GPS gap. */
function acceptFix(p: LatLng, d: number, patch: Partial<TrackerState>, bridged: number) {
  const meters = state.meters + d;
  const route = [...state.route, p];
  lastPt = p;
  lastFixAt = Date.now();
  const elapsed = nowElapsedSec();
  let splits = state.splits;
  // close a split for every full mile crossed (a long bridge can cross
  // several) — the gap's time is split evenly across them
  const crossings: number[] = [];
  while (metersToMiles(meters) >= mileMark) {
    crossings.push(mileMark);
    mileMark += 1;
  }
  if (crossings.length > 0) {
    const per = Math.max(1, Math.round((elapsed - splitBaseSec) / crossings.length));
    splits = [...splits, ...crossings.map(() => ({ miles: 1, seconds: per }))];
    splitBaseSec = elapsed;
  }
  set({ ...patch, meters, route, splits, elapsed, bridgedMeters: state.bridgedMeters + bridged });
  snapshot();
}

function onGpsError(err: GeolocationPositionError) {
  set({
    error: err.code === err.PERMISSION_DENIED
      ? 'Location permission denied — enable it in your browser to record runs.'
      : 'Waiting for GPS signal…'
  });
}

function startWatch() {
  if (watchId !== null || !('geolocation' in navigator)) return;
  watchId = navigator.geolocation.watchPosition(onPosition, onGpsError, {
    enableHighAccuracy: true,
    maximumAge: 1000,
    timeout: 20000
  });
}

function stopWatch() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

// ---- ticking ----------------------------------------------------------------

function startTicker() {
  if (ticker !== null) return;
  ticker = window.setInterval(() => {
    if (state.phase !== 'running') return;
    const elapsed = nowElapsedSec();
    if (elapsed !== state.elapsed) set({ elapsed });
    if (elapsed % 10 === 0) snapshot();
  }, 500);
}

function stopTicker() {
  if (ticker !== null) {
    clearInterval(ticker);
    ticker = null;
  }
}

// ---- public API ---------------------------------------------------------------

export function trackerStart() {
  const goalMiles = state.goalMiles; // keep goal + sport picked before starting
  const sport = state.sport;
  activeMs = 0;
  segStart = Date.now();
  lastPt = null;
  mileMark = 1;
  splitBaseSec = 0;
  state = { ...idleState, phase: 'running', startedAt: Date.now(), goalMiles, sport };
  emit();
  startWatch();
  startTicker();
  void acquireWakeLock();
  snapshot();
}

/** Set (or clear) the target distance in miles for the live estimated finish. */
export function trackerSetGoal(miles: number | null) {
  set({ goalMiles: miles });
  snapshot();
}

/** Pick what to record (run / ride / walk). Locked once a session starts. */
export function trackerSetSport(sport: Sport) {
  if (state.phase !== 'idle') return;
  set({ sport });
}

export function trackerPause() {
  if (state.phase !== 'running') return;
  activeMs += segStart !== null ? Date.now() - segStart : 0;
  segStart = null;
  lastPt = null; // don't count the paused gap on resume
  lastFixAt = null;
  set({ phase: 'paused', elapsed: Math.floor(activeMs / 1000) });
  snapshot();
}

export function trackerResume() {
  if (state.phase !== 'paused') return;
  segStart = Date.now();
  set({ phase: 'running', restored: false });
  startWatch();
  startTicker();
  void acquireWakeLock();
}

/** Save the run as an Activity (if it's long enough) and reset. */
export function trackerFinish(name: string, note = ''): Activity | null {
  if (state.phase === 'running') trackerPause();
  const seconds = Math.floor(activeMs / 1000);
  const miles = +metersToMiles(state.meters).toFixed(2);

  let saved: Activity | null = null;
  if (seconds > 0 && miles > 0.02) {
    // close out the partial final split
    const splits = [...state.splits];
    const tail = miles - splits.length;
    if (tail > 0.05 && seconds - splitBaseSec > 5) {
      splits.push({ miles: +tail.toFixed(2), seconds: seconds - splitBaseSec });
    }
    saved = {
      id: uid(),
      date: new Date(state.startedAt ?? Date.now()).toISOString(),
      name: name.trim() || defaultRunName(new Date(state.startedAt ?? Date.now()), state.sport),
      sport: state.sport,
      seconds,
      miles,
      route: state.route,
      splits,
      source: 'gps',
      note: state.bridgedMeters > 80
        ? [note, `Includes ${metersToMiles(state.bridgedMeters).toFixed(2)} mi bridged across GPS gaps (phone was in another app).`]
            .filter(Boolean).join(' ')
        : note
    };
    addActivity(saved);
  }
  trackerDiscard();
  return saved;
}

/** Throw the in-progress run away and reset to idle. */
export function trackerDiscard() {
  stopWatch();
  stopTicker();
  void releaseWakeLock();
  activeMs = 0;
  segStart = null;
  lastPt = null;
  lastFixAt = null;
  mileMark = 1;
  splitBaseSec = 0;
  clearSnapshot();
  state = { ...idleState };
  emit();
}

// ---- React binding -------------------------------------------------------------

export function trackerSubscribe(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function trackerGet(): TrackerState {
  return state;
}
