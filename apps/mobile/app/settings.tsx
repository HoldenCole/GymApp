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
  DISCIPLINE_ORDER,
  DISCIPLINES,
  NORM_PROFILE_INFO,
  NORM_PROFILE_ORDER,
} from "@kanon/engine";
import type { UnitSystem } from "@kanon/fitness";
import { useFitness } from "../src/fitness";
import { useProfile } from "../src/profile";
import { colors, sacredSerif, sectionLabel } from "../src/theme";

/**
 * Settings (UI brief §3.6). Scaffold scope: the resolver's three inputs —
 * discipline, country norm profile, birth date. The discipline choice
 * states which body of law applies; it is never framed as a devotion
 * ranking. Doubt about which applies routes to a pastor, not to the app.
 *
 * Lampstand stays quiet until launch: footer and the Introibo line only
 * (Project Master §1).
 */
export default function Settings() {
  const { profile, setProfile } = useProfile();
  const { state, update } = useFitness();
  const [birthDraft, setBirthDraft] = useState(profile.birthDate);

  const commitBirthDate = () => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(birthDraft)) {
      setProfile({ ...profile, birthDate: birthDraft });
    } else {
      setBirthDraft(profile.birthDate);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={sectionLabel}>Training & nutrition</Text>
      <View style={styles.linkRow}>
        <Link href="/plan" style={styles.navLink}>
          Plan — goal, rate, targets
        </Link>
        <Link href="/split" style={styles.navLink}>
          Split — sessions & week
        </Link>
      </View>
      <View style={styles.unitsRow}>
        {(["imperial", "metric"] as UnitSystem[]).map((u) => {
          const active = state.units === u;
          return (
            <Pressable
              key={u}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => update({ units: u })}
            >
              <Text style={[styles.unitChoice, active && styles.unitActive]}>
                {u === "imperial" ? "lb / in" : "kg / cm"}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Discipline</Text>
      <Text style={styles.help}>
        Which fasting discipline the Church's calendar applies to you. If
        you're unsure, this is a good question for your pastor.
      </Text>
      {DISCIPLINE_ORDER.map((id) => {
        const d = DISCIPLINES[id];
        const active = profile.discipline === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => setProfile({ ...profile, discipline: id })}
            style={styles.option}
          >
            <View style={styles.optionHead}>
              <Text style={[styles.optionLabel, active && styles.optionActive]}>
                {d.label}
              </Text>
              {active ? <Text style={styles.check}>✓</Text> : null}
            </View>
            <Text style={styles.optionSub}>{d.sublabel}</Text>
            <Text style={styles.optionBody}>{d.description}</Text>
          </Pressable>
        );
      })}
      <View style={styles.rule} />

      <Text style={sectionLabel}>Country</Text>
      <Text style={styles.help}>
        Your home country sets which bishops' norms apply — it changes only
        when you change it, never when you travel.
      </Text>
      {NORM_PROFILE_ORDER.map((id) => {
        const n = NORM_PROFILE_INFO[id];
        const active = profile.normProfile === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => setProfile({ ...profile, normProfile: id })}
            style={styles.option}
          >
            <View style={styles.optionHead}>
              <Text style={[styles.optionLabel, active && styles.optionActive]}>
                {n.label}
              </Text>
              {active ? <Text style={styles.check}>✓</Text> : null}
            </View>
            <Text style={styles.optionBody}>{n.description}</Text>
          </Pressable>
        );
      })}
      <View style={styles.rule} />

      <Text style={sectionLabel}>Birth date</Text>
      <Text style={styles.help}>
        Used only to know which obligations bind at your age.
      </Text>
      <TextInput
        value={birthDraft}
        onChangeText={setBirthDraft}
        onBlur={commitBirthDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.grayInactive}
        autoCapitalize="none"
        style={styles.input}
      />
      <View style={styles.rule} />

      <Text style={[styles.footer, sacredSerif]}>
        Calendar data: Introibo — import pending.
      </Text>
      <Text style={styles.footerQuiet}>Kanon · a Lampstand product</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48, gap: 10 },
  help: { color: colors.graySecondary, fontSize: 13, lineHeight: 18 },
  option: { paddingVertical: 10, gap: 3 },
  optionHead: { flexDirection: "row", justifyContent: "space-between" },
  optionLabel: { fontSize: 15, fontWeight: "600", color: colors.graySecondary },
  optionActive: { color: colors.inkNavy },
  check: { color: colors.goldDeep, fontSize: 15 },
  optionSub: { fontSize: 12, color: colors.grayLabel },
  optionBody: { fontSize: 13, lineHeight: 18, color: colors.graySecondary },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16, marginVertical: 8 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMajor,
    paddingVertical: 6,
    fontSize: 15,
    color: colors.inkNavy,
  },
  footer: { fontSize: 13, fontStyle: "italic", color: colors.graySecondary, marginTop: 12 },
  footerQuiet: { fontSize: 11, color: colors.grayInactive },
  linkRow: { gap: 10 },
  navLink: { color: colors.oxblood, fontSize: 14, paddingVertical: 2 },
  unitsRow: { flexDirection: "row", gap: 16, marginTop: 4 },
  unitChoice: { fontSize: 13, color: colors.graySecondary },
  unitActive: { color: colors.inkNavy, fontWeight: "600" },
});
