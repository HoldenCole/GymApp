/**
 * The personal fasting layer (content pack Part 2; Project Master §1):
 * calendar-independent, stackable commitments with origin `chosen`, with
 * optional intentions. Also the Orthodox bridge for v1 — the vocabulary's
 * oil/alcohol categories exist for exactly this layer.
 *
 * The wellbeing rules here are load-bearing, not decoration:
 *
 * - `origin` is the firm distinction (§1). This module only ever produces
 *   `chosen`; church obligations come from the rule resolver and are never
 *   represented as a PersonalFast. The two must stay visually and verbally
 *   distinct everywhere ("You've chosen…", never "you must").
 * - Setting aside a chosen commitment is NOT a sin (§1, breakage rule).
 *   Set-aside days exist so the filter relaxes; they are never scored,
 *   streaked, aggregated, or surfaced as failure. No API here counts them.
 * - The custom field is honest (Part 4): free text cannot be enforced by
 *   the recipe filter and is advisory unless the user maps it onto real
 *   categories. `activeAvoidSet` keeps the two visibly separate.
 * - The accumulation check (§4) watches DECLARED COMMITMENTS, never food
 *   intake, and its response is pastoral: gentle, infrequent, dismissible,
 *   never a block. Thresholds are reviewer-tunable parameters, not truths.
 */

import type { Weekday } from "./types";

export type FastSchedule =
  | { kind: "daily" }
  | { kind: "weekdays"; days: Weekday[] };

export interface PersonalFast {
  id: string;
  /** Always "chosen". Church obligations never appear in this layer. */
  origin: "chosen";
  /** The user's own name for it — "My Lent commitment", "No sweets". */
  name: string;
  /** Vocabulary categories this commitment avoids — these hard-filter. */
  avoidCategories: string[];
  /** Free-text commitment — tracked and shown, advisory in the filter. */
  customText?: string;
  schedule: FastSchedule;
  /** Optional intention (from the shared pool, or the user's own). */
  intention?: string;
  /** ISO dates; endDate omitted = open-ended. */
  startDate: string;
  endDate?: string;
  /** When it was declared — the escalation signal reads this. */
  createdAt: string;
  /**
   * Days the user set this aside. Relaxes the filter for that day.
   * Private; never counted against the user, never rendered as a streak.
   */
  setAsideDates: string[];
}

/** Whether a commitment applies on a given day. */
export function fastAppliesOn(
  fast: PersonalFast,
  date: string,
  weekday: Weekday,
): boolean {
  if (date < fast.startDate) return false;
  if (fast.endDate && date > fast.endDate) return false;
  if (fast.setAsideDates.includes(date)) return false;
  if (fast.schedule.kind === "weekdays" && !fast.schedule.days.includes(weekday)) {
    return false;
  }
  return true;
}

export interface ActiveAvoidSet {
  /** Union of categories from applying commitments — feeds the hard filter. */
  categories: string[];
  /**
   * Custom commitments applying today that the filter CANNOT enforce.
   * The UI must say so plainly — silent non-enforcement is the dishonest
   * failure mode.
   */
  customAdvisory: string[];
}

export function activeAvoidSet(
  fasts: readonly PersonalFast[],
  date: string,
  weekday: Weekday,
): ActiveAvoidSet {
  const categories = new Set<string>();
  const customAdvisory: string[] = [];
  for (const fast of fasts) {
    if (!fastAppliesOn(fast, date, weekday)) continue;
    for (const c of fast.avoidCategories) categories.add(c);
    if (fast.customText?.trim()) customAdvisory.push(fast.customText.trim());
  }
  return { categories: [...categories], customAdvisory };
}

/** Set a commitment aside for one day. Nothing to confess, nothing to make up. */
export function setAsideOn(fast: PersonalFast, date: string): PersonalFast {
  if (fast.setAsideDates.includes(date)) return fast;
  return { ...fast, setAsideDates: [...fast.setAsideDates, date] };
}

/** Resume a commitment on a day it was set aside. */
export function resumeOn(fast: PersonalFast, date: string): PersonalFast {
  return { ...fast, setAsideDates: fast.setAsideDates.filter((d) => d !== date) };
}

// ————— The accumulation check (§4) ————————————————————————————————————

