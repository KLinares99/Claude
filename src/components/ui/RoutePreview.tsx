import { MapPin } from 'lucide-react';
import type { LatLng } from '../../lib/run';

/** Normalized SVG rendering of a route shape — the feed-card "map". */
export default function RoutePreview({
  route,
  height = 144,
  className = ''
}: {
  route: LatLng[];
  height?: number;
  className?: string;
}) {
  if (route.length < 2) {
    return (
      <div className={`w-full rounded-xl bg-paper flex items-center justify-center ${className}`} style={{ height }}>
        <MapPin size={18} className="text-faint" />
      </div>
    );
  }

  const W = 320;
  const H = height;
  const PAD = 16;
  const lats = route.map((p) => p[0]);
  const lngs = route.map((p) => p[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const span = Math.max(maxLng - minLng, maxLat - minLat) || 1e-6;
  // center the route inside the box
  const offX = (W - 2 * PAD - ((maxLng - minLng) / span) * (W - 2 * PAD)) / 2;
  const offY = (H - 2 * PAD - ((maxLat - minLat) / span) * (H - 2 * PAD)) / 2;

  const pt = (p: LatLng): [number, number] => [
    PAD + offX + ((p[1] - minLng) / span) * (W - 2 * PAD),
    H - PAD - offY - ((p[0] - minLat) / span) * (H - 2 * PAD)
  ];
  const pts = route.map((p) => pt(p).map((v) => v.toFixed(1)).join(',')).join(' ');
  const [sx, sy] = pt(route[0]);
  const [ex, ey] = pt(route[route.length - 1]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full rounded-xl bg-paper ${className}`}
      style={{ height }}
      preserveAspectRatio="xMidYMid meet"
    >
      <polyline points={pts} fill="none" stroke="#FC4C02" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={sx} cy={sy} r={4} fill="#16A34A" stroke="#fff" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={4} fill="#16181D" stroke="#fff" strokeWidth={1.5} />
    </svg>
  );
}
