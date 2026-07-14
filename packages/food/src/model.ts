/**
 * The food diary model. Entries are per-date, per-meal, with macros
 * denormalized onto the entry (what you logged is what you logged, even
 * if the catalog or a future USDA re-pull changes underneath).
 */

export type Meal = "breakfast" | "lunch" | "dinner" | "snack";

export const MEALS: Meal[] = ["breakfast", "lunch", "dinner", "snack"];

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

export interface MacroSet {
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  fiberG: number;
}

export const EMPTY_MACROS: MacroSet = {
  kcal: 0,
  proteinG: 0,
  carbG: 0,
  fatG: 0,
  fiberG: 0,
};

export type DiarySource = "recipe" | "product" | "custom";

export interface DiaryEntry extends MacroSet {
  id: string;
  /** ISO date the entry belongs to. */
  date: string;
  meal: Meal;
  name: string;
  source: DiarySource;
  /** Catalog id when source is recipe/product. */
  refId?: string;
  servings: number;
}

export function scaleMacros(m: MacroSet, servings: number): MacroSet {
  const s = (n: number) => Math.round(n * servings * 10) / 10;
  return {
    kcal: Math.round(m.kcal * servings),
    proteinG: s(m.proteinG),
    carbG: s(m.carbG),
    fatG: s(m.fatG),
    fiberG: s(m.fiberG),
  };
}

export function sumMacros(list: readonly MacroSet[]): MacroSet {
  const out = { ...EMPTY_MACROS };
  for (const m of list) {
    out.kcal += m.kcal;
    out.proteinG += m.proteinG;
    out.carbG += m.carbG;
    out.fatG += m.fatG;
    out.fiberG += m.fiberG;
  }
  out.proteinG = round1(out.proteinG);
  out.carbG = round1(out.carbG);
  out.fatG = round1(out.fatG);
  out.fiberG = round1(out.fiberG);
  return out;
}

export function entriesFor(entries: readonly DiaryEntry[], date: string): DiaryEntry[] {
  return entries.filter((e) => e.date === date);
}

export function mealEntries(
  entries: readonly DiaryEntry[],
  date: string,
  meal: Meal,
): DiaryEntry[] {
  return entries.filter((e) => e.date === date && e.meal === meal);
}

export function dayTotals(entries: readonly DiaryEntry[], date: string): MacroSet {
  return sumMacros(entriesFor(entries, date));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
