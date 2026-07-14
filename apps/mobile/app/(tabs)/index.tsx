import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, sacredSerif, sectionLabel } from "../../src/theme";

/**
 * Home — the glance (UI brief §3.1). Dense dashboard: liturgical header,
 * slim macro bars, fasting/training split, weight sparkline, meal picks,
 * offering line. Scaffold: layout skeleton with the section order locked;
 * data wiring follows the tracker build.
 */
export default function Home() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.liturgicalHeader}>
        Liturgical day — awaiting calendar import
      </Text>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Macros</Text>
      <Text style={styles.placeholder}>
        Slim single-baseline macro bars land here — kcal lead, protein gold,
        carbs teal, fat coral. No rings, no cards.
      </Text>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Fasting · Training</Text>
      <Text style={styles.placeholder}>
        Today's rule and the training-collision note, split row.
      </Text>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Weight · 30 days</Text>
      <Text style={styles.placeholder}>
        Thin trend line over faint daily dots, axes always drawn.
      </Text>
      <View style={styles.rule} />

      <Text style={[styles.offering, sacredSerif]}>
        Offer this for the work of your hands.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 64, paddingBottom: 32, gap: 12 },
  liturgicalHeader: { ...sacredSerif, fontSize: 16, color: colors.inkNavy },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16 },
  placeholder: { color: colors.graySecondary, fontSize: 13, lineHeight: 18 },
  offering: { fontStyle: "italic", color: colors.goldDeep, fontSize: 15 },
});
