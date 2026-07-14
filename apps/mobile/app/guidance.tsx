import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GUIDANCE_FRAME, GUIDANCE_SECTIONS, GUIDANCE_STATUS } from "@kanon/engine";
import { colors, sacredSerif, sectionLabel } from "../src/theme";

/**
 * Fast-while-training guidance (content pack Part 3). The disclaimer is
 * the first section BY DATA (a test pins it) and links to exemptions so
 * a health-affected user meets easing first, not just a warning.
 * Principles only — no zones, targets, or figures anywhere.
 */
export default function Guidance() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={[styles.frame, sacredSerif]}>{GUIDANCE_FRAME}</Text>
      <Text style={styles.status}>{GUIDANCE_STATUS}</Text>
      <View style={styles.rule} />

      {GUIDANCE_SECTIONS.map((section) => (
        <View key={section.id} style={{ gap: 6 }}>
          <Text style={sectionLabel}>{section.title}</Text>
          {section.paragraphs.map((p, i) => (
            <Text key={i} style={styles.body}>
              {p}
            </Text>
          ))}
          {section.id === "disclaimer" ? (
            <Link href="/(tabs)/fasting" style={styles.link}>
              See your exemptions
            </Link>
          ) : null}
          <View style={styles.rule} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 48, gap: 10 },
  frame: { fontSize: 17, lineHeight: 25, fontStyle: "italic", color: colors.inkNavy },
  status: { fontSize: 11, color: colors.grayInactive },
  body: { fontSize: 14, lineHeight: 21, color: colors.graySecondary },
  link: { color: colors.oxblood, fontSize: 13, marginTop: 2 },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16, marginVertical: 8 },
});
