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
  cycleDay,
  REST,
  sessionFor,
  Split,
  SPLIT_TEMPLATES,
  validateSplit,
  WEEKDAYS,
} from "@kanon/fitness";
import { useFitness } from "../src/fitness";
import { colors, sectionLabel } from "../src/theme";

/**
 * Split editor. Pick a template as a starting point, rename any session
 * to anything, add your own, and tap a day to cycle rest → sessions.
 * The split is the user's — templates are suggestions, not programs.
 */
export default function SplitScreen() {
  const { state, update } = useFitness();
  const split = state.split;
  const setSplit = (next: Split) => {
    if (validateSplit(next).length === 0) update({ split: next });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={sectionLabel}>Templates</Text>
      <Text style={styles.help}>Starting points — everything below is editable.</Text>
      <View style={styles.rowWrap}>
        {SPLIT_TEMPLATES.map((t) => (
          <Pressable
            key={t.name}
            onPress={() => setSplit(structuredClone(t))}
            style={[styles.choice, split.name === t.name && styles.choiceActive]}
          >
            <Text
              style={[styles.choiceText, split.name === t.name && styles.choiceTextActive]}
            >
              {t.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Sessions</Text>
      <Text style={styles.help}>Name them anything — Push, Squat day, Sprints.</Text>
      {split.sessions.map((s) => (
        <SessionRow
          key={s.id}
          name={s.name}
          onRename={(name) =>
            name.trim() &&
            setSplit({
              ...split,
              sessions: split.sessions.map((x) => (x.id === s.id ? { ...x, name } : x)),
            })
          }
          onRemove={
            split.sessions.length > 1
              ? () =>
                  setSplit({
                    ...split,
                    name: "Custom split",
                    sessions: split.sessions.filter((x) => x.id !== s.id),
                    week: Object.fromEntries(
                      Object.entries(split.week).map(([d, id]) => [d, id === s.id ? REST : id]),
                    ) as Split["week"],
                  })
              : undefined
          }
        />
      ))}
      <Pressable
        style={styles.add}
        onPress={() => {
          const id = `s${Date.now().toString(36)}`;
          setSplit({
            ...split,
            name: "Custom split",
            sessions: [...split.sessions, { id, name: "New session" }],
          });
        }}
      >
        <Text style={styles.addText}>Add session</Text>
      </Pressable>
      <View style={styles.rule} />

      <Text style={sectionLabel}>Week</Text>
      <Text style={styles.help}>Tap a day to cycle: rest → each session.</Text>
      {WEEKDAYS.map((day) => {
        const session = sessionFor(split, day);
        return (
          <Pressable
            key={day}
            onPress={() => setSplit(cycleDay(split, day))}
            style={styles.dayRow}
          >
            <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
            <Text style={[styles.daySession, !session && styles.dayRest]}>
              {session ? session.name : "Rest"}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function SessionRow({
  name,
  onRename,
  onRemove,
}: {
  name: string;
  onRename: (name: string) => void;
  onRemove?: () => void;
}) {
  const [draft, setDraft] = useState(name);
  return (
    <View style={styles.sessionRow}>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onBlur={() => onRename(draft)}
        style={styles.sessionInput}
      />
      {onRemove ? (
        <Pressable onPress={onRemove} accessibilityRole="button">
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48, gap: 10 },
  help: { color: colors.graySecondary, fontSize: 13, lineHeight: 18 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    borderWidth: 1,
    borderColor: colors.hairlineMajor,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  choiceActive: { borderColor: colors.inkNavy },
  choiceText: { fontSize: 12, color: colors.graySecondary },
  choiceTextActive: { color: colors.inkNavy, fontWeight: "600" },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sessionInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMajor,
    paddingVertical: 5,
    fontSize: 15,
    color: colors.inkNavy,
  },
  remove: { color: colors.oxblood, fontSize: 13 },
  add: { paddingVertical: 8 },
  addText: { color: colors.oxblood, fontSize: 14 },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMinor,
  },
  dayName: { fontSize: 14, color: colors.graySecondary },
  daySession: { fontSize: 14, fontWeight: "600", color: colors.inkNavy },
  dayRest: { color: colors.grayInactive, fontWeight: "400" },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16, marginVertical: 8 },
});
