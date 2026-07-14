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
  ACTIVITY_LABELS,
  ActivityLevel,
  BodyProfile,
  cmToIn,
  energyTargets,
  ffmi,
  GOAL_LABELS,
  Goal,
  heightUnitLabel,
  inToCm,
  kgToLb,
  lbToKg,
  Plan,
  RATE_PRESETS,
  Sex,
  weightUnitLabel,
} from "@kanon/fitness";
import { useProfile } from "../src/profile";
import { useFitness } from "../src/fitness";
import { colors, sectionLabel } from "../src/theme";

/**
 * Plan — body inputs, goal (bulk/cut/maintain), rate, and the override
 * chain. Everything computed is a default; everything is editable.
 *
 * Wellbeing rules kept here: a below-BMR target gets one gentle,
 * informational line (never a block); plan language never borrows fasting
 * language — a cut is a fitness choice, not a fast.
 */
export default function PlanScreen() {
  const { profile } = useProfile();
  const { state, update } = useFitness();
  const { units } = state;

  const body: BodyProfile = state.body ?? {
    sex: "male",
    heightCm: 178,
    weightKg: 82,
    birthDate: profile.birthDate,
    activity: "moderate",
  };
  const plan = state.plan;
  const setBody = (patch: Partial<BodyProfile>) =>
    update({ body: { ...body, ...patch, birthDate: profile.birthDate } });
  const setPlan = (patch: Partial<Plan>) => update({ plan: { ...plan, ...patch } });
  const setOverride = (key: keyof NonNullable<Plan["overrides"]>, raw: string) => {
    const overrides = { ...plan.overrides };
    const n = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(n)) delete overrides[key];
    else overrides[key] = Math.round(n);
    setPlan({ overrides });
  };

  const today = new Date().toISOString().slice(0, 10);
  const targets = state.body ? energyTargets(state.body, plan, today) : null;
  const ffmiResult =
    state.body?.bodyFatPct !== undefined && state.body
      ? ffmi(state.body.weightKg, state.body.heightCm, state.body.bodyFatPct)
      : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={sectionLabel}>Body</Text>
      <View style={styles.rowWrap}>
        {(["male", "female"] as Sex[]).map((s) => (
          <Choice
            key={s}
            label={s === "male" ? "Male" : "Female"}
            active={body.sex === s}
            onPress={() => setBody({ sex: s })}
          />
        ))}
      </View>
      <NumberField
        label={`Height (${heightUnitLabel(units)})`}
        value={units === "metric" ? body.heightCm : cmToIn(body.heightCm)}
        onCommit={(n) => setBody({ heightCm: units === "metric" ? n : inToCm(n) })}
      />
      <NumberField
        label={`Weight (${weightUnitLabel(units)})`}
        value={units === "metric" ? body.weightKg : kgToLb(body.weightKg)}
        onCommit={(n) => setBody({ weightKg: units === "metric" ? n : lbToKg(n) })}
      />
      <NumberField
        label="Body fat % (optional, unlocks FFMI)"
        value={body.bodyFatPct}
        onCommit={(n) => setBody({ bodyFatPct: n > 0 ? n : undefined })}
      />
      <Text style={styles.help}>Birth date comes from Settings.</Text>
      <View style={styles.rowWrap}>
        {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((a) => (
          <Choice
            key={a}
            label={ACTIVITY_LABELS[a].split(" — ")[0] ?? a}
            active={body.activity === a}
            onPress={() => setBody({ activity: a })}
          />
        ))}
      </View>
      {!state.body ? (
        <Pressable style={styles.save} onPress={() => setBody({})}>
          <Text style={styles.saveText}>Use these numbers</Text>
        </Pressable>
      ) : null}
      <View style={styles.rule} />

      <Text style={sectionLabel}>Goal</Text>
      <View style={styles.rowWrap}>
        {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
          <Choice
            key={g}
            label={GOAL_LABELS[g]}
            active={plan.goal === g}
            onPress={() =>
              setPlan({ goal: g, weeklyRatePct: g === "maintain" ? 0 : plan.weeklyRatePct || 0.5 })
            }
          />
        ))}
      </View>
      {plan.goal !== "maintain" ? (
        <>
          <View style={styles.rowWrap}>
            {RATE_PRESETS.filter((p) => p.goal === plan.goal).map((p) => (
              <Choice
                key={p.id}
                label={p.label}
                active={plan.weeklyRatePct === p.weeklyRatePct}
                onPress={() => setPlan({ weeklyRatePct: p.weeklyRatePct })}
              />
            ))}
          </View>
          <NumberField
            label="Custom rate (% of body weight per week)"
            value={plan.weeklyRatePct}
            onCommit={(n) => setPlan({ weeklyRatePct: Math.abs(n) })}
          />
        </>
      ) : null}
      <NumberField
        label="Protein (g per kg)"
        value={plan.proteinPerKg}
        onCommit={(n) => setPlan({ proteinPerKg: n })}
      />
      <NumberField
        label="Fat (g per kg)"
        value={plan.fatPerKg}
        onCommit={(n) => setPlan({ fatPerKg: n })}
      />
      <View style={styles.rule} />

      <Text style={sectionLabel}>Targets</Text>
      {targets ? (
        <>
          <TargetRow label="BMR (Mifflin-St Jeor)" value={`${targets.bmr} kcal`} overridden={targets.overridden.bmr} />
          <TargetRow label="TDEE" value={`${targets.tdee} kcal`} overridden={targets.overridden.tdee} />
          <TargetRow
            label="Daily target"
            value={`${targets.kcal} kcal (${targets.dailyDeltaKcal >= 0 ? "+" : ""}${targets.dailyDeltaKcal})`}
            overridden={targets.overridden.kcal}
          />
          <TargetRow label="Protein" value={`${targets.proteinG} g`} overridden={targets.overridden.proteinG} />
          <TargetRow label="Carbs" value={`${targets.carbG} g`} overridden={targets.overridden.carbG} />
          <TargetRow label="Fat" value={`${targets.fatG} g`} overridden={targets.overridden.fatG} />
          {ffmiResult ? (
            <TargetRow
              label="FFMI (normalized)"
              value={`${ffmiResult.ffmi} (${ffmiResult.normalized})`}
              overridden={false}
            />
          ) : null}
          {targets.kcalBelowBmr ? (
            <Text style={styles.gentle}>
              This target sits below your basal rate. That can be right for a
              season — it's also worth a word with your doctor. Nothing here
              needs undoing; this is just information.
            </Text>
          ) : null}
        </>
      ) : (
        <Text style={styles.help}>Enter your body numbers above to see targets.</Text>
      )}
      <View style={styles.rule} />

      <Text style={sectionLabel}>Overrides</Text>
      <Text style={styles.help}>
        Every computed value is a default. Set any of these to take over;
        clear the field to return to the formula.
      </Text>
      {(
        [
          ["kcal", "Daily kcal"],
          ["proteinG", "Protein (g)"],
          ["carbG", "Carbs (g)"],
          ["fatG", "Fat (g)"],
          ["tdee", "TDEE (kcal)"],
          ["bmr", "BMR (kcal)"],
        ] as const
      ).map(([key, label]) => (
        <OverrideField
          key={key}
          label={label}
          value={plan.overrides?.[key]}
          onCommit={(raw) => setOverride(key, raw)}
        />
      ))}
    </ScrollView>
  );
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.choice, active && styles.choiceActive]}
    >
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
    </Pressable>
  );
}

