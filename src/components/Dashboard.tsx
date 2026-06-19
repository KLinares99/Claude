import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { vo2MaxNorms, weeklyLoadModel, runningEconomyFactors, scienceStats } from '../data/physiologyData';

const vo2ChartData = [
  { category: 'Excellent', '20-29': 52.5, '30-39': 51.5 },
  { category: 'Good', '20-29': 46.4, '30-39': 43.9 },
  { category: 'Average', '20-29': 38.4, '30-39': 35.4 },
  { category: 'Below Avg', '20-29': 35.0, '30-39': 31.8 }
];

const loadColors: Record<string, string> = {
  Base: '#0ea5e9',
  Build: '#6366f1',
  Recovery: '#10b981'
};

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-slate-800 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-600/5" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge bg-sky-500/20 text-sky-400 border border-sky-500/30">Science-Backed</span>
            <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Men 20s-30s</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Run Faster. Recover Smarter.<br />
            <span className="text-sky-400">Train Like an Athlete.</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl">
            Everything you need to optimize running performance — from training zones and periodization to nutrition timing and injury prevention — all grounded in peer-reviewed sports science.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {scienceStats.map((s) => (
              <div key={s.stat} className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                <div className="text-3xl font-black text-sky-400">{s.stat}</div>
                <div className="text-slate-300 text-sm mt-1">{s.label}</div>
                <div className="text-slate-500 text-xs mt-1">{s.source}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VO2 Max Norms */}
        <div className="card">
          <h2 className="section-title">VO₂ Max Norms for Men</h2>
          <p className="section-sub">ml/kg/min — where do you stack up? (ACSM Guidelines)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={vo2ChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[25, 60]} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="20-29" name="Ages 20-29" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="30-39" name="Ages 30-39" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <span className="flex items-center gap-2 text-sm text-slate-400"><span className="w-3 h-3 rounded bg-sky-500" /> Ages 20-29</span>
            <span className="flex items-center gap-2 text-sm text-slate-400"><span className="w-3 h-3 rounded bg-indigo-500" /> Ages 30-39</span>
          </div>
        </div>

        {/* Training Load Periodization */}
        <div className="card">
          <h2 className="section-title">Periodization Model</h2>
          <p className="section-sub">3:1 build-to-recovery ratio prevents overtraining (Bompa)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyLoadModel}>
              <defs>
                <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#94a3b8' }}
                formatter={(val: number) => [`${val}`, 'Training Load']}
              />
              <Area
                type="monotone"
                dataKey="load"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                fill="url(#loadGrad)"
                dot={(p) => (
                  <circle
                    key={p.key}
                    cx={p.cx}
                    cy={p.cy}
                    r={5}
                    fill={loadColors[(p.payload as { type: string }).type] ?? '#0ea5e9'}
                    stroke="#0f172a"
                    strokeWidth={2}
                  />
                )}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {Object.entries(loadColors).map(([type, color]) => (
              <span key={type} className="flex items-center gap-2 text-sm text-slate-400">
                <span className="w-3 h-3 rounded-full" style={{ background: color }} /> {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Running Economy Factors */}
      <div className="card">
        <h2 className="section-title">Running Economy Factors</h2>
        <p className="section-sub">Biomechanical variables with the highest impact on efficiency</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 text-slate-400 font-medium">Factor</th>
                <th className="text-left py-3 text-slate-400 font-medium">Optimal Range</th>
                <th className="text-left py-3 text-slate-400 font-medium">Impact</th>
                <th className="text-left py-3 text-slate-400 font-medium">Key Insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {runningEconomyFactors.map((row) => (
                <tr key={row.factor} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-semibold text-white">{row.factor}</td>
                  <td className="py-3 text-sky-400 font-mono text-xs">{row.optimal}</td>
                  <td className="py-3">
                    <span className={`badge ${row.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {row.impact}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{row.tip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Progressive Overload', desc: 'Increase training stress gradually to force adaptation without breakdown. The 10% rule: never increase weekly volume more than 10% per week.', color: 'border-sky-500/40', icon: '📈' },
          { title: 'Specificity', desc: 'You adapt to what you do. Train at paces and efforts that mirror your goal race demands. Race-specific work in the final 4-6 weeks.', color: 'border-violet-500/40', icon: '🎯' },
          { title: 'Reversibility', desc: 'Aerobic fitness fades faster than it builds. Missing >10 days starts noticeable detraining. Consistency over intensity wins every time.', color: 'border-amber-500/40', icon: '⏳' },
          { title: 'Individuality', desc: 'Optimal training varies by genetics, age, experience, and life stress. Use HRV and perceived effort to personalize — not just a plan on paper.', color: 'border-emerald-500/40', icon: '🧬' }
        ].map((p) => (
          <div key={p.title} className={`card border-l-2 ${p.color}`}>
            <div className="text-2xl mb-3">{p.icon}</div>
            <h3 className="font-bold text-white mb-2">{p.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
