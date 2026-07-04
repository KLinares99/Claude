import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Trash2, Pencil, Check, Share2 } from 'lucide-react';
import { useStore, type Activity } from '../lib/storage';
import { deleteRemoteActivity } from '../lib/sync';
import { fmtClock, paceFor, fmtRelDate, caloriesFor } from '../lib/run';
import { toast } from '../lib/toast';
import ShareCard from './ShareCard';

/** Full-screen activity page — map, stats, mile splits, rename, delete.
 *  readOnly = a partner's activity from the shared feed (view + share only). */
export default function ActivityDetail({
  activity, onClose, readOnly = false
}: { activity: Activity; onClose: () => void; readOnly?: boolean }) {
  const { data, update } = useStore();
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [name, setName] = useState(activity.name);
  const mapDiv = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapDiv.current || map.current || activity.route.length < 2) return;
    const m = L.map(mapDiv.current, {
      zoomControl: false,
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(m);
    const line = L.polyline(activity.route as L.LatLngExpression[], {
      color: '#FC4C02', weight: 5, opacity: 0.95
    }).addTo(m);
    L.circleMarker(activity.route[0], { radius: 6, color: '#fff', weight: 2, fillColor: '#16A34A', fillOpacity: 1 }).addTo(m);
    L.circleMarker(activity.route[activity.route.length - 1], { radius: 6, color: '#fff', weight: 2, fillColor: '#16181D', fillOpacity: 1 }).addTo(m);
    m.fitBounds(line.getBounds(), { padding: [24, 24] });
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, [activity]);

  const saveName = () => {
    const clean = name.trim();
    if (clean) {
      update((d) => {
        const a = d.activities.find((x) => x.id === activity.id);
        if (a) a.name = clean;
        return d;
      });
    }
    setEditing(false);
  };

  const del = () => {
    if (!confirm('Delete this activity? This cannot be undone.')) return;
    update((d) => ({ ...d, activities: d.activities.filter((x) => x.id !== activity.id) }));
    void deleteRemoteActivity(activity.id);
    toast('Activity deleted');
    onClose();
  };

  // slowest split scales the bars
  const maxSplitPace = Math.max(...activity.splits.map((s) => s.seconds / Math.max(0.05, s.miles)), 1);

  return (
    <div className="fixed inset-0 z-50 bg-paper overflow-y-auto">
      <header
        className="sticky top-0 z-10 bg-paper/90 backdrop-blur border-b border-line"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[480px] mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={onClose} className="p-1 -ml-1 text-dim hover:text-ink" aria-label="Close">
            <X size={24} />
          </button>
          <span className="text-sm font-bold">{fmtRelDate(activity.date)}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setSharing(true)} className="p-1 text-dim hover:text-brand" aria-label="Share">
              <Share2 size={20} />
            </button>
            {!readOnly && (
              <button onClick={del} className="p-1 -mr-1 text-dim hover:text-bad" aria-label="Delete">
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[480px] mx-auto px-4 py-4 space-y-4 pb-12">
        {/* name */}
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <input
                className="input flex-1 text-lg font-black"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
              />
              <button className="btn-primary !px-3" onClick={saveName} aria-label="Save name"><Check size={18} /></button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black flex-1">{activity.name}</h1>
              {!readOnly && (
                <button className="text-dim hover:text-ink p-1" onClick={() => setEditing(true)} aria-label="Rename">
                  <Pencil size={18} />
                </button>
              )}
            </>
          )}
        </div>

        {activity.route.length > 1 && (
          // isolate traps leaflet's internal z-indexes (200-800) so the map
          // can't paint over the sticky header or the share modal
          <div className="card !p-0 overflow-hidden isolate">
            <div ref={mapDiv} className="w-full h-64" />
          </div>
        )}

        {/* stats */}
        <div className="card-pad grid grid-cols-2 gap-4">
          <DetailStat label="Distance" value={activity.miles.toFixed(2)} unit="mi" big />
          <DetailStat label="Moving time" value={fmtClock(activity.seconds)} big />
          <DetailStat label="Avg pace" value={paceFor(activity.seconds, activity.miles)} unit="/mi" />
          <DetailStat label="Calories" value={`${caloriesFor(activity.seconds, activity.miles, data.settings.weightLbs)}`} />
        </div>

        {/* splits */}
        {activity.splits.length > 0 && (
          <div className="card-pad">
            <h2 className="font-black mb-3">Splits</h2>
            <div className="space-y-2">
              {activity.splits.map((s, i) => {
                const pace = s.seconds / Math.max(0.05, s.miles);
                const isPartial = s.miles < 0.995;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-8 text-sm font-bold text-dim nums">{isPartial ? s.miles.toFixed(1) : i + 1}</span>
                    <div className="flex-1 h-5 rounded bg-paper overflow-hidden">
                      <div
                        className="h-full bg-brand/80 rounded"
                        style={{ width: `${Math.max(8, (pace / maxSplitPace) * 100)}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm font-bold nums">{fmtClock(pace)}/mi</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activity.note && (
          <div className="card-pad text-sm text-dim">{activity.note}</div>
        )}
      </main>

      {sharing && <ShareCard activity={activity} onClose={() => setSharing(false)} />}
    </div>
  );
}

function DetailStat({ label, value, unit, big }: { label: string; value: string; unit?: string; big?: boolean }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className={`stat-num mt-0.5 ${big ? 'text-3xl' : 'text-2xl'}`}>
        {value}
        {unit && <span className="text-dim text-sm font-bold"> {unit}</span>}
      </div>
    </div>
  );
}
