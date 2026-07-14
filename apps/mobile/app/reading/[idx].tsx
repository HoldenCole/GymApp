import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import patrons from "@kanon/content/packaged/patrons.json";
import { useProfile } from "../../src/profile";
import { colors, sacredSerif } from "../../src/theme";

/** A full reflective reading — parchment, serif, drop cap, nothing else. */
export default function Reading() {
  const { idx } = useLocalSearchParams<{ idx: string }>();
  const { profile } = useProfile();
  const patron = patrons.saints[profile.patronId ?? "benedict"];
  const reading = patron.readings[Number(idx) || 0] ?? patron.readings[0]!;

  return (
    <>
      <Stack.Screen
        options={{
          title: patron.name,
          headerStyle: { backgroundColor: colors.parchment },
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={[styles.title, sacredSerif]}>{reading.title}</Text>
        {reading.paragraphs.map((p, i) => (
          <Text key={i} style={[styles.body, sacredSerif]}>
            {i === 0 ? (
              <>
                <Text style={styles.dropCap}>{p.charAt(0)}</Text>
                {p.slice(1)}
              </>
            ) : (
              p
            )}
          </Text>
        ))}
        <Text style={[styles.offering, sacredSerif]}>{patron.offering_line}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parchment },
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 56, gap: 14 },
  title: { fontSize: 20, color: colors.inkNavy, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 26, color: colors.inkNavy },
  dropCap: { fontSize: 38, lineHeight: 40, color: colors.oxblood },
  offering: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.oxblood,
    marginTop: 10,
  },
});
