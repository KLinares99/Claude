import { useRef } from 'react';
import { X, Download, Upload, Database, Shield } from 'lucide-react';
import { useForge, computeStreak, type ForgeData } from '../lib/storage';
import { toast } from '../lib/toast';

export default function DataPanel({ onClose }: { onClose: () => void }) {
  const { data, update } = useForge();
  const fileRef = useRef<HTMLInputElement>(null);

  const loopRuns = data.runs.length;
  const gpsCount = data.gpsRuns.length;
  const gpsMiles = data.gpsRuns.reduce((s, r) => s + r.miles, 0);
  const skillLogs = Object.values(data.cal.nodes).reduce((s, n) => s + n.logs.length, 0);
  const masteredNodes = Object.values(data.cal.nodes).filter((n) => n.mastered).length;
  const sessions = data.sessions.length;
  const streak = computeStreak(data.sessions);
  const lastSession = [...data.sessions].sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? '—';

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invincible-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('Backup downloaded ✓');
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<ForgeData>;
        if (!parsed || !Array.isArray(parsed.sessions)) throw new Error('bad file');
        if (!confirm('Restore this backup? It replaces your current data on this device.')) return;
        update((d) => ({
          runs: parsed.runs ?? d.runs,
          gpsRuns: parsed.gpsRuns ?? d.gpsRuns,
          cal: {
            nodes: parsed.cal?.nodes ?? d.cal.nodes,
            maxes: { ...d.cal.maxes, ...(parsed.cal?.maxes ?? {}) }
          },
          sessions: parsed.sessions ?? d.sessions,
          settings: { ...d.settings, ...(parsed.settings ?? {}) }
        }));
        toast('Backup restored ✓');
      } catch {
        toast('Could not read that file');
      } finally {
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  }

  const stats: { label: string; value: string }[] = [
    { label: 'Loop runs', value: `${loopRuns}` },
    { label: 'GPS runs', value: `${gpsCount}` },
    { label: 'GPS miles', value: gpsMiles.toFixed(1) },
    { label: 'Skill logs', value: `${skillLogs}` },
    { label: 'Nodes mastered', value: `${masteredNodes}` },
    { label: 'Total sessions', value: `${sessions}` }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-forge-panel border border-forge-border rounded-t-2xl sm:rounded-2xl w-full max-w-[480px] max-h-[88vh] overflow-y-auto p-5 space-y-4"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between">
          <h2 className="section-title text-lg flex items-center gap-2">
            <Database size={18} className="text-forge-teal" /> Data & Backup
          </h2>
          <button onClick={onClose} className="text-forge-dim p-1"><X size={22} /></button>
        </div>

        {/* live counts — your source of truth */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="card-tight text-center">
              <div className="stat-num text-xl text-white">{s.value}</div>
              <div className="text-[10px] text-forge-dim mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-forge-dim text-center nums">
          🔥 {streak}-day streak · last activity {lastSession}
        </div>

        {/* where it's stored */}
        <div className="card-tight flex gap-3">
          <Shield size={18} className="text-forge-green shrink-0 mt-0.5" />
          <div className="text-xs text-forge-dim leading-relaxed">
            Everything saves on <span className="text-slate-200">this device</span> (your browser's local storage).
            It survives closing the app and restarting your phone, but it isn't synced to the cloud.
            <span className="text-slate-200"> Export a backup regularly</span> so you never lose your history.
          </div>
        </div>

        {/* actions */}
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-primary" onClick={exportData}>
            <Download size={18} /> Export
          </button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={18} /> Import
          </button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importData} />
      </div>
    </div>
  );
}
