import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  ACCUMULATION_NOTICE_COPY,
  accumulationCheck,
  activeAvoidSet,
  CUSTOM_ADVISORY_COPY,
  DISCIPLINES,
  EXEMPTION_CHOSEN_NOTE,
  EXEMPTION_CLAIMED_COPY,
  EXEMPTION_COPY,
  fastAppliesOn,
  Obligation,
  PersonalFast,
  resolveObligation,
  SET_ASIDE_COPY,
} from "@kanon/engine";
import { dayFactsFor, dayHeader, PROVENANCE_NOTE } from "../../src/dayFacts";
import { addDaysISO, todayISO, todayWeekday } from "../../src/dates";
import { useFasts } from "../../src/fasts";
import { feastOn } from "../../src/feasts";
import { useTodaysObligation } from "../../src/obligation";
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
  const { facts: day, provenance, law, obligation, exemptedToday } =
    useTodaysObligation();
  const discipline = DISCIPLINES[profile.discipline];
  const note = PROVENANCE_NOTE[provenance];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>TODAY</Text>
        <Text style={[styles.heroDay, sacredSerif]}>{dayHeader(day)}</Text>
        <Text style={[styles.heroLine, sacredSerif]}>
          {law.abstinence !== "none" || law.fast
            ? describe(law.fast, law.abstinence)
            : law.lifted
              ? "The day's penance is lifted — a feast of the Lord's own keeping."
              : "No fast or abstinence binds today."}
        </Text>
        {exemptedToday ? (
          <Text style={[styles.heroSoftening, sacredSerif]}>
            {EXEMPTION_CLAIMED_COPY}
          </Text>
        ) : null}
        {feastOn(day.date)?.softens ? (
          <Text style={[styles.heroSoftening, sacredSerif]}>
            {feastOn(day.date)!.label} — a feast is a feast; the emphasis
            softens today.
          </Text>
        ) : null}
        {note ? <Text style={styles.heroNote}>{note}</Text> : null}
      </View>

      <Text style={sectionLabel}>What today allows</Text>
      <Text style={styles.body}>
        Rendered from the obligation record ({law.ruleRefs.join(", ") || "—"}).
      </Text>
      <View style={styles.rule} />

      <ExemptionBlock law={law} exemptedToday={exemptedToday} date={day.date} />

      <Text style={sectionLabel}>The week</Text>
      <WeekStrip />
      <View style={styles.rule} />

      <Text style={sectionLabel}>Your discipline</Text>
      <Text style={styles.body}>
        {discipline.label} — {discipline.sublabel}.{" "}
        <Link href="/settings" style={styles.link}>
          Change
        </Link>
      </Text>
      <View style={styles.rule} />

      <PersonalCommitments />
    </ScrollView>
  );
}

/**
 * The exemption flow (Part 2 §2): one tap from the obligation itself, no
 * justification, no confirmation gauntlet, no reason logged. Shown only
 * when something actually binds; framed as the Church's own provision.
 */
function ExemptionBlock({
  law,
  exemptedToday,
  date,
}: {
  law: Obligation;
  exemptedToday: boolean;
  date: string;
}) {
  const { state, claimExemption, unclaimExemption } = useFasts();
  const bindsSomething =
    (law.fast && law.binds.fast) || (law.abstinence !== "none" && law.binds.abstinence);
  if (!bindsSomething && !exemptedToday) return null;

  const commitmentsToday =
    activeAvoidSet(state.fasts, date, todayWeekday()).categories.length > 0 ||
    state.fasts.some((f) => fastAppliesOn(f, date, todayWeekday()));

  return (
    <>
      <Text style={styles.exemptions}>Exemptions</Text>
      <Text style={styles.body}>{EXEMPTION_COPY}</Text>
      {exemptedToday ? (
        <>
          <Text style={styles.body}>{EXEMPTION_CLAIMED_COPY}</Text>
          {commitmentsToday ? <Text style={styles.body}>{EXEMPTION_CHOSEN_NOTE}</Text> : null}
          <Pressable onPress={() => unclaimExemption(date)} accessibilityRole="button">
            <Text style={styles.exemptAction}>Resume the day's observance</Text>
          </Pressable>
        </>
      ) : (
        <Pressable onPress={() => claimExemption(date)} accessibilityRole="button">
          <Text style={styles.exemptAction}>I'm excused today</Text>
        </Pressable>
      )}
      <Text style={styles.bodyQuiet}>
        Unsure whether you're excused? That's a good question for your
        pastor or confessor — and your doctor where health is involved.
      </Text>
      <View style={styles.rule} />
    </>
  );
}

