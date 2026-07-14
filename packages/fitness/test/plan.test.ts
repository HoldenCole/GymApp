import { describe, expect, it } from "vitest";
import {
  BodyProfile,
  DEFAULT_PLAN,
  energyTargets,
  ffmi,
  mifflinStJeor,
  Plan,
  tdeeFromBmr,
} from "../src";

// 80 kg, 180 cm, born 2001-01-01 → age 25 on the reference date.
const BODY: BodyProfile = {
  sex: "male",
  heightCm: 180,
  weightKg: 80,
  birthDate: "2001-01-01",
  activity: "moderate",
};
const ON = "2026-07-14";

describe("Mifflin-St Jeor", () => {
  it("male reference case: 10·80 + 6.25·180 − 5·25 + 5 = 1805", () => {
    expect(mifflinStJeor("male", 80, 180, 25)).toBe(1805);
  });
  it("female offset is −161", () => {
    expect(mifflinStJeor("female", 80, 180, 25)).toBe(1805 - 166);
  });
  it("TDEE applies the activity factor", () => {
    expect(tdeeFromBmr(1805, "moderate")).toBe(Math.round(1805 * 1.55));
  });
});

describe("FFMI", () => {
  it("80 kg at 15% body fat, 180 cm", () => {
    const r = ffmi(80, 180, 15);
    expect(r.leanMassKg).toBe(68);
    expect(r.ffmi).toBe(21); // 68 / 1.8² = 20.99
    expect(r.normalized).toBe(21); // height is exactly 1.80 m
  });
  it("normalization adjusts toward 1.80 m", () => {
    const short = ffmi(70, 170, 15);
    expect(short.normalized).toBeGreaterThan(short.ffmi);
  });
});

describe("energyTargets: goals and rates", () => {
  it("maintain: kcal = TDEE, no delta", () => {
    const t = energyTargets(BODY, DEFAULT_PLAN, ON);
    expect(t.bmr).toBe(1805);
    expect(t.tdee).toBe(2798);
    expect(t.dailyDeltaKcal).toBe(0);
    expect(t.kcal).toBe(2798);
  });

  it("cut at 0.5%/wk on 80 kg: −440 kcal/day", () => {
    const plan: Plan = { ...DEFAULT_PLAN, goal: "cut", weeklyRatePct: 0.5 };
    const t = energyTargets(BODY, plan, ON);
    expect(t.dailyDeltaKcal).toBe(-440); // 0.4 kg × 7700 / 7
    expect(t.kcal).toBe(2798 - 440);
  });

  it("bulk at 0.25%/wk: +220 kcal/day", () => {
    const plan: Plan = { ...DEFAULT_PLAN, goal: "bulk", weeklyRatePct: 0.25 };
    const t = energyTargets(BODY, plan, ON);
    expect(t.dailyDeltaKcal).toBe(220);
  });

  it("macros: protein/fat from per-kg, carbs absorb the remainder", () => {
    const t = energyTargets(BODY, DEFAULT_PLAN, ON);
    expect(t.proteinG).toBe(160); // 2.0 g/kg
    expect(t.fatG).toBe(64); // 0.8 g/kg
    expect(t.carbG).toBe(Math.round((2798 - 160 * 4 - 64 * 9) / 4));
  });
});

describe("energyTargets: the override chain", () => {
  it("kcal override wins and carbs re-derive from it", () => {
    const plan: Plan = { ...DEFAULT_PLAN, overrides: { kcal: 2500 } };
    const t = energyTargets(BODY, plan, ON);
    expect(t.kcal).toBe(2500);
    expect(t.overridden.kcal).toBe(true);
    expect(t.carbG).toBe(Math.round((2500 - 160 * 4 - 64 * 9) / 4));
  });

  it("protein override holds and carbs absorb the difference", () => {
    const plan: Plan = { ...DEFAULT_PLAN, overrides: { proteinG: 200 } };
    const t = energyTargets(BODY, plan, ON);
    expect(t.proteinG).toBe(200);
    expect(t.carbG).toBe(Math.round((2798 - 200 * 4 - 64 * 9) / 4));
  });

  it("TDEE override flows into kcal", () => {
    const plan: Plan = {
      ...DEFAULT_PLAN,
      goal: "cut",
      weeklyRatePct: 0.5,
      overrides: { tdee: 3000 },
    };
    const t = energyTargets(BODY, plan, ON);
    expect(t.kcal).toBe(3000 - 440);
    expect(t.overridden.tdee).toBe(true);
    expect(t.overridden.kcal).toBe(false);
  });

  it("every level can be overridden at once", () => {
    const plan: Plan = {
      ...DEFAULT_PLAN,
      overrides: { bmr: 1700, tdee: 2600, kcal: 2400, proteinG: 180, fatG: 70, carbG: 200 },
    };
    const t = energyTargets(BODY, plan, ON);
    expect([t.bmr, t.tdee, t.kcal, t.proteinG, t.fatG, t.carbG]).toEqual([
      1700, 2600, 2400, 180, 70, 200,
    ]);
    expect(Object.values(t.overridden).every(Boolean)).toBe(true);
  });

  it("carbs never go negative", () => {
    const plan: Plan = { ...DEFAULT_PLAN, overrides: { kcal: 800 } };
    const t = energyTargets(BODY, plan, ON);
    expect(t.carbG).toBe(0);
  });

  it("a target below BMR is flagged for gentle information, never blocked", () => {
    const plan: Plan = { ...DEFAULT_PLAN, overrides: { kcal: 1500 } };
    const t = energyTargets(BODY, plan, ON);
    expect(t.kcalBelowBmr).toBe(true);
    expect(t.kcal).toBe(1500); // the value stands — the app informs, it never blocks
  });

  it("age comes from birthDate — a birthday changes the BMR", () => {
    const before = energyTargets(BODY, DEFAULT_PLAN, "2025-12-31");
    const after = energyTargets(BODY, DEFAULT_PLAN, "2026-01-01");
    expect(before.bmr - after.bmr).toBe(5); // one more year, −5 kcal
  });
});
