// Run math + formatting shared across the app.

export type LatLng = [number, number];

/** GPS-tracked activity types. Legacy activities without a sport are runs. */
export type Sport = 'run' | 'ride' | 'walk';

export const SPORTS: { id: Sport; label: string; emoji: string; verb: string }[] = [
  { id: 'run', label: 'Run', emoji: '🏃', verb: 'Run' },
  { id: 'ride', label: 'Ride', emoji: '🚴', verb: 'Ride' },
  { id: 'walk', label: 'Walk', emoji: '🚶', verb: 'Walk' }
];

export function sportOf(id: string | undefined): (typeof SPORTS)[number] {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[0];
}

/** Rides read naturally as speed (mph); runs and walks as pace (min/mi). */
export function speedMph(seconds: number, miles: number): string {
  if (seconds <= 0 || miles < 0.01) return '--';
  return (miles / (seconds / 3600)).toFixed(1);
}

/** The headline effort stat for a sport: pace for run/walk, speed for ride. */
export function effortStat(sport: Sport, seconds: number, miles: number): { label: string; value: string; unit: string } {
  return sport === 'ride'
    ? { label: 'Avg speed', value: speedMph(seconds, miles), unit: 'mph' }
    : { label: 'Avg pace', value: paceFor(seconds, miles), unit: '/mi' };
}

/** Standard race distances (miles) for the live goal + estimated finish. */
export const RACE_DISTANCES: { label: string; miles: number }[] = [
  { label: '5K', miles: 3.10686 },
  { label: '10K', miles: 6.21371 },
  { label: '15K', miles: 9.32057 },
  { label: '10 mi', miles: 10 },
  { label: 'Half', miles: 13.1094 },
  { label: 'Marathon', miles: 26.2188 }
];

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

/** Calories for a distance/time using a sport-specific, speed-derived MET. */
export function caloriesFor(seconds: number, miles: number, weightLbs: number, sport: Sport = 'run'): number {
  if (seconds <= 0) return 0;
  const mph = miles / (seconds / 3600);
  let met: number;
  if (sport === 'ride') {
    // cycling MET steps (Compendium): easy spin → vigorous
    met = mph < 10 ? 4 : mph < 12 ? 6 : mph < 14 ? 8 : mph < 16 ? 10 : 12;
  } else if (sport === 'walk') {
    // walking: ~2.5 (stroll) up to ~5 (very brisk)
    met = Math.min(5, Math.max(2.5, mph * 1.2 + 0.5));
  } else {
    met = Math.max(3, mph * 1.0 + 3.5); // rough running MET curve
  }
  const kg = weightLbs * 0.453592;
  return Math.round(met * kg * (seconds / 3600));
}

/** "Morning Run" / "Evening Ride" / ... — Strava-style default name. */
export function defaultRunName(date = new Date(), sport: Sport = 'run'): string {
  const verb = sportOf(sport).verb;
  const h = date.getHours();
  if (h < 4) return `Night ${verb}`;
  if (h < 11) return `Morning ${verb}`;
  if (h < 14) return `Lunch ${verb}`;
  if (h < 18) return `Afternoon ${verb}`;
  if (h < 22) return `Evening ${verb}`;
  return `Night ${verb}`;
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
