import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { activeAvoidSet, FAST_CATEGORIES, obligationAvoids } from "@kanon/engine";
import { CatalogItem, filterCatalog } from "@kanon/food";
import { CATALOG } from "../../src/catalog";
import { todayISO, todayWeekday } from "../../src/dates";
import { useFasts } from "../../src/fasts";
import { useFood } from "../../src/food";
import { useTodaysObligation } from "../../src/obligation";
import { colors, sectionLabel } from "../../src/theme";

/**
 * Food — the browse (UI brief §3.4): the recipe database behind stackable
 * facets. Allergies apply silently and absolutely (set in Settings).
 * The fast-rule facet here is the user's manual layer; the engine's
 * day-aware pre-filter joins it when the calendar import lands.
 */
export default function Food() {
  const router = useRouter();
  const { state } = useFood();
  const { state: fastsState } = useFasts();
  const [query, setQuery] = useState("");
  const [avoid, setAvoid] = useState<string[]>([]);
  const [effortMax, setEffortMax] = useState<number | undefined>(undefined);
  const [abstinenceOnly, setAbstinenceOnly] = useState(false);
  const [goalTag, setGoalTag] = useState<string | undefined>(undefined);
  const [tradition, setTradition] = useState<string | undefined>(undefined);

  // Day-aware pre-filtering (UI brief §4 layer 2): the engine's church
  // obligation and the user's chosen commitments apply automatically;
  // the manual facets stack on top. EF partial abstinence deliberately
  // does not hard-filter (meat is permitted at the principal meal).
  const { obligation } = useTodaysObligation();
  const personalToday = useMemo(
    () => activeAvoidSet(fastsState.fasts, todayISO(), todayWeekday()),
    [fastsState.fasts],
  );
  const churchToday = useMemo(() => obligationAvoids(obligation), [obligation]);

  const results = useMemo(
    () =>
      filterCatalog(CATALOG, {
        query,
        allergies: state.allergies,
        avoidCategories: [
          ...new Set([...avoid, ...personalToday.categories, ...churchToday]),
        ],
        dislikedCategories: state.dislikedCategories,
        effortMax,
        abstinenceFriendlyOnly: abstinenceOnly,
        goalTag,
        tradition,
      }),
    [
      query,
      avoid,
      effortMax,
      abstinenceOnly,
      goalTag,
      tradition,
      state.allergies,
      state.dislikedCategories,
      personalToday,
      churchToday,
    ],
  );

  const toggleAvoid = (c: string) =>
    setAvoid((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={results}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CatalogRow item={item} onPress={() => router.push(`/recipe/${item.id}`)} />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search recipes & products"
            placeholderTextColor={colors.grayInactive}
            style={styles.search}
            autoCapitalize="none"
          />

          <Text style={sectionLabel}>Fast rule</Text>
          <View style={styles.facets}>
            <Facet
              label="abstinence-friendly"
              active={abstinenceOnly}
              onPress={() => setAbstinenceOnly((v) => !v)}
            />
            {FAST_CATEGORIES.map((c) => (
              <Facet
                key={c}
                label={`no ${c}`}
                active={avoid.includes(c)}
                onPress={() => toggleAvoid(c)}
              />
            ))}
          </View>

          <Text style={sectionLabel}>Effort</Text>
          <View style={styles.facets}>
            {[1, 2, 3, 4].map((e) => (
              <Facet
                key={e}
                label={`≤ ${["Assembly", "Quick", "Standard", "Project"][e - 1]}`}
                active={effortMax === e}
                onPress={() => setEffortMax(effortMax === e ? undefined : e)}
              />
            ))}
          </View>

          <Text style={sectionLabel}>Goal</Text>
          <View style={styles.facets}>
            {(
              [
                ["high-protein", "high-protein"],
                ["fast-compatible / light", "light"],
                ["post-workout", "post-workout"],
              ] as const
            ).map(([tag, label]) => (
              <Facet
                key={tag}
                label={label}
                active={goalTag === tag}
                onPress={() => setGoalTag(goalTag === tag ? undefined : tag)}
              />
            ))}
          </View>

          <Text style={sectionLabel}>Tradition</Text>
          <View style={styles.facets}>
            {["Joseph", "Benedict", "Hyacinth", "Therese", "Anthony"].map((p) => (
              <Facet
                key={p}
                label={`St. ${p === "Therese" ? "Thérèse" : p}`}
                active={tradition === p}
                onPress={() => setTradition(tradition === p ? undefined : p)}
              />
            ))}
          </View>

          {churchToday.length > 0 ? (
            <Text style={styles.churchLine}>
              Today is a day of abstinence — meatless, fish allowed. Applied
              automatically.
            </Text>
          ) : null}
          {personalToday.categories.length > 0 ? (
            <Text style={styles.personalLine}>
              Your commitments today: {personalToday.categories.map((c) => `no ${c}`).join(" · ")}
            </Text>
          ) : null}
          {personalToday.customAdvisory.length > 0 ? (
            <Text style={styles.advisoryLine}>
              Tracked but not filtered: {personalToday.customAdvisory.join("; ")}
            </Text>
          ) : null}
          <Text style={styles.count}>
            {results.length} of {CATALOG.length}
            {state.allergies.length
              ? ` · allergies filtered (${state.allergies.join(", ")})`
              : ""}
            {"  "}
            <Link href="/add-food" style={styles.link}>
              Add custom food
            </Link>
          </Text>
          <View style={styles.rule} />
        </View>
      }
    />
  );
}

function Facet({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: active }}>
      <Text style={[styles.facet, active && styles.facetActive]}>{label}</Text>
    </Pressable>
  );
}

function CatalogRow({ item, onPress }: { item: CatalogItem; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {item.type === "product" ? item.brand ?? "Product" : item.effortName}
          {item.abstinenceFriendly ? " · abstinence-friendly" : ""}
          {item.fastCodes.length ? ` · ${item.fastCodes.join(" ")}` : ""}
        </Text>
      </View>
      <Text style={styles.rowMacros}>
        {item.macros.kcal} kcal · {item.macros.proteinG}g P
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingBottom: 32 },
  header: { paddingHorizontal: 16, paddingTop: 64, gap: 10 },
  search: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMajor,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.inkNavy,
  },
  facets: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  facet: {
    borderWidth: 1,
    borderColor: colors.hairlineMajor,
    color: colors.graySecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    overflow: "hidden",
  },
  facetActive: {
    borderColor: colors.inkNavy,
    color: colors.inkNavy,
    fontWeight: "600",
  },
  count: { color: colors.grayLabel, fontSize: 12, marginTop: 2 },
  churchLine: { color: colors.oxblood, fontSize: 12, fontWeight: "600" },
  personalLine: { color: colors.graySecondary, fontSize: 12 },
  advisoryLine: { color: colors.grayLabel, fontSize: 12 },
  link: { color: colors.oxblood },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16, marginTop: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMinor,
  },
  rowMain: { flexShrink: 1, gap: 2 },
  rowTitle: { fontSize: 15, color: colors.inkNavy },
  rowSub: { fontSize: 12, color: colors.grayLabel },
  rowMacros: { fontSize: 13, fontWeight: "600", color: colors.graySecondary },
});