function NumberField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number | undefined;
  onCommit: (n: number) => void;
}) {
  const display = value === undefined ? "" : String(Math.round(value * 10) / 10);
  const [draft, setDraft] = useState(display);
  const [editing, setEditing] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={editing ? draft : display}
        onFocus={() => {
          setDraft(display);
          setEditing(true);
        }}
        onChangeText={setDraft}
        onBlur={() => {
          setEditing(false);
          const n = Number(draft);
          if (Number.isFinite(n) && draft.trim() !== "") onCommit(n);
        }}
        keyboardType="decimal-pad"
        style={styles.input}
        placeholderTextColor={colors.grayInactive}
      />
    </View>
  );
}

function OverrideField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number | undefined;
  onCommit: (raw: string) => void;
}) {
  const [draft, setDraft] = useState(value === undefined ? "" : String(value));
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onBlur={() => onCommit(draft)}
        placeholder="auto"
        keyboardType="number-pad"
        style={styles.input}
        placeholderTextColor={colors.grayInactive}
      />
    </View>
  );
}

function TargetRow({ label, value, overridden }: { label: string; value: string; overridden: boolean }) {
  return (
    <View style={styles.targetRow}>
      <Text style={styles.fieldLabel}>
        {label}
        {overridden ? " · yours" : ""}
      </Text>
      <Text style={styles.targetValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48, gap: 10 },
  help: { color: colors.graySecondary, fontSize: 13, lineHeight: 18 },
  gentle: { color: colors.graySecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
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
  field: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  fieldLabel: { fontSize: 13, color: colors.graySecondary, flexShrink: 1 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMajor,
    minWidth: 80,
    textAlign: "right",
    paddingVertical: 4,
    fontSize: 15,
    color: colors.inkNavy,
  },
  targetRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  targetValue: { fontSize: 15, fontWeight: "600", color: colors.inkNavy },
  rule: { height: 1, backgroundColor: colors.hairlineMajor, marginHorizontal: -16, marginVertical: 8 },
  save: { backgroundColor: colors.inkNavyDeep, paddingVertical: 12, alignItems: "center", marginTop: 6 },
  saveText: { color: colors.paperWhite, fontSize: 14, letterSpacing: 0.5 },
});
