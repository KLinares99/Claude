import { Footprints, Coffee, Flame } from 'lucide-react';

const phases = [
  { id: 1, title: 'Phase 1', work: 'Run 5:00 / walk 60s', goal: 'Build the habit. Keep the run segments truly easy.' },
  { id: 2, title: 'Phase 2', work: 'Run 7:00 / walk 45s', goal: 'Stretch the run blocks, shrink the walks.' },
  { id: 3, title: 'Phase 3', work: 'Run 10:00 / walk 30s', goal: 'Long run blocks, walks become micro-resets.' },
  { id: 4, title: 'Phase 4', work: 'Full run, no stops', goal: 'Attack the loop continuous — chase sub-32.' }
];

const rules = [
  { icon: Footprints, title: 'Run first', body: 'Start running from step one — no warm-up walk that eats your time and your nerve.', color: '#e8a14b' },
  { icon: Coffee, title: 'Breaks are scheduled, not emotional', body: 'You walk when the plan says, not when it gets hard. The clock decides, not your head.', color: '#5fc48a' },
  { icon: Flame, title: 'One push day per week', body: 'Only Saturday is a true PR attempt. Every other run stays controlled.', color: '#d9695f' }
];

export default function GamePlan() {
  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="section-title text-base mb-1">The 4-Phase Build</h2>
        <p className="cite mb-4">Progressive run:walk ratio → continuous loop</p>
        <div className="space-y-3">
          {phases.map((p) => (
            <div key={p.id} className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-forge-teal/15 text-forge-teal flex items-center justify-center stat-num text-sm">
                {p.id}
              </div>
              <div>
                <div className="font-bold text-white text-sm">
                  {p.title} · <span className="text-forge-teal">{p.work}</span>
                </div>
                <div className="text-forge-dim text-sm">{p.goal}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="section-title text-base px-1">The 3 Rules</h2>
        {rules.map((r) => (
          <div key={r.title} className="card-tight flex gap-3 border-l-2" style={{ borderLeftColor: r.color }}>
            <r.icon size={22} style={{ color: r.color }} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">{r.title}</div>
              <div className="text-forge-dim text-sm">{r.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
