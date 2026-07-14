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
  energyTargets,
  formatWeight,
  GOAL_LABELS,
  kgToLb,
  lbToKg,
  sessionFor,
  SessionType,
  trainingCollision,
  trendSeries,
  weeklyRate,
  weightUnitLabel,
} from "@kanon/fitness";
import { Dimensions } from "react-native";
import { TRAINING_COLLISION_NUDGE } from "@kanon/engine";
import { AxedLineChart } from "../../src/charts";
import { weightChartData } from "../../src/weightChart";
import { dayTotals, filterCatalog } from "@kanon/food";
import { activeAvoidSet, obligationAvoids, type Weekday } from "@kanon/engine";
import patrons from "@kanon/content/packaged/patrons.json";
import { CATALOG } from "../../src/catalog";
import { dayHeader, PROVENANCE_NOTE } from "../../src/dayFacts";
import { feastOn } from "../../src/feasts";
import { useTodaysObligation } from "../../src/obligation";
import { todayWeekday } from "../../src/dates";
import { useFasts } from "../../src/fasts";
import { useFitness } from "../../src/fitness";
import { todayISO, useFood } from "../../src/food";
import { useProfile } from "../../src/profile";
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
  const sparkline = weightChartData(
    state.weightLog,
    todayISO(),
    30,
    state.units === "metric",
  );

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
      <LiturgicalHeader />
      <View style={styles.rule} />

      <Text style={sectionLabel}>Macros</Text>
      <MacroGlance />
      <View style={styles.rule} />

      <Text style={sectionLabel}>Fasting · Training</Text>
      <FastingTrainingSplit session={session} />
      <View style={styles.rule} />

      <Text style={sectionLabel}>Today's picks</Text>
      <MealPicks />
      <View style={styles.rule} />

      <Text style={sectionLabel}>Weight · 30 days</Text>
      {trend.length >= 2 ? (
        <AxedLineChart
          series={[{ label: "trend", color: colors.teal, values: sparkline.values }]}
          dots={sparkline.dots}
          xLabels={sparkline.xLabels}
          pointCount={30}
          width={Dimensions.get("window").width - 32}
          height={90}
          zoomY
          yFormat={(v) => String(Math.round(v))}
        />
      ) : null}
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

      <OfferingLine />
    </ScrollView>
  );
}

function OfferingLine() {
  const { profile } = useProfile();
  const patron = patrons.saints[profile.patronId ?? "benedict"];
  const feast = feastOn(todayISO());
  return (
    <View style={{ gap: 4 }}>
      {feast?.softens ? (
        <Text style={[styles.softening, sacredSerif]}>
          {feast.label} — the emphasis softens today.
        </Text>
      ) : null}
      <Text style={[styles.offering, sacredSerif]}>{patron.offering_line}</Text>
      {profile.intention ? (
        <Text style={[styles.intentionLine, sacredSerif]}>{profile.intention}</Text>
      ) : null}
    </View>
  );
}

function LiturgicalHeader() {
  const { facts, provenance } = useTodaysObligation();
  const note = PROVENANCE_NOTE[provenance];
  return (
    <View style={{ gap: 2 }}>
      <View style={styles.header}>
        <Text style={styles.liturgicalHeader}>{dayHeader(facts)}</Text>
        <Link href="/settings" style={styles.settingsLink}>
          Settings
        </Link>
      </View>
      {note ? <Text style={styles.provenance}>{note}</Text> : null}
    </View>
  );
}

function FastingTrainingSplit({ session }: { session: SessionType | null }) {
  const { state } = useFitness();
  const { law, obligation, facts, provenance, exemptedToday } = useTodaysObligation();
  const bound = law.fast || law.abstinence !== "none";
  const softened = feastOn(facts.date)?.softens ?? false;
  const collision =
    trainingCollision(obligation.fast && obligation.binds.fast, session) && !softened;

  return (
    <View style={{ gap: 4 }}>
      <Text style={bound && !exemptedToday ? styles.obligationLine : styles.body}>
        {exemptedToday
          ? "You're excused today — the Church's own provision."
          : bound
            ? `The Church asks: ${[
                law.fast ? "fast" : "",
                law.abstinence !== "none" ? "abstinence" : "",
              ]
                .filter(Boolean)
                .join(" and ")} today.`
            : "No fast or abstinence binds today."}
        {provenance === "civil_fallback" ? " (weekday rules only — calendar pending)" : ""}
      </Text>
      <View style={styles.baselineRow}>
        <Text style={styles.body}>
          {session ? session.name : "Rest"} · {GOAL_LABELS[state.plan.goal]}
        </Text>
        <Link href="/split" style={styles.link}>
          Split
        </Link>
      </View>
      {collision ? <Text style={styles.placeholder}>{TRAINING_COLLISION_NUDGE}</Text> : null}
    </View>
  );
}

