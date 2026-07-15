import { useMemo, useRef, useState } from 'react';
import { Search, Sparkles, PencilLine, Camera, Loader2, X, Check, KeyRound, BookMarked, Star, Trash2, Plus } from 'lucide-react';
import { useStore, uid } from '../lib/storage';
import {
  type Meal, type FoodEntry, type SavedMeal, type MealComponent,
  calorieTarget, entryTotals, mealTotals
} from '../lib/nutrition';
import { analyzeFood, fileToJpegBase64, aiErrorMessage, type AiAnalysis } from '../lib/ai';
import FoodSearch, { type PickableFood } from '../components/FoodSearch';
import { toast } from '../lib/toast';

type Mode = 'search' | 'meals' | 'ai' | 'manual';

/**
 * Add-food sheet: search foods (built-in + Open Food Facts), pick from your
 * saved custom meals, scan/describe a meal with the AI nutritionist, or
 * enter macros manually.
 */
export default function AddFoodSheet({
  meal, date, caloriesSoFar, onClose, onAdd
}: {
  meal: Meal;
  date: string;
  caloriesSoFar: number;
  onClose: () => void;
  onAdd: (items: FoodEntry[]) => void;
}) {
  const [mode, setMode] = useState<Mode>('search');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-[480px] p-5 space-y-4 shadow-sheet h-[88vh] sm:h-auto sm:max-h-[88vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto sm:hidden" />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black capitalize">Add to {meal}</h2>
          <button onClick={onClose} className="p-1 -mr-1 text-dim hover:text-ink" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="card p-1 grid grid-cols-4 gap-1">
          <ModeTab on={mode === 'search'} onClick={() => setMode('search')} icon={<Search size={14} />} label="Search" />
          <ModeTab on={mode === 'meals'} onClick={() => setMode('meals')} icon={<BookMarked size={14} />} label="Meals" />
          <ModeTab on={mode === 'ai'} onClick={() => setMode('ai')} icon={<Sparkles size={14} />} label="AI scan" />
          <ModeTab on={mode === 'manual'} onClick={() => setMode('manual')} icon={<PencilLine size={14} />} label="Manual" />
        </div>

        {mode === 'search' && <SearchMode meal={meal} date={date} onAdd={onAdd} />}
        {mode === 'meals' && <MealsMode meal={meal} date={date} onAdd={onAdd} />}
        {mode === 'ai' && <AiMode meal={meal} date={date} caloriesSoFar={caloriesSoFar} onAdd={onAdd} />}
        {mode === 'manual' && <ManualMode meal={meal} date={date} onAdd={onAdd} />}
      </div>
    </div>
  );
}

