import { useMemo, useRef, useState } from 'react';
import { Search, Sparkles, PencilLine, Camera, Loader2, X, Check, KeyRound } from 'lucide-react';
import { useStore, uid } from '../lib/storage';
import { type Meal, type FoodEntry, calorieTarget, entryTotals } from '../lib/nutrition';
import { FOOD_DB } from '../data/foods';
import { analyzeFood, fileToJpegBase64, aiErrorMessage, type AiAnalysis } from '../lib/ai';

type Mode = 'search' | 'ai' | 'manual';

/**
 * Add-food sheet: search the built-in database (+ your recent foods),
 * describe or photograph a meal for the AI nutritionist, or enter macros
 * manually.
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

        <div className="card p-1 grid grid-cols-3 gap-1">
          <ModeTab on={mode === 'search'} onClick={() => setMode('search')} icon={<Search size={14} />} label="Search" />
          <ModeTab on={mode === 'ai'} onClick={() => setMode('ai')} icon={<Sparkles size={14} />} label="AI scan" />
          <ModeTab on={mode === 'manual'} onClick={() => setMode('manual')} icon={<PencilLine size={14} />} label="Manual" />
        </div>

        {mode === 'search' && <SearchMode meal={meal} date={date} onAdd={onAdd} />}
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
      className={`rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1 ${
        on ? 'bg-ink text-white' : 'text-dim hover:text-ink'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ---- search ----------------------------------------------------------------

function SearchMode({ meal, date, onAdd }: { meal: Meal; date: string; onAdd: (items: FoodEntry[]) => void }) {
  const { data } = useStore();
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<Omit<FoodEntry, 'id' | 'date' | 'meal' | 'servings'> | null>(null);
  const [servings, setServings] = useState(1);

  // recent foods: latest unique names the user logged, so frequent meals are one tap
  const recents = useMemo(() => {
    const seen = new Set<string>();
    const out: FoodEntry[] = [];
    for (let i = data.nutrition.entries.length - 1; i >= 0 && out.length < 8; i--) {
      const e = data.nutrition.entries[i];
      if (!seen.has(e.name)) {
        seen.add(e.name);
        out.push(e);
      }
    }
    return out;
  }, [data.nutrition.entries]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return FOOD_DB.filter(([name]) => name.toLowerCase().includes(term)).slice(0, 25);
  }, [q]);

  const submit = () => {
    if (!picked) return;
    onAdd([{ ...picked, id: uid(), date, meal, servings }]);
  };

  if (picked) {
    const preview = entryTotals({ ...picked, id: '', date, meal, servings });
    return (
      <div className="space-y-4">
        <div className="bg-paper rounded-xl p-3">
          <div className="font-bold">{picked.name}</div>
          <div className="text-xs text-dim">{picked.serving} · {picked.calories} kcal · P{picked.protein} C{picked.carbs} F{picked.fat}</div>
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
          <button className="btn-primary flex-1" onClick={submit}><Check size={18} /> Log it</button>
          <button className="btn-ghost" onClick={() => setPicked(null)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        className="input w-full"
        placeholder="Search foods — chicken, rice, pizza…"
        value={q}
        autoFocus
        onChange={(e) => setQ(e.target.value)}
      />
      {!q && recents.length > 0 && (
        <>
          <div className="label">Recent</div>
          <div className="divide-y divide-line">
            {recents.map((r) => (
              <FoodRowButton
                key={r.id}
                name={r.name}
                sub={`${r.serving} · ${r.calories} kcal`}
                onClick={() => setPicked({ name: r.name, serving: r.serving, calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat, source: r.source })}
              />
            ))}
          </div>
        </>
      )}
      {q && (
        <div className="divide-y divide-line">
          {results.length === 0 && (
            <p className="text-sm text-dim py-4 text-center">
              No match — try the <span className="font-bold">AI scan</span> or <span className="font-bold">Manual</span> tab.
            </p>
          )}
          {results.map(([name, serving, cal, p, c, f]) => (
            <FoodRowButton
              key={name}
              name={name}
              sub={`${serving} · ${cal} kcal · P${p} C${c} F${f}`}
              onClick={() => setPicked({ name, serving, calories: cal, protein: p, carbs: c, fat: f, source: 'db' })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FoodRowButton({ name, sub, onClick }: { name: string; sub: string; onClick: () => void }) {
  return (
    <button className="w-full text-left py-2.5 flex items-center justify-between gap-2" onClick={onClick}>
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate">{name}</div>
        <div className="text-[11px] text-dim nums">{sub}</div>
      </div>
      <span className="text-brand"><Check size={16} className="opacity-0" /><span className="sr-only">select</span></span>
    </button>
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
                className="w-5 h-5 accent-[#FC4C02]"
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
