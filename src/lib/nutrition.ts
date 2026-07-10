/**
 * Nutrition math — MyFitnessPal-style targets and daily tallies.
 * BMR via Mifflin-St Jeor, TDEE via activity multiplier, daily calorie
 * target adjusted for the weight goal, macros as a % split.
 */
import type { Activity } from './storage';
import { caloriesFor } from './run';

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snacks'];
export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks'
};

export interface FoodEntry {
  id: string;
  date: string;        // yyyy-mm-dd
  meal: Meal;
  name: string;
  serving: string;     // e.g. "1 cup", "2 slices"
  servings: number;    // multiplier
  calories: number;    // per serving
  protein: number;     // g per serving
  carbs: number;
  fat: number;
  source: 'db' | 'ai' | 'manual' | 'meal';
}

/** One food inside a saved meal (its own per-serving macros × servings). */
export interface MealComponent {
  name: string;
  serving: string;
  servings: number;
  calories: number;    // per serving
  protein: number;
  carbs: number;
  fat: number;
}

/** A reusable custom meal — a favorited bundle of foods for quick logging
 *  and meal prep (log N batches at once). */
export interface SavedMeal {
  id: string;
  name: string;
  favorite: boolean;
  components: MealComponent[];
  createdAt: string;
}

/** Combined per-batch macros for a saved meal. */
export function mealTotals(m: SavedMeal): { calories: number; protein: number; carbs: number; fat: number } {
  const t = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const c of m.components) {
    t.calories += c.calories * c.servings;
    t.protein += c.protein * c.servings;
    t.carbs += c.carbs * c.servings;
    t.fat += c.fat * c.servings;
  }
  return {
    calories: Math.round(t.calories),
    protein: Math.round(t.protein * 10) / 10,
    carbs: Math.round(t.carbs * 10) / 10,
    fat: Math.round(t.fat * 10) / 10
  };
}

export interface NutritionProfile {
  sex: 'male' | 'female';
  age: number;
  heightIn: number;      // inches
  activity: number;      // 1.2 | 1.375 | 1.55 | 1.725
  goal: 'lose' | 'maintain' | 'gain';
}

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary', desc: 'Desk job, little exercise' },
  { value: 1.375, label: 'Light', desc: '1–3 workouts / week' },
  { value: 1.55, label: 'Moderate', desc: '3–5 workouts / week' },
  { value: 1.725, label: 'Active', desc: '6–7 workouts / week' }
];

export const GOALS = [
  { value: 'lose' as const, label: 'Lose weight', delta: -500, desc: '≈ 1 lb / week deficit' },
  { value: 'maintain' as const, label: 'Maintain', delta: 0, desc: 'Stay where you are' },
  { value: 'gain' as const, label: 'Gain', delta: 300, desc: 'Lean surplus' }
];

/** Mifflin-St Jeor BMR (kcal/day). */
export function bmr(p: NutritionProfile, weightLbs: number): number {
  const kg = weightLbs * 0.453592;
  const cm = p.heightIn * 2.54;
  const base = 10 * kg + 6.25 * cm - 5 * p.age;
  return Math.round(p.sex === 'male' ? base + 5 : base - 161);
}

export function tdee(p: NutritionProfile, weightLbs: number): number {
  return Math.round(bmr(p, weightLbs) * p.activity);
}

/** Daily calorie target = TDEE adjusted for the goal (floored at 1200). */
export function calorieTarget(p: NutritionProfile, weightLbs: number): number {
  const delta = GOALS.find((g) => g.value === p.goal)?.delta ?? 0;
  return Math.max(1200, tdee(p, weightLbs) + delta);
}

/** Macro targets in grams from a 30% protein / 45% carb / 25% fat split. */
export function macroTargets(calories: number) {
  return {
    protein: Math.round((calories * 0.3) / 4),
    carbs: Math.round((calories * 0.45) / 4),
    fat: Math.round((calories * 0.25) / 9)
  };
}

export interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function entryTotals(e: FoodEntry): DayTotals {
  return {
    calories: Math.round(e.calories * e.servings),
    protein: +(e.protein * e.servings).toFixed(1),
    carbs: +(e.carbs * e.servings).toFixed(1),
    fat: +(e.fat * e.servings).toFixed(1)
  };
}

export function dayTotals(entries: FoodEntry[], date: string): DayTotals {
  const t: DayTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const e of entries) {
    if (e.date !== date) continue;
    const et = entryTotals(e);
    t.calories += et.calories;
    t.protein += et.protein;
    t.carbs += et.carbs;
    t.fat += et.fat;
  }
  return {
    calories: Math.round(t.calories),
    protein: Math.round(t.protein),
    carbs: Math.round(t.carbs),
    fat: Math.round(t.fat)
  };
}

/** Calories burned by runs on a given local date — the MFP "exercise" credit. */
export function exerciseCalories(activities: Activity[], date: string, weightLbs: number): number {
  return activities
    .filter((a) => {
      const d = new Date(a.date);
      const local = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      return local === date;
    })
    .reduce((s, a) => s + caloriesFor(a.seconds, a.miles, weightLbs), 0);
}

export function localDateISO(d = new Date()): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

export function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return localDateISO(date);
}
