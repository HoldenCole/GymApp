/**
 * Core types for the Kanon rule resolver.
 *
 * The resolver consumes DayFacts from an imported liturgical calendar
 * (Introibo is the source of truth) and layers the fasting obligation on
 * top per the user's discipline, norm profile, and age. It computes no
 * dates, ranks, or transfers itself — that seam is what lets Orthodox
 * calendars slot in later as purely additive day-fact sources.
 */

/** The two Roman corpora. Separate bodies of law — never cross-wired. */
export type Discipline = "of" | "ef";

/**
 * Country norm profile. One profile carries ALL country-dependent values
 * together (EF fast age + Ember Wed/Sat rule move as a unit; OF Friday
 * substitution). Unauthored countries fall back to `universal`, never
 * silently to `us`.
 */
export type NormProfileId = "us" | "universal";

export type Weekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

/** Liturgical season, as supplied by the calendar import. */
export type Season =
  | "advent"
  | "christmastide"
  | "lent"
  | "eastertide"
  | "ordinary";

/**
 * EF retained fast-day vigils (B7). The Immaculate Conception and All
 * Saints vigils were omitted from the 1962 calendar itself, so they are
 * modeled as ABSENT — there is deliberately no member for them here, and
 * a day-fact must never carry a vigil with a `none` obligation.
 */
export type FastDayVigil = "christmas" | "assumption" | "pentecost";

/**
 * What the imported calendar tells the resolver about one day.
 * Everything liturgical is read from here, never re-derived. If a fasting
 * rule needs to know "is this a solemnity", it reads the fact.
 */
export interface DayFacts {
  /** ISO date (YYYY-MM-DD). Civil, for age math only. */
  date: string;
  /** Supplied by the calendar source alongside the date. */
  weekday: Weekday;
  season: Season;
  /** Display label from the calendar, e.g. "Solemnity of the Annunciation". */
  celebration?: string;
  /** The two fixed fast-and-abstinence days, when this day is one. */
  key?: "ash_wednesday" | "good_friday";
  /** OF calendar: this day is a solemnity (rank-lift threshold, A5). */
  isSolemnity?: boolean;
  /** EF calendar: feast of precept / Holy Day of Obligation (B9). */
  isFeastOfPrecept?: boolean;
  /** EF calendar: one of the four Ember sets' Wed/Fri/Sat (B6). */
  isEmberDay?: boolean;
  /** EF calendar: a retained fast-day vigil falls today (B7). */
  vigil?: FastDayVigil;
}

export interface UserProfile {
  discipline: Discipline;
  normProfile: NormProfileId;
  /** ISO date (YYYY-MM-DD). Used only for binding-age computation. */
  birthDate: string;
}

/**
 * Kinds of abstinence, across both corpora.
 * - `abstinence`            OF: no flesh meat (A1/A3).
 * - `penance_or_abstinence` OF Fridays outside Lent where the conference
 *                           permits substitution (A4, US norm).
 * - `complete`              EF: no flesh meat, no meat broth/soup (B1).
 * - `partial`               EF: meat at the one principal meal only (B1).
 */
export type Abstinence =
  | "none"
  | "abstinence"
  | "penance_or_abstinence"
  | "complete"
  | "partial";

/** A non-binding recommendation (e.g. the paschal fast, A2). */
export interface Recommendation {
  id: string;
  note: string;
  binding: false;
}

/** What the resolver returns for one day and one user. */
export interface Obligation {
  discipline: Discipline;
  /** The day's obligation as law states it (before age binding). */
  fast: boolean;
  abstinence: Abstinence;
  /** Whether each obligation binds THIS user, by age. */
  binds: { fast: boolean; abstinence: boolean };
  /** Set when a rank lift removed the day's penance (A5 / B9). */
  lifted: { by: "solemnity" | "sunday_or_precept" } | null;
  /** Set when an EF fast-day vigil fell on a Sunday and is dropped that
   *  year — not anticipated to Saturday (B9). */
  vigilDropped?: FastDayVigil;
  recommendations: Recommendation[];
  /** Corpus record ids this result was derived from (A1..B10). */
  ruleRefs: string[];
  /** Open items from the priest review that touch this result. */
  openFlags?: string[];
  /**
   * The user claimed the Church's own exemption today (Part 2 §2). The
   * law's statement stands; binding is removed. Private — never scored.
   */
  exempted?: boolean;
}
