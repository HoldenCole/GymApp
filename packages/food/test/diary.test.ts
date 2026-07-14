import { describe, expect, it } from "vitest";
import {
  DiaryEntry,
  dayTotals,
  mealEntries,
  scaleMacros,
  sumMacros,
} from "../src";

const entry = (over: Partial<DiaryEntry>): DiaryEntry => ({
  id: "x",
  date: "2026-07-14",
  meal: "lunch",
  name: "test",
  source: "custom",
  servings: 1,
  kcal: 400,
  proteinG: 30,
  carbG: 40,
  fatG: 12,
  fiberG: 5,
  ...over,
});

describe("diary math", () => {
  it("scales macros by servings", () => {
    const scaled = scaleMacros(
      { kcal: 348, proteinG: 32, carbG: 28.6, fatG: 9.8, fiberG: 2.8 },
      1.5,
    );
    expect(scaled.kcal).toBe(522);
    expect(scaled.proteinG).toBe(48);
    expect(scaled.carbG).toBe(42.9);
  });

  it("sums a day and slices by meal", () => {
    const entries = [
      entry({ id: "1", meal: "breakfast", kcal: 500 }),
      entry({ id: "2", meal: "lunch" }),
      entry({ id: "3", meal: "lunch", kcal: 300, proteinG: 20 }),
      entry({ id: "4", date: "2026-07-13", kcal: 9999 }), // other day: excluded
    ];
    const totals = dayTotals(entries, "2026-07-14");
    expect(totals.kcal).toBe(500 + 400 + 300);
    expect(totals.proteinG).toBe(30 + 30 + 20);
    expect(mealEntries(entries, "2026-07-14", "lunch")).toHaveLength(2);
  });

  it("empty day totals to zero", () => {
    expect(dayTotals([], "2026-07-14").kcal).toBe(0);
    expect(sumMacros([]).proteinG).toBe(0);
  });
});
