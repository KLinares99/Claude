import { useEffect, useMemo, useState } from 'react';
import { Globe, Loader2, Star, Check } from 'lucide-react';
import { FOOD_DB } from '../data/foods';
import { searchOnlineFoods, type OnlineFood } from '../lib/foodSearch';
import type { FoodEntry } from '../lib/nutrition';

/** A food the user can pick — from the local DB, online search, or recents. */
export interface PickableFood {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: FoodEntry['source'];
}

/**
 * Reusable food search: an input plus built-in "Common foods" results and a
 * live "Open Food Facts" section (free, keyless). Used by the Add-food
 * Search tab and the meal builder. `onSave` (optional) renders a star to
 * favorite a result into My Meals.
 */
export default function FoodSearch({
  onPick,
  onSave,
  recents = [],
  autoFocus = true,
  placeholder = 'Search foods — chicken, rice, pizza…'
}: {
  onPick: (f: PickableFood) => void;
  onSave?: (f: PickableFood) => void;
  recents?: PickableFood[];
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const [q, setQ] = useState('');

  const local = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return FOOD_DB.filter(([name]) => name.toLowerCase().includes(term)).slice(0, 25);
  }, [q]);

  const [online, setOnline] = useState<OnlineFood[]>([]);
  const [onlineState, setOnlineState] = useState<'idle' | 'loading' | 'error'>('idle');
  useEffect(() => {
    const term = q.trim();
    setOnline([]);
    if (term.length < 2) {
      setOnlineState('idle');
      return;
    }
    setOnlineState('loading');
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const found = await searchOnlineFoods(term, ctrl.signal);
        const localNames = new Set(local.map(([n]) => n.toLowerCase()));
        setOnline(found.filter((f) => !localNames.has(f.name.toLowerCase())));
        setOnlineState('idle');
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') setOnlineState('error');
      }
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, local]);

  return (
    <div className="space-y-3">
      <input
        className="input w-full"
        placeholder={placeholder}
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
      />

      {!q && recents.length > 0 && (
        <>
          <div className="label">Recent</div>
          <div className="divide-y divide-line">
            {recents.map((r, i) => (
              <Row key={`r-${i}`} food={r} onPick={onPick} onSave={onSave} />
            ))}
          </div>
        </>
      )}

      {q && (
        <div className="space-y-1">
          {local.length > 0 && (
            <>
              <div className="label pt-1">Common foods</div>
              <div className="divide-y divide-line">
                {local.map(([name, serving, cal, p, c, f]) => (
                  <Row
                    key={name}
                    food={{ name, serving, calories: cal, protein: p, carbs: c, fat: f, source: 'db' }}
                    onPick={onPick}
                    onSave={onSave}
                  />
                ))}
              </div>
            </>
          )}

          {q.trim().length >= 2 && (
            <>
              <div className="label pt-3 flex items-center gap-1.5">
                <Globe size={12} /> Open Food Facts
                {onlineState === 'loading' && <Loader2 size={12} className="animate-spin" />}
              </div>
              {onlineState === 'error' ? (
                <p className="text-xs text-dim py-2">Couldn't reach the online database — check your connection, or use Manual.</p>
              ) : online.length > 0 ? (
                <div className="divide-y divide-line">
                  {online.map((f, i) => (
                    <Row key={`o-${i}`} food={{ ...f, source: 'db' }} onPick={onPick} onSave={onSave} />
                  ))}
                </div>
              ) : onlineState === 'idle' ? (
                <p className="text-xs text-dim py-2">No online matches. Try a different term, or use Manual.</p>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  food, onPick, onSave
}: {
  food: PickableFood;
  onPick: (f: PickableFood) => void;
  onSave?: (f: PickableFood) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-2.5">
      <button className="flex-1 text-left min-w-0" onClick={() => onPick(food)}>
        <div className="text-sm font-semibold truncate">{food.name}</div>
        <div className="text-[11px] text-dim nums">
          {food.serving} · {food.calories} kcal · P{food.protein} C{food.carbs} F{food.fat}
        </div>
      </button>
      {onSave ? (
        <button
          className="text-faint hover:text-brand p-1 shrink-0"
          aria-label={`Save ${food.name} to meals`}
          onClick={() => onSave(food)}
        >
          <Star size={16} />
        </button>
      ) : (
        <Check size={16} className="text-brand opacity-0 shrink-0" />
      )}
    </div>
  );
}
