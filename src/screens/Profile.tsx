import { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, Download, Upload, Shield } from 'lucide-react';
import {
  useStore, weeklyMileage, bestEfforts, computeStreak, defaultData, type RunnerData
} from '../lib/storage';
import { fmtClock, fmtTime, paceFor } from '../lib/run';
import { toast } from '../lib/toast';

export default function Profile() {
  const { data, update } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const best = bestEfforts(data.activities);
  const streak = computeStreak(data.activities);
  const weeks = weeklyMileage(data.activities, 8);

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('Backup downloaded');
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<RunnerData>;
        if (!parsed || !Array.isArray(parsed.activities)) throw new Error('bad file');
        if (!confirm('Restore this backup? It replaces your current data on this device.')) return;
        update((d) => ({
          activities: parsed.activities ?? d.activities,
          settings: { ...d.settings, ...(parsed.settings ?? {}) }
        }));
        toast('Backup restored');
      } catch {
        toast('Could not read that file');
      } finally {
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4">
      {/* identity */}
      <div className="card-pad flex items-center gap-4">
        <span className="w-16 h-16 rounded-full bg-brand text-white font-black text-2xl flex items-center justify-center">
          {data.settings.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="flex-1">
          <input
            className="text-xl font-black bg-transparent focus:outline-none w-full"
            value={data.settings.name}
            onChange={(e) => update((d) => ({ ...d, settings: { ...d.settings, name: e.target.value } }))}
            aria-label="Your name"
          />
          <div className="text-xs text-dim">{streak > 0 ? `🔥 ${streak}-day streak` : 'Runner'}</div>
        </div>
      </div>

      {/* all-time totals */}
      <div className="card-pad">
        <h2 className="font-black mb-3">All time</h2>
        <div className="grid grid-cols-3 gap-2">
          <Total label="Runs" value={`${best.count}`} />
          <Total label="Distance" value={best.totalMiles.toFixed(1)} unit="mi" />
          <Total label="Time" value={fmtClock(best.totalSeconds)} />
        </div>
      </div>

      {/* weekly mileage chart */}
      <div className="card-pad">
        <h2 className="font-black mb-1">Weekly mileage</h2>
        <p className="text-xs text-dim mb-3">Last 8 weeks</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeks} margin={{ left: -22, right: 4, top: 4 }}>
            <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(22,24,29,0.05)' }}
              contentStyle={{ background: '#fff', border: '1px solid #E7E5E0', borderRadius: 10, fontSize: 12 }}
              formatter={(v: number) => [`${v} mi`, 'Distance']}
            />
            <Bar dataKey="miles" fill="#FC4C02" radius={[5, 5, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* best efforts */}
      <div className="card-pad">
        <h2 className="font-black mb-3 flex items-center gap-2">
          <Trophy size={16} className="text-brand" /> Best efforts
        </h2>
        <div className="divide-y divide-line">
          <Effort
            label="Longest run"
            value={best.longest ? `${best.longest.miles.toFixed(2)} mi` : '—'}
            sub={best.longest?.name}
          />
          <Effort
            label="Fastest mile"
            value={best.fastestMileSec !== null ? fmtTime(best.fastestMileSec) : '—'}
            sub={best.fastestMileSec !== null ? 'from GPS splits' : 'record a GPS run ≥ 1 mi'}
          />
          <Effort
            label="Best avg pace"
            value={best.fastestPace ? `${paceFor(best.fastestPace.seconds, best.fastestPace.miles)}/mi` : '—'}
            sub={best.fastestPace?.name}
          />
        </div>
      </div>

      {/* settings */}
      <div className="card-pad space-y-3">
        <h2 className="font-black">Settings</h2>
        <SettingRow label="Weekly goal (miles)">
          <input
            className="input w-24 text-center"
            inputMode="numeric"
            value={data.settings.weeklyGoalMiles}
            onChange={(e) =>
              update((d) => ({ ...d, settings: { ...d.settings, weeklyGoalMiles: Math.max(0, parseInt(e.target.value || '0', 10)) } }))
            }
          />
        </SettingRow>
        <SettingRow label="Weight (lbs) — for calories">
          <input
            className="input w-24 text-center"
            inputMode="numeric"
            value={data.settings.weightLbs}
            onChange={(e) =>
              update((d) => ({ ...d, settings: { ...d.settings, weightLbs: Math.max(1, parseInt(e.target.value || '0', 10)) } }))
            }
          />
        </SettingRow>
      </div>

      {/* data & backup */}
      <div className="card-pad space-y-3">
        <h2 className="font-black">Data & backup</h2>
        <div className="flex gap-3 items-start">
          <Shield size={18} className="text-good shrink-0 mt-0.5" />
          <p className="text-xs text-dim leading-relaxed">
            Everything is stored on <span className="text-ink font-semibold">this device</span> (browser local storage).
            It isn't synced to the cloud — export a backup regularly so you never lose your history.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-primary" onClick={exportData}>
            <Download size={18} /> Export
          </button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={18} /> Import
          </button>
        </div>
        <button
          className="btn-danger w-full"
          onClick={() => {
            if (confirm('Erase ALL activities and settings on this device?')) {
              update(() => defaultData());
              toast('All data erased');
            }
          }}
        >
          Erase all data
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importData} />
      </div>
    </div>
  );
}

function Total({ label, value, unit }: { label: string; value: string; unit?: string }) {
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

function Effort({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {sub && <div className="text-[11px] text-dim">{sub}</div>}
      </div>
      <span className="stat-num text-lg">{value}</span>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink">{label}</span>
      {children}
    </div>
  );
}
