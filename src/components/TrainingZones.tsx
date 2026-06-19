import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { zones, polarizedSplit } from '../data/trainingZones';

const polarData = [
  { name: 'Easy (Z1-Z2)', value: 80, color: '#34d399' },
  { name: 'Hard (Z4-Z5)', value: 20, color: '#f87171' }
];

const volumeData = zones.map(z => ({
  zone: z.label,
  volume: z.weeklyVolumePct,
  color: z.color
}));

export default function TrainingZones() {
  const [expanded, setExpanded] = useState<number | null>(2);
  const [age, setAge] = useState('');

  const mafHR = age ? 180 - parseInt(age) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="section-title text-3xl">Training Zones</h1>
        <p className="text-slate-400">Heart rate-based intensity zones backed by Seiler, Daniels, and Maffetone research</p>
      </div>

      {/* Zone Cards */}
      <div className="space-y-3">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="card cursor-pointer hover:border-slate-700 transition-all"
            style={{ borderLeft: `4px solid ${zone.color}` }}
            onClick={() => setExpanded(expanded === zone.id ? null : zone.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-slate-900"
                  style={{ background: zone.color }}
                >
                  {zone.label}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{zone.name}</h3>
                  <p className="text-slate-400 text-sm">{zone.hrPct[0]}–{zone.hrPct[1]}% Max HR · RPE {zone.rpe}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-slate-400">Weekly volume</div>
                  <div className="text-lg font-bold" style={{ color: zone.color }}>{zone.weeklyVolumePct}%</div>
                </div>
                <div className="text-slate-400">
                  {expanded === zone.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {expanded === zone.id && (
              <div className="mt-5 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Purpose</h4>
                  <p className="text-slate-300 text-sm">{zone.purpose}</p>
                  <div className="mt-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Pace Zone</span>
                    <div className="text-sky-400 font-mono text-sm mt-1">{zone.paceAdjust}</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Adaptations</h4>
                  <ul className="space-y-1">
                    {zone.adaptations.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: zone.color }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Example Sessions</h4>
                  <ul className="space-y-1">
                    {zone.sessions.map((s) => (
                      <li key={s} className="text-sm text-slate-300 bg-slate-800/50 rounded-lg px-3 py-2">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Polarized Training + Volume Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title">Polarized Training Split</h2>
          <p className="section-sub">{polarizedSplit.citation}</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={polarData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                  {polarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-4">
              {polarData.map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-300">{d.name}</span>
                    <span className="font-bold" style={{ color: d.color }}>{d.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
                  </div>
                </div>
              ))}
              <p className="text-slate-400 text-xs leading-relaxed mt-2">{polarizedSplit.summary}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Weekly Volume by Zone</h2>
          <p className="section-sub">Recommended time distribution across all 5 zones</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="zone" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                formatter={(val: number) => [`${val}%`, 'Weekly Volume']}
              />
              <Bar dataKey="volume" radius={[0, 6, 6, 0]}>
                {volumeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MAF Calculator */}
      <div className="card border border-emerald-500/30 bg-emerald-900/10">
        <h2 className="section-title">Maffetone MAF Heart Rate Calculator</h2>
        <p className="text-slate-400 text-sm mb-4">
          Phil Maffetone's 180-Formula: subtract your age from 180 to find your aerobic threshold training HR cap.
          Training below this number for 3-6 months builds a dominant aerobic base.
        </p>
        <div className="flex items-center gap-4">
          <div>
            <label className="text-slate-400 text-sm block mb-2">Your Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 28"
              min={18}
              max={50}
              className="w-32 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {mafHR && (
            <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-emerald-500/30">
              <div className="text-4xl font-black text-emerald-400">{mafHR} <span className="text-xl font-normal text-slate-400">bpm</span></div>
              <div className="text-slate-300 mt-1">Your MAF aerobic training cap</div>
              <div className="text-slate-400 text-sm mt-2">
                Run all easy sessions at or below {mafHR} bpm. Most men in their 20s-30s find this feels "embarrassingly slow" at first — that's normal and expected.
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-emerald-400 font-bold">{mafHR - 10}–{mafHR}</div>
                  <div className="text-slate-500 text-xs">MAF Zone</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-amber-400 font-bold">{mafHR}–{mafHR + 10}</div>
                  <div className="text-slate-500 text-xs">Threshold</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-red-400 font-bold">{mafHR + 10}+</div>
                  <div className="text-slate-500 text-xs">High Intensity</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
