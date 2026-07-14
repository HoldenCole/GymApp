import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { energyTargets } from "@kanon/fitness";
import { useFitness } from "../../src/fitness";
import { colors, sectionLabel } from "../../src/theme";

/**
 * Macros — the ledger (UI brief §3.3). Targets are live from the plan
 * (Mifflin-St Jeor baseline, every value user-overridable); consumed
 * amounts fill in when the diary + USDA FoodData Central lookup build out.
 */
export default function Macros() {
  const { state } = useFitness();
  const today = new Date().toISOString().slice(0, 10);
  const targets = state.body ? energyTargets(state.body, state.plan, today) : null;

  const macroRows = targets
    ? ([
        ["Protein", targets.proteinG, colors.goldDeep],
        ["Carbs", targets.carbG, colors.teal],
        ["Fat", targets.fatG, colors.burntCoral],
      ] as const)
    : ([
        ["Protein", null, colors.goldDeep],
        ["Carbs", null, colors.teal],
        ["Fat", null, colors.burntCoral],
      ] as const);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kcal}>
          0 <Text style={styles.kcalGoal}>/ {targets ? `${targets.kcal} kcal` : "set your plan"}</Text>
        </Text>
        {!targets ? (
          <Text style={styles.placeholder}>
            <Link href="/plan" style={styles.link}>
              Set up your plan
            </Link>{" "}
            — goal, rate, and targets. Every computed value is overridable.
          </Text>
        ) : (
          <Text style={styles.placeholder}>
            {targets.dailyDeltaKcal === 0
              ? "Maintenance"
              : `${targets.dailyDeltaKcal > 0 ? "+" : ""}${targets.dailyDeltaKcal} kcal/day`}{" "}
            · <Link href="/plan" style={styles.link}>Plan</Link>
          </Text>
        )}
        <View style={styles.rule} />

        {macroRows.map(([label, goal, color]) => (
          <View key={label} style={styles.macroRow}>
            <View style={styles.macroBaseline}>
              <Text style={styles.macroLabel}>{label}</Text>
              <Text style={styles.macroValue}>
                0 <Text style={styles.kcalGoal}>/ {goal ?? "—"} g</Text>
              </Text>
            </View>
            <View style={[styles.macroTrack, { backgroundColor: `${color}22` }]}>
              <View style={[styles.macroFill, { backgroundColor: color, width: "0%" }]} />
            </View>
          </View>
        ))}
        <View style={styles.rule} />

        {["Breakfast", "Lunch", "Dinner"].map((meal) => (
          <View key={meal}>
            <Text style={sectionLabel}>{meal}</Text>
            <Text style={styles.placeholder}>Diary rows land here.</Text>
            <View style={styles.rule} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.addBar}>
        <Text style={styles.addBarText}>Add food</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 64, paddingBottom: 96, gap: 12 },
  kcal: { fontSize: 28, fontWeight: "600", color: colors.inkNavy, letterSpacing: -0.5 },
  kcalGoal: { fontSize: 14, fontWeight: "300", color: colors.grayInactive },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16 },
  macroRow: { gap: 6 },
  macroBaseline: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  macroLabel: { fontSize: 13, color: colors.graySecondary },
  macroValue: { fontSize: 15, fontWeight: "600", color: colors.inkNavy },
  macroTrack: { height: 3, borderRadius: 1.5, overflow: "hidden" },
  macroFill: { height: 3 },
  placeholder: { color: colors.grayInactive, fontSize: 13, marginBottom: 8 },
  link: { color: colors.oxblood },
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
});
