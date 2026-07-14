/**
 * Plans: bulk / cut / maintain, customizable at every level.
 *
 * The customization contract: every number the app computes is a DEFAULT,
 * and every default is overridable — BMR, TDEE, daily kcal, and each
 * macro. Overrides win at their own level and downstream values recompute
 * around them (override kcal → macros re-derive from it; override protein
 * → carbs absorb the remainder).
 *
 * Wellbeing boundary: a plan is a fitness choice, never a fast. Plan copy
 * must never borrow fasting language, and no plan mechanic feeds the
 * accumulation check (which watches declared fasting commitments, never
 * intake). Aggressive settings are flagged for gentle information — the
 * app informs, it never blocks or shames.
 */

import { completedYears } from "@kanon/engine";
import { ACTIVITY_FACTORS, BodyProfile, mifflinStJeor } from "./body";

export type Goal = "bulk" | "cut" | "maintain";

export const GOAL_LABELS: Record<Goal, string> = {
  bulk: "Bulk — build",
  cut: "Cut — lean out",
  maintain: "Maintain — hold steady",
};

export interface Plan {
  goal: Goal;
  /**
   * Weekly body-weight change as a % of current weight, always positive;
   * the sign comes from the goal. Ignored for maintain.
   */
  weeklyRatePct: number;
  /** Protein target, grams per kg body weight. */
  proteinPerKg: number;
  /** Fat target, grams per kg body weight. */
  fatPerKg: number;
  /** User overrides — each wins over the computed default at its level. */
  overrides?: {
    bmr?: number;
    tdee?: number;
    kcal?: number;
    proteinG?: number;
    fatG?: number;
    carbG?: number;
  };
}

export interface RatePreset {
  goal: Goal;
  id: string;
  label: string;
  weeklyRatePct: number;
}

/** Starting points, not limits — the rate field takes any custom value. */
export const RATE_PRESETS: RatePreset[] = [
  { goal: "bulk", id: "lean_bulk", label: "Lean bulk · +0.25%/wk", weeklyRatePct: 0.25 },
  { goal: "bulk", id: "standard_bulk", label: "Standard bulk · +0.5%/wk", weeklyRatePct: 0.5 },
  { goal: "cut", id: "gentle_cut", label: "Gentle cut · −0.5%/wk", weeklyRatePct: 0.5 },
  { goal: "cut", id: "standard_cut", label: "Standard cut · −0.75%/wk", weeklyRatePct: 0.75 },
  { goal: "cut", id: "aggressive_cut", label: "Aggressive cut · −1%/wk", weeklyRatePct: 1.0 },
  { goal: "maintain", id: "maintain", label: "Maintain", weeklyRatePct: 0 },
];

export const DEFAULT_PLAN: Plan = {
  goal: "maintain",
  weeklyRatePct: 0,
  proteinPerKg: 2.0, // serious-lifter default; fully user-adjustable
  fatPerKg: 0.8,
};

/** ≈7700 kcal per kg of body-weight change — the standard planning constant. */
const KCAL_PER_KG = 7700;

export interface EnergyTargets {
  bmr: number;
  tdee: number;
  /** Signed daily kcal adjustment implied by goal + rate. */
  dailyDeltaKcal: number;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  /** Which values came from a user override rather than the formula. */
  overridden: {
    bmr: boolean;
    tdee: boolean;
    kcal: boolean;
    proteinG: boolean;
    fatG: boolean;
    carbG: boolean;
  };
  /**
   * Informational only (never a block): the target sits below the user's
   * BMR — worth a gentle "talk to your doctor" line in the UI.
   */
  kcalBelowBmr: boolean;
}

export function energyTargets(
  body: BodyProfile,
  plan: Plan,
  onDateISO: string,
): EnergyTargets {
  const o = plan.overrides ?? {};
  const age = completedYears(body.birthDate, onDateISO);

  const bmr = o.bmr ?? mifflinStJeor(body.sex, body.weightKg, body.heightCm, age);
  const tdee = o.tdee ?? Math.round(bmr * ACTIVITY_FACTORS[body.activity]);

  const sign = plan.goal === "bulk" ? 1 : plan.goal === "cut" ? -1 : 0;
  const weeklyDeltaKg = (plan.weeklyRatePct / 100) * body.weightKg;
  const dailyDeltaKcal = Math.round((sign * weeklyDeltaKg * KCAL_PER_KG) / 7);

  const kcal = o.kcal ?? Math.max(0, tdee + dailyDeltaKcal);

  const proteinG = o.proteinG ?? Math.round(plan.proteinPerKg * body.weightKg);
  const fatG = o.fatG ?? Math.round(plan.fatPerKg * body.weightKg);
  const carbG =
    o.carbG ?? Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));

  return {
    bmr,
    tdee,
    dailyDeltaKcal,
    kcal,
    proteinG,
    fatG,
    carbG,
    overridden: {
      bmr: o.bmr !== undefined,
      tdee: o.tdee !== undefined,
      kcal: o.kcal !== undefined,
      proteinG: o.proteinG !== undefined,
      fatG: o.fatG !== undefined,
      carbG: o.carbG !== undefined,
    },
    kcalBelowBmr: kcal < bmr,
  };
}
