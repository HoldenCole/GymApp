import { ScrollView, StyleSheet, Text, View } from "react-native";
import patrons from "@kanon/content/packaged/patrons.json";
import { colors, sacredSerif } from "../../src/theme";

/**
 * Rule — the page (UI brief §3.5). Full editorial: masthead, daily quote,
 * drop-cap reading, offering, journal. Set like a devotional; zero
 * mechanics. Parchment ground, entirely serif.
 *
 * Scaffold: renders the default patron (Benedict) from the packaged
 * catalog. Quote rotation, readings, and the journal build out from here.
 */
const patron = patrons.saints.benedict;
const quote = patron.quotes[0];

export default function Rule() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.masthead}>
        <Text style={[styles.mastheadTitle, sacredSerif]}>KANON</Text>
        <Text style={[styles.mastheadSub, sacredSerif]}>{patron.name}</Text>
      </View>

      {quote ? (
        <>
          <Text style={[styles.quote, sacredSerif]}>“{quote.text}”</Text>
          <Text style={[styles.attribution, sacredSerif]}>— {quote.attribution}</Text>
        </>
      ) : null}
      <View style={styles.rule} />

      <Text style={[styles.offering, sacredSerif]}>{patron.offering_line}</Text>
      <View style={styles.rule} />

      <Text style={[styles.readingTitle, sacredSerif]}>
        {patron.readings[0]?.title}
      </Text>
      <Text style={[styles.reading, sacredSerif]} numberOfLines={6}>
        {patron.readings[0]?.paragraphs[0]}
      </Text>
      <Text style={[styles.continue, sacredSerif]}>Continue reading</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parchment },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
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
  quote: { fontSize: 20, lineHeight: 30, color: colors.inkNavy, marginTop: 28 },
  attribution: { fontSize: 13, color: colors.graySecondary, marginTop: 8, fontStyle: "italic" },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginVertical: 20 },
  offering: { fontSize: 15, fontStyle: "italic", color: colors.oxblood, lineHeight: 22 },
  readingTitle: { fontSize: 17, color: colors.inkNavy, marginBottom: 8 },
  reading: { fontSize: 15, lineHeight: 24, color: colors.inkNavy },
  continue: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.oxblood,
    textDecorationLine: "underline",
    marginTop: 12,
  },
});
