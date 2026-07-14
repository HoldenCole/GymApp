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
import { MEAL_LABELS, MEALS, Meal } from "@kanon/food";
import { todayISO, useFood } from "../src/food";
import { colors, sectionLabel } from "../src/theme";

/**
 * Custom food entry — the honest gap-filler until the USDA FoodData
 * Central lookup lands (the seam is defined in @kanon/food). Name +
 * macros, straight into today's diary.
 */
export default function AddFood() {
  const router = useRouter();
  const { addEntry } = useFood();
  const [name, setName] = useState("");
  const [meal, setMeal] = useState<Meal>("lunch");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const n = (s: string) => (Number.isFinite(Number(s)) && s.trim() !== "" ? Number(s) : 0);
  const canAdd = name.trim().length > 0 && n(kcal) > 0;

  const add = () => {
    addEntry({
      date: todayISO(),
      meal,
      name: name.trim(),
      source: "custom",
      servings: 1,
      kcal: n(kcal),
      proteinG: n(protein),
      carbG: n(carbs),
      fatG: n(fat),
      fiberG: 0,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={sectionLabel}>Custom food</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor={colors.grayInactive}
        style={styles.input}
      />
      {(
        [
          ["kcal", kcal, setKcal],
          ["Protein (g)", protein, setProtein],
          ["Carbs (g)", carbs, setCarbs],
          ["Fat (g)", fat, setFat],
        ] as const
      ).map(([label, value, set]) => (
        <View key={label} style={styles.field}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TextInput
            value={value}
            onChangeText={set}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.grayInactive}
            style={styles.numInput}
          />
        </View>
      ))}
      <View style={styles.meals}>
        {MEALS.map((m) => (
          <Pressable key={m} onPress={() => setMeal(m)}>
            <Text style={[styles.mealChip, meal === m && styles.mealActive]}>
              {MEAL_LABELS[m]}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={[styles.addBar, !canAdd && styles.addBarDisabled]}
        onPress={add}
        disabled={!canAdd}
        accessibilityRole="button"
      >
        <Text style={styles.addBarText}>Add to {MEAL_LABELS[meal]}</Text>
      </Pressable>
      <Text style={styles.help}>
        USDA FoodData Central search lands here — values entered by hand
        until then.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48, gap: 12 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMajor,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.inkNavy,
  },
  field: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fieldLabel: { fontSize: 13, color: colors.graySecondary },
  numInput: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMajor,
    minWidth: 90,
    textAlign: "right",
    paddingVertical: 5,
    fontSize: 15,
    color: colors.inkNavy,
  },
  meals: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  mealChip: {
    borderWidth: 1,
    borderColor: colors.hairlineMajor,
    color: colors.graySecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
  },
  mealActive: { borderColor: colors.inkNavy, color: colors.inkNavy, fontWeight: "600" },
  addBar: {
    backgroundColor: colors.inkNavyDeep,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  addBarDisabled: { opacity: 0.4 },
  addBarText: { color: colors.paperWhite, fontSize: 14, letterSpacing: 0.5 },
  help: { color: colors.grayLabel, fontSize: 12, lineHeight: 17 },
});
