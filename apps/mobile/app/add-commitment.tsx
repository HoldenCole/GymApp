import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FAST_CATEGORIES, FastSchedule, type Weekday } from "@kanon/engine";
import patrons from "@kanon/content/packaged/patrons.json";
import { todayISO } from "../src/dates";
import { useFasts } from "../src/fasts";
import { colors, sacredSerif, sectionLabel } from "../src/theme";

/**
 * Add a chosen commitment. Everything here is the user's own choice and
 * the copy says so — "you've chosen", never "you must". The custom field
 * is honest about what the meal filter can and can't enforce.
 */

const WEEKDAY_ORDER: Weekday[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

export default function AddCommitment() {
  const router = useRouter();
  const { addFast } = useFasts();
  const [name, setName] = useState("");
  const [avoid, setAvoid] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [daily, setDaily] = useState(false);
  const [days, setDays] = useState<Weekday[]>(["friday"]);
  const [intention, setIntention] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState("");

  const intentions: string[] = patrons.intentions.full_pool;

  const toggle = <T,>(list: T[], v: T): T[] =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const canAdd =
    (avoid.length > 0 || custom.trim().length > 0) && (daily || days.length > 0);

  const add = () => {
    const schedule: FastSchedule = daily
      ? { kind: "daily" }
      : { kind: "weekdays", days };
    addFast({
      name: name.trim() || defaultName(avoid, custom),
      avoidCategories: avoid,
      customText: custom.trim() || undefined,
      schedule,
      intention,
      startDate: todayISO(),
      endDate: /^\d{4}-\d{2}-\d{2}$/.test(endDate) ? endDate : undefined,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.lede}>
        A commitment you choose, alongside what the Church asks. Yours to
        shape, yours to ease — setting it aside is never something to
        confess.
      </Text>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Name (optional)</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="My Lent commitment"
        placeholderTextColor={colors.grayInactive}
        style={styles.input}
      />

      <Text style={sectionLabel}>Avoid</Text>
      <View style={styles.chipWrap}>
        {FAST_CATEGORIES.map((c) => (
          <Pressable key={c} onPress={() => setAvoid(toggle(avoid, c))}>
            <Text style={[styles.chip, avoid.includes(c) && styles.chipActive]}>
              no {c}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.help}>These filter your meal suggestions.</Text>

      <Text style={sectionLabel}>Custom (optional)</Text>
      <TextInput
        value={custom}
        onChangeText={setCustom}
        placeholder="No coffee, no snacks between meals…"
        placeholderTextColor={colors.grayInactive}
        style={styles.input}
      />
      <Text style={styles.help}>
        Tracked for you, but meal suggestions can't enforce free text — if
        it maps onto a category above (say "no butter" → no dairy), tick
        that too and the filter will carry it.
      </Text>

      <Text style={sectionLabel}>Days</Text>
      <View style={styles.chipWrap}>
        <Pressable onPress={() => setDaily(true)}>
          <Text style={[styles.chip, daily && styles.chipActive]}>Every day</Text>
        </Pressable>
        <Pressable onPress={() => setDaily(false)}>
          <Text style={[styles.chip, !daily && styles.chipActive]}>Certain days</Text>
        </Pressable>
      </View>
      {!daily ? (
        <View style={styles.chipWrap}>
          {WEEKDAY_ORDER.map((d) => (
            <Pressable key={d} onPress={() => setDays(toggle(days, d))}>
              <Text style={[styles.chip, days.includes(d) && styles.chipActive]}>
                {d.slice(0, 3)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Text style={sectionLabel}>Until (optional)</Text>
      <TextInput
        value={endDate}
        onChangeText={setEndDate}
        placeholder="YYYY-MM-DD — leave empty for open-ended"
        placeholderTextColor={colors.grayInactive}
        autoCapitalize="none"
        style={styles.input}
      />

      <Text style={sectionLabel}>Offered for (optional)</Text>
      <View style={{ gap: 6 }}>
        {intentions.map((line) => (
          <Pressable
            key={line}
            onPress={() => setIntention(intention === line ? undefined : line)}
          >
            <Text
              style={[
                styles.intention,
                sacredSerif,
                intention === line && styles.intentionActive,
              ]}
            >
              {line}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.help}>
        An invitation, not an obligation — a commitment without an offering
        is whole in itself.
      </Text>

      <Pressable
        style={[styles.addBar, !canAdd && styles.addBarDisabled]}
        onPress={add}
        disabled={!canAdd}
        accessibilityRole="button"
      >
        <Text style={styles.addBarText}>Take this on</Text>
      </Pressable>
    </ScrollView>
  );
}

function defaultName(avoid: string[], custom: string): string {
  if (avoid.length > 0) return `No ${avoid.join(", ")}`;
  return custom.trim() || "My commitment";
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 48, gap: 10 },
  lede: { fontSize: 14, lineHeight: 20, color: colors.graySecondary },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16, marginVertical: 6 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMajor,
    paddingVertical: 7,
    fontSize: 15,
    color: colors.inkNavy,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.hairlineMajor,
    color: colors.graySecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    overflow: "hidden",
  },
  chipActive: { borderColor: colors.inkNavy, color: colors.inkNavy, fontWeight: "600" },
  help: { fontSize: 12, lineHeight: 17, color: colors.grayLabel },
  intention: { fontSize: 14, fontStyle: "italic", color: colors.graySecondary },
  intentionActive: { color: colors.goldDeep },
  addBar: {
    backgroundColor: colors.inkNavyDeep,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  addBarDisabled: { opacity: 0.4 },
  addBarText: { color: colors.paperWhite, fontSize: 14, letterSpacing: 0.5 },
});
