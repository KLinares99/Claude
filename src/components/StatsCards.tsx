import { useMemo, useState } from 'react';
import { Trophy, Utensils, Lock, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceDot } from 'recharts';
import { raceBests, raceTrend, type Activity } from '../lib/storage';
import { fmtClock, RACE_DISTANCES } from '../lib/run';
import { dayTotals, calorieTarget, localDateISO, type FoodEntry, type NutritionProfile } from '../lib/nutrition';

/**
 * "Race times" — the merged race card (You tab): one chip row of standard
 * distances, the best time for the selected one, and the time-over-time
 * trend with the PR marked. Locked distances collapse to a single line.
 */
export function RaceTimesCard({ activities, accent }: { activities: Activity[]; accent: string }) {
  const bests = useMemo(() => raceBests(activities), [activities]);
  const unlocked = bests.filter((b) => b.seconds != null);
  const locked = bests.filter((b) => b.seconds == null);
  const [sel, setSel] = useState<string | null>(null);
  const active = unlocked.find((b) => b.label === sel) ?? unlocked[0];

  const points = useMemo(() => {
    if (!active) return [];
    const d = RACE_DISTANCES.find((x) => x.label === active.label);
    if (!d) return [];
    return raceTrend(activities, d.miles).map((p) => ({
      label: new Date(p.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
      seconds: p.seconds,
      name: p.name,
      exact: p.exact
    }));
  }, [activities, active]);
  const best = points.length ? Math.min(...points.map((p) => p.seconds)) : 0;

  if (unlocked.length === 0) {
    return (
      <div className="card-pad">
        <h2 className="font-black mb-2 flex items-center gap-2">
          <Trophy size={16} className="text-brand" /> Race times
        </h2>
        <p className="text-sm text-dim">Log a run and your best 5K, 10K and beyond will show up here.</p>
      </div>
    );
  }

  return (
    <div className="card-pad">
      <h2 className="font-black mb-3 flex items-center gap-2">
        <Trophy size={16} className="text-brand" /> Race times
        <span className="text-[10px] font-bold text-faint uppercase tracking-wide ml-auto">runs only</span>
      </h2>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 mb-3">
        {unlocked.map((b) => {
          const on = b.label === (active?.label ?? '');
          return (
            <button
              key={b.label}
              onClick={() => setSel(b.label)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition-colors ${
                on ? 'border-brand bg-brand text-white' : 'border-line text-dim hover:text-ink'
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      {active && (
        <div className="flex items-baseline gap-2 mb-1">
          <span className="stat-num text-3xl">{fmtClock(active.seconds as number)}</span>
          <span className="text-xs text-dim nums">
            {fmtClock((active.seconds as number) / active.miles)}/mi{active.exact ? '' : ' · est from a longer run'}
          </span>
        </div>
      )}

      {points.length >= 2 ? (
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={points} margin={{ left: 4, right: 12, top: 12, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              width={44}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 60', 'dataMax + 60']}
              tickFormatter={(v: number) => fmtClock(v)}
            />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #E7E5E0', borderRadius: 10, fontSize: 12 }}
              formatter={(v: number) => [fmtClock(v), active?.label]}
              labelFormatter={(l, payload) => {
                const p = payload?.[0]?.payload as { name?: string; exact?: boolean } | undefined;
                return `${p?.name ?? l}${p?.exact ? '' : ' (est from longer run)'}`;
              }}
            />
            <Line
              type="monotone"
              dataKey="seconds"
              stroke={accent}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: accent, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            {/* ring + tag the PR so the best effort pops out of the line */}
            {(() => {
              const pr = points.find((p) => p.seconds === best);
              return pr ? (
                <ReferenceDot
                  x={pr.label}
                  y={pr.seconds}
                  r={5.5}
                  fill={accent}
                  stroke="#fff"
                  strokeWidth={2}
                  isFront
                  label={{ value: 'PR', position: 'top', fontSize: 9, fontWeight: 800, fill: accent }}
                />
              ) : null;
            })()}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-xs text-dim mt-1">
          One {active?.label} on the books — log another run that far and the trend line appears.
        </p>
      )}

      {locked.length > 0 && (
        <p className="text-[11px] text-faint mt-2 flex items-center gap-1.5">
          <Lock size={11} className="shrink-0" />
          {locked.map((b) => b.label).join(' · ')} — unlock by running farther.
        </p>
      )}
    </div>
  );
}

/** Compact "Nutrition today" row (You tab) — eaten vs target with a mini bar;
 *  tapping opens the Nutrition tab for the full diary. */
export function NutritionSummaryCard({
  entries, profile, weightLbs, onOpen
}: {
  entries: FoodEntry[];
  profile: NutritionProfile | null;
  weightLbs: number;
  onOpen: () => void;
}) {
  const today = localDateISO();
  const eaten = useMemo(() => dayTotals(entries, today).calories, [entries, today]);
  const target = profile ? calorieTarget(profile, weightLbs) : null;
  if (eaten === 0 && !profile) return null;

  return (
    <button className="card-pad w-full text-left" onClick={onOpen}>
      <div className="flex items-center gap-3">
        <Utensils size={16} className="text-brand shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-black">Nutrition today</span>
            <span className="text-sm font-bold nums">
              {eaten}{target != null && <span className="text-dim font-semibold"> / {target}</span>}
              <span className="text-dim text-xs font-semibold"> kcal</span>
            </span>
          </div>
          {target != null && (
            <div className="h-1.5 rounded-full bg-paper overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full ${eaten > target ? 'bg-bad' : 'bg-brand'}`}
                style={{ width: `${Math.min(1, target > 0 ? eaten / target : 0) * 100}%` }}
              />
            </div>
          )}
        </div>
        <ChevronRight size={16} className="text-faint shrink-0" />
      </div>
    </button>
  );
}
