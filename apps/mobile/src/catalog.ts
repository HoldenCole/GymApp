/**
 * The in-app catalog: packaged recipe database + products, normalized
 * once at startup. Macro values are USDA-aligned placeholders until the
 * FoodData Central re-pull (the packaged JSON's own meta says so).
 */

import recipesJson from "@kanon/data/packaged/recipes.json";
import productsJson from "@kanon/data/packaged/products.json";
import { CatalogItem, normalizeCatalog } from "@kanon/food";

export const CATALOG: CatalogItem[] = normalizeCatalog([
  ...recipesJson.recipes,
  ...productsJson.products,
]);

const byId = new Map(CATALOG.map((item) => [item.id, item]));

export function catalogItem(id: string): CatalogItem | undefined {
  return byId.get(id);
}
