import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { energyTargets } from "@kanon/fitness";
import { dayTotals, MEAL_LABELS, MEALS, mealEntries, sumMacros } from "@kanon/food";
import { useFitness } from "../../src/fitness";
import { todayISO, useFood } from "../../src/food";
import { colors, sectionLabel } from "../../src/theme";
import { TrendsView } from "../../src/trendsView";

/**
 * Macros — the ledger (UI brief §3.3). Two faces: Today (kcal lead,
 * macro bars, diary rows, pinned add-food bar) and Trends (axed thin
 * charts + adherence grid). Values come from the catalog placeholders
 * until the USDA re-pull.
 */
export default function Macros() {
  const router = useRouter();
  const { state: fitness } = useFitness();
  const { state: food, removeEntry } = useFood();
  const [view, setView] = useState<"today" | "trends">("today");
  const today = todayISO();

  const targets = fitness.body
    ? energyTargets(fitness.body, fitness.plan, today)
    : null;
  const totals = dayTotals(food.diary, today);

  const macroRows = [
    ["Protein", totals.proteinG, targets?.proteinG, colors.goldDeep],
    ["Carbs", totals.carbG, targets?.carbG, colors.teal],
    ["Fat", totals.fatG, targets?.fatG, colors.burntCoral],
  ] as const;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.segments}>
          {(["today", "trends"] as const).map((v) => (
            <Pressable key={v} onPress={() => setView(v)} accessibilityRole="tab">
              <Text style={[styles.segment, view === v && styles.segmentActive]}>
                {v === "today" ? "Today" : "Trends"}
              </Text>
            </Pressable>
          ))}
        </View>

        {view === "trends" ? (
          <TrendsView />
        ) : (
          <TodayView />
        )}
      </ScrollView>

      {view === "today" ? (
        <Pressable
          style={styles.addBar}
          onPress={() => router.push("/(tabs)/food")}
          accessibilityRole="button"
        >
          <Text style={styles.addBarText}>Add food</Text>
        </Pressable>
      ) : null}
    </View>
  );

  function TodayView() {
    return (
      <>
        <Text style={styles.kcal}>
          {totals.kcal}{" "}
          <Text style={styles.kcalGoal}>
            / {targets ? `${targets.kcal} kcal` : "set your plan"}
          </Text>
        </Text>
        <Text style={styles.planLine}>
          {targets
            ? targets.dailyDeltaKcal === 0
              ? "Maintenance"
              : `${targets.dailyDeltaKcal > 0 ? "+" : ""}${targets.dailyDeltaKcal} kcal/day`
            : ""}
          {targets ? " · " : ""}
          <Link href="/plan" style={styles.link}>
            Plan
          </Link>
        </Text>
        <View style={styles.rule} />

        {macroRows.map(([label, eaten, goal, color]) => {
          const pct = goal ? Math.min(100, (eaten / goal) * 100) : 0;
          return (
            <View key={label} style={styles.macroRow}>
              <View style={styles.macroBaseline}>
                <Text style={styles.macroLabel}>{label}</Text>
                <Text style={styles.macroValue}>
                  {eaten} <Text style={styles.kcalGoal}>/ {goal ?? "—"} g</Text>
                </Text>
              </View>
              <View style={[styles.macroTrack, { backgroundColor: `${color}22` }]}>
                <View
                  style={[styles.macroFill, { backgroundColor: color, width: `${pct}%` }]}
                />
              </View>
            </View>
          );
        })}
        <View style={styles.rule} />

        {MEALS.map((meal) => {
          const entries = mealEntries(food.diary, today, meal);
          const mealKcal = sumMacros(entries).kcal;
          return (
            <View key={meal}>
              <View style={styles.mealHead}>
                <Text style={sectionLabel}>{MEAL_LABELS[meal]}</Text>
                <Text style={styles.mealKcal}>{mealKcal ? `${mealKcal} kcal` : ""}</Text>
              </View>
              {entries.length === 0 ? (
                <Text style={styles.placeholder}>Nothing logged.</Text>
              ) : (
                entries.map((e) => (
                  <View key={e.id} style={styles.entryRow}>
                    <Text style={styles.entryName} numberOfLines={1}>
                      {e.name}
                      {e.servings !== 1 ? ` × ${e.servings}` : ""}
                    </Text>
                    <View style={styles.entryRight}>
                      <Text style={styles.entryMacros}>
                        {e.kcal} · {e.proteinG}P
                      </Text>
                      <Pressable onPress={() => removeEntry(e.id)} accessibilityRole="button">
                        <Text style={styles.remove}>×</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
              <View style={styles.rule} />
            </View>
          );
        })}
      </>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 64, paddingBottom: 96, gap: 12 },
  kcal: { fontSize: 28, fontWeight: "600", color: colors.inkNavy, letterSpacing: -0.5 },
  kcalGoal: { fontSize: 14, fontWeight: "300", color: colors.grayInactive },
  planLine: { fontSize: 13, color: colors.graySecondary },
  link: { color: colors.oxblood },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16 },
  macroRow: { gap: 6 },
  macroBaseline: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  macroLabel: { fontSize: 13, color: colors.graySecondary },
  macroValue: { fontSize: 15, fontWeight: "600", color: colors.inkNavy },
  macroTrack: { height: 3, borderRadius: 1.5, overflow: "hidden" },
  macroFill: { height: 3 },
  mealHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  mealKcal: { fontSize: 12, color: colors.grayLabel },
  placeholder: { color: colors.grayInactive, fontSize: 13, marginVertical: 6 },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    gap: 12,
  },
  entryName: { fontSize: 14, color: colors.inkNavy, flexShrink: 1 },
  entryRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  entryMacros: { fontSize: 13, color: colors.graySecondary },
  remove: { fontSize: 16, color: colors.grayInactive, paddingHorizontal: 4 },
  addBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.inkNavyDeep,
    paddingVertical: 16,
    alignItems: "center",
  },
  addBarText: { color: colors.paperWhite, fontSize: 14, letterSpacing: 0.5 },
  segments: { flexDirection: "row", gap: 18 },
  segment: {
    fontSize: 13,
    color: colors.grayInactive,
    paddingBottom: 3,
  },
  segmentActive: {
    color: colors.inkNavy,
    fontWeight: "600",
    borderBottomWidth: 2,
    borderBottomColor: colors.inkNavy,
  },
});