/**
 * Thresholds are set WITH the wellbeing reviewer, not hard-coded truths.
 * These defaults are deliberately conservative starting points; tuning
 * them is a review-gate task, and they trigger on commitment patterns,
 * never on any quantity of food.
 */
export interface AccumulationThresholds {
  /** Distinct categories avoided at once through stacked personal fasts. */
  stackedCategories: number;
  /** Chosen fasting applying this many days of the week or more. */
  daysPerWeek: number;
  /** Flag chosen fasting running on Sundays (days the Church leaves free). */
  flagSundays: boolean;
  /** N commitments created within the escalation window. */
  escalationCount: number;
  escalationWindowDays: number;
}

export const DEFAULT_ACCUMULATION_THRESHOLDS: AccumulationThresholds = {
  stackedCategories: 4,
  daysPerWeek: 6,
  flagSundays: true,
  escalationCount: 3,
  escalationWindowDays: 14,
};

export type AccumulationSignal =
  | "stacked_categories"
  | "most_days_running"
  | "free_days_covered"
  | "rapid_escalation";

export interface AccumulationResult {
  signals: AccumulationSignal[];
  /** True when any signal fired — the UI may show the gentle notice. */
  noticeSuggested: boolean;
}

const ALL_WEEKDAYS: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const MS_PER_DAY = 86_400_000;

/**
 * Pattern-level check over declared commitments as of `date`. Reads
 * commitments only — by design it cannot see food intake, weights, or
 * calories, so it can never become an eating monitor.
 */
export function accumulationCheck(
  fasts: readonly PersonalFast[],
  date: string,
  thresholds: AccumulationThresholds = DEFAULT_ACCUMULATION_THRESHOLDS,
): AccumulationResult {
  const signals: AccumulationSignal[] = [];

  // Which weekdays does any commitment cover this week (ignoring set-asides)?
  const active = fasts.filter(
    (f) => f.startDate <= date && (!f.endDate || f.endDate >= date),
  );
  const coveredDays = new Set<Weekday>();
  const categoriesNow = new Set<string>();
  for (const f of active) {
    const days = f.schedule.kind === "daily" ? ALL_WEEKDAYS : f.schedule.days;
    for (const d of days) coveredDays.add(d);
    for (const c of f.avoidCategories) categoriesNow.add(c);
  }

  if (categoriesNow.size >= thresholds.stackedCategories) {
    signals.push("stacked_categories");
  }
  if (coveredDays.size >= thresholds.daysPerWeek) {
    signals.push("most_days_running");
  }
  if (thresholds.flagSundays && coveredDays.has("sunday") && active.length > 0) {
    signals.push("free_days_covered");
  }

  const windowStart = Date.parse(`${date}T00:00:00Z`) -
    thresholds.escalationWindowDays * MS_PER_DAY;
  const recent = active.filter(
    (f) => Date.parse(`${f.createdAt.slice(0, 10)}T00:00:00Z`) >= windowStart,
  );
  if (recent.length >= thresholds.escalationCount) {
    signals.push("rapid_escalation");
  }

  return { signals, noticeSuggested: signals.length > 0 };
}

// ————— USER-FACING copy (app-ready, from the content pack) ————————————

/** §1 breakage rule — shown when a chosen commitment is set aside. */
export const SET_ASIDE_COPY =
  "You set aside your own commitment today. That's yours to decide — nothing to confess, nothing to make up.";

/** §4 accumulation notice — gentle, dismissible, never a block. */
export const ACCUMULATION_NOTICE_COPY =
  "You're carrying a few commitments on top of what the Church asks right now. That instinct toward devotion is a good one — and part of how the Church orders fasting is to keep it sustainable: it builds in feast days, rest, and generous exceptions. If it feels like a lot, it can be worth talking over with your confessor, or your doctor if it touches your health. Nothing here needs undoing — this is just a gentle check-in.";

/**
 * §4 severe/persistent path: the app still does not adjudicate — it
 * offers support and routes to a person. Note for the dev (from the
 * pack): do NOT use NEDA's discontinued helpline.
 */
export const EATING_SUPPORT_RESOURCE = {
  name: "National Alliance for Eating Disorders",
  note: "Offered as care, never as an accusation; always dismissible.",
};

/** Part 4 custom-field honesty — shown wherever custom commitments meet suggestions. */
export const CUSTOM_ADVISORY_COPY =
  "Meal suggestions can't account for this one — it's tracked for you, not filtered.";
