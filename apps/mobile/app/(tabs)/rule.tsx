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
import patrons from "@kanon/content/packaged/patrons.json";
import { todayISO } from "../../src/dates";
import { feastOn } from "../../src/feasts";
import { useJournal } from "../../src/journal";
import { useProfile } from "../../src/profile";
import { colors, sacredSerif } from "../../src/theme";

/**
 * Rule — the page (UI brief §3.5). Full editorial: masthead, feast note,
 * daily quote, offering with intention, drop-cap reading, journal. Set
 * like a devotional; zero mechanics — nothing here counts anything.
 */
export default function Rule() {
  const { profile, setProfile } = useProfile();
  const patron = patrons.saints[profile.patronId ?? "benedict"];
  const today = todayISO();
  const feast = feastOn(today);

  const day = new Date().getDate();
  const quote = patron.quotes[day % patron.quotes.length];
  const readingIdx = day % patron.readings.length;
  const reading = patron.readings[readingIdx]!;
  const firstPara = reading.paragraphs[0] ?? "";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.masthead}>
        <Text style={[styles.mastheadTitle, sacredSerif]}>KANON</Text>
        <Text style={[styles.mastheadSub, sacredSerif]}>{patron.name}</Text>
        {feast ? (
          <Text style={[styles.mastheadFeast, sacredSerif]}>{feast.label}</Text>
        ) : null}
      </View>

      {feast?.note ? (
        <>
          <Text style={[styles.feastHeading, sacredSerif]}>{feast.note.heading}</Text>
          {feast.note.paragraphs.map((p, i) => (
            <Text key={i} style={[styles.reading, sacredSerif]}>
              {p}
            </Text>
          ))}
          <View style={styles.rule} />
        </>
      ) : feast ? (
        <>
          <Text style={[styles.feastHeading, sacredSerif]}>
            Today the Church keeps the {feast.label}. The emphasis softens
            today.
          </Text>
          <View style={styles.rule} />
        </>
      ) : null}

      {quote ? (
        <>
          <Text style={[styles.quote, sacredSerif]}>“{quote.text}”</Text>
          <Text style={[styles.attribution, sacredSerif]}>— {quote.attribution}</Text>
        </>
      ) : null}
      <View style={styles.rule} />

      <OfferingBlock
        offeringLine={patron.offering_line ?? ""}
        intention={profile.intention}
        onIntention={(line) => setProfile({ ...profile, intention: line })}
      />
      <View style={styles.rule} />

      <Text style={[styles.readingTitle, sacredSerif]}>{reading.title}</Text>
      <Text style={[styles.reading, sacredSerif]}>
        <Text style={styles.dropCap}>{firstPara.charAt(0)}</Text>
        {firstPara.slice(1)}
      </Text>
      <Link href={`/reading/${readingIdx}`} style={[styles.continue, sacredSerif]}>
        Continue reading
      </Link>

      <Text style={[styles.otherReadings, sacredSerif]}>Also from {shortName(patron.name)}:</Text>
      {patron.readings.map((r, i) =>
        i === readingIdx ? null : (
          <Link key={r.title} href={`/reading/${i}`} style={[styles.readingLink, sacredSerif]}>
            {r.title}
          </Link>
        ),
      )}
      <View style={styles.rule} />

      <JournalBlock />

      <Text style={[styles.begin, sacredSerif]}>We begin again tomorrow.</Text>
    </ScrollView>
  );
}

