import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { injuryRates, runningEconomyFactors } from '../data/physiologyData';
import { BookOpen, FlaskConical, ShieldCheck } from 'lucide-react';

const keyStudies = [
  {
    title: 'Polarized Training Model',
    authors: 'Seiler & Tønnessen (2009)',
    journal: 'International Journal of Sports Physiology and Performance',
    finding: 'Elite endurance athletes distribute ~80% of training below VT1 and ~20% above VT2. Polarized distribution outperforms threshold-heavy or pyramidal models for VO₂ max and performance gains.',
    impact: 'Very High',
    color: '#0ea5e9'
  },
  {
    title: 'Strength Training & Injury Prevention',
    authors: 'Lauersen et al. (2014)',
    journal: 'British Journal of Sports Medicine',
    finding: 'Strength training reduces sports injury risk by ~50% and overuse injuries by up to 50%. Progressive resistance training is the single most effective injury prevention tool for runners.',
    impact: 'Very High',
    color: '#10b981'
  },
  {
    title: 'VO₂ Max Training',
    authors: 'Midgley, McNaughton & Jones (2006)',
    journal: 'Sports Medicine',
    finding: 'Intervals at 95-100% VO₂ max velocity (vVO₂max) for 3-8 min produce optimal VO₂ max adaptations. Key stimulus: time spent at or near maximal oxygen uptake per session.',
    impact: 'High',
    color: '#f87171'
  },
  {
    title: 'Sleep & Injury Risk',
    authors: 'Milewski et al. (2014)',
    journal: 'Journal of Pediatric Orthopaedics',
    finding: 'Athletes sleeping <8 hours per night are 1.7× more likely to sustain an injury than those sleeping ≥8 hours. Sleep is the most underrated performance and recovery variable.',
    impact: 'High',
    color: '#6366f1'
  },
  {
    title: 'Maffetone Aerobic Base Method',
    authors: 'Maffetone & Laursen (2020)',
    journal: 'Frontiers in Physiology',
    finding: 'Aerobic base training below the aerobic threshold (180 − age bpm) optimizes fat oxidation, reduces injury risk, and builds the mitochondrial density needed for endurance performance.',
    impact: 'High',
    color: '#34d399'
  },
  {
    title: 'Caffeine & Endurance Performance',
    authors: 'Doherty & Smith (2004)',
    journal: 'Journal of Sports Sciences',
    finding: 'Caffeine at 3-6 mg/kg improves endurance performance by 12.4% on average and reduces perceived exertion (RPE) during sustained efforts. Most evidence-backed ergogenic for runners.',
    impact: 'High',
    color: '#fbbf24'
  }
];

const injuryColors: Record<string, string> = {
  28: '#f87171',
  22: '#fb923c',
  20: '#fbbf24',
  15: '#a78bfa',
  10: '#60a5fa',
  5: '#34d399'
};

export default function ScienceHub() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title text-3xl">Science Hub</h1>
        <p className="text-slate-400">The peer-reviewed research behind every recommendation in this app</p>
      </div>

      {/* Key Studies */}
      <div>
        <h2 className="section-title flex items-center gap-2"><FlaskConical className="w-5 h-5 text-sky-400" /> Landmark Studies</h2>
        <p className="section-sub">Foundational research that shapes modern evidence-based running training</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {keyStudies.map((study) => (
            <div key={study.title} className="card hover:border-slate-700 transition-all" style={{ borderLeft: `4px solid ${study.color}` }}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-white">{study.title}</h3>
                <span
                  className="badge text-xs flex-shrink-0 ml-2"
                  style={{ background: `${study.color}20`, color: study.color, border: `1px solid ${study.color}40` }}
                >
                  {study.impact}
                </span>
              </div>
              <div className="text-xs text-slate-500 mb-1">{study.authors}</div>
              <div className="text-xs italic text-slate-600 mb-3">{study.journal}</div>
              <p className="text-slate-300 text-sm leading-relaxed">{study.finding}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Injury Prevalence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-sky-400" /> Running Injury Prevalence</h2>
          <p className="section-sub">% of running injuries by type — most are preventable</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={injuryRates} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="injury" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={145} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                formatter={(val: number) => [`${val}%`, 'Prevalence']}
              />
              <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                {injuryRates.map((_, i) => (
                  <Cell key={i} fill={Object.values(injuryColors)[i] ?? '#0ea5e9'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="section-title">Injury Prevention Protocols</h2>
          <p className="section-sub">Evidence-based interventions for the most common running injuries</p>
          <div className="space-y-3">
            {injuryRates.map((injury) => (
              <div key={injury.injury} className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{injury.injury}</span>
                  <span className="text-xs text-slate-500">{injury.pct}% of injuries</span>
                </div>
                <p className="text-slate-400 text-xs">{injury.prevention}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Running Economy Science */}
      <div className="card">
        <h2 className="section-title flex items-center gap-2"><BookOpen className="w-5 h-5 text-sky-400" /> Running Economy Deep Dive</h2>
        <p className="section-sub">Running economy (oxygen cost at a given pace) is as important as VO₂ max for race performance</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {runningEconomyFactors.map((f) => (
            <div key={f.factor} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{f.factor}</h3>
                <span className={`badge text-xs ${f.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {f.impact} Impact
                </span>
              </div>
              <div className="text-sky-400 font-mono text-xs mb-2">{f.optimal}</div>
              <p className="text-slate-400 text-sm leading-relaxed">{f.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Resources */}
      <div className="card">
        <h2 className="section-title">Recommended Resources</h2>
        <p className="section-sub">Books and resources used to inform this learning hub</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Daniels' Running Formula",
              author: 'Jack Daniels, PhD',
              type: 'Book',
              desc: 'The gold standard of running science. VDOT tables, training zones, and phase-based periodization from Olympic coach and exercise physiologist.',
              color: 'border-sky-500/40'
            },
            {
              title: 'The Maffetone Method',
              author: 'Phil Maffetone',
              type: 'Book',
              desc: 'Aerobic base development and the 180-formula HR training approach. Backed by decades of working with elite triathletes including Mark Allen.',
              color: 'border-emerald-500/40'
            },
            {
              title: 'Anatomy for Runners',
              author: 'Jay Dicharry, DPT',
              type: 'Book',
              desc: 'Biomechanics and movement screening for runners. Identifies specific weaknesses and provides corrective exercises to improve economy and prevent injury.',
              color: 'border-violet-500/40'
            },
            {
              title: 'Science of Running',
              author: 'Steve Magness',
              type: 'Book',
              desc: 'Bridges the gap between sport science research and practical training. Training theory, periodization, and performance physiology explained clearly.',
              color: 'border-amber-500/40'
            },
            {
              title: 'Hansons Marathon Method',
              author: 'Luke & Kevin Hanson',
              type: 'Book',
              desc: 'Cumulative fatigue training model that prepares the body for the final miles of a marathon. The philosophy behind training on "tired legs."',
              color: 'border-orange-500/40'
            },
            {
              title: 'Running Rewired',
              author: 'Jay Dicharry, DPT',
              type: 'Book',
              desc: 'Strength and mobility program designed specifically for runners. Addresses the top muscular imbalances that lead to the most common running injuries.',
              color: 'border-rose-500/40'
            }
          ].map((r) => (
            <div key={r.title} className={`bg-slate-800/40 rounded-xl p-4 border-l-4 ${r.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge bg-slate-700 text-slate-400 text-xs">{r.type}</span>
              </div>
              <h3 className="font-bold text-white mt-2">{r.title}</h3>
              <p className="text-slate-500 text-xs mb-2">{r.author}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
