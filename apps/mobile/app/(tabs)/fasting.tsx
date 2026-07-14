import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { DISCIPLINES, resolveObligation } from "@kanon/engine";
import { civilDayFactsToday } from "../../src/dayFacts";
import { useProfile } from "../../src/profile";
import { colors, sacredSerif, sectionLabel } from "../../src/theme";

/**
 * Fasting — the crown jewel (UI brief §3.2). Today-first: dark obligation
 * hero, what today allows, one-tap exemptions, training-collision warning,
 * personal commitments, week strip.
 *
 * Scaffold wiring: the resolver runs against PLACEHOLDER civil day-facts.
 * Until the Introibo import lands the hero states that plainly — it never
 * presents a fabricated liturgical day as truth.
 */

export default function Fasting() {
  const { profile } = useProfile();
  const day = civilDayFactsToday();
  const obligation = resolveObligation(day, profile);
  const pending = day.liturgicalFactsPending;
  const discipline = DISCIPLINES[profile.discipline];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>TODAY</Text>
        {pending ? (
          <Text style={[styles.heroLine, sacredSerif]}>
            Liturgical calendar not yet connected.{"\n"}
            Weekday rules only, shown provisionally.
          </Text>
        ) : null}
        <Text style={[styles.heroLine, sacredSerif]}>
          {obligation.abstinence !== "none" || obligation.fast
            ? describe(obligation.fast, obligation.abstinence)
            : "No fast or abstinence binds today."}
        </Text>
      </View>

      <Text style={sectionLabel}>What today allows</Text>
      <Text style={styles.body}>
        Rendered from the obligation record ({obligation.ruleRefs.join(", ") || "—"}).
      </Text>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Your discipline</Text>
      <Text style={styles.body}>
        {discipline.label} — {discipline.sublabel}.{" "}
        <Link href="/settings" style={styles.link}>
          Change
        </Link>
      </Text>
      <View style={styles.rule} />

      <Text style={styles.exemptions}>Exemptions</Text>
      <Text style={styles.body}>
        One tap from the obligation, no justification asked, never scored.
        The Church's own provision, not a shortcut.
      </Text>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Personal commitments</Text>
      <Text style={styles.body}>
        Chosen commitments render in their own treatment — never the visual
        language of an obligation. Setting one aside is nothing to confess.
      </Text>
    </ScrollView>
  );
}

function describe(fast: boolean, abstinence: string): string {
  const parts: string[] = [];
  if (fast) parts.push("a day of fast");
  if (abstinence === "abstinence" || abstinence === "complete") parts.push("abstinence");
  if (abstinence === "partial") parts.push("partial abstinence");
  if (abstinence === "penance_or_abstinence") parts.push("Friday penance");
  return `The Church asks: ${parts.join(" and ")}.`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingBottom: 32 },
  hero: {
    backgroundColor: colors.inkNavyDeep,
    paddingHorizontal: 16,
    paddingTop: 72,
    paddingBottom: 28,
    gap: 10,
  },
  heroLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: "600", color: colors.goldBright },
  heroLine: { color: colors.paperWhite, fontSize: 17, lineHeight: 24 },
  body: {
    color: colors.graySecondary,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginVertical: 14 },
  exemptions: {
    color: colors.oxblood,
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  link: { color: colors.oxblood },
});
