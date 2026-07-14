import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, sectionLabel } from "../../src/theme";

/**
 * Macros — the ledger (UI brief §3.3). Today view: kcal lead, four macro
 * bars, meal sections, pinned add-food bar. Trends view: axed thin charts
 * and the adherence grid. Scaffold: ledger skeleton; the tracker (Mifflin-
 * St Jeor baseline, USDA FoodData Central values) wires in next.
 */
export default function Macros() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kcal}>
          — <Text style={styles.kcalGoal}>/ goal kcal</Text>
        </Text>
        <View style={styles.rule} />

        {(
          [
            ["Protein", colors.goldDeep],
            ["Carbs", colors.teal],
            ["Fat", colors.burntCoral],
            ["Fiber", colors.graySecondary],
          ] as const
        ).map(([label, color]) => (
          <View key={label} style={styles.macroRow}>
            <View style={styles.macroBaseline}>
              <Text style={styles.macroLabel}>{label}</Text>
              <Text style={styles.macroValue}>
                — <Text style={styles.kcalGoal}>/ goal g</Text>
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
