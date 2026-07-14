/**
 * The app's day-facts source, reading through the calendar import seam.
 *
 * Currently loads the PROVISIONAL 2026 fixture — a labeled stand-in,
 * not Introibo. The verified Introibo export replaces the JSON file and
 * nothing else changes. Dates outside coverage fall back to civil facts
 * (date + weekday only), which the UI must present as "calendar
 * pending", never as a liturgical claim.
 */

import calendarJson from "@kanon/data/packaged/calendar-2026-provisional.json";
import {
  CalendarData,
  DayFacts,
  Discipline,
  loadCalendar,
  Weekday,
} from "@kanon/engine";

const calendar = loadCalendar(calendarJson as CalendarData);

const WEEKDAYS: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export type DayFactsProvenance = "introibo" | "provisional" | "civil_fallback";

export interface TodaysFacts {
  facts: DayFacts;
  provenance: DayFactsProvenance;
}

export function todaysDayFacts(discipline: Discipline, now: Date = new Date()): TodaysFacts {
  const iso = now.toISOString().slice(0, 10);
  const imported = calendar.dayFacts(iso, discipline);
  if (imported) {
    return { facts: imported, provenance: calendar.meta.provenance };
  }
  return {
    facts: {
      date: iso,
      weekday: WEEKDAYS[now.getDay()] as Weekday,
      // Liturgical facts unknown — "ordinary" is a stand-in the UI must
      // label as pending, never present as truth.
      season: "ordinary",
    },
    provenance: "civil_fallback",
  };
}

/** Human header for the day: celebration if named, else season + weekday. */
export function dayHeader(facts: DayFacts): string {
  if (facts.celebration) return facts.celebration;
  const wd = facts.weekday.charAt(0).toUpperCase() + facts.weekday.slice(1);
  const seasonLabel: Record<string, string> = {
    advent: "Advent",
    christmastide: "Christmastide",
    lent: "Lent",
    eastertide: "Eastertide",
    ordinary: "Ordinary Time",
  };
  return `${wd} in ${seasonLabel[facts.season] ?? facts.season}`;
}

export const PROVENANCE_NOTE: Record<DayFactsProvenance, string | null> = {
  introibo: null,
  provisional: "Provisional calendar — Introibo verification pending.",
  civil_fallback: "Liturgical calendar not available for this date.",
};
