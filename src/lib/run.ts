// Run math + formatting shared across the app.

export type LatLng = [number, number];

export function fmtTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** mm:ss under an hour, h:mm:ss over. Used for the live clock + durations. */
export function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

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

/** Pace string (mm:ss) per mile from distance + time. Guards div-by-zero. */
export function paceFor(seconds: number, miles: number): string {
  if (miles < 0.01 || seconds <= 0) return '--:--';
  return fmtTime(seconds / miles);
}

/** Calories for an arbitrary distance/time using a speed-derived MET. */
export function caloriesFor(seconds: number, miles: number, weightLbs: number): number {
  if (seconds <= 0) return 0;
  const mph = miles / (seconds / 3600);
  const met = Math.max(3, mph * 1.0 + 3.5); // rough running MET curve
  const kg = weightLbs * 0.453592;
  return Math.round(met * kg * (seconds / 3600));
}

/** "Morning Run" / "Lunch Run" / ... — Strava-style default activity name. */
export function defaultRunName(date = new Date()): string {
  const h = date.getHours();
  if (h < 4) return 'Night Run';
  if (h < 11) return 'Morning Run';
  if (h < 14) return 'Lunch Run';
  if (h < 18) return 'Afternoon Run';
  if (h < 22) return 'Evening Run';
  return 'Night Run';
}

/** "Today", "Yesterday", or "Mon, Jun 30" (+ year when not this year). */
export function fmtRelDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const day = (x: Date) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (day(d) === day(now)) return 'Today';
  if (day(d) === day(yesterday)) return 'Yesterday';
  const opts: Intl.DateTimeFormatOptions =
    d.getFullYear() === now.getFullYear()
      ? { weekday: 'short', month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString(undefined, opts);
}