function ModeTab({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl py-2 text-[11px] font-bold flex items-center justify-center gap-1 ${
        on ? 'bg-ink text-white' : 'text-dim hover:text-ink'
      }`}
    >
      {icon} {label}
    </button>
  );
}

/** Save a single food as a one-component favorite meal. */
function saveFoodAsMeal(
  update: ReturnType<typeof useStore>['update'],
  f: PickableFood
) {
  const meal: SavedMeal = {
    id: uid(),
    name: f.name,
    favorite: true,
    createdAt: new Date().toISOString(),
    components: [{ name: f.name, serving: f.serving, servings: 1, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat }]
  };
  update((d) => {
    // don't duplicate an identical favorite by name
    if (!d.nutrition.meals.some((m) => m.name.toLowerCase() === meal.name.toLowerCase())) {
      d.nutrition.meals.push(meal);
    }
    return d;
  });
  toast(`Saved "${f.name}" to Meals ⭐`);
}

// ---- search ----------------------------------------------------------------

function SearchMode({ meal, date, onAdd }: { meal: Meal; date: string; onAdd: (items: FoodEntry[]) => void }) {
  const { data, update } = useStore();
  const [picked, setPicked] = useState<PickableFood | null>(null);
  const [servings, setServings] = useState(1);

  // recent foods: latest unique names the user logged, so frequent meals are one tap
  const recents = useMemo<PickableFood[]>(() => {
    const seen = new Set<string>();
    const out: PickableFood[] = [];
    for (let i = data.nutrition.entries.length - 1; i >= 0 && out.length < 8; i--) {
      const e = data.nutrition.entries[i];
      if (!seen.has(e.name)) {
        seen.add(e.name);
        out.push({ name: e.name, serving: e.serving, calories: e.calories, protein: e.protein, carbs: e.carbs, fat: e.fat, source: e.source });
      }
    }
    return out;
  }, [data.nutrition.entries]);

  if (picked) {
    return (
      <PortionPicker
        food={picked}
        servings={servings}
        setServings={setServings}
        onBack={() => setPicked(null)}
        onLog={() =>
          onAdd([{
            name: picked.name, serving: picked.serving, calories: picked.calories,
            protein: picked.protein, carbs: picked.carbs, fat: picked.fat, source: picked.source,
            id: uid(), date, meal, servings
          }])
        }
      />
    );
  }

  return (
    <FoodSearch
      recents={recents}
      onPick={(f) => { setServings(1); setPicked(f); }}
      onSave={(f) => saveFoodAsMeal(update, f)}
    />
  );
}

/** Serving stepper + macro preview + log button. */
function PortionPicker({
  food, servings, setServings, onBack, onLog
}: {
  food: PickableFood;
  servings: number;
  setServings: (n: number) => void;
  onBack: () => void;
  onLog: () => void;
}) {
  const preview = entryTotals({ ...food, id: '', date: '', meal: 'breakfast', servings });
  return (
    <div className="space-y-4">
      <div className="bg-paper rounded-xl p-3">
        <div className="font-bold">{food.name}</div>
        <div className="text-xs text-dim">{food.serving} · {food.calories} kcal · P{food.protein} C{food.carbs} F{food.fat}</div>
      </div>
      <label className="block">
        <span className="label block mb-1">Servings</span>
        <div className="flex items-center gap-3">
          <button className="btn-ghost w-11 h-11 !p-0 text-xl" onClick={() => setServings(Math.max(0.25, +(servings - 0.5).toFixed(2)))}>−</button>
          <input
            className="input w-20 text-center"
            inputMode="decimal"
            value={servings}
            onChange={(e) => setServings(Math.max(0.1, parseFloat(e.target.value || '1')))}
          />
          <button className="btn-ghost w-11 h-11 !p-0 text-xl" onClick={() => setServings(+(servings + 0.5).toFixed(2))}>+</button>
          <span className="stat-num text-lg ml-auto">{preview.calories} kcal</span>
        </div>
      </label>
      <div className="flex gap-2">
        <button className="btn-primary flex-1" onClick={onLog}><Check size={18} /> Log it</button>
        <button className="btn-ghost" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

// ---- my meals ----------------------------------------------------------------

function MealsMode({ meal, date, onAdd }: { meal: Meal; date: string; onAdd: (items: FoodEntry[]) => void }) {
  const { data, update } = useStore();
  const [building, setBuilding] = useState<SavedMeal | null>(null);
  const [logging, setLogging] = useState<SavedMeal | null>(null);
  const [batch, setBatch] = useState(1);

  const meals = useMemo(
    () => [...data.nutrition.meals].sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.createdAt.localeCompare(a.createdAt)),
    [data.nutrition.meals]
  );

  if (building) {
    return (
      <MealBuilder
        initial={building}
        onCancel={() => setBuilding(null)}
        onSave={(m) => {
          update((d) => {
            const i = d.nutrition.meals.findIndex((x) => x.id === m.id);
            if (i >= 0) d.nutrition.meals[i] = m;
            else d.nutrition.meals.push(m);
            return d;
          });
          setBuilding(null);
          toast('Meal saved');
        }}
      />
    );
  }

  // logging: choose how many batches (meal-prep) to log
  if (logging) {
    const t = mealTotals(logging);
    return (
      <div className="space-y-4">
        <div className="bg-paper rounded-xl p-3">
          <div className="font-bold">{logging.name}</div>
          <div className="text-xs text-dim">{logging.components.length} item{logging.components.length === 1 ? '' : 's'} · {t.calories} kcal · P{t.protein} C{t.carbs} F{t.fat}</div>
        </div>
        <label className="block">
          <span className="label block mb-1">Servings (meal-prep batches)</span>
          <div className="flex items-center gap-3">
            <button className="btn-ghost w-11 h-11 !p-0 text-xl" onClick={() => setBatch(Math.max(0.25, +(batch - 0.5).toFixed(2)))}>−</button>
            <input className="input w-20 text-center" inputMode="decimal" value={batch} onChange={(e) => setBatch(Math.max(0.1, parseFloat(e.target.value || '1')))} />
            <button className="btn-ghost w-11 h-11 !p-0 text-xl" onClick={() => setBatch(+(batch + 0.5).toFixed(2))}>+</button>
            <span className="stat-num text-lg ml-auto">{Math.round(t.calories * batch)} kcal</span>
          </div>
        </label>
        <div className="flex gap-2">
          <button
            className="btn-primary flex-1"
            onClick={() => {
              onAdd([{
                id: uid(), date, meal, name: logging.name, serving: '1 meal', servings: batch,
                calories: t.calories, protein: t.protein, carbs: t.carbs, fat: t.fat, source: 'meal'
              }]);
            }}
          >
            <Check size={18} /> Log it
          </button>
          <button className="btn-ghost" onClick={() => { setLogging(null); setBatch(1); }}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        className="btn-primary w-full"
        onClick={() => setBuilding({ id: uid(), name: '', favorite: true, components: [], createdAt: new Date().toISOString() })}
      >
        <Plus size={18} /> Create a meal
      </button>

      {meals.length === 0 ? (
        <p className="text-sm text-dim text-center py-6">
          No saved meals yet. Build a custom meal for meal prep, or tap the ⭐ on any
          food in Search to save it here.
        </p>
      ) : (
        <div className="space-y-2">
          {meals.map((m) => {
            const t = mealTotals(m);
            return (
              <div key={m.id} className="rounded-xl border border-line p-3">
                <div className="flex items-start gap-2">
                  <button className="flex-1 text-left min-w-0" onClick={() => { setBatch(1); setLogging(m); }}>
                    <div className="font-bold truncate flex items-center gap-1.5">
                      {m.favorite && <Star size={13} className="text-brand shrink-0" fill="currentColor" />}
                      {m.name}
                    </div>
                    <div className="text-[11px] text-dim nums">
                      {m.components.length} item{m.components.length === 1 ? '' : 's'} · {t.calories} kcal · P{t.protein} C{t.carbs} F{t.fat}
                    </div>
                  </button>
                  <button className="text-dim hover:text-ink p-1" aria-label="Edit meal" onClick={() => setBuilding(m)}>
                    <PencilLine size={15} />
                  </button>
                  <button
                    className="text-faint hover:text-bad p-1"
                    aria-label="Delete meal"
                    onClick={() => update((d) => ({ ...d, nutrition: { ...d.nutrition, meals: d.nutrition.meals.filter((x) => x.id !== m.id) } }))}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Build or edit a custom meal — name + components (add via search or manual). */
function MealBuilder({
  initial, onSave, onCancel
}: {
  initial: SavedMeal;
  onSave: (m: SavedMeal) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [favorite, setFavorite] = useState(initial.favorite);
  const [components, setComponents] = useState<MealComponent[]>(initial.components);
  const [adding, setAdding] = useState(false);

  const t = mealTotals({ ...initial, components });

  if (adding) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black">Add an ingredient</h3>
          <button className="text-dim hover:text-ink text-sm font-bold" onClick={() => setAdding(false)}>Done</button>
        </div>
        <FoodSearch
          onPick={(f) => {
            setComponents((cs) => [...cs, { name: f.name, serving: f.serving, servings: 1, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat }]);
            toast(`Added ${f.name}`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="label block mb-1">Meal name</span>
        <input className="input w-full" placeholder="Chicken & rice meal prep" value={name} autoFocus onChange={(e) => setName(e.target.value)} />
      </label>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="label">Ingredients</span>
          <span className="stat-num text-sm">{t.calories} kcal · P{t.protein} C{t.carbs} F{t.fat}</span>
        </div>
        {components.length === 0 ? (
          <p className="text-xs text-dim py-2">No ingredients yet — add foods below.</p>
        ) : (
          <div className="divide-y divide-line">
            {components.map((c, i) => (
              <div key={i} className="flex items-center gap-2 py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  <div className="text-[11px] text-dim nums">{Math.round(c.calories * c.servings)} kcal</div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="btn-ghost w-8 h-8 !p-0" onClick={() => setComponents((cs) => cs.map((x, j) => j === i ? { ...x, servings: Math.max(0.25, +(x.servings - 0.5).toFixed(2)) } : x))}>−</button>
                  <span className="w-8 text-center text-sm nums">{c.servings}</span>
                  <button className="btn-ghost w-8 h-8 !p-0" onClick={() => setComponents((cs) => cs.map((x, j) => j === i ? { ...x, servings: +(x.servings + 0.5).toFixed(2) } : x))}>+</button>
                </div>
                <button className="text-faint hover:text-bad p-1" aria-label="Remove" onClick={() => setComponents((cs) => cs.filter((_, j) => j !== i))}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
        <button className="btn-ghost w-full mt-2" onClick={() => setAdding(true)}>
          <Plus size={16} /> Add ingredient
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="w-4 h-4 accent-brand" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} />
        Favorite (pin to top)
      </label>

      <div className="flex gap-2">
        <button
          className="btn-primary flex-1"
          disabled={!name.trim() || components.length === 0}
          onClick={() => onSave({ ...initial, name: name.trim(), favorite, components })}
        >
          <Check size={18} /> Save meal
        </button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ---- AI nutritionist ---------------------------------------------------------

function AiMode({ meal, date, caloriesSoFar, onAdd }: { meal: Meal; date: string; caloriesSoFar: number; onAdd: (items: FoodEntry[]) => void }) {
  const { data, update } = useStore();
  const [desc, setDesc] = useState('');
  const [photo, setPhoto] = useState<{ b64: string; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AiAnalysis | null>(null);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [keyDraft, setKeyDraft] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const apiKey = data.nutrition.apiKey;
  const profile = data.nutrition.profile;

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const b64 = await fileToJpegBase64(file);
      setPhoto({ b64, preview: `data:image/jpeg;base64,${b64}` });
      setError('');
    } catch {
      setError("Couldn't read that image.");
    }
  };

  const analyze = async () => {
    if (!photo && !desc.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await analyzeFood(
        apiKey,
        { photoBase64Jpeg: photo?.b64, description: desc },
        {
          goal: profile?.goal ?? 'maintain',
          calorieTarget: profile ? calorieTarget(profile, data.settings.weightLbs) : 2000,
          caloriesSoFar
        }
      );
      setResult(res);
      setChecked(res.items.map(() => true));
    } catch (err) {
      setError(aiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const logChecked = () => {
    if (!result) return;
    const items: FoodEntry[] = result.items
      .filter((_, i) => checked[i])
      .map((it) => ({
        id: uid(), date, meal, name: it.name, serving: it.serving, servings: 1,
        calories: Math.round(it.calories), protein: it.protein, carbs: it.carbs, fat: it.fat,
        source: 'ai' as const
      }));
    if (items.length > 0) onAdd(items);
  };

  // one-time key setup
  if (!apiKey) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 items-start">
          <KeyRound size={18} className="text-brand shrink-0 mt-0.5" />
          <p className="text-xs text-dim leading-relaxed">
            The AI nutritionist sends your photo or description <span className="text-ink font-semibold">directly
            from this device to Claude</span> (Anthropic's AI) using your own API key — Runner has no server and
            never sees it. The key is stored only in this browser. Get one at{' '}
            <span className="text-ink font-semibold">console.anthropic.com</span>. Everything else in the
            Nutrition tab works without it.
          </p>
        </div>
        <input
          className="input w-full"
          placeholder="sk-ant-…"
          value={keyDraft}
          onChange={(e) => setKeyDraft(e.target.value)}
        />
        <button
          className="btn-primary w-full"
          disabled={!keyDraft.trim().startsWith('sk-ant-')}
          onClick={() => update((d) => ({ ...d, nutrition: { ...d.nutrition, apiKey: keyDraft.trim() } }))}
        >
          Save key on this device
        </button>
      </div>
    );
  }

  // results view
  if (result) {
    const total = result.items.reduce((s, it, i) => (checked[i] ? s + it.calories : s), 0);
    return (
      <div className="space-y-4">
        <div className="divide-y divide-line">
          {result.items.map((it, i) => (
            <label key={i} className="flex items-center gap-3 py-2.5">
              <input
                type="checkbox"
                className="w-5 h-5 accent-brand"
                checked={checked[i] ?? false}
                onChange={(e) => setChecked((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{it.name}</div>
                <div className="text-[11px] text-dim nums">{it.serving} · P{it.protein} C{it.carbs} F{it.fat}</div>
              </div>
              <span className="stat-num text-sm">{it.calories}</span>
            </label>
          ))}
        </div>
        {result.tips.length > 0 && (
          <div className="bg-brand-soft rounded-xl p-3 space-y-1.5">
            {result.tips.map((t, i) => (
              <p key={i} className="text-xs text-ink leading-relaxed flex gap-1.5">
                <Sparkles size={12} className="text-brand shrink-0 mt-0.5" /> {t}
              </p>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={logChecked} disabled={!checked.some(Boolean)}>
            Log {checked.filter(Boolean).length} item{checked.filter(Boolean).length === 1 ? '' : 's'} · {Math.round(total)} kcal
          </button>
          <button className="btn-ghost" onClick={() => { setResult(null); setPhoto(null); }}>Redo</button>
        </div>
        <p className="text-[10px] text-faint text-center">AI estimates are approximate — treat them as a smart guess, not a lab report.</p>
      </div>
    );
  }

  // input view
  return (
    <div className="space-y-4">
      {photo ? (
        <div className="relative">
          <img src={photo.preview} alt="Your meal" className="w-full max-h-56 object-cover rounded-xl" />
          <button
            className="absolute top-2 right-2 bg-ink/70 text-white rounded-full p-1.5"
            onClick={() => setPhoto(null)}
            aria-label="Remove photo"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          className="w-full h-32 rounded-xl border-2 border-dashed border-line text-dim flex flex-col items-center justify-center gap-1 hover:border-brand hover:text-brand"
          onClick={() => fileRef.current?.click()}
        >
          <Camera size={22} />
          <span className="text-xs font-bold">Snap or upload a photo of your food</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pickPhoto} />

      <textarea
        className="input w-full h-20 resize-none"
        placeholder={photo ? 'Optional: add context — "large portion", "no dressing"…' : 'Or describe it — "chicken burrito with guac and a side of chips"'}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      {error && <p className="text-xs text-bad">{error}</p>}

      <button className="btn-primary w-full py-3" onClick={analyze} disabled={busy || (!photo && !desc.trim())}>
        {busy ? <><Loader2 size={18} className="animate-spin" /> Analyzing…</> : <><Sparkles size={18} /> Analyze with AI</>}
      </button>
      <button
        className="text-[11px] text-faint underline mx-auto block"
        onClick={() => update((d) => ({ ...d, nutrition: { ...d.nutrition, apiKey: '' } }))}
      >
        Remove saved API key
      </button>
    </div>
  );
}

// ---- manual ------------------------------------------------------------------

function ManualMode({ meal, date, onAdd }: { meal: Meal; date: string; onAdd: (items: FoodEntry[]) => void }) {
  const [name, setName] = useState('');
  const [cal, setCal] = useState('');
  const [p, setP] = useState('');
  const [c, setC] = useState('');
  const [f, setF] = useState('');

  const submit = () => {
    const calories = parseInt(cal || '0', 10);
    if (!name.trim() || calories <= 0) return;
    onAdd([{
      id: uid(), date, meal, name: name.trim(), serving: '1 serving', servings: 1,
      calories, protein: parseFloat(p || '0'), carbs: parseFloat(c || '0'), fat: parseFloat(f || '0'),
      source: 'manual'
    }]);
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="label block mb-1">Food name</span>
        <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="Grandma's lasagna" autoFocus />
      </label>
      <div className="grid grid-cols-4 gap-2">
        <MacroField label="kcal" value={cal} onChange={setCal} />
        <MacroField label="Protein g" value={p} onChange={setP} />
        <MacroField label="Carbs g" value={c} onChange={setC} />
        <MacroField label="Fat g" value={f} onChange={setF} />
      </div>
      <button className="btn-primary w-full" onClick={submit} disabled={!name.trim() || !(parseInt(cal || '0', 10) > 0)}>
        <Check size={18} /> Log it
      </button>
    </div>
  );
}

function MacroField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="label block mb-1">{label}</span>
      <input className="input w-full text-center" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" />
    </label>
  );
}
