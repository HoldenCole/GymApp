import { Link } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  formatWeight,
  GOAL_LABELS,
  kgToLb,
  lbToKg,
  sessionFor,
  trendSeries,
  weeklyRate,
  weightUnitLabel,
} from "@kanon/fitness";
import type { Weekday } from "@kanon/engine";
import { useFitness } from "../../src/fitness";
import { colors, sacredSerif, sectionLabel } from "../../src/theme";

/**
 * Home — the glance (UI brief §3.1). Scaffold state: liturgical header
 * pending the calendar import; training and weight sections are live from
 * the fitness store. Macro bars fill in from the diary build.
 */

const WEEKDAY_NAMES: Weekday[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

export default function Home() {
  const { state, logWeight } = useFitness();
  const [draft, setDraft] = useState("");

  const todayWeekday = WEEKDAY_NAMES[new Date().getDay()] as Weekday;
  const session = sessionFor(state.split, todayWeekday);
  const trend = trendSeries(state.weightLog);
  const latestTrend = trend[trend.length - 1];
  const rate = weeklyRate(state.weightLog);

  const commitWeight = () => {
    const n = Number(draft);
    if (!Number.isFinite(n) || n <= 0) return;
    logWeight({
      date: new Date().toISOString().slice(0, 10),
      weightKg: state.units === "metric" ? n : lbToKg(n),
    });
    setDraft("");
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.liturgicalHeader}>
          Liturgical day — awaiting calendar import
        </Text>
        <Link href="/settings" style={styles.settingsLink}>
          Settings
        </Link>
      </View>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Macros</Text>
      <Text style={styles.placeholder}>
        Slim single-baseline macro bars land here once the diary builds out —
        targets are set in <Link href="/plan" style={styles.link}>Plan</Link>.
      </Text>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Training</Text>
      <View style={styles.baselineRow}>
        <Text style={styles.body}>
          Today: {session ? session.name : "Rest"} · {GOAL_LABELS[state.plan.goal]}
        </Text>
        <Link href="/split" style={styles.link}>
          Split
        </Link>
      </View>
      <Text style={styles.placeholder}>
        Fast-day collision notes arrive with the calendar import.
      </Text>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Weight · trend</Text>
      {latestTrend ? (
        <View style={styles.baselineRow}>
          <Text style={styles.weightValue}>
            {formatWeight(latestTrend.trendKg, state.units)}
          </Text>
          <Text style={styles.body}>
            {rate
              ? `${rate.kgPerWeek >= 0 ? "+" : ""}${
                  state.units === "metric"
                    ? `${rate.kgPerWeek} kg`
                    : `${Math.round(kgToLb(rate.kgPerWeek) * 100) / 100} lb`
                }/week`
              : "trend forming"}
          </Text>
        </View>
      ) : (
        <Text style={styles.placeholder}>Log a weight to start the trend.</Text>
      )}
      <View style={styles.baselineRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={`Today's weight (${weightUnitLabel(state.units)})`}
          placeholderTextColor={colors.grayInactive}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <Pressable onPress={commitWeight} accessibilityRole="button">
          <Text style={styles.link}>Log</Text>
        </Pressable>
      </View>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 12 },
  liturgicalHeader: { ...sacredSerif, fontSize: 16, color: colors.inkNavy, flexShrink: 1 },
  settingsLink: { color: colors.oxblood, fontSize: 13 },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16 },
  placeholder: { color: colors.graySecondary, fontSize: 13, lineHeight: 18 },
  body: { color: colors.inkNavy, fontSize: 14 },
  baselineRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 12 },
  weightValue: { fontSize: 22, fontWeight: "600", color: colors.inkNavy, letterSpacing: -0.4 },
  link: { color: colors.oxblood, fontSize: 13 },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMajor,
    paddingVertical: 5,
    fontSize: 15,
    color: colors.inkNavy,
  },
  offering: { fontStyle: "italic", color: colors.goldDeep, fontSize: 15 },
});
