/**
 * Trend series over the diary: per-day totals for the last N days,
 * aligned to a fixed day grid so charts get honest gaps (a day with no
 * entries is a null point, never a fabricated zero — an unlogged day is
 * unknown, not fasted; the distinction is a wellbeing rule as much as a
 * data rule).
 */

import { DiaryEntry, MacroSet, sumMacros } from "./model";

export interface DayPoint {
  date: string;
  /** Null when nothing was logged that day. */
  totals: MacroSet | null;
}

const MS_PER_DAY = 86_400_000;

function addDays(iso: string, days: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

/** One point per calendar day, ending at `endDate`, spanning `days`. */
export function dailySeries(
  entries: readonly DiaryEntry[],
  endDate: string,
  days: number,
): DayPoint[] {
  const byDate = new Map<string, DiaryEntry[]>();
  for (const e of entries) {
    const list = byDate.get(e.date);
    if (list) list.push(e);
    else byDate.set(e.date, [e]);
  }
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(endDate, -i);
    const dayEntries = byDate.get(date);
    out.push({ date, totals: dayEntries ? sumMacros(dayEntries) : null });
  }
  return out;
}
