/**
 * Trends — the Macros tab's second face (UI brief §3.3): axed thin
 * charts and the adherence grid. Chart law lives in charts.tsx; this
 * file only shapes data.
 *
 * The fast-day adherence grid (green/coral across the liturgical year)
 * needs the calendar import and the fasting layer's day records — it
 * renders as an honest pending block until then.
 */

import { useMemo, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { energyTargets, kgToLb, trendSeries } from "@kanon/fitness";
import { dailySeries } from "@kanon/food";
import { AxedLineChart, ChartDot, ChartSeries } from "./charts";
import { useFitness } from "./fitness";
import { todayISO, useFood } from "./food";
import { colors, sectionLabel } from "./theme";

const RANGES = [30, 90] as const;

export function TrendsView() {
  const { state: fitness } = useFitness();
  const { state: food } = useFood();
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const today = todayISO();
  const width = Dimensions.get("window").width - 32;

  const targets = fitness.body
    ? energyTargets(fitness.body, fitness.plan, today)
    : null;

  const points = useMemo(
    () => dailySeries(food.diary, today, days),
    [food.diary, today, days],
  );

  const xLabels = useMemo(() => {
    const label = (iso: string) => {
      const d = new Date(`${iso}T00:00:00Z`);
      return `${d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} ${d.getUTCDate()}`;
    };
    const mid = Math.floor((days - 1) / 2);
    return {
      0: label(points[0]?.date ?? today),
      [mid]: label(points[mid]?.date ?? today),
      [days - 1]: "today",
    } as Record<number, string>;
  }, [points, days, today]);

  const kcalSeries: ChartSeries[] = [
    {
      label: "kcal",
      color: colors.inkNavy,
      values: points.map((p) => p.totals?.kcal ?? null),
      goal: targets?.kcal,
    },
  ];

  const macroSeries: ChartSeries[] = [
    {
      label: "Protein",
      color: colors.goldDeep,
      values: points.map((p) => p.totals?.proteinG ?? null),
      goal: targets?.proteinG,
    },
    {
      label: "Carbs",
      color: colors.teal,
      values: points.map((p) => p.totals?.carbG ?? null),
      goal: targets?.carbG,
    },
    {
      label: "Fat",
      color: colors.burntCoral,
      values: points.map((p) => p.totals?.fatG ?? null),
      goal: targets?.fatG,
    },
  ];

  // Weight: align the trend to the same day grid; dots are raw weigh-ins.
  const metric = fitness.units === "metric";
  const display = (kg: number) => (metric ? kg : kgToLb(kg));
  const { weightValues, weightDots } = useMemo(() => {
    const trend = trendSeries(fitness.weightLog);
    const trendByDate = new Map(trend.map((t) => [t.date, t]));
    const values: (number | null)[] = [];
    const dots: ChartDot[] = [];
    points.forEach((p, i) => {
      const t = trendByDate.get(p.date);
      values.push(t ? display(t.trendKg) : null);
      if (t) {
        dots.push({ index: i, value: display(t.weightKg), filled: p.date === today });
      }
    });
    return { weightValues: values, weightDots: dots };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitness.weightLog, points, metric]);

  return (
    <View style={styles.wrap}>
      <View style={styles.ranges}>
        {RANGES.map((r) => (
          <Pressable key={r} onPress={() => setDays(r)} accessibilityRole="radio">
            <Text style={[styles.range, days === r && styles.rangeActive]}>{r} days</Text>
          </Pressable>
        ))}
      </View>

      <Text style={sectionLabel}>Calories</Text>
      <AxedLineChart
        series={kcalSeries}
        xLabels={xLabels}
        pointCount={days}
        width={width}
      />
      <View style={styles.rule} />

      <Text style={sectionLabel}>Macros · g</Text>
      <AxedLineChart
        series={macroSeries}
        xLabels={xLabels}
        pointCount={days}
        width={width}
      />
      <View style={styles.rule} />

      <Text style={sectionLabel}>Weight · {metric ? "kg" : "lb"}</Text>
      <AxedLineChart
        series={[{ label: "trend", color: colors.teal, values: weightValues }]}
        dots={weightDots}
        xLabels={xLabels}
        pointCount={days}
        width={width}
        zoomY
        yFormat={(v) => String(Math.round(v * 10) / 10)}
      />
      <View style={styles.rule} />

      <Text style={sectionLabel}>Fast days · liturgical year</Text>
      <Text style={styles.pending}>
        The adherence grid arrives with the liturgical calendar import —
        it needs the real fast days to chart against.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  ranges: { flexDirection: "row", gap: 12 },
  range: {
    fontSize: 12,
    color: colors.graySecondary,
    borderWidth: 1,
    borderColor: colors.hairlineMajor,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: "hidden",
  },
  rangeActive: { color: colors.inkNavy, borderColor: colors.inkNavy, fontWeight: "600" },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16 },
  pending: { color: colors.grayInactive, fontSize: 13, lineHeight: 18 },
});
