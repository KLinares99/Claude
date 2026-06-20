// Rockland Lake loop constants + run math.
export const LOOP_MILES = 3.2;
export const TARGET_SECONDS = 32 * 60; // sub-32 goal
export const MET_RUNNING = 9.8;        // ~6 mph running MET

export function fmtTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export function pacePerMile(seconds: number): string {
  return fmtTime(seconds / LOOP_MILES) + '/mi';
}

/** Calories ~ MET * weightKg * hours. */
export function calories(seconds: number, weightLbs: number): number {
  const kg = weightLbs * 0.453592;
  return Math.round(MET_RUNNING * kg * (seconds / 3600));
}
