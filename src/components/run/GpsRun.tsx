import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, Square, MapPin, Lock, Satellite, Trash2 } from 'lucide-react';
import {
  fmtClock, paceFor, haversineMeters, metersToMiles, caloriesGps, type LatLng
} from '../../lib/run';
import { useWakeLock } from '../../lib/useWakeLock';
import { useForge, withSession, uid, todayISO, type GpsRun as GpsRunEntry } from '../../lib/storage';
import { toast } from '../../lib/toast';

type Phase = 'idle' | 'running' | 'paused';

const DEFAULT_CENTER: LatLng = [41.1506, -73.9495]; // Rockland Lake-ish
const MIN_MOVE_M = 4;    // ignore jitter below this
const MAX_JUMP_M = 150;  // ignore GPS teleports above this
const MAX_ACCURACY_M = 40;

export default function GpsRun() {
  const { data, update } = useForge();
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [miles, setMiles] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const wake = useWakeLock();

  // refs that the geolocation callback reads/writes without re-rendering
  const mapDiv = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const line = useRef<L.Polyline | null>(null);
  const dot = useRef<L.CircleMarker | null>(null);
  const route = useRef<LatLng[]>([]);
  const lastPt = useRef<LatLng | null>(null);
  const watchId = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;

  // init map once
  useEffect(() => {
    if (!mapDiv.current || map.current) return;
    const m = L.map(mapDiv.current, { zoomControl: false, attributionControl: true }).setView(DEFAULT_CENTER, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(m);
    line.current = L.polyline([], { color: '#e8a14b', weight: 5, opacity: 0.9 }).addTo(m);
    dot.current = L.circleMarker(DEFAULT_CENTER, {
      radius: 7, color: '#0b1418', weight: 2, fillColor: '#37b6c4', fillOpacity: 1
    }).addTo(m);
    map.current = m;
    setTimeout(() => m.invalidateSize(), 100);
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  // 1s timer ticks only while running
  useEffect(() => {
    if (phase !== 'running') return;
    timer.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [phase]);

  function onPosition(pos: GeolocationPosition) {
    const p: LatLng = [pos.coords.latitude, pos.coords.longitude];
    const acc = pos.coords.accuracy;
    setAccuracy(acc);
    setError('');

    // always move the dot + (while running) follow the runner
    dot.current?.setLatLng(p);
    if (phaseRef.current === 'running') map.current?.panTo(p, { animate: true });
    else if (route.current.length === 0) map.current?.setView(p, 16);

    if (phaseRef.current !== 'running') return;
    if (acc > MAX_ACCURACY_M) return; // too noisy to trust for distance

    if (lastPt.current) {
      const d = haversineMeters(lastPt.current, p);
      if (d < MIN_MOVE_M || d > MAX_JUMP_M) return; // jitter or teleport
      setMiles((mi) => mi + metersToMiles(d));
    }
    lastPt.current = p;
    route.current = [...route.current, p];
    line.current?.setLatLngs(route.current as L.LatLngExpression[]);
  }

  function onError(err: GeolocationPositionError) {
    setError(
      err.code === err.PERMISSION_DENIED
        ? 'Location permission denied — enable it in your browser to track runs.'
        : 'Waiting for GPS signal…'
    );
  }

  function startWatch() {
    if (watchId.current !== null) return;
    watchId.current = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 20000
    });
  }
  function stopWatch() {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }

  function start() {
    setElapsed(0);
    setMiles(0);
    route.current = [];
    lastPt.current = null;
    line.current?.setLatLngs([]);
    setError('');
    void wake.acquire();
    startWatch();
    setPhase('running');
  }
  function pause() {
    setPhase('paused');
    lastPt.current = null; // don't count the paused gap when we resume
  }
  function resume() {
    setPhase('running');
  }
  function stop() {
    stopWatch();
    void wake.release();
    if (elapsed > 0 && miles > 0.02) {
      const entry: GpsRunEntry = {
        id: uid(),
        date: todayISO(),
        seconds: elapsed,
        miles: +miles.toFixed(2),
        route: route.current,
        note: ''
      };
      update((d) => {
        d.gpsRuns = [...d.gpsRuns, entry];
        return withSession(d, 'run');
      });
      toast(`GPS run saved ✓ ${entry.miles.toFixed(2)} mi`);
    }
    setPhase('idle');
  }

  // cleanup watch on unmount
  useEffect(() => () => stopWatch(), []);

  const pace = paceFor(elapsed, miles);
  const cals = caloriesGps(elapsed, miles, data.settings.weightLbs);
  const recent = [...data.gpsRuns].reverse();

  if (!supported) {
    return (
      <div className="card text-center">
        <Satellite className="mx-auto text-forge-dim mb-2" />
        <p className="text-sm text-forge-dim">Geolocation isn't available on this device/browser.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* map */}
      <div className="card-tight !p-0 overflow-hidden">
        <div ref={mapDiv} className="w-full h-72" style={{ background: '#0b1418' }} />
      </div>

      {/* live stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Distance" value={miles.toFixed(2)} unit="mi" big />
        <Stat label="Time" value={fmtClock(elapsed)} />
        <Stat label="Pace" value={pace.replace('/mi', '')} unit="/mi" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Calories" value={`${cals}`} />
        <div className="card-tight flex items-center justify-center gap-2">
          <Satellite size={15} className={accuracy && accuracy <= MAX_ACCURACY_M ? 'text-forge-green' : 'text-forge-dim'} />
          <span className="text-xs text-forge-dim nums">
            {accuracy ? `±${Math.round(accuracy)}m` : 'no fix'}
          </span>
          <Lock size={14} className={wake.active ? 'text-forge-green' : 'text-forge-dim'} />
        </div>
      </div>

      {error && (
        <div className="card-tight border-l-2 border-forge-red text-sm text-forge-dim">{error}</div>
      )}

      {/* controls */}
      <div className="flex items-center justify-center gap-3">
        {phase === 'idle' && (
          <button className="btn-primary w-full" onClick={start}>
            <Play size={18} /> Start GPS Run
          </button>
        )}
        {phase === 'running' && (
          <>
            <button className="btn-ghost flex-1" onClick={pause}>
              <Pause size={18} /> Pause
            </button>
            <button className="btn-primary flex-1" onClick={stop}>
              <Square size={18} /> Finish
            </button>
          </>
        )}
        {phase === 'paused' && (
          <>
            <button className="btn-primary flex-1" onClick={resume}>
              <Play size={18} /> Resume
            </button>
            <button className="btn-ghost flex-1" onClick={stop}>
              <Square size={18} /> Finish
            </button>
          </>
        )}
      </div>

      {phase !== 'idle' && (
        <p className="cite text-center">
          Keep the screen on — web apps can't track GPS with the screen locked (that needs the native build).
        </p>
      )}

      {/* history */}
      <div className="card">
        <h2 className="section-title text-base mb-3 flex items-center gap-2">
          <MapPin size={16} className="text-forge-teal" /> GPS Runs
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-forge-dim">No GPS runs yet. Hit start and map your first one.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((r) => (
              <HistoryRow key={r.id} run={r} onDelete={() =>
                update((d) => ({ ...d, gpsRuns: d.gpsRuns.filter((x) => x.id !== r.id) }))
              } />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, unit, big }: { label: string; value: string; unit?: string; big?: boolean }) {
  return (
    <div className="card-tight text-center">
      <div className={`stat-num text-white ${big ? 'text-3xl' : 'text-2xl'}`}>
        {value}
        {unit && <span className="text-forge-dim text-sm font-bold"> {unit}</span>}
      </div>
      <div className="text-[10px] text-forge-dim mt-0.5">{label}</div>
    </div>
  );
}

function HistoryRow({ run, onDelete }: { run: GpsRunEntry; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-forge-border bg-forge-bg/40">
      <RoutePreview route={run.route} />
      <div className="flex-1">
        <div className="stat-num text-lg text-white">{run.miles.toFixed(2)} mi</div>
        <div className="text-xs text-forge-dim nums">
          {run.date} · {fmtClock(run.seconds)} · {paceFor(run.seconds, run.miles)}
        </div>
      </div>
      <button className="text-forge-dim hover:text-forge-red p-1" onClick={onDelete} aria-label="Delete run">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

/** Tiny normalized SVG preview of the route shape. */
function RoutePreview({ route }: { route: [number, number][] }) {
  if (route.length < 2) {
    return <div className="w-12 h-12 rounded-lg bg-forge-panel2 flex items-center justify-center"><MapPin size={16} className="text-forge-dim" /></div>;
  }
  const lats = route.map((p) => p[0]);
  const lngs = route.map((p) => p[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const w = maxLng - minLng || 1e-6;
  const h = maxLat - minLat || 1e-6;
  const span = Math.max(w, h);
  const pts = route
    .map((p) => {
      const x = 2 + ((p[1] - minLng) / span) * 44;
      const y = 46 - ((p[0] - minLat) / span) * 44; // invert lat for screen y
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={48} height={48} className="rounded-lg bg-forge-panel2 shrink-0">
      <polyline points={pts} fill="none" stroke="#37b6c4" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
