import { describe, expect, it } from "vitest";
import { dailySeries, DiaryEntry } from "../src";

const entry = (date: string, kcal: number): DiaryEntry => ({
  id: date + kcal,
  date,
  meal: "lunch",
  name: "x",
  source: "custom",
  servings: 1,
  kcal,
  proteinG: 10,
  carbG: 10,
  fatG: 5,
  fiberG: 0,
});

describe("dailySeries", () => {
  it("returns one point per calendar day ending at endDate", () => {
    const s = dailySeries([], "2026-07-14", 7);
    expect(s).toHaveLength(7);
    expect(s[0]?.date).toBe("2026-07-08");
    expect(s[6]?.date).toBe("2026-07-14");
  });

  it("sums logged days and leaves unlogged days null — never a fabricated zero", () => {
    const s = dailySeries(
      [entry("2026-07-13", 1800), entry("2026-07-13", 400), entry("2026-07-10", 2000)],
      "2026-07-14",
      7,
    );
    const byDate = Object.fromEntries(s.map((p) => [p.date, p.totals]));
    expect(byDate["2026-07-13"]?.kcal).toBe(2200);
    expect(byDate["2026-07-10"]?.kcal).toBe(2000);
    expect(byDate["2026-07-12"]).toBeNull();
    expect(byDate["2026-07-14"]).toBeNull();
  });

  it("spans month boundaries correctly", () => {
    const s = dailySeries([], "2026-03-02", 4);
    expect(s.map((p) => p.date)).toEqual([
      "2026-02-27",
      "2026-02-28",
      "2026-03-01",
      "2026-03-02",
    ]);
  });
});
