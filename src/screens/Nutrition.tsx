import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings2, Trash2, Flame } from 'lucide-react';
import { useStore } from '../lib/storage';
import {
  MEALS, MEAL_LABELS, type Meal, type FoodEntry, type NutritionProfile,
  calorieTarget, macroTargets, bmr, tdee, dayTotals, entryTotals,
  exerciseCalories, localDateISO, shiftDate, ACTIVITY_LEVELS, GOALS
} from '../lib/nutrition';
import { fmtRelDate } from '../lib/run';
import { accentHex } from '../lib/theme';
import AddFoodSheet from './AddFood';
import { toast } from '../lib/toast';

export default function Nutrition() {
  const { data, update } = useStore();
  const accent = accentHex(data.settings.accent);
  const [date, setDate] = useState(localDateISO());
  const [addingTo, setAddingTo] = useState<Meal | null>(null);
  const [goalsOpen, setGoalsOpen] = useState(false);

  const profile = data.nutrition.profile;
  const weight = data.settings.weightLbs;
  const entries = data.nutrition.entries;

  const target = profile ? calorieTarget(profile, weight) : 2000;
  const macros = macroTargets(target);
  const totals = dayTotals(entries, date);
  const exercise = exerciseCalories(data.activities, date, weight);
  const remaining = target - totals.calories + exercise;
  const isToday = date === localDateISO();

  const addEntries = (items: FoodEntry[]) => {
    update((d) => {
      d.nutrition.entries.push(...items);
      return d;
    });
    setAddingTo(null);
    toast(items.length === 1 ? `${items[0].name} logged` : `${items.length} items logged`);
  };

  const removeEntry = (id: string) => {
    update((d) => ({
      ...d,
      nutrition: { ...d.nutrition, entries: d.nutrition.entries.filter((e) => e.id !== id) }
    }));
  };

  return (
    <>
    <div className="space-y-4">
      {/* date nav */}
      <div className="flex items-center justify-between">
        <button className="btn-ghost !px-3 !py-2" onClick={() => setDate(shiftDate(date, -1))} aria-label="Previous day">
          <ChevronLeft size={18} />
        </button>
        <button className="font-black" onClick={() => setDate(localDateISO())}>
          {fmtRelDate(`${date}T12:00:00`)}
        </button>
        <button
          className="btn-ghost !px-3 !py-2 disabled:opacity-30"
          onClick={() => setDate(shiftDate(date, 1))}
          disabled={isToday}
          aria-label="Next day"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* goals onboarding */}
      {!profile && (
        <button className="card-pad w-full text-left border-l-4 !border-l-brand" onClick={() => setGoalsOpen(true)}>
          <div className="font-black">Set up your nutrition goals</div>
          <p className="text-sm text-dim mt-1">
            Tell Runner your age, height and goal to get a personalized daily calorie
            target — until then the tracker uses a 2,000 kcal default.
          </p>
          <span className="chip bg-brand text-white mt-3">Get started</span>
        </button>
      )}

      {/* calories summary — the MFP formula */}
      <div className="card-pad">
        <div className="flex items-center justify-between">
          <h2 className="font-black">Calories</h2>
          <button className="text-dim hover:text-ink p-1" onClick={() => setGoalsOpen(true)} aria-label="Nutrition goals">
            <Settings2 size={18} />
          </button>
        </div>
        <div className="text-center mt-2">
          <div className={`stat-num text-6xl leading-none ${remaining < 0 ? 'text-bad' : ''}`}>
            {Math.round(remaining).toLocaleString()}
          </div>
          <div className="label mt-1">Remaining</div>
        </div>
        <div className="grid grid-cols-4 gap-1 mt-4 pt-4 border-t border-line text-center">
          <Formula label="Goal" value={target} />
          <Formula label="Food" value={totals.calories} sign="−" />
          <Formula label="Exercise" value={exercise} sign="+" accent={exercise > 0} />
          <Formula label="Remaining" value={Math.round(remaining)} sign="=" />
        </div>
        {exercise > 0 && (
          <div className="flex items-center gap-1.5 justify-center mt-3 text-xs text-dim">
            <Flame size={13} className="text-brand" /> {exercise} kcal earned back from your runs
          </div>
        )}
      </div>

      {/* macros */}
      <div className="card-pad">
        <h2 className="font-black mb-3">Macros</h2>
        <MacroBar label="Protein" value={totals.protein} target={macros.protein} color={accent} />
        <MacroBar label="Carbs" value={totals.carbs} target={macros.carbs} color="#16A34A" />
        <MacroBar label="Fat" value={totals.fat} target={macros.fat} color="#EAB308" />
      </div>

      {/* meals */}
      {MEALS.map((meal) => {
        const mealEntries = entries.filter((e) => e.date === date && e.meal === meal);
        const mealCals = mealEntries.reduce((s, e) => s + entryTotals(e).calories, 0);
        return (
          <div key={meal} className="card-pad">
            <div className="flex items-center justify-between">
              <h3 className="font-black">{MEAL_LABELS[meal]}</h3>
              <span className="stat-num text-dim">{mealCals > 0 ? `${mealCals} kcal` : ''}</span>
            </div>
            {mealEntries.length > 0 && (
              <div className="divide-y divide-line mt-2">
                {mealEntries.map((e) => {
                  const t = entryTotals(e);
                  return (
                    <div key={e.id} className="flex items-center gap-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{e.name}</div>
                        <div className="text-[11px] text-dim nums">
                          {e.servings !== 1 ? `${e.servings} × ` : ''}{e.serving} · P{t.protein} C{t.carbs} F{t.fat}
                        </div>
                      </div>
                      <span className="stat-num text-sm">{t.calories}</span>
                      <button className="text-faint hover:text-bad p-1" onClick={() => removeEntry(e.id)} aria-label={`Delete ${e.name}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              className="mt-2 text-sm font-bold text-brand flex items-center gap-1"
              onClick={() => setAddingTo(meal)}
            >
              <Plus size={16} /> Add food
            </button>
          </div>
        );
      })}
    </div>

      {addingTo && (
        <AddFoodSheet
          meal={addingTo}
          date={date}
          caloriesSoFar={totals.calories}
          onClose={() => setAddingTo(null)}
          onAdd={addEntries}
        />
      )}
      {goalsOpen && <GoalsSheet onClose={() => setGoalsOpen(false)} />}
    </>
  );
}

function Formula({ label, value, sign, accent }: { label: string; value: number; sign?: string; accent?: boolean }) {
  return (
    <div>
      <div className={`stat-num text-base ${accent ? 'text-good' : ''}`}>
        {sign && <span className="text-faint font-bold mr-0.5">{sign}</span>}
        {value.toLocaleString()}
      </div>
      <div className="label mt-0.5">{label}</div>
    </div>
  );
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min(1, target > 0 ? value / target : 0);
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold">{label}</span>
        <span className="text-dim nums">{Math.round(value)} / {target} g</span>
      </div>
      <div className="h-2 rounded-full bg-paper overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, background: color }} />
      </div>
    </div>
  );
}

/** Goals onboarding — profile → BMR → TDEE → daily target. */
function GoalsSheet({ onClose }: { onClose: () => void }) {
  const { data, update } = useStore();
  const existing = data.nutrition.profile;
  const [sex, setSex] = useState<NutritionProfile['sex']>(existing?.sex ?? 'male');
  const [age, setAge] = useState(existing?.age ?? 30);
  const [heightIn, setHeightIn] = useState(existing?.heightIn ?? 69);
  const [activity, setActivity] = useState(existing?.activity ?? 1.375);
  const [goal, setGoal] = useState<NutritionProfile['goal']>(existing?.goal ?? 'maintain');
  const [weight, setWeight] = useState(data.settings.weightLbs);

  const draft: NutritionProfile = { sex, age, heightIn, activity, goal };
  const valid = age >= 13 && age <= 100 && heightIn >= 48 && heightIn <= 90 && weight >= 60;

  const save = () => {
    if (!valid) return;
    update((d) => ({
      ...d,
      nutrition: { ...d.nutrition, profile: draft },
      settings: { ...d.settings, weightLbs: weight }
    }));
    toast(`Daily target: ${calorieTarget(draft, weight).toLocaleString()} kcal`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-[480px] p-5 space-y-4 shadow-sheet max-h-[92vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto sm:hidden" />
        <h2 className="text-lg font-black">Nutrition goals</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="block">
            <span className="label block mb-1">Sex (for BMR)</span>
            <div className="card p-1 grid grid-cols-2 gap-1">
              {(['male', 'female'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className={`rounded-lg py-1.5 text-sm font-bold ${sex === s ? 'bg-ink text-white' : 'text-dim'}`}
                >
                  {s === 'male' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
          </div>
          <NumField label="Age" value={age} onChange={setAge} />
          <label className="block">
            <span className="label block mb-1">Height</span>
            <div className="flex items-center gap-1">
              <input
                className="input w-16 text-center"
                inputMode="numeric"
                value={Math.floor(heightIn / 12)}
                onChange={(e) => setHeightIn(Math.max(0, parseInt(e.target.value || '0', 10)) * 12 + (heightIn % 12))}
              />
              <span className="text-xs text-dim">ft</span>
              <input
                className="input w-16 text-center"
                inputMode="numeric"
                value={heightIn % 12}
                onChange={(e) => setHeightIn(Math.floor(heightIn / 12) * 12 + Math.min(11, Math.max(0, parseInt(e.target.value || '0', 10))))}
              />
              <span className="text-xs text-dim">in</span>
            </div>
          </label>
          <NumField label="Weight (lbs)" value={weight} onChange={setWeight} />
        </div>

        <div className="block">
          <span className="label block mb-1">Activity level (outside of logged runs)</span>
          <div className="space-y-1.5">
            {ACTIVITY_LEVELS.map((a) => (
              <button
                key={a.value}
                onClick={() => setActivity(a.value)}
                className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  activity === a.value ? 'border-brand bg-brand-soft' : 'border-line'
                }`}
              >
                <span className="text-sm font-bold">{a.label}</span>
                <span className="text-[11px] text-dim">{a.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="block">
          <span className="label block mb-1">Bodyweight goal</span>
          <div className="grid grid-cols-3 gap-1.5">
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`rounded-xl border px-2 py-2 text-center ${
                  goal === g.value ? 'border-brand bg-brand-soft' : 'border-line'
                }`}
              >
                <div className="text-sm font-bold">{g.label}</div>
                <div className="text-[10px] text-dim">{g.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {valid && (
          <div className="bg-paper rounded-xl p-3 grid grid-cols-3 text-center">
            <div>
              <div className="stat-num text-lg">{bmr(draft, weight).toLocaleString()}</div>
              <div className="label mt-0.5">BMR</div>
            </div>
            <div>
              <div className="stat-num text-lg">{tdee(draft, weight).toLocaleString()}</div>
              <div className="label mt-0.5">TDEE</div>
            </div>
            <div>
              <div className="stat-num text-lg text-brand">{calorieTarget(draft, weight).toLocaleString()}</div>
              <div className="label mt-0.5">Daily target</div>
            </div>
          </div>
        )}

        <button className="btn-primary w-full py-3" onClick={save} disabled={!valid}>Save goals</button>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="label block mb-1">{label}</span>
      <input
        className="input w-full text-center"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value || '0', 10)))}
      />
    </label>
  );
}
