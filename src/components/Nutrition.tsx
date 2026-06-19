import { macroNeeds, hydrationGuide, raceNutritionGuide, keySupplements } from '../data/nutritionData';
import { Droplets, Pill, Utensils } from 'lucide-react';

const evidenceColor: Record<string, string> = {
  Strong: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Moderate: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Limited: 'bg-red-500/20 text-red-400 border border-red-500/30'
};

export default function Nutrition() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title text-3xl">Running Nutrition</h1>
        <p className="text-slate-400">Evidence-based fueling strategies for training and racing — built on sports dietetics research</p>
      </div>

      {/* Macros */}
      <div>
        <h2 className="section-title flex items-center gap-2"><Utensils className="w-5 h-5 text-sky-400" /> Macronutrient Targets</h2>
        <p className="section-sub">Daily intake ranges for training men — adjust upward on hard/long run days</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {macroNeeds.map((m) => (
            <div key={m.macro} className={`card ${m.bgColor} border-t-4`} style={{ borderTopColor: m.color }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-lg">{m.macro}</h3>
                <span className="font-mono text-sm font-bold px-3 py-1 rounded-lg bg-slate-900/60" style={{ color: m.color }}>
                  {m.amount}
                </span>
              </div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Timing</p>
              <p className="text-slate-300 text-sm mb-4">{m.timing}</p>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Top Sources</p>
              <ul className="space-y-1 mb-4">
                {m.sources.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="bg-slate-900/50 rounded-xl p-3 text-xs text-slate-400 leading-relaxed">
                {m.science}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hydration Guide */}
      <div className="card">
        <h2 className="section-title flex items-center gap-2"><Droplets className="w-5 h-5 text-sky-400" /> Hydration Protocol</h2>
        <p className="section-sub">Dehydration as little as 2% body weight reduces performance by up to 20% (Cheuvront et al. 2003)</p>
        <div className="space-y-3">
          {hydrationGuide.map((h, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
              <div className="w-full sm:w-56 flex-shrink-0">
                <span className="text-sm font-semibold text-slate-200">{h.phase}</span>
              </div>
              <div className="text-sky-400 font-bold font-mono text-sm w-36 flex-shrink-0">{h.amount}</div>
              <div className="text-slate-400 text-sm">{h.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Race Day Nutrition */}
      <div className="card">
        <h2 className="section-title">Race Day Fueling by Distance</h2>
        <p className="section-sub">Never experiment on race day — practice all strategies in long training runs first</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 text-slate-400 font-medium">Distance</th>
                <th className="text-left py-3 text-slate-400 font-medium">Carb Target</th>
                <th className="text-left py-3 text-slate-400 font-medium">Sodium</th>
                <th className="text-left py-3 text-slate-400 font-medium">Race Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {raceNutritionGuide.map((r) => (
                <tr key={r.distance} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3">
                    <span className="badge bg-sky-500/20 text-sky-400 border border-sky-500/30">{r.distance}</span>
                  </td>
                  <td className="py-3 text-amber-400 font-mono font-bold text-xs">{r.carbs}</td>
                  <td className="py-3 text-slate-300 text-xs">{r.sodium}</td>
                  <td className="py-3 text-slate-300 max-w-xs">{r.strategy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplements */}
      <div>
        <h2 className="section-title flex items-center gap-2"><Pill className="w-5 h-5 text-sky-400" /> Evidence-Based Supplements</h2>
        <p className="section-sub">Ranked by scientific evidence strength — food first, supplements where evidence is clear</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {keySupplements.map((s) => (
            <div key={s.name} className="card hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-white">{s.name}</h3>
                <span className={`badge ${evidenceColor[s.evidence] ?? evidenceColor.Moderate}`}>{s.evidence} Evidence</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-800/50 rounded-lg p-2">
                  <div className="text-xs text-slate-500 mb-0.5">Dose</div>
                  <div className="text-sm text-sky-400 font-mono font-bold">{s.dose}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2">
                  <div className="text-xs text-slate-500 mb-0.5">Timing</div>
                  <div className="text-sm text-slate-300">{s.timing}</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm">{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
