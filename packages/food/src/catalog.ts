/**
 * The catalog: the 500-recipe database + verified products, normalized
 * from the packaged JSON, with search and the three filter layers from
 * the UI brief §4:
 *
 *   1. Allergies — safety. Hard filter, absolute, no override.
 *   2. Fast & abstinence — the Church's calendar + the user's rule.
 *      Set by the engine (a system-applied avoid-set); shown, not managed.
 *   3. Never-eat & dislikes — preference. Hard filter, but casual.
 *
 * All three run through the same overlap mechanics (engine vocabulary),
 * but they are separate inputs with separate treatments in the UI — the
 * filter never collapses them into one list.
 */

import { recipeAllowed } from "@kanon/engine";
import { DiaryEntry, EMPTY_MACROS, MacroSet, Meal, scaleMacros } from "./model";

export interface CatalogItem {
  id: string;
  type: "recipe" | "product";
  title: string;
  brand?: string;
  effortLevel?: number;
  effortName?: string;
  servings?: string | number;
  activeMin?: number;
  totalMin?: number;
  /** Per serving. Placeholder values by design until the USDA re-pull. */
  macros: MacroSet;
  abstinenceFriendly: boolean;
  fastCodes: string[];
  allergenCodes: string[];
  trainingTags: string[];
  culturalTag?: string;
  verified: boolean;
  ingredients?: string;
  steps?: string;
  notes?: string;
}

/**
 * Allergen vocabulary: the nine FDA major allergens, plus `gluten`,
 * which the shipped database uses on a few rows. Labels for the UI;
 * codes match the database exactly.
 */
export const ALLERGENS: { code: string; label: string }[] = [
  { code: "milk", label: "Milk" },
  { code: "eggs", label: "Eggs" },
  { code: "fish", label: "Fish" },
  { code: "shellfish", label: "Shellfish" },
  { code: "tree_nuts", label: "Tree nuts" },
  { code: "peanuts", label: "Peanuts" },
  { code: "wheat", label: "Wheat" },
  { code: "soy", label: "Soy" },
  { code: "sesame", label: "Sesame" },
  { code: "gluten", label: "Gluten" },
];

interface RawItem {
  id: string;
  type: string;
  title: string;
  brand?: string | null;
  effort_level?: number | null;
  effort_name?: string | null;
  servings?: string | number | null;
  active_min?: number | null;
  total_min?: number | null;
  kcal_per_serv?: number | null;
  protein_g?: number | null;
  carb_g?: number | null;
  fat_g?: number | null;
  fiber_g?: number | null;
  abstinence_friendly?: boolean | null;
  fast_codes: string[];
  allergen_codes: string[];
  training_tags: string[];
  cultural_tag?: string | null;
  verified?: boolean | null;
  ingredients?: string | null;
  steps?: string | null;
  notes?: string | null;
}

export function normalizeCatalog(raw: RawItem[]): CatalogItem[] {
  return raw.map((r) => ({
    id: r.id,
    type: r.type === "product" ? "product" : "recipe",
    title: r.title,
    brand: r.brand ?? undefined,
    effortLevel: r.effort_level ?? undefined,
    effortName: r.effort_name ?? undefined,
    servings: r.servings ?? undefined,
    activeMin: r.active_min ?? undefined,
    totalMin: r.total_min ?? undefined,
    macros: {
      ...EMPTY_MACROS,
      kcal: r.kcal_per_serv ?? 0,
      proteinG: r.protein_g ?? 0,
      carbG: r.carb_g ?? 0,
      fatG: r.fat_g ?? 0,
      fiberG: r.fiber_g ?? 0,
    },
    abstinenceFriendly: r.abstinence_friendly === true,
    fastCodes: r.fast_codes,
    allergenCodes: r.allergen_codes,
    trainingTags: r.training_tags,
    culturalTag: r.cultural_tag ?? undefined,
    verified: r.verified === true,
    ingredients: r.ingredients ?? undefined,
    steps: r.steps ?? undefined,
    notes: r.notes ?? undefined,
  }));
}

export interface CatalogFilter {
  /** Case-insensitive title/brand match. */
  query?: string;
  /**
   * Layer 1 — allergies. Absolute: any overlap blocks, and nothing in
   * this module or the UI may offer an override.
   */
  allergies?: readonly string[];
  /**
   * Layer 2 — the day's rule + personal fasts, as an avoid-set of
   * vocabulary categories (the engine/UI supplies it; e.g. an abstinence
   * day contributes "meat").
   */
  avoidCategories?: readonly string[];
  /** Layer 3 — never-eat & dislikes, same category vocabulary, casual. */
  dislikedCategories?: readonly string[];
  /** Facets. */
  effortMax?: number;
  abstinenceFriendlyOnly?: boolean;
  type?: "recipe" | "product";
  /** Goal facet — matches any training tag containing this token. */
  goalTag?: string;
  /** Tradition facet — matches a cultural tag containing this token. */
  tradition?: string;
}

export function filterCatalog(
  items: readonly CatalogItem[],
  f: CatalogFilter,
): CatalogItem[] {
  const q = f.query?.trim().toLowerCase();
  return items.filter((item) => {
    if (f.type && item.type !== f.type) return false;
    if (
      f.allergies?.length &&
      item.allergenCodes.some((a) => f.allergies!.includes(a))
    ) {
      return false;
    }
    if (f.avoidCategories?.length && !recipeAllowed(item.fastCodes, f.avoidCategories)) {
      return false;
    }
    if (
      f.dislikedCategories?.length &&
      !recipeAllowed(item.fastCodes, f.dislikedCategories)
    ) {
      return false;
    }
    if (f.effortMax !== undefined && (item.effortLevel ?? 1) > f.effortMax) return false;
    if (f.abstinenceFriendlyOnly && !item.abstinenceFriendly) return false;
    if (f.goalTag && !item.trainingTags.some((t) => t.includes(f.goalTag!))) return false;
    if (
      f.tradition &&
      !(item.culturalTag ?? "").toLowerCase().includes(f.tradition.toLowerCase())
    ) {
      return false;
    }
    if (q) {
      const hay = `${item.title} ${item.brand ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Log a catalog item into the diary at a serving multiple. */
export function toDiaryEntry(
  item: CatalogItem,
  opts: { id: string; date: string; meal: Meal; servings: number },
): DiaryEntry {
  return {
    id: opts.id,
    date: opts.date,
    meal: opts.meal,
    name: item.title,
    source: item.type,
    refId: item.id,
    servings: opts.servings,
    ...scaleMacros(item.macros, opts.servings),
  };
}

/**
 * Seam for external food search (USDA FoodData Central is the planned
 * source of truth for values). An implementation lands with API access;
 * custom entry covers the gap honestly in the meantime.
 */
export interface FoodSearchResult {
  name: string;
  brand?: string;
  servingDescription: string;
  macrosPerServing: MacroSet;
}

export interface FoodDataSource {
  search(query: string): Promise<FoodSearchResult[]>;
}