/** The week ahead — today-first, each day's rule from the calendar. */
function WeekStrip() {
  const { profile } = useProfile();
  const { state } = useFasts();
  const today = todayISO();

  const rows = Array.from({ length: 7 }, (_, i) => {
    const date = addDaysISO(today, i);
    const { facts } = dayFactsFor(date, profile.discipline);
    const law = resolveObligation(facts, profile);
    const chosen = activeAvoidSet(state.fasts, date, facts.weekday);
    return { date, facts, law, exempt: state.exemptDates.includes(date), chosen };
  });

  return (
    <View>
      {rows.map(({ date, facts, law, exempt, chosen }, i) => {
        const obligationText = shortObligation(law);
        return (
          <View key={date} style={styles.weekRow}>
            <View style={styles.weekDay}>
              <Text style={styles.weekDayName}>
                {i === 0 ? "Today" : facts.weekday.slice(0, 3)}
              </Text>
              <Text style={styles.weekDate}>{date.slice(8)}</Text>
            </View>
            <View style={styles.weekMain}>
              {facts.celebration ? (
                <Text style={[styles.weekCelebration, sacredSerif]} numberOfLines={1}>
                  {facts.celebration}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.weekObligation,
                  obligationText && !exempt && styles.weekObligationBinds,
                ]}
                numberOfLines={1}
              >
                {exempt
                  ? "excused — the Church's provision"
                  : obligationText ?? (law.lifted ? "penance lifted" : "—")}
                {chosen.categories.length > 0
                  ? `  ·  yours: no ${chosen.categories.join(", no ")}`
                  : ""}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function shortObligation(law: Obligation): string | null {
  if (law.lifted) return null;
  const parts: string[] = [];
  if (law.fast) parts.push("fast");
  if (law.abstinence === "abstinence") parts.push("abstinence");
  if (law.abstinence === "complete") parts.push("complete abstinence");
  if (law.abstinence === "partial") parts.push("partial abstinence");
  if (law.abstinence === "penance_or_abstinence") parts.push("Friday penance");
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Chosen commitments — deliberately NOT the obligation treatment: no dark
 * hero, no oxblood, "you've chosen" language throughout. Set-aside is one
 * tap, met with reassurance, and never counted.
 */
function PersonalCommitments() {
  const { state, setAside, resume, dismissAccumulation } = useFasts();
  const today = todayISO();
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
  heroDay: { color: colors.goldBright, fontSize: 14, fontStyle: "italic" },
  heroLine: { color: colors.paperWhite, fontSize: 17, lineHeight: 24 },
  heroSoftening: { color: colors.goldBright, fontSize: 13, fontStyle: "italic", lineHeight: 19 },
  heroNote: { color: "#B4B0A6", fontSize: 11, marginTop: 4 },
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
  bodyQuiet: {
    color: colors.grayLabel,
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  exemptAction: {
    color: colors.teal,
    fontSize: 14,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMinor,
  },
  weekDay: { width: 44, alignItems: "flex-start" },
  weekDayName: { fontSize: 12, fontWeight: "600", color: colors.inkNavy, textTransform: "capitalize" },
  weekDate: { fontSize: 10, color: colors.grayLabel },
  weekMain: { flex: 1, gap: 1 },
  weekCelebration: { fontSize: 12, fontStyle: "italic", color: colors.graySecondary },
  weekObligation: { fontSize: 12, color: colors.grayInactive },
  weekObligationBinds: { color: colors.oxblood, fontWeight: "600" },
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
