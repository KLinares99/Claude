import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import SubTabs from './ui/SubTabs';
import {
  runStats, hrZones, polarized, economyFactors,
  calStats, calPrinciples, thresholdTable, gates
} from '../data/knowledge';

type Sub = 'run' | 'cal';

export default function Knowledge() {
  const [sub, setSub] = useState<Sub>('run');
  return (
    <div className="space-y-4">
      <SubTabs
        active={sub}
        onChange={(s) => setSub(s as Sub)}
        tabs={[
          { id: 'run', label: 'Running' },
          { id: 'cal', label: 'Calisthenics' }
        ]}
      />
      {sub === 'run' ? <RunKnowledge /> : <CalKnowledge />}
    </div>
  );
}

function StatGrid({ stats }: { stats: { stat: string; label: string; source: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((s) => (
        <div key={s.label} className="card-tight">
          <div className="stat-num text-2xl text-forge-teal">{s.stat}</div>
          <div className="text-xs text-slate-300 mt-1 leading-snug">{s.label}</div>
          <div className="cite mt-1">{s.source}</div>
        </div>
      ))}
    </div>
  );
}

function RunKnowledge() {
  return (
    <div className="space-y-4">
      <StatGrid stats={runStats} />

      {/* HR zones */}
      <div className="card">
        <h2 className="section-title text-base mb-3">Heart-Rate Zones</h2>
        <div className="space-y-2">
          {hrZones.map((z) => (
            <div key={z.label} className="flex items-center gap-3">
              <span className="w-9 text-center stat-num text-sm font-bold" style={{ color: z.color }}>{z.label}</span>
              <div className="flex-1">
                <div className="text-sm text-white font-semibold">{z.name}</div>
                <div className="text-xs text-forge-dim nums">{z.pct} · RPE {z.rpe}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* polarized split */}
      <div className="card">
        <h2 className="section-title text-base mb-1">Polarized 80/20</h2>
        <p className="cite mb-3">{polarized.citation}</p>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={[{ v: polarized.easy }, { v: polarized.hard }]}
                dataKey="v"
                innerRadius={34}
                outerRadius={56}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                <Cell fill="#5fc48a" />
                <Cell fill="#d9695f" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 text-sm text-forge-dim">
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded bg-forge-green" /> 80% easy (Z1–Z2)</div>
            <div className="flex items-center gap-2 mb-2"><span className="w-3 h-3 rounded bg-forge-red" /> 20% hard (Z4–Z5)</div>
            <p className="text-xs leading-relaxed">{polarized.summary}</p>
          </div>
        </div>
      </div>

      {/* economy table */}
      <div className="card">
        <h2 className="section-title text-base mb-3">Running Economy Factors</h2>
        <div className="space-y-2">
          {economyFactors.map((f) => (
            <div key={f.factor} className="rounded-xl border border-forge-border bg-forge-bg/40 p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">{f.factor}</span>
                <span className={`badge ${f.impact === 'High' ? 'bg-forge-red/20 text-forge-red' : 'bg-forge-orange/20 text-forge-orange'}`}>
                  {f.impact}
                </span>
              </div>
              <div className="text-xs text-forge-teal nums mt-1">{f.optimal}</div>
              <div className="text-xs text-forge-dim mt-1">{f.tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalKnowledge() {
  return (
    <div className="space-y-4">
      <StatGrid stats={calStats} />

      {/* principles */}
      <div className="space-y-3">
        {calPrinciples.map((p) => (
          <div key={p.title} className="card-tight border-l-2 border-forge-teal">
            <div className="font-bold text-white text-sm">{p.title}</div>
            <p className="text-sm text-forge-dim mt-1 leading-relaxed">{p.body}</p>
            <p className="cite mt-1">— {p.citation}</p>
          </div>
        ))}
      </div>

      {/* gates */}
      <div className="card">
        <h2 className="section-title text-base mb-3">Skill Gates</h2>
        <div className="space-y-2">
          {gates.map((g) => (
            <div key={g.skill} className="flex justify-between gap-3 text-sm border-b border-forge-border/60 pb-2 last:border-0">
              <span className="font-semibold text-white shrink-0">{g.skill}</span>
              <span className="text-forge-dim text-right">{g.gate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* thresholds */}
      <div className="card">
        <h2 className="section-title text-base mb-3">Mastery Thresholds</h2>
        <div className="space-y-2">
          {thresholdTable.map((t) => (
            <div key={t.skill} className="rounded-xl border border-forge-border bg-forge-bg/40 p-3">
              <div className="font-semibold text-white text-sm">{t.skill}</div>
              <div className="text-xs text-forge-teal mt-1">{t.rule}</div>
              <div className="text-xs text-forge-dim mt-0.5 nums">e.g. {t.example}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
