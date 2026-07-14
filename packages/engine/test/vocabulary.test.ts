import { describe, expect, it } from "vitest";
import { abstinenceAvoids, recipeAllowed } from "../src";

describe("the hard filter: allowed iff contained ∩ avoided is empty", () => {
  it("allows a recipe sharing no categories with the user's avoidance", () => {
    expect(recipeAllowed(["fish", "oil"], ["meat"])).toBe(true);
  });

  it("blocks on any overlap", () => {
    expect(recipeAllowed(["meat", "dairy"], ["dairy"])).toBe(false);
  });

  it("an empty personal fast allows everything", () => {
    expect(recipeAllowed(["meat", "eggs", "sweets"], [])).toBe(true);
  });

  it("extension codes in recipe data still block (conservative until the wheat/soy decision)", () => {
    expect(recipeAllowed(["wheat"], ["wheat"])).toBe(false);
  });

  it("abstinence is a system-applied avoid:meat with fish allowed", () => {
    const avoided = abstinenceAvoids();
    expect(recipeAllowed(["fish"], avoided)).toBe(true);
    expect(recipeAllowed(["meat"], avoided)).toBe(false);
  });
});
