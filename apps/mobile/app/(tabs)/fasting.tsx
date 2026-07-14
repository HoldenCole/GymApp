import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  ACCUMULATION_NOTICE_COPY,
  accumulationCheck,
  CUSTOM_ADVISORY_COPY,
  DISCIPLINES,
  fastAppliesOn,
  PersonalFast,
  resolveObligation,
  SET_ASIDE_COPY,
} from "@kanon/engine";
import { civilDayFactsToday } from "../../src/dayFacts";
import { todayWeekday } from "../../src/dates";
import { useFasts } from "../../src/fasts";
import { feastOn } from "../../src/feasts";
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
        {feastOn(day.date)?.softens ? (
          <Text style={[styles.heroSoftening, sacredSerif]}>
            {feastOn(day.date)!.label} — a feast is a feast; the emphasis
            softens today.
          </Text>
        ) : null}
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

      <PersonalCommitments />
    </ScrollView>
  );
}

/**
 * Chosen commitments — deliberately NOT the obligation treatment: no dark
 * hero, no oxblood, "you've chosen" language throughout. Set-aside is one
 * tap, met with reassurance, and never counted.
 */
function PersonalCommitments() {
  const { state, setAside, resume, dismissAccumulation } = useFasts();
  const today = civilDayFactsToday().date;
  const weekday = todayWeekday();

  const accumulation = accumulationCheck(state.fasts, today);
  const noticeVisible =
    accumulation.noticeSuggested &&
    (!state.accumulationDismissedUntil || state.accumulationDismissedUntil <= today);

  return (
    <>
      <View style={styles.commitHead}>
        <Text style={sectionLabel}>Your commitments</Text>
        <Link href="/add-commitment" style={styles.link}>
          Add
        </Link>
      </View>

      {state.fasts.length === 0 ? (
        <Text style={styles.body}>
          Nothing here yet. A chosen commitment — no sweets on Fridays, a
          Lenten discipline — lives alongside what the Church asks, always
          clearly yours.
        </Text>
      ) : (
        state.fasts.map((f) => (
          <CommitmentRow
            key={f.id}
            fast={f}
            today={today}
            appliesToday={fastAppliesOn(f, today, weekday)}
            setAsideToday={f.setAsideDates.includes(today)}
            onSetAside={() => setAside(f.id, today)}
            onResume={() => resume(f.id, today)}
          />
        ))
      )}

      {noticeVisible ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{ACCUMULATION_NOTICE_COPY}</Text>
          <Pressable onPress={() => dismissAccumulation(today)} accessibilityRole="button">
            <Text style={styles.noticeDismiss}>Thanks — dismiss</Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

function CommitmentRow({
  fast,
  appliesToday,
  setAsideToday,
  onSetAside,
  onResume,
}: {
  fast: PersonalFast;
  today: string;
  appliesToday: boolean;
  setAsideToday: boolean;
  onSetAside: () => void;
  onResume: () => void;
}) {
  const parts = fast.avoidCategories.map((c) => `no ${c}`);
  const scheduleLabel =
    fast.schedule.kind === "daily"
      ? "every day"
      : fast.schedule.days.map((d) => d.slice(0, 3)).join(" · ");

  return (
    <View style={styles.commitment}>
      <Text style={styles.commitName}>{fast.name}</Text>
      <Text style={styles.commitDetail}>
        You've chosen: {[...parts, ...(fast.customText ? [fast.customText] : [])].join(", ")}
        {" — "}
        {scheduleLabel}
      </Text>
      {fast.customText ? (
        <Text style={styles.commitAdvisory}>{CUSTOM_ADVISORY_COPY}</Text>
      ) : null}
      {fast.intention ? (
        <Text style={[styles.commitIntention, sacredSerif]}>{fast.intention}</Text>
      ) : null}
      {setAsideToday ? (
        <>
          <Text style={styles.commitDetail}>{SET_ASIDE_COPY}</Text>
          <Pressable onPress={onResume} accessibilityRole="button">
            <Text style={styles.commitAction}>Resume today</Text>
          </Pressable>
        </>
      ) : appliesToday ? (
        <Pressable onPress={onSetAside} accessibilityRole="button">
          <Text style={styles.commitAction}>Set aside for today</Text>
        </Pressable>
      ) : (
        <Text style={styles.commitAdvisory}>Not scheduled today.</Text>
      )}
    </View>
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
  heroSoftening: { color: colors.goldBright, fontSize: 13, fontStyle: "italic", lineHeight: 19 },
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
  commitHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingRight: 16,
  },
  commitment: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMinor,
    gap: 4,
  },
  commitName: { fontSize: 15, fontWeight: "600", color: colors.inkNavy },
  commitDetail: { fontSize: 13, lineHeight: 18, color: colors.graySecondary },
  commitAdvisory: { fontSize: 12, color: colors.grayLabel },
  commitIntention: { fontSize: 13, fontStyle: "italic", color: colors.goldDeep },
  commitAction: { fontSize: 13, color: colors.teal, marginTop: 2 },
  notice: {
    marginHorizontal: 16,
    marginTop: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.hairlineMajor,
    paddingVertical: 12,
    gap: 8,
  },
  noticeText: { fontSize: 13, lineHeight: 19, color: colors.graySecondary },
  noticeDismiss: { fontSize: 13, color: colors.teal },
});
