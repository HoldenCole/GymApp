/**
 * The calendar import seam (content pack Part 5 §1) — written down as
 * the interface, exactly as the spec asks.
 *
 * WHAT THE CALENDAR PROVIDES (Introibo is the source of truth): verified
 * date, weekday, season, celebration + feast keys, rank flags per
 * discipline, Ember/vigil identification, transfer info. WHAT THE ENGINE
 * ADDS: the obligation mapping — nothing else. The engine computes no
 * dates, ranks, or transfers; a fasting rule that recomputes "is this a
 * solemnity" instead of reading the day-fact is the bug this seam
 * exists to prevent.
 *
 * Additive-only: a future Orthodox calendar is a new record source with
 * `calendar: "orthodox"`, loaded through this same seam — the resolver
 * is untouched.
 */

import type { DayFacts, Discipline, FastDayVigil, Season, Weekday } from "./types";

/** One imported day-record for one discipline's calendar. */
export interface CalendarRecord {
  /** ISO date (YYYY-MM-DD) — the OBSERVED date; transfers already applied. */
  date: string;
  /** Which calendar this record belongs to. */
  calendar: Discipline;
  weekday: Weekday;
  season: Season;
  /** The two fixed fast-and-abstinence days. */
  key?: "ash_wednesday" | "good_friday";
  /** Display label, e.g. "Solemnity of the Annunciation". */
  celebration?: string;
  /** OF rank-lift threshold fact (A5). */
  is_solemnity?: boolean;
  /** EF rank-lift threshold fact (B9). */
  is_feast_of_precept?: boolean;
  /** EF Ember day (B6). */
  is_ember_day?: boolean;
  /** EF retained fast-day vigils only (B7) — omitted vigils are ABSENT. */
  vigil?: FastDayVigil;
  /** Nominal date when this celebration was transferred here. */
  transferred_from?: string;
}

export interface CalendarMeta {
  source: string;
  /** "introibo" once the verified import lands; "provisional" until then. */
  provenance: "introibo" | "provisional";
  coverage: { from: string; to: string };
}

export interface CalendarData {
  meta: CalendarMeta;
  records: CalendarRecord[];
}

/** Day-facts lookup for the resolver. Undefined = date not covered. */
export interface CalendarSource {
  meta: CalendarMeta;
  dayFacts(date: string, discipline: Discipline): DayFacts | undefined;
}

const WEEKDAYS: Weekday[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];
const SEASONS: Season[] = ["advent", "christmastide", "lent", "eastertide", "ordinary"];
const VIGILS: FastDayVigil[] = ["christmas", "assumption", "pentecost"];

/**
 * Structural validation of an import. Returns human-readable errors;
 * empty means loadable. Checks are the executable half of the Part 5 §1
 * cross-checks: well-formed dates, weekday agreeing with the civil
 * calendar (catches export off-by-ones), discipline-appropriate flags,
 * vigils within the retained set, no duplicate (date, calendar) rows.
 */
export function validateCalendar(data: CalendarData): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const r of data.records) {
    const where = `${r.date}/${r.calendar}`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) {
      errors.push(`${where}: bad date`);
      continue;
    }
    const civil = WEEKDAYS[new Date(`${r.date}T00:00:00Z`).getUTCDay()];
    if (r.weekday !== civil) errors.push(`${where}: weekday ${r.weekday} ≠ civil ${civil}`);
    if (!SEASONS.includes(r.season)) errors.push(`${where}: unknown season ${r.season}`);
    if (r.vigil !== undefined && !VIGILS.includes(r.vigil)) {
      errors.push(`${where}: unknown vigil ${String(r.vigil)} — omitted vigils must be absent, never named`);
    }
    if (r.calendar === "of" && (r.is_feast_of_precept || r.is_ember_day || r.vigil)) {
      errors.push(`${where}: EF-only facts on an OF record`);
    }
    if (r.calendar === "ef" && r.is_solemnity) {
      errors.push(`${where}: OF solemnity flag on an EF record`);
    }
    if (seen.has(where)) errors.push(`${where}: duplicate record`);
    seen.add(where);
  }
  return errors;
}

/** Index an import for the resolver. Throws on invalid data. */
export function loadCalendar(data: CalendarData): CalendarSource {
  const errors = validateCalendar(data);
  if (errors.length > 0) {
    throw new Error(`calendar import invalid:\n  ${errors.slice(0, 10).join("\n  ")}`);
  }
  const byKey = new Map<string, CalendarRecord>();
  for (const r of data.records) byKey.set(`${r.date}/${r.calendar}`, r);

  return {
    meta: data.meta,
    dayFacts(date, discipline) {
      const r = byKey.get(`${date}/${discipline}`);
      if (!r) return undefined;
      const facts: DayFacts = {
        date: r.date,
        weekday: r.weekday,
        season: r.season,
      };
      if (r.celebration) facts.celebration = r.celebration;
      if (r.key) facts.key = r.key;
      if (r.is_solemnity) facts.isSolemnity = true;
      if (r.is_feast_of_precept) facts.isFeastOfPrecept = true;
      if (r.is_ember_day) facts.isEmberDay = true;
      if (r.vigil) facts.vigil = r.vigil;
      return facts;
    },
  };
}