function OfferingBlock({
  offeringLine,
  intention,
  onIntention,
}: {
  offeringLine: string;
  intention?: string;
  onIntention: (line?: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const pool: string[] = patrons.intentions.full_pool;

  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.offering, sacredSerif]}>{offeringLine}</Text>
      {intention ? (
        <Text style={[styles.intention, sacredSerif]}>{intention}</Text>
      ) : null}
      <Pressable onPress={() => setPicking((v) => !v)}>
        <Text style={[styles.quietAction, sacredSerif]}>
          {picking ? "Close" : intention ? "Change intention" : "Offer this for…"}
        </Text>
      </Pressable>
      {picking ? (
        <View style={{ gap: 6 }}>
          {pool.map((line) => (
            <Pressable
              key={line}
              onPress={() => {
                onIntention(line === intention ? undefined : line);
                setPicking(false);
              }}
            >
              <Text
                style={[
                  styles.intentionOption,
                  sacredSerif,
                  line === intention && styles.intentionActive,
                ]}
              >
                {line}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function JournalBlock() {
  const { entries, write } = useJournal();
  const today = todayISO();
  const todayEntry = entries.find((e) => e.date === today);
  const [draft, setDraft] = useState(todayEntry?.text ?? "");
  const past = entries.filter((e) => e.date !== today).slice(-5).reverse();

  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.readingTitle, sacredSerif]}>Journal</Text>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onBlur={() => write(today, draft)}
        placeholder="A line for today, if you want one."
        placeholderTextColor={colors.grayInactive}
        multiline
        style={[styles.journalInput, sacredSerif]}
      />
      {past.map((e) => (
        <View key={e.date} style={{ gap: 2 }}>
          <Text style={styles.journalDate}>{e.date}</Text>
          <Text style={[styles.journalPast, sacredSerif]}>{e.text}</Text>
        </View>
      ))}
    </View>
  );
}

function shortName(full: string): string {
  return full.replace(/^St\. /, "").split(" ")[0] ?? full;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parchment },
  content: { paddingHorizontal: 20, paddingBottom: 48 },
  masthead: {
    backgroundColor: colors.inkNavyDeep,
    marginHorizontal: -20,
    paddingTop: 72,
    paddingBottom: 24,
    alignItems: "center",
    gap: 6,
  },
  mastheadTitle: { color: colors.parchment, fontSize: 22, letterSpacing: 6 },
  mastheadSub: { color: colors.goldBright, fontSize: 14, fontStyle: "italic" },
  mastheadFeast: { color: colors.parchment, fontSize: 12, fontStyle: "italic" },
  feastHeading: { fontSize: 16, color: colors.oxblood, marginTop: 20, lineHeight: 23 },
  quote: { fontSize: 20, lineHeight: 30, color: colors.inkNavy, marginTop: 24 },
  attribution: { fontSize: 13, color: colors.graySecondary, marginTop: 8, fontStyle: "italic" },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginVertical: 18 },
  offering: { fontSize: 15, fontStyle: "italic", color: colors.oxblood, lineHeight: 22 },
  intention: { fontSize: 14, fontStyle: "italic", color: colors.goldDeep },
  quietAction: {
    fontSize: 13,
    fontStyle: "italic",
    color: colors.oxblood,
    textDecorationLine: "underline",
  },
  intentionOption: { fontSize: 14, fontStyle: "italic", color: colors.graySecondary },
  intentionActive: { color: colors.goldDeep },
  readingTitle: { fontSize: 17, color: colors.inkNavy, marginBottom: 6 },
  reading: { fontSize: 15, lineHeight: 24, color: colors.inkNavy, marginBottom: 8 },
  dropCap: { fontSize: 34, lineHeight: 36, color: colors.oxblood },
  continue: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.oxblood,
    textDecorationLine: "underline",
    marginTop: 2,
  },
  otherReadings: { fontSize: 13, color: colors.graySecondary, marginTop: 16 },
  readingLink: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.oxblood,
    textDecorationLine: "underline",
    marginTop: 4,
  },
  journalInput: {
    minHeight: 60,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkNavy,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMajor,
    paddingVertical: 6,
    textAlignVertical: "top",
  },
  journalDate: { fontSize: 11, color: colors.grayLabel, letterSpacing: 0.8 },
  journalPast: { fontSize: 14, lineHeight: 21, color: colors.graySecondary },
  begin: {
    fontSize: 13,
    fontStyle: "italic",
    color: colors.graySecondary,
    textAlign: "center",
    marginTop: 24,
  },
});
