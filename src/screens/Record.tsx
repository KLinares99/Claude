import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, Square, Satellite } from 'lucide-react';
import { fmtClock, paceFor, metersToMiles, caloriesFor, defaultRunName, type LatLng } from '../lib/run';
import {
  trackerSubscribe, trackerGet, trackerStart, trackerPause, trackerResume,
  trackerFinish, trackerDiscard
} from '../lib/tracker';
import { useStore } from '../lib/storage';
import { toast } from '../lib/toast';
import Mascot from '../components/Mascot';
import Intervals from './Intervals';

const DEFAULT_CENTER: LatLng = [41.1506, -73.9495];
const GOOD_ACCURACY_M = 40;

type Mode = 'run' | 'intervals';

/**
 * The Record screen stays mounted for the whole app session (App hides it
 * with CSS when another tab is active) and all live state lives in the
 * global tracker store — so nothing here resets when you switch tabs.
 */
export default function Record({ active }: { active: boolean }) {
  const s = useSyncExternalStore(trackerSubscribe, trackerGet);
  const { data } = useStore();
  const [mode, setMode] = useState<Mode>('run');
  const [saving, setSaving] = useState(false);

  const mapDiv = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const line = useRef<L.Polyline | null>(null);
  const dot = useRef<L.CircleMarker | null>(null);

  // lazy-init the map the first time the screen is actually visible
  // (leaflet can't measure a display:none container), then keep it forever
  useEffect(() => {
    if (!active || mode !== 'run') return;
    if (!map.current && mapDiv.current) {
      const m = L.map(mapDiv.current, { zoomControl: false, attributionControl: true }).setView(
        trackerGet().lastPos ?? DEFAULT_CENTER, 15
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(m);
      line.current = L.polyline(trackerGet().route as L.LatLngExpression[], {
        color: '#FC4C02', weight: 5, opacity: 0.95
      }).addTo(m);
      dot.current = L.circleMarker(trackerGet().lastPos ?? DEFAULT_CENTER, {
        radius: 7, color: '#ffffff', weight: 2.5, fillColor: '#FC4C02', fillOpacity: 1
      }).addTo(m);
      map.current = m;
    }
    const t = setTimeout(() => map.current?.invalidateSize(), 80);
    return () => clearTimeout(t);
  }, [active, mode]);

  // reflect global tracker state onto the map
  useEffect(() => {
    if (!map.current) return;
    line.current?.setLatLngs(s.route as L.LatLngExpression[]);
    if (s.lastPos) {
      dot.current?.setLatLng(s.lastPos);
      if (s.phase === 'running') map.current.panTo(s.lastPos, { animate: true });
      else if (s.phase === 'idle' && s.route.length === 0) map.current.setView(s.lastPos, 16);
    }
  }, [s.route, s.lastPos, s.phase]);

  const miles = metersToMiles(s.meters);
  const cals = caloriesFor(s.elapsed, miles, data.settings.weightLbs);

  return (
    <>
    <div className="space-y-4">
      {/* mode toggle */}
      <div className="card p-1 grid grid-cols-2 gap-1">
        {(['run', 'intervals'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-xl py-2 text-sm font-bold transition-colors ${
              mode === m ? 'bg-ink text-white' : 'text-dim hover:text-ink'
            }`}
          >
            {m === 'run' ? 'Run' : 'Intervals'}
          </button>
        ))}
      </div>

      {/* GPS run — the map stays in the DOM even in intervals mode */}
      <div className={mode === 'run' ? 'space-y-4' : 'hidden'}>
        {/* isolate traps leaflet's internal z-indexes so the map can't
            paint over the app header, nav or modals */}
        <div className="card !p-0 overflow-hidden relative isolate">
          <div ref={mapDiv} className="w-full h-64" />
          <div className="absolute top-3 right-3 z-[500]">
            <span
              className={`chip shadow-card ${
                s.accuracy !== null && s.accuracy <= GOOD_ACCURACY_M
                  ? 'bg-white text-good'
                  : 'bg-white text-faint'
              }`}
            >
              <Satellite size={13} />
              {s.accuracy !== null ? `GPS ±${Math.round(s.accuracy)}m` : 'GPS'}
            </span>
          </div>
        </div>

        {/* live stats */}
        <div className="card-pad">
          <div className="text-center">
            <div className="label">Time</div>
            <div className="stat-num text-6xl leading-none mt-1">{fmtClock(s.elapsed)}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-line">
            <LiveStat label="Distance" value={miles.toFixed(2)} unit="mi" />
            <LiveStat label="Avg pace" value={paceFor(s.elapsed, miles)} unit="/mi" />
            <LiveStat label="Calories" value={`${cals}`} />
          </div>
          {s.splits.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pt-3 border-t border-line">
              {s.splits.map((sp, i) => (
                <span key={i} className="chip bg-paper text-ink shrink-0">
                  Mi {i + 1} · {fmtClock(sp.seconds)}
                </span>
              ))}
            </div>
          )}
        </div>

        {s.error && (
          <div className="card-pad border-l-4 !border-l-brand text-sm text-dim">{s.error}</div>
        )}
        {s.restored && (
          <div className="card-pad border-l-4 !border-l-good text-sm text-dim">
            Your run was recovered after a reload — resume when ready.
          </div>
        )}

        {/* controls */}
        {s.phase === 'idle' && (
          <button
            className="w-24 h-24 mx-auto rounded-full bg-brand hover:bg-brand-dark text-white font-black text-lg shadow-card flex items-center justify-center transition-colors active:scale-95"
            onClick={trackerStart}
          >
            Start
          </button>
        )}
        {s.phase === 'running' && (
          <button
            className="w-24 h-24 mx-auto rounded-full bg-ink text-white shadow-card flex items-center justify-center active:scale-95"
            onClick={trackerPause}
            aria-label="Pause"
          >
            <Pause size={36} fill="currentColor" />
          </button>
        )}
        {s.phase === 'paused' && (
          <div className="flex items-center justify-center gap-4">
            <button
              className="w-20 h-20 rounded-full bg-brand hover:bg-brand-dark text-white shadow-card flex items-center justify-center active:scale-95"
              onClick={trackerResume}
              aria-label="Resume"
            >
              <Play size={30} fill="currentColor" className="ml-1" />
            </button>
            <button
              className="w-20 h-20 rounded-full bg-ink text-white shadow-card flex items-center justify-center active:scale-95"
              onClick={() => setSaving(true)}
              aria-label="Finish"
            >
              <Square size={26} fill="currentColor" />
            </button>
          </div>
        )}

        {s.phase !== 'idle' && (
          <p className="text-[11px] text-faint text-center">
            Keep the screen on while recording — mobile browsers pause GPS when the screen locks.
          </p>
        )}
      </div>

      {mode === 'intervals' && <Intervals />}
    </div>

      {/* modal lives outside the space-y container so its sibling margins
          can't offset the fixed backdrop */}
      {saving && (
        <SaveSheet
          seconds={s.elapsed}
          miles={miles}
          startedAt={s.startedAt}
          onResume={() => setSaving(false)}
          onDiscard={() => {
            if (confirm('Discard this run? This cannot be undone.')) {
              trackerDiscard();
              setSaving(false);
            }
          }}
          onSave={(name) => {
            const saved = trackerFinish(name);
            setSaving(false);
            toast(saved ? `${saved.name} saved — ${saved.miles.toFixed(2)} mi` : 'Run too short to save');
          }}
        />
      )}
    </>
  );
}

function LiveStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="text-center">
      <div className="label">{label}</div>
      <div className="stat-num text-2xl mt-0.5">
        {value}
        {unit && <span className="text-dim text-xs font-bold"> {unit}</span>}
      </div>
    </div>
  );
}

function SaveSheet({
  seconds, miles, startedAt, onSave, onResume, onDiscard
}: {
  seconds: number;
  miles: number;
  startedAt: number | null;
  onSave: (name: string) => void;
  onResume: () => void;
  onDiscard: () => void;
}) {
  const [name, setName] = useState(() => defaultRunName(new Date(startedAt ?? Date.now())));
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onResume}>
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-[480px] p-5 space-y-4 shadow-sheet"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto sm:hidden" />
        <div className="flex items-center gap-3">
          <Mascot pose="coach" size={56} fallback={<span className="text-3xl">🦜</span>} />
          <div>
            <h2 className="text-lg font-black leading-tight">Nice run!</h2>
            <p className="text-xs text-dim">Ptak's proud — name it and save.</p>
          </div>
        </div>
        <input className="input w-full text-base font-semibold" value={name} onChange={(e) => setName(e.target.value)} placeholder="Run name" />
        <div className="grid grid-cols-3 gap-2">
          <SheetStat label="Distance" value={`${miles.toFixed(2)} mi`} />
          <SheetStat label="Time" value={fmtClock(seconds)} />
          <SheetStat label="Avg pace" value={`${paceFor(seconds, miles)}/mi`} />
        </div>
        <button className="btn-primary w-full py-3 text-base" onClick={() => onSave(name)}>Save run</button>
        <div className="flex gap-2">
          <button className="btn-ghost flex-1" onClick={onResume}>Keep going</button>
          <button className="btn-danger flex-1" onClick={onDiscard}>Discard</button>
        </div>
      </div>
    </div>
  );
}

function SheetStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper rounded-xl p-3 text-center">
      <div className="label">{label}</div>
      <div className="stat-num text-lg mt-0.5">{value}</div>
    </div>
  );
}
