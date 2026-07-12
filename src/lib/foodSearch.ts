/**
 * Online food search — merges two free, browser-accessible databases so the
 * app never needs its own server:
 *   • USDA FoodData Central — generic/whole foods, restaurant & mixed dishes
 *     (Foundation, SR Legacy, Survey/FNDDS). Great for "chicken breast",
 *     "burrito", etc. Uses a public API key (DEMO_KEY by default; users can
 *     paste their own free key for higher limits).
 *   • Open Food Facts — 3M+ packaged/branded products.
 * Both are CORS-enabled and queried in parallel; results are normalized to
 * the same shape as the built-in food DB and de-duplicated.
 *
 * Attribution: USDA FoodData Central (public domain) · Open Food Facts (ODbL).
 */

export interface OnlineFood {
  name: string;
  serving: string;
  calories: number;   // per serving
  protein: number;    // g
  carbs: number;
  fat: number;
  src: 'usda' | 'off';
}

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number);
  return typeof n === 'number' && isFinite(n) ? n : null;
};
const round = (v: number | null): number => (v == null ? 0 : Math.round(v * 10) / 10);

// ---- USDA FoodData Central --------------------------------------------------

const USDA_KEY_STORAGE = 'runner:usdaKey';
export function getUsdaKey(): string {
  try {
    return localStorage.getItem(USDA_KEY_STORAGE)?.trim() || 'DEMO_KEY';
  } catch {
    return 'DEMO_KEY';
  }
}
export function setUsdaKey(key: string) {
  try {
    if (key.trim()) localStorage.setItem(USDA_KEY_STORAGE, key.trim());
    else localStorage.removeItem(USDA_KEY_STORAGE);
  } catch { /* ignore */ }
}

interface UsdaNutrient { nutrientNumber?: string; value?: number }
interface UsdaFood {
  description?: string;
  brandName?: string;
  foodNutrients?: UsdaNutrient[];
}

/** Per-100g macros from USDA nutrient numbers (208 kcal, 203 P, 204 F, 205 C). */
function usdaMacros(f: UsdaFood) {
  const by: Record<string, number> = {};
  for (const n of f.foodNutrients ?? []) {
    if (n.nutrientNumber && n.value != null) by[n.nutrientNumber] = n.value;
  }
  return { kcal: by['208'] ?? null, protein: by['203'] ?? null, carbs: by['205'] ?? null, fat: by['204'] ?? null };
}

async function searchUsda(term: string, signal?: AbortSignal): Promise<OnlineFood[]> {
  const url =
    'https://api.nal.usda.gov/fdc/v1/foods/search' +
    `?api_key=${encodeURIComponent(getUsdaKey())}` +
    `&query=${encodeURIComponent(term)}` +
    '&pageSize=20&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS)';
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`USDA ${res.status}`);
  const data = (await res.json()) as { foods?: UsdaFood[] };
  const out: OnlineFood[] = [];
  for (const f of data.foods ?? []) {
    const name = (f.description ?? '').trim();
    if (!name) continue;
    const m = usdaMacros(f);
    if (m.kcal == null || m.kcal <= 0) continue;
    // USDA generic values are per 100 g
    out.push({
      name: name.length > 60 ? name.slice(0, 59) + '…' : name,
      serving: '100 g',
      calories: Math.round(m.kcal),
      protein: round(m.protein),
      carbs: round(m.carbs),
      fat: round(m.fat),
      src: 'usda'
    });
  }
  return out;
}

// ---- Open Food Facts --------------------------------------------------------

interface OffProduct {
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: Record<string, unknown>;
}

async function searchOff(term: string, signal?: AbortSignal): Promise<OnlineFood[]> {
  const url =
    'https://world.openfoodfacts.org/cgi/search.pl' +
    `?search_terms=${encodeURIComponent(term)}` +
    '&search_simple=1&action=process&json=1&page_size=25&sort_by=unique_scans_n' +
    '&fields=product_name,brands,serving_size,nutriments';
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`OFF ${res.status}`);
  const data = (await res.json()) as { products?: OffProduct[] };
  const out: OnlineFood[] = [];
  for (const p of data.products ?? []) {
    const name = (p.product_name ?? '').trim();
    if (!name) continue;
    const n = p.nutriments ?? {};
    const perServing = !!p.serving_size && num(n['energy-kcal_serving']) != null;
    const kcal = num(perServing ? n['energy-kcal_serving'] : n['energy-kcal_100g']);
    if (kcal == null || kcal <= 0) continue;
    const label = p.brands ? `${name} (${String(p.brands).split(',')[0].trim()})` : name;
    out.push({
      name: label.length > 60 ? label.slice(0, 59) + '…' : label,
      serving: perServing ? (p.serving_size as string) : '100 g',
      calories: Math.round(kcal),
      protein: round(num(perServing ? n.proteins_serving : n.proteins_100g)),
      carbs: round(num(perServing ? n.carbohydrates_serving : n.carbohydrates_100g)),
      fat: round(num(perServing ? n.fat_serving : n.fat_100g)),
      src: 'off'
    });
  }
  return out;
}

// ---- merged search ----------------------------------------------------------

/**
 * Query both databases in parallel and merge. USDA generic foods come first
 * (better for whole foods / meals), then Open Food Facts branded products.
 * If one source fails, results from the other still return; only when BOTH
 * fail does this reject.
 */
export async function searchOnlineFoods(term: string, signal?: AbortSignal): Promise<OnlineFood[]> {
  const [usda, off] = await Promise.allSettled([searchUsda(term, signal), searchOff(term, signal)]);
  if (usda.status === 'rejected' && off.status === 'rejected') {
    throw usda.reason ?? off.reason ?? new Error('search failed');
  }
  const merged = [
    ...(usda.status === 'fulfilled' ? usda.value : []),
    ...(off.status === 'fulfilled' ? off.value : [])
  ];
  const seen = new Set<string>();
  const out: OnlineFood[] = [];
  for (const f of merged) {
    const key = f.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
    if (out.length >= 30) break;
  }
  return out;
}
