/**
 * The shared food vocabulary (content pack Part 4).
 *
 * THE single source of truth: the personal-fast UI, the recipe tagger,
 * and the recommender's hard filter all import this list. Adding or
 * changing a category is a change here and nowhere else.
 *
 * Open decision (wheat-soy): the shipped recipe database extends
 * fast_codes with `wheat` and `soy` beyond these seven. Until decided,
 * they are NOT first-class categories; the recipe data carries them and
 * the filter treats unknown codes conservatively (they still block).
 */

export const FAST_CATEGORIES = [
  "meat",
  "fish",
  "dairy",
  "eggs",
  "alcohol",
  "oil",
  "sweets",
] as const;

export type FastCategory = (typeof FAST_CATEGORIES)[number];

/**
 * The hard filter:
 *   allowed = (recipe.contained ∩ user.avoided) is empty
 *
 * String-typed on purpose — recipe data may carry extension codes
 * (wheat/soy, see open decision) and a user's mapped custom avoidance;
 * overlap semantics are identical for them. Ambiguity rule: the tagger
 * errs toward including a category, so a wrongly-hidden dish is the
 * failure mode, never a wrongly-recommended one.
 */
export function recipeAllowed(
  containedCategories: readonly string[],
  avoidedCategories: readonly string[],
): boolean {
  return !containedCategories.some((c) => avoidedCategories.includes(c));
}

/**
 * The obligation layer's mechanical reuse of the filter: a day ruled as
 * abstinence is a system-applied avoid:meat with fish allowed — the
 * reason meat and fish are separate categories.
 *
 * NOTE (meat-broth-scopes, open decision): the recipe `meat` tag includes
 * broth/stock (safe-erring), but EF complete abstinence permits meat
 * broth (B1). The obligation-layer filter and the personal-fast filter
 * may need different meat scopes — resolve before consolidating further.
 */
export function abstinenceAvoids(): FastCategory[] {
  return ["meat"];
}

/**
 * The avoid-set a resolved obligation contributes to the food filter.
 * Full/OF abstinence → avoid meat. EF PARTIAL abstinence permits meat at
 * the one principal meal, so it must NOT hard-filter the whole day — the
 * UI notes it instead. Only a binding obligation filters.
 */
export function obligationAvoids(obligation: {
  abstinence: string;
  binds: { abstinence: boolean };
}): FastCategory[] {
  if (!obligation.binds.abstinence) return [];
  if (obligation.abstinence === "abstinence" || obligation.abstinence === "complete") {
    return abstinenceAvoids();
  }
  return [];
}
