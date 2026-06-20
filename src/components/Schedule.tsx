import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { weeklyPlan, dayTypeMeta, periodization, planForToday, isDeloadWeek } from '../data/schedule';

export default function Schedule() {
  const today = planForToday();
  const deload = isDeloadWeek();

  return (
    <div className="space-y-4">
      {deload && (
        <div className="card-tight border-l-2 border-forge-green">
          <div className="text-sm font-semibold text-white">Deload week 🌙</div>
          <div className="text-xs text-forge-dim">Week 4 of the 3:1 cycle — cut volume ~25%, keep skills crisp.</div>
        </div>
      )}

      {/* weekly grid */}
      <div className="space-y-2">
        {weeklyPlan.map((d) => {
          const meta = dayTypeMeta[d.type];
          const isToday = d.day === today.day;
          return (
            <div
              key={d.day}
              className="card-tight flex gap-3 items-start"
              style={{
                borderColor: isToday ? meta.color : undefined,
                background: isToday ? meta.bg : undefined
              }}
            >
              <div className="w-12 shrink-0 text-center">
                <div className="text-sm font-bold text-white">{d.short}</div>
                {isToday && <div className="text-[9px] text-forge-teal font-bold">TODAY</div>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="badge" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  <span className="text-sm font-semibold text-white">{d.focus}</span>
                </div>
                <div className="text-xs text-forge-dim mt-1">{d.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* legend */}
      <div className="card-tight flex flex-wrap gap-x-4 gap-y-2">
        {Object.values(dayTypeMeta).map((m) => (
          <span key={m.label} className="flex items-center gap-2 text-xs text-forge-dim">
            <span className="w-3 h-3 rounded" style={{ background: m.color }} /> {m.label}
          </span>
        ))}
      </div>

      {/* 3:1 periodization */}
      <div className="card">
        <h2 className="section-title text-base mb-1">3:1 Periodization</h2>
        <p className="cite mb-3">3 weeks build, 1 week deload — Bompa</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={periodization} margin={{ left: -20, right: 6, top: 6 }}>
            <defs>
              <linearGradient id="load" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#37b6c4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#37b6c4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e333b" />
            <XAxis dataKey="week" tick={{ fill: '#7c93a0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#7c93a0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Area type="monotone" dataKey="load" stroke="#37b6c4" strokeWidth={2.5} fill="url(#load)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-forge-dim px-1">
        Separate-day split — run days and skill days never collide. Template ships fixed; editable in a future build.
      </p>
    </div>
  );
}