/**
 * Tappable meal picks — day-aware: filtered by allergies, dislikes, and
 * the day's commitments; the church obligation joins automatically once
 * real day-facts arrive. Easy efforts, protein-forward, rotated by date.
 */
function MealPicks() {
  const { state: food } = useFood();
  const { state: fasts } = useFasts();
  const { obligation } = useTodaysObligation();
  const personalToday = activeAvoidSet(fasts.fasts, todayISO(), todayWeekday());
  const churchToday = obligationAvoids(obligation);

  const candidates = filterCatalog(CATALOG, {
    allergies: food.allergies,
    avoidCategories: [...new Set([...personalToday.categories, ...churchToday])],
    dislikedCategories: food.dislikedCategories,
    effortMax: 2,
    type: "recipe",
  }).sort((a, b) => b.macros.proteinG - a.macros.proteinG);

  const offset = new Date().getDate() % Math.max(1, candidates.length - 3);
  const picks = candidates.slice(offset, offset + 3);

  if (picks.length === 0) {
    return <Text style={styles.placeholder}>No picks match today's filters.</Text>;
  }
  return (
    <View style={{ gap: 8 }}>
      {picks.map((p) => (
        <Link key={p.id} href={`/recipe/${p.id}`} style={styles.pick}>
          <Text style={styles.body}>{p.title} </Text>
          <Text style={styles.pickMacros}>
            {p.macros.kcal} kcal · {p.macros.proteinG}g P
          </Text>
        </Link>
      ))}
    </View>
  );
}

function MacroGlance() {
  const { state } = useFitness();
  const { state: food } = useFood();
  const today = todayISO();
  const totals = dayTotals(food.diary, today);
  const targets = state.body ? energyTargets(state.body, state.plan, today) : null;

  if (!targets) {
    return (
      <Text style={styles.placeholder}>
        Targets appear once your <Link href="/plan" style={styles.link}>plan</Link> is set.
      </Text>
    );
  }
  const rows = [
    ["kcal", totals.kcal, targets.kcal, colors.inkNavy],
    ["Protein", totals.proteinG, targets.proteinG, colors.goldDeep],
    ["Carbs", totals.carbG, targets.carbG, colors.teal],
    ["Fat", totals.fatG, targets.fatG, colors.burntCoral],
  ] as const;
  return (
    <View style={{ gap: 7 }}>
      {rows.map(([label, eaten, goal, color]) => (
        <View key={label} style={{ gap: 3 }}>
          <View style={styles.baselineRow}>
            <Text style={styles.glanceLabel}>{label}</Text>
            <Text style={styles.glanceValue}>
              {eaten} <Text style={styles.glanceGoal}>/ {goal}</Text>
            </Text>
          </View>
          <View style={[styles.glanceTrack, { backgroundColor: `${color}22` }]}>
            <View
              style={[
                styles.glanceFill,
                {
                  backgroundColor: color,
                  width: `${Math.min(100, goal ? (eaten / goal) * 100 : 0)}%`,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 64, paddingBottom: 32, gap: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 12 },
  liturgicalHeader: { ...sacredSerif, fontSize: 16, color: colors.inkNavy, flexShrink: 1 },
  settingsLink: { color: colors.oxblood, fontSize: 13 },
  provenance: { fontSize: 10, color: colors.grayInactive },
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
  glanceLabel: { fontSize: 13, color: colors.graySecondary },
  glanceValue: { fontSize: 14, fontWeight: "600", color: colors.inkNavy },
  glanceGoal: { fontSize: 12, fontWeight: "300", color: colors.grayInactive },
  glanceTrack: { height: 2.5, borderRadius: 1.25, overflow: "hidden" },
  glanceFill: { height: 2.5 },
  obligationLine: { color: colors.oxblood, fontSize: 14, fontWeight: "600" },
  pick: { paddingVertical: 2 },
  pickMacros: { fontSize: 12, color: colors.grayLabel },
  softening: { fontSize: 13, fontStyle: "italic", color: colors.graySecondary },
  intentionLine: { fontSize: 13, fontStyle: "italic", color: colors.graySecondary },
});
