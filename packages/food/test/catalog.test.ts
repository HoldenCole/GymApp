/**
 * Catalog tests run against the REAL packaged database — they double as
 * integrity checks on data/packaged/*.json (Recipe DB Brief QA gates).
 */

import { describe, expect, it } from "vitest";
import recipesJson from "@kanon/data/packaged/recipes.json";
import productsJson from "@kanon/data/packaged/products.json";
import { FAST_CATEGORIES } from "@kanon/engine";
import {
  ALLERGENS,
  filterCatalog,
  normalizeCatalog,
  toDiaryEntry,
} from "../src";

const catalog = normalizeCatalog([...recipesJson.recipes, ...productsJson.products]);
const recipes = catalog.filter((c) => c.type === "recipe");

describe("database integrity", () => {
  it("413 recipes + 87 products, unique ids", () => {
    expect(recipes).toHaveLength(413);
    expect(catalog.filter((c) => c.type === "product")).toHaveLength(87);
    expect(new Set(catalog.map((c) => c.id)).size).toBe(500);
  });

  it("every fast code is in the controlled vocabulary (+ the open wheat/soy extension)", () => {
    const allowed = new Set<string>([...FAST_CATEGORIES, "wheat", "soy"]);
    for (const item of catalog) {
      for (const code of item.fastCodes) {
        expect(allowed.has(code), `${item.id}: unknown fast code ${code}`).toBe(true);
      }
    }
  });

  it("every allergen code is a known allergen", () => {
    const allowed = new Set(ALLERGENS.map((a) => a.code));
    for (const item of catalog) {
      for (const code of item.allergenCodes) {
        expect(allowed.has(code), `${item.id}: unknown allergen ${code}`).toBe(true);
      }
    }
  });

  it("recipe effort levels are 1–4", () => {
    for (const r of recipes) {
      expect(r.effortLevel).toBeGreaterThanOrEqual(1);
      expect(r.effortLevel).toBeLessThanOrEqual(4);
    }
  });

  it("abstinence-friendly recipes never carry the meat tag (safe-erring)", () => {
    for (const r of recipes.filter((x) => x.abstinenceFriendly)) {
      expect(r.fastCodes, `${r.id} ${r.title}`).not.toContain("meat");
    }
  });
});

describe("the three filter layers", () => {
  it("layer 1 — allergies block absolutely", () => {
    const out = filterCatalog(catalog, { allergies: ["milk", "tree_nuts"] });
    for (const item of out) {
      expect(item.allergenCodes).not.toContain("milk");
      expect(item.allergenCodes).not.toContain("tree_nuts");
    }
    expect(out.length).toBeLessThan(catalog.length);
  });

  it("layer 2 — an abstinence day (avoid meat) keeps fish", () => {
    const out = filterCatalog(catalog, { avoidCategories: ["meat"] });
    expect(out.every((i) => !i.fastCodes.includes("meat"))).toBe(true);
    expect(out.some((i) => i.fastCodes.includes("fish"))).toBe(true);
  });

  it("layer 3 — dislikes filter with the same vocabulary, separately", () => {
    const out = filterCatalog(catalog, {
      avoidCategories: ["meat"],
      dislikedCategories: ["eggs"],
    });
    expect(
      out.every((i) => !i.fastCodes.includes("meat") && !i.fastCodes.includes("eggs")),
    ).toBe(true);
  });

  it("facets: effort cap, abstinence-only, type, query", () => {
    const easy = filterCatalog(catalog, { effortMax: 2, type: "recipe" });
    expect(easy.every((i) => (i.effortLevel ?? 1) <= 2)).toBe(true);
    expect(easy).toHaveLength(159 + 75);

    const friday = filterCatalog(catalog, { abstinenceFriendlyOnly: true });
    expect(friday.every((i) => i.abstinenceFriendly)).toBe(true);

    const salmon = filterCatalog(catalog, { query: "salmon" });
    expect(salmon.length).toBeGreaterThan(0);
    expect(
      salmon.every((i) => `${i.title} ${i.brand ?? ""}`.toLowerCase().includes("salmon")),
    ).toBe(true);
  });

  it("no filters returns everything", () => {
    expect(filterCatalog(catalog, {})).toHaveLength(500);
  });

  it("goal facet matches training tags including compound ones", () => {
    const highProtein = filterCatalog(catalog, { goalTag: "high-protein" });
    expect(highProtein.length).toBeGreaterThan(400); // plain + abstinence-friendly variants
    expect(
      highProtein.every((i) => i.trainingTags.some((t) => t.includes("high-protein"))),
    ).toBe(true);
    const postWorkout = filterCatalog(catalog, { goalTag: "post-workout" });
    expect(postWorkout.length).toBeGreaterThan(0);
  });

  it("tradition facet finds each patron's table", () => {
    for (const patron of ["Joseph", "Benedict", "Hyacinth", "Therese", "Anthony"]) {
      const dishes = filterCatalog(catalog, { tradition: patron });
      expect(dishes.length, patron).toBeGreaterThan(0);
      expect(dishes.every((d) => d.culturalTag?.includes(patron))).toBe(true);
    }
  });
});

describe("catalog → diary", () => {
  it("logs an item at a serving multiple with scaled macros", () => {
    const item = catalog.find((c) => c.id === "A001")!;
    const e = toDiaryEntry(item, {
      id: "d1",
      date: "2026-07-14",
      meal: "breakfast",
      servings: 2,
    });
    expect(e.name).toBe(item.title);
    expect(e.refId).toBe("A001");
    expect(e.kcal).toBe(item.macros.kcal * 2);
    expect(e.source).toBe("recipe");
  });
});
