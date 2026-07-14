/**
 * Body metrics (Project Master: "Mifflin-St Jeor baseline, user-overridable;
 * FFMI in Body metrics"). Pure math — no storage, no UI.
 */

export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

/** Standard Mifflin-St Jeor activity multipliers. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary — desk work, little exercise",
  light: "Light — training 1–3 days/week",
  moderate: "Moderate — training 3–5 days/week",
  active: "Active — training 6–7 days/week",
  very_active: "Very active — hard training + physical job",
};

export interface BodyProfile {
  sex: Sex;
  heightCm: number;
  weightKg: number;
  /** ISO date; age drives the BMR term. */
  birthDate: string;
  activity: ActivityLevel;
  /** Optional; unlocks FFMI. */
  bodyFatPct?: number;
}

/** Mifflin-St Jeor basal metabolic rate (kcal/day). */
export function mifflinStJeor(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  ageYears: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return Math.round(base + (sex === "male" ? 5 : -161));
}

export function tdeeFromBmr(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTORS[activity]);
}

export interface FfmiResult {
  leanMassKg: number;
  ffmi: number;
  /** Height-normalized to 1.80 m (the common +6.1/m adjustment). */
  normalized: number;
}

export function ffmi(
  weightKg: number,
  heightCm: number,
  bodyFatPct: number,
): FfmiResult {
  const heightM = heightCm / 100;
  const leanMassKg = weightKg * (1 - bodyFatPct / 100);
  const raw = leanMassKg / (heightM * heightM);
  return {
    leanMassKg: round1(leanMassKg),
    ffmi: round1(raw),
    normalized: round1(raw + 6.1 * (1.8 - heightM)),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
