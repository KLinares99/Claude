import { Footprints, Bike, PersonStanding } from 'lucide-react';
import type { Sport } from '../../lib/run';

/** Line icon per sport — replaces the 🏃🚴🚶 emoji in the UI. */
export default function SportIcon({ sport, size = 14 }: { sport: Sport; size?: number }) {
  const Icon = sport === 'ride' ? Bike : sport === 'walk' ? PersonStanding : Footprints;
  return <Icon size={size} strokeWidth={2.2} aria-hidden="true" />;
}
