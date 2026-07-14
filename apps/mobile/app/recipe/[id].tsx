import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MEAL_LABELS, MEALS, Meal, scaleMacros, toDiaryEntry } from "@kanon/food";
import { catalogItem } from "../../src/catalog";
import { todayISO, useFood } from "../../src/food";
import { colors, sectionLabel } from "../../src/theme";

/**
 * Recipe / product detail with the add-to-diary flow (servings + meal).
 * Allergens render in the safety treatment — visible, never overridable.
 */
export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, addEntry } = useFood();
  const [servings, setServings] = useState(1);
  const [meal, setMeal] = useState<Meal>("lunch");

  const item = id ? catalogItem(id) : undefined;
  if (!item) {
    return (
      <View style={styles.screen}>
        <Text style={styles.body}>Not found.</Text>
      </View>
    );
  }

  const scaled = scaleMacros(item.macros, servings);
  const allergyHit = item.allergenCodes.filter((a) => state.allergies.includes(a));

  const add = () => {
    const entry = toDiaryEntry(item, {
      id: "", // assigned by the store
      date: todayISO(),
      meal,
      servings,
    });
    const { id: _drop, ...rest } = entry;
    addEntry(rest);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: item.title }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.sub}>
          {item.type === "product"
            ? `${item.brand ?? "Product"} · ${item.servings ?? ""}`
            : `${item.effortName} · ${item.totalMin ?? "—"} min · serves ${item.servings ?? "—"}`}
          {item.verified ? "" : " · verification pending"}
        </Text>

        {allergyHit.length > 0 ? (
          <Text style={styles.allergy}>
            Contains {allergyHit.join(", ")} — on your allergy list. Not
            suggested to you; shown here only because you opened it.
          </Text>
        ) : item.allergenCodes.length > 0 ? (
          <Text style={styles.allergenLine}>
            Allergens: {item.allergenCodes.join(", ")}
          </Text>
        ) : null}
        {item.fastCodes.length > 0 ? (
          <Text style={styles.sub}>Contains: {item.fastCodes.join(", ")}</Text>
        ) : (
          <Text style={styles.sub}>Contains none of the fast categories.</Text>
        )}
        <View style={styles.rule} />

        <Text style={sectionLabel}>Per {servings === 1 ? "serving" : `${servings} servings`}</Text>
        <View style={styles.macroRow}>
          {(
            [
              [`${scaled.kcal}`, "kcal"],
              [`${scaled.proteinG}g`, "protein"],
              [`${scaled.carbG}g`, "carbs"],
              [`${scaled.fatG}g`, "fat"],
            ] as const
          ).map(([v, l]) => (
            <View key={l} style={styles.macroCell}>
              <Text style={styles.macroValue}>{v}</Text>
              <Text style={styles.macroLabel}>{l}</Text>
            </View>
          ))}
        </View>
        <View style={styles.rule} />

        {item.ingredients ? (
          <>
            <Text style={sectionLabel}>Ingredients</Text>
            {item.ingredients.split(";").map((ing, i) => (
              <Text key={i} style={styles.body}>
                {ing.trim()}
              </Text>
            ))}
            <View style={styles.rule} />
          </>
        ) : null}

        {item.steps ? (
          <>
            <Text style={sectionLabel}>Method</Text>
            <Text style={styles.body}>{item.steps}</Text>
            <View style={styles.rule} />
          </>
        ) : null}

        <Text style={sectionLabel}>Add to today</Text>
        <View style={styles.addRow}>
          <View style={styles.stepper}>
            <Pressable onPress={() => setServings(Math.max(0.5, servings - 0.5))}>
              <Text style={styles.stepBtn}>−</Text>
            </Pressable>
            <Text style={styles.stepValue}>{servings}</Text>
            <Pressable onPress={() => setServings(servings + 0.5)}>
              <Text style={styles.stepBtn}>+</Text>
            </Pressable>
          </View>
          <View style={styles.meals}>
            {MEALS.map((m) => (
              <Pressable key={m} onPress={() => setMeal(m)}>
                <Text style={[styles.mealChip, meal === m && styles.mealActive]}>
                  {MEAL_LABELS[m]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Pressable style={styles.addBar} onPress={add} accessibilityRole="button">
          <Text style={styles.addBarText}>
            Add · {scaled.kcal} kcal to {MEAL_LABELS[meal]}
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48, gap: 8 },
  title: { fontSize: 20, fontWeight: "600", color: colors.inkNavy },
  sub: { fontSize: 13, color: colors.graySecondary },
  allergy: { fontSize: 13, lineHeight: 18, color: colors.oxblood, fontWeight: "600" },
  allergenLine: { fontSize: 13, color: colors.oxblood },
  body: { fontSize: 14, lineHeight: 21, color: colors.inkNavy },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16, marginVertical: 10 },
  macroRow: { flexDirection: "row", justifyContent: "space-between" },
  macroCell: { alignItems: "center", gap: 2 },
  macroValue: { fontSize: 17, fontWeight: "600", color: colors.inkNavy },
  macroLabel: { fontSize: 11, color: colors.grayLabel, textTransform: "uppercase", letterSpacing: 0.8 },
  addRow: { gap: 10 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 18 },
  stepBtn: { fontSize: 22, color: colors.oxblood, paddingHorizontal: 8 },
  stepValue: { fontSize: 16, fontWeight: "600", color: colors.inkNavy, minWidth: 36, textAlign: "center" },
  meals: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
    marginTop: 6,
  },
  addBarText: { color: colors.paperWhite, fontSize: 14, letterSpacing: 0.5 },
});
