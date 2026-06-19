import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, TrendingUp, Zap } from 'lucide-react';
import { trainingPlans } from '../data/trainingPlans';

const typeStyles: Record<string, string> = {
  recovery: 'bg-slate-800 text-slate-300',
  easy: 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50',
  quality: 'bg-orange-900/40 text-orange-400 border border-orange-800/50',
  long: 'bg-sky-900/40 text-sky-400 border border-sky-800/50',
  cross: 'bg-violet-900/40 text-violet-400 border border-violet-800/50'
};

const levelBadge: Record<string, string> = {
  Beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  Advanced: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
};

export default function TrainingPlans() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title text-3xl">Training Plans</h1>
        <p className="text-slate-400">Research-backed programs from 5K to marathon, designed for men in their peak performance years</p>
      </div>

      <div className="space-y-5">
        {trainingPlans.map((plan) => (
          <div key={plan.id} className="card hover:border-slate-700 transition-all">
            {/* Plan Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                  {plan.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-white">{plan.goal} Plan</h2>
                    <span className={`badge border ${levelBadge[plan.level]}`}>{plan.level}</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1 max-w-xl">{plan.description}</p>
                  <div className="flex items-center gap-6 mt-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{plan.weeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <TrendingUp className="w-4 h-4 text-slate-500" />
                      <span>Peak {plan.peakMileage} mi/week</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors flex-shrink-0"
              >
                {expanded === plan.id ? (
                  <><ChevronUp className="w-4 h-4" /> Collapse</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> View Plan</>
                )}
              </button>
            </div>

            {/* Key Workouts */}
            <div className="mt-4 flex flex-wrap gap-2">
              {plan.keyWorkouts.map((w) => (
                <div key={w} className="flex items-center gap-1.5 bg-slate-800/70 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {w}
                </div>
              ))}
            </div>

            {/* Expanded: Weekly Schedule + Science */}
            {expanded === plan.id && (
              <div className="mt-6 pt-6 border-t border-slate-800 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Sample Weekly Schedule</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
                    {plan.schedule.map((day) => (
                      <div key={day.day} className={`rounded-xl p-3 ${typeStyles[day.type]}`}>
                        <div className="text-xs font-black uppercase tracking-wider mb-1 opacity-60">{day.day}</div>
                        <div className="text-sm font-medium leading-snug">{day.workout}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {Object.entries(typeStyles).map(([type, cls]) => (
                      <span key={type} className={`badge ${cls} capitalize text-xs`}>{type}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-2">The Science Behind This Plan</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{plan.science}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* How to Pick a Plan */}
      <div className="card">
        <h2 className="section-title">How to Choose Your Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {[
            { q: 'Running < 6 months?', a: 'Start with the 5K Beginner plan. Build consistency before intensity.', color: 'border-emerald-500/40 text-emerald-400' },
            { q: 'Running 6-18 months?', a: '10K or Half Marathon. You have the aerobic base to handle quality work.', color: 'border-sky-500/40 text-sky-400' },
            { q: 'Running 2+ years?', a: 'Half or Full Marathon. Focus on specificity and peaking for a goal race.', color: 'border-violet-500/40 text-violet-400' }
          ].map((item) => (
            <div key={item.q} className={`bg-slate-800/40 rounded-xl p-4 border-l-4 ${item.color.split(' ')[0]}`}>
              <div className={`font-bold mb-2 ${item.color.split(' ')[1]}`}>{item.q}</div>
              <p className="text-slate-300 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
