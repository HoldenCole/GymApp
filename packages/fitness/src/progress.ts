/**
 * Progress tracking math: weight log → smoothed trend → weekly rate.
 *
 * The trend is an exponentially-weighted moving average with a time-aware
 * decay (irregular logging must not distort it). The UI brief's weight
 * chart (thin trend line over faint daily dots) draws exactly this.
 *
 * Deliberately returns numbers, not verdicts: whether a rate is "good"
 * is the plan's context and gentle UI copy — never a red failure state.
 */

export interface WeightEntry {
  /** ISO date. One entry per date; later writes replace. */
  date: string;
  weightKg: number;
}

export interface TrendPoint {
  date: string;
  weightKg: number;
  trendKg: number;
}

const MS_PER_DAY = 86_400_000;

function daysBetween(a: string, b: string): number {
  return (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / MS_PER_DAY;
}

/** Entries sorted by date, deduplicated (last write per date wins). */
export function normalizeLog(entries: WeightEntry[]): WeightEntry[] {
  const byDate = new Map<string, number>();
  for (const e of entries) byDate.set(e.date, e.weightKg);
  return [...byDate.entries()]
    .map(([date, weightKg]) => ({ date, weightKg }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

/**
 * Time-aware EWMA: per observation, the previous trend decays by
 * 0.5^(gapDays/halfLifeDays) toward the new reading.
 */
export function trendSeries(
  entries: WeightEntry[],
  halfLifeDays = 7,
): TrendPoint[] {
  const log = normalizeLog(entries);
  const out: TrendPoint[] = [];
  let trend: number | null = null;
  let prevDate: string | null = null;
  for (const e of log) {
    if (trend === null || prevDate === null) {
      trend = e.weightKg;
    } else {
      const gap = Math.max(daysBetween(prevDate, e.date), 0.001);
      const keep = Math.pow(0.5, gap / halfLifeDays);
      trend = keep * trend + (1 - keep) * e.weightKg;
    }
    prevDate = e.date;
    out.push({ date: e.date, weightKg: e.weightKg, trendKg: round2(trend) });
  }
  return out;
}

export interface WeeklyRate {
  kgPerWeek: number;
  pctPerWeek: number;
  windowDays: number;
}

/**
 * Trend-based weekly rate over the most recent window. Null until there
 * are two trend points at least three days apart — no verdicts from noise.
 */
export function weeklyRate(
  entries: WeightEntry[],
  windowDays = 21,
): WeeklyRate | null {
  const series = trendSeries(entries);
  const last = series[series.length - 1];
  if (!last) return null;
  const windowStart = series.filter(
    (p) => daysBetween(p.date, last.date) <= windowDays,
  );
  const first = windowStart[0];
  if (!first) return null;
  const span = daysBetween(first.date, last.date);
  if (span < 3) return null;
  const kgPerWeek = ((last.trendKg - first.trendKg) / span) * 7;
  return {
    kgPerWeek: round2(kgPerWeek),
    pctPerWeek: round2((kgPerWeek / last.trendKg) * 100),
    windowDays,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
