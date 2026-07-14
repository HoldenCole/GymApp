import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FAST_CATEGORIES } from "@kanon/engine";
import { colors, sectionLabel } from "../../src/theme";

/**
 * Food — the browse (UI brief §3.4). Visual grid + stackable tag facets
 * (fast rule / effort / goal / tradition), day-aware pre-filtering.
 * Scaffold: facet rail from the one controlled vocabulary; the 500-recipe
 * grid loads from data/packaged/recipes.json when the browse builds out.
 */
export default function Food() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={sectionLabel}>Fast rule</Text>
      <View style={styles.facets}>
        {FAST_CATEGORIES.map((c) => (
          <Text key={c} style={styles.facet}>
            no {c}
          </Text>
        ))}
      </View>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Effort</Text>
      <View style={styles.facets}>
        {["1 Assembly", "2 Quick", "3 Standard", "4 Project"].map((e) => (
          <Text key={e} style={styles.facet}>
            {e}
          </Text>
        ))}
      </View>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Recipes</Text>
      <Text style={styles.placeholder}>
        The 500-recipe visual grid lands here, pre-filtered by today's rule.
        Allergies are a hard filter — oxblood, absolute, no override.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 64, paddingBottom: 32, gap: 12 },
  facets: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  facet: {
    borderWidth: 1,
    borderColor: colors.hairlineMajor,
    color: colors.graySecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
  },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16 },
  placeholder: { color: colors.graySecondary, fontSize: 13, lineHeight: 18 },
});
