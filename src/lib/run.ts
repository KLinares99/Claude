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

// ---- GPS helpers -------------------------------------------------------

export type LatLng = [number, number];

/** Great-circle distance between two coordinates, in meters (Haversine). */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const METERS_PER_MILE = 1609.344;

export function metersToMiles(m: number): number {
  return m / METERS_PER_MILE;
}

/** Pace string (mm:ss/mi) from a distance + time. Guards against div-by-zero. */
export function paceFor(seconds: number, miles: number): string {
  if (miles < 0.01) return '--:--/mi';
  return fmtTime(seconds / miles) + '/mi';
}

/** Calories for an arbitrary distance/time using speed-derived MET. */
export function caloriesGps(seconds: number, miles: number, weightLbs: number): number {
  if (seconds <= 0) return 0;
  const mph = miles / (seconds / 3600);
  // rough MET curve for running: ~ 0.1 * mph in METs, floored to a walk
  const met = Math.max(3, mph * 1.0 + 3.5);
  const kg = weightLbs * 0.453592;
  return Math.round(met * kg * (seconds / 3600));
}

