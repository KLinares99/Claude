import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Trophy, Plus } from 'lucide-react';
import { useForge, withSession, uid, todayISO, type RunEntry } from '../../lib/storage';
import { TARGET_SECONDS, fmtTime, calories, pacePerMile } from '../../lib/run';
import Ring from '../ui/Ring';

export default function RunLog() {
  const { data, update } = useForge();
  const runs = data.runs;

  const sorted = useMemo(() => [...runs].sort((a, b) => a.date.localeCompare(b.date)), [runs]);
  const pr = useMemo(() => runs.reduce((m, r) => (r.seconds < m.seconds ? r : m), runs[0]), [runs]);
  const last = sorted[sorted.length - 1];

  // progress to sub-32: baseline = worst run -> 0%, target -> 100%
  const worst = useMemo(() => Math.max(...runs.map((r) => r.seconds)), [runs]);
  const progress = pr ? Math.min(1, (worst - pr.seconds) / Math.max(1, worst - TARGET_SECONDS)) : 0;

  const chartData = sorted.map((r, i) => ({
    name: `#${i + 1}`,
    min: +(r.seconds / 60).toFixed(2),
    date: r.date
  }));

  const gapToPR = last && pr ? last.seconds - pr.seconds : 0;
  const gapToTarget = last ? last.seconds - TARGET_SECONDS : 0;

  return (
    <div className="space-y-5">
      {/* PR hero */}
      <div className="card bg-gradient-to-br from-forge-panel to-[#16323a] border-forge-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-forge-gold">
              <Trophy size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Current PR</span>
            </div>
            <div className="stat-num text-5xl text-white mt-1">{pr ? fmtTime(pr.seconds) : '—'}</div>
            <div className="text-forge-dim text-sm mt-1">
              3.2 mi · {pr ? pacePerMile(pr.seconds) : '—'}
            </div>
          </div>
          <Ring pct={progress} size={120} stroke={10} color="#37b6c4">
            <div className="stat-num text-2xl text-white">{Math.round(progress * 100)}%</div>
            <div className="text-[10px] text-forge-dim">to sub-32</div>
          </Ring>
        </div>
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Gap to PR" value={gapToPR <= 0 ? 'PR!' : `+${fmtTime(gapToPR)}`} accent={gapToPR <= 0 ? '#f2c46a' : undefined} />
        <Stat label="To sub-32" value={gapToTarget <= 0 ? '✓' : `+${fmtTime(gapToTarget)}`} accent={gapToTarget <= 0 ? '#5fc48a' : undefined} />
        <Stat label="Last run" value={last ? fmtTime(last.seconds) : '—'} />
        <Stat label="Calories" value={last ? `${calories(last.seconds, data.settings.weightLbs)}` : '—'} />
      </div>

      {/* line chart */}
      <div className="card">
        <h2 className="section-title text-base mb-1">Every Run vs Sub-32</h2>
        <p className="cite mb-3">Dashed line = 32:00 target</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ left: -18, right: 6, top: 6 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e333b" />
            <XAxis dataKey="name" tick={{ fill: '#7c93a0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#7c93a0', fontSize: 11 }} axisLine={false} tickLine={false} domain={[30, 'dataMax + 1']} />
            <Tooltip
              contentStyle={{ background: '#0b1418', border: '1px solid #1e333b', borderRadius: 10 }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(v: number) => [fmtTime(v * 60), 'Time']}
            />
            <ReferenceLine y={TARGET_SECONDS / 60} stroke="#5fc48a" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="min" stroke="#37b6c4" strokeWidth={2.5} dot={{ r: 3, fill: '#37b6c4' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <AddRunForm
        onAdd={(entry) =>
          update((d) => {
            d.runs.push(entry);
            return withSession(d, 'run', entry.date);
          })
        }
      />

      {/* history */}
      <div className="card">
        <h2 className="section-title text-base mb-3">History</h2>
        <div className="space-y-2">
          {[...sorted].reverse().map((r) => {
            const isPR = pr && r.id === pr.id;
            return (
              <div
                key={r.id}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
                  isPR ? 'border-forge-gold/40 bg-forge-gold/10' : 'border-forge-border bg-forge-bg/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="stat-num text-lg text-white">{fmtTime(r.seconds)}</span>
                    {isPR && <Trophy size={14} className="text-forge-gold" />}
                  </div>
                  <div className="text-xs text-forge-dim">
                    {r.date} · {r.breaks} breaks{r.note ? ` · ${r.note}` : ''}
                  </div>
                </div>
                <span className="text-xs text-forge-dim nums">{pacePerMile(r.seconds)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="card-tight text-center px-1">
      <div className="stat-num text-lg" style={{ color: accent ?? '#fff' }}>{value}</div>
      <div className="text-[10px] text-forge-dim mt-0.5">{label}</div>
    </div>
  );
}

function AddRunForm({ onAdd }: { onAdd: (e: RunEntry) => void }) {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState('');
  const [sec, setSec] = useState('');
  const [breaks, setBreaks] = useState('0');
  const [runFirst, setRunFirst] = useState(true);
  const [note, setNote] = useState('');

  const submit = () => {
    const m = parseInt(min || '0', 10);
    const s = parseInt(sec || '0', 10);
    const total = m * 60 + s;
    if (total <= 0) return;
    onAdd({
      id: uid(),
      date: todayISO(),
      seconds: total,
      breaks: parseInt(breaks || '0', 10),
      runFirst,
      note: note.trim()
    });
    setMin(''); setSec(''); setBreaks('0'); setNote(''); setRunFirst(true); setOpen(false);
  };

  if (!open) {
    return (
      <button className="btn-primary w-full" onClick={() => setOpen(true)}>
        <Plus size={18} /> Log a run
      </button>
    );
  }

  return (
    <div className="card space-y-3">
      <h2 className="section-title text-base">Log a run</h2>
      <div className="flex items-end gap-2">
        <Field label="Min">
          <input className="input w-16 text-center" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} placeholder="32" />
        </Field>
        <span className="pb-2 text-forge-dim">:</span>
        <Field label="Sec">
          <input className="input w-16 text-center" inputMode="numeric" value={sec} onChange={(e) => setSec(e.target.value)} placeholder="00" />
        </Field>
        <Field label="Breaks">
          <input className="input w-16 text-center" inputMode="numeric" value={breaks} onChange={(e) => setBreaks(e.target.value)} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={runFirst} onChange={(e) => setRunFirst(e.target.checked)} className="accent-forge-teal w-4 h-4" />
        Ran first (no warm-up walk)
      </label>
      <Field label="Note">
        <input className="input w-full" value={note} onChange={(e) => setNote(e.target.value)} placeholder="How did it feel?" />
      </Field>
      <div className="flex gap-2">
        <button className="btn-primary flex-1" onClick={submit}>Save</button>
        <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-forge-dim">{label}</span>
      {children}
    </label>
  );
}
