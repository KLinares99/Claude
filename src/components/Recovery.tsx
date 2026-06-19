import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import { recoveryPillars, hrvData, sleepStages } from '../data/recoveryData';

export default function Recovery() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title text-3xl">Recovery Science</h1>
        <p className="text-slate-400">Training breaks you down — recovery is where you actually get faster. Here's how to do it right.</p>
      </div>

      {/* Recovery Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {recoveryPillars.map((pillar) => (
          <div key={pillar.title} className="card hover:border-slate-700 transition-all">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                {pillar.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-white text-lg">{pillar.title}</h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="h-2 w-20 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-400"
                        style={{ width: `${pillar.score * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-sky-400">{pillar.score}/10</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">{pillar.description}</p>
                <ul className="space-y-1.5">
                  {pillar.protocols.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 bg-slate-800/50 rounded-lg px-3 py-2 text-xs text-slate-500 italic">
                  {pillar.citation}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* HRV Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="section-title">Sample HRV Weekly Trend</h2>
          <p className="section-sub">Values below baseline signal fatigue — reduce intensity on those days</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hrvData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[50, 90]} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                formatter={(val: number, key: string) => [val, key === 'hrv' ? 'HRV (ms)' : '7-day Baseline']}
              />
              <ReferenceLine y={73} stroke="#475569" strokeDasharray="4 4" label={{ value: 'Baseline 73', fill: '#64748b', fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="baseline"
                stroke="#475569"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="hrv"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                dot={(p) => {
                  const val = (p.payload as { hrv: number }).hrv;
                  const color = val >= 73 ? '#34d399' : val >= 65 ? '#fbbf24' : '#f87171';
                  return <circle key={p.key} cx={p.cx} cy={p.cy} r={5} fill={color} stroke="#0f172a" strokeWidth={2} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {[['#34d399', 'Good (≥ baseline)'], ['#fbbf24', 'Moderate (−5-10%)'], ['#f87171', 'Low (>10% below)']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-3 h-3 rounded-full" style={{ background: c }} />{l}
              </span>
            ))}
          </div>
        </div>

        {/* Sleep Stages */}
        <div className="card">
          <h2 className="section-title">Sleep Architecture</h2>
          <p className="section-sub">Target 8-9 hrs — deep sleep is non-negotiable</p>
          <div className="flex justify-center">
            <div style={{ width: 160, height: 160 }}>
              <PieChart width={160} height={160}>
                <Pie data={sleepStages} cx="50%" cy="50%" outerRadius={70} dataKey="pct" strokeWidth={0}>
                  {sleepStages.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
              </PieChart>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {sleepStages.map((s) => (
              <div key={s.stage} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-sm text-slate-300">{s.stage}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{s.pct}%</span>
                  <p className="text-xs text-slate-500">{s.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recovery Timeline */}
      <div className="card">
        <h2 className="section-title">Recovery Timeline After Hard Efforts</h2>
        <p className="section-sub">Understanding how long different systems take to fully recover informs training spacing</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Muscle Glycogen', time: '24-48 hrs', color: 'border-amber-500/40 text-amber-400', tip: 'Prioritize carb-rich meals within 2 hrs post-run. Full repletion requires 24-36 hrs on high CHO.' },
            { title: 'Muscle Damage (DOMS)', time: '48-72 hrs', color: 'border-red-500/40 text-red-400', tip: 'Eccentric loading (downhill runs) causes greatest damage. Light movement speeds clearance.' },
            { title: 'Neuromuscular Fatigue', time: '24-48 hrs', color: 'border-violet-500/40 text-violet-400', tip: 'Neural fatigue limits power output. Key reason hard sessions need 48 hrs between them.' },
            { title: 'Connective Tissue', time: '72-96 hrs', color: 'border-sky-500/40 text-sky-400', tip: 'Tendons and ligaments adapt slowest. Most running injuries occur when connective tissue lags muscle fitness.' }
          ].map((item) => (
            <div key={item.title} className={`bg-slate-800/40 rounded-xl p-4 border-l-4 ${item.color.split(' ')[0]}`}>
              <div className={`font-bold text-lg ${item.color.split(' ')[1]} mb-1`}>{item.time}</div>
              <div className="font-semibold text-white text-sm mb-2">{item.title}</div>
              <p className="text-slate-400 text-xs leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
