/**
 * PLACEHOLDER day-facts source.
 *
 * The real source is Introibo's verified liturgical calendar (7,671
 * entries), consumed through the calendar-import seam — the resolver
 * never re-derives the calendar. Until that import lands, this module
 * supplies civil-only facts (date + weekday + a crude season guess is
 * deliberately NOT attempted: no liturgical fact is fabricated here).
 *
 * Everything liturgical is left unset, which the UI must treat as
 * "calendar not yet available", never as "no obligation".
 */

import type { DayFacts, Weekday } from "@kanon/engine";

const WEEKDAYS: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export interface PlaceholderDayFacts extends DayFacts {
  /** True until the Introibo import provides real liturgical facts. */
  liturgicalFactsPending: true;
}

export function civilDayFactsToday(now: Date = new Date()): PlaceholderDayFacts {
  const iso = now.toISOString().slice(0, 10);
  return {
    date: iso,
    weekday: WEEKDAYS[now.getDay()] as Weekday,
    // Season is a liturgical fact; "ordinary" here is a stand-in the UI
    // must label as pending, not present as truth.
    season: "ordinary",
    liturgicalFactsPending: true,
  };
}
