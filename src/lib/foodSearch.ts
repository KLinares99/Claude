/**
 * Online food search via Open Food Facts — a free, open database of 3M+
 * foods (generic + branded). No API key, CORS-enabled, so it runs straight
 * from the browser with no server. Results are normalized to the same shape
 * as the built-in food DB. The local DB stays the instant/offline layer;
 * these results append below it.
 *
 * Attribution: data © Open Food Facts contributors, ODbL.
 */

export interface OnlineFood {
  name: string;
  serving: string;
  calories: number;   // per serving
  protein: number;    // g
  carbs: number;
  fat: number;
}

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number);
  return typeof n === 'number' && isFinite(n) ? n : null;
};
const round = (v: number | null): number => (v == null ? 0 : Math.round(v * 10) / 10);

interface OffProduct {
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: Record<string, unknown>;
}

/** Search Open Food Facts; returns normalized foods (empty on no matches). */
export async function searchOnlineFoods(term: string, signal?: AbortSignal): Promise<OnlineFood[]> {
  const url =
    'https://world.openfoodfacts.org/cgi/search.pl' +
    `?search_terms=${encodeURIComponent(term)}` +
    '&search_simple=1&action=process&json=1&page_size=30&sort_by=unique_scans_n' +
    '&fields=product_name,brands,serving_size,nutriments';

  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { products?: OffProduct[] };

  const seen = new Set<string>();
  const out: OnlineFood[] = [];
  for (const p of data.products ?? []) {
    const name = (p.product_name ?? '').trim();
    if (!name) continue;
    const n = p.nutriments ?? {};

    // prefer per-serving values when the product declares a serving size
    const perServing = !!p.serving_size && num(n['energy-kcal_serving']) != null;
    const kcal = num(perServing ? n['energy-kcal_serving'] : n['energy-kcal_100g']);
    if (kcal == null || kcal <= 0) continue;

    const label = p.brands ? `${name} (${String(p.brands).split(',')[0].trim()})` : name;
    const dedup = label.toLowerCase();
    if (seen.has(dedup)) continue;
    seen.add(dedup);

    out.push({
      name: label.length > 60 ? label.slice(0, 59) + '…' : label,
      serving: perServing ? (p.serving_size as string) : '100 g',
      calories: Math.round(kcal),
      protein: round(num(perServing ? n.proteins_serving : n.proteins_100g)),
      carbs: round(num(perServing ? n.carbohydrates_serving : n.carbohydrates_100g)),
      fat: round(num(perServing ? n.fat_serving : n.fat_100g))
    });
    if (out.length >= 25) break;
  }
  return out;
}
