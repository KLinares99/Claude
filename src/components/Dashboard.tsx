import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Flame, ChevronRight, Activity, Dumbbell, AlertTriangle } from 'lucide-react';
import type { Tab } from './Nav';
import Ring from './ui/Ring';
import { useForge, computeStreak, sessionsThisWeek } from '../lib/storage';
import { TARGET_SECONDS, fmtTime, pacePerMile } from '../lib/run';
import { trees } from '../data/calisthenics';
import { masteredCount, featuredProgress, pushPullBalance, totalMastered } from '../lib/cal';
import { planForToday, dayTypeMeta, weeklyPlan } from '../data/schedule';

export default function Dashboard({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const { data } = useForge();
  const runs = data.runs;
  const sorted = [...runs].sort((a, b) => a.date.localeCompare(b.date));
  const pr = runs.reduce((m, r) => (r.seconds < m.seconds ? r : m), runs[0]);
  const last = sorted[sorted.length - 1];
  const worst = Math.max(...runs.map((r) => r.seconds));
  const progress = pr ? Math.min(1, (worst - pr.seconds) / Math.max(1, worst - TARGET_SECONDS)) : 0;
  const spark = sorted.slice(-8).map((r, i) => ({ i, m: r.seconds / 60 }));

  const streak = computeStreak(data.sessions);
  const week = sessionsThisWeek(data.sessions);
  const planned = weeklyPlan.filter((d) => d.type !== 'rest').length;

  const feat = featuredProgress(data);
  const bal = pushPullBalance(data);
  const today = planForToday();
  const todayMeta = dayTypeMeta[today.type];

  return (
    <div className="space-y-4">
      {/* streak + week */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-tight flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-forge-orange/15 flex items-center justify-center">
            <Flame className="text-forge-orange" size={24} />
          </div>
          <div>
            <div className="stat-num text-3xl text-white leading-none">{streak}</div>
            <div className="text-xs text-forge-dim mt-1">day streak</div>
          </div>
        </div>
        <div className="card-tight">
          <div className="text-xs text-forge-dim mb-1">This week</div>
          <div className="stat-num text-2xl text-white">{week}<span className="text-forge-dim text-base">/{planned}</span></div>
          <div className="h-1.5 rounded-full bg-forge-bg mt-2 overflow-hidden">
            <div className="h-full bg-forge-teal rounded-full" style={{ width: `${Math.min(1, week / planned) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* next session */}
      <button
        onClick={() => onNavigate(today.type === 'run' ? 'run' : today.type === 'rest' ? 'schedule' : 'cal')}
        className="card w-full text-left flex items-center justify-between"
        style={{ borderColor: todayMeta.color, background: todayMeta.bg }}
      >
        <div>
          <div className="text-xs text-forge-dim">Today · next session</div>
          <div className="font-bold text-white mt-0.5">{today.focus}</div>
          <div className="text-xs text-forge-dim mt-0.5">{today.detail}</div>
        </div>
        <ChevronRight size={20} className="text-forge-dim shrink-0" />
      </button>

      {/* running snapshot */}
      <button onClick={() => onNavigate('run')} className="card w-full text-left">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-forge-orange">
            <Activity size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Running</span>
          </div>
          <ChevronRight size={18} className="text-forge-dim" />
        </div>
        <div className="flex items-center gap-4">
          <Ring pct={progress} size={92} stroke={9} color="#37b6c4">
            <div className="stat-num text-lg text-white">{Math.round(progress * 100)}%</div>
            <div className="text-[9px] text-forge-dim">sub-32</div>
          </Ring>
          <div className="flex-1">
            <div className="text-xs text-forge-dim">PR</div>
            <div className="stat-num text-3xl text-white">{pr ? fmtTime(pr.seconds) : '—'}</div>
            <div className="text-xs text-forge-dim nums">{last ? `last ${fmtTime(last.seconds)} · ${pacePerMile(last.seconds)}` : ''}</div>
          </div>
          <div className="w-20 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark}>
                <Line type="monotone" dataKey="m" stroke="#37b6c4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </button>

      {/* calisthenics snapshot */}
      <button onClick={() => onNavigate('cal')} className="card w-full text-left">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-forge-teal">
            <Dumbbell size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Calisthenics</span>
          </div>
          <ChevronRight size={18} className="text-forge-dim" />
        </div>

        <div className="text-sm text-white font-semibold">{feat.text}</div>

        <div className="grid grid-cols-4 gap-2 mt-3">
          {trees.filter((t) => !t.collapsed).map((t) => (
            <div key={t.id} className="text-center">
              <div className="text-lg">{t.icon}</div>
              <div className="stat-num text-sm text-forge-teal">{masteredCount(data, t)}/{t.nodes.length}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-forge-border flex items-center justify-between">
          <span className="text-xs text-forge-dim">Push / pull · {totalMastered(data)} nodes mastered</span>
          <span className={`badge ${bal.flag ? 'bg-forge-red/20 text-forge-red' : 'bg-forge-green/20 text-forge-green'}`}>
            {bal.flag && <AlertTriangle size={12} />}
            {bal.push + bal.pull === 0 ? 'no volume' : bal.ratioText}
          </span>
        </div>
      </button>
    </div>
  );
}
