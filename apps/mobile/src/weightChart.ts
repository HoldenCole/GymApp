/**
 * Shared weight-chart shaping: align the smoothed trend to a fixed day
 * grid ending today; raw weigh-ins become dots (today's filled). Used by
 * the Trends chart and Home's sparkline so the two always agree.
 */

import { kgToLb, trendSeries, WeightEntry } from "@kanon/fitness";
import type { ChartDot } from "./charts";

const MS_PER_DAY = 86_400_000;

export interface WeightChartData {
  values: (number | null)[];
  dots: ChartDot[];
  xLabels: Record<number, string>;
}

export function weightChartData(
  weightLog: readonly WeightEntry[],
  endDate: string,
  days: number,
  metric: boolean,
): WeightChartData {
  const display = (kg: number) => (metric ? kg : kgToLb(kg));
  const trend = trendSeries([...weightLog]);
  const trendByDate = new Map(trend.map((t) => [t.date, t]));

  const values: (number | null)[] = [];
  const dots: ChartDot[] = [];
  const end = Date.parse(`${endDate}T00:00:00Z`);
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(end - i * MS_PER_DAY).toISOString().slice(0, 10);
    const t = trendByDate.get(date);
    values.push(t ? display(t.trendKg) : null);
    if (t) {
      dots.push({
        index: days - 1 - i,
        value: display(t.weightKg),
        filled: date === endDate,
      });
    }
  }

  const label = (offset: number) => {
    const d = new Date(end - offset * MS_PER_DAY);
    return `${d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} ${d.getUTCDate()}`;
  };
  const mid = Math.floor((days - 1) / 2);
  const xLabels: Record<number, string> = {
    0: label(days - 1),
    [mid]: label(days - 1 - mid),
    [days - 1]: "today",
  };

  return { values, dots, xLabels };
}
