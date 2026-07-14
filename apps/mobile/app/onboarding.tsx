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
import {
  DISCIPLINE_ORDER,
  DISCIPLINES,
  NORM_PROFILE_INFO,
  NORM_PROFILE_ORDER,
} from "@kanon/engine";
import {
  ACTIVITY_LABELS,
  ActivityLevel,
  cmToIn,
  GOAL_LABELS,
  Goal,
  heightUnitLabel,
  inToCm,
  lbToKg,
  RATE_PRESETS,
  Sex,
  SPLIT_TEMPLATES,
  UnitSystem,
  weightUnitLabel,
} from "@kanon/fitness";
import patrons from "@kanon/content/packaged/patrons.json";
import { useFitness } from "../src/fitness";
import { AppProfile, PatronId, useProfile } from "../src/profile";
import { colors, sacredSerif, sectionLabel } from "../src/theme";

/**
 * Onboarding (Project Master §4, item 4): its ORDER encodes fitness-first
 * — body, goal, and split before the faith layer — and it captures
 * exactly the data model's inputs. Everything set here is editable later
 * in Settings / Plan / Split; nothing is locked in.
 */

type Step = "welcome" | "body" | "goal" | "split" | "discipline" | "patron";
const STEPS: Step[] = ["welcome", "body", "goal", "split", "discipline", "patron"];

const PATRON_IDS: PatronId[] = ["benedict", "joseph", "hyacinth", "therese", "anthony"];

export default function Onboarding() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const { state: fitness, update } = useFitness();

  const [step, setStep] = useState<Step>("welcome");
  const [units, setUnits] = useState<UnitSystem>(fitness.units);
  const [sex, setSex] = useState<Sex>("male");
  const [heightRaw, setHeightRaw] = useState("");
  const [weightRaw, setWeightRaw] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [ratePct, setRatePct] = useState(0);
  const [splitIdx, setSplitIdx] = useState(0);
  const [draft, setDraft] = useState<Partial<AppProfile>>({});
  const [patronId, setPatronId] = useState<PatronId>("benedict");

  const idx = STEPS.indexOf(step);
  const next = () => setStep(STEPS[Math.min(idx + 1, STEPS.length - 1)] as Step);
  const back = () => setStep(STEPS[Math.max(idx - 1, 0)] as Step);

  const num = (s: string) => (s.trim() !== "" && Number.isFinite(Number(s)) ? Number(s) : null);
  const bodyValid =
    num(heightRaw) !== null &&
    num(weightRaw) !== null &&
    /^\d{4}-\d{2}-\d{2}$/.test(birthDate);

  const commitBody = () => {
    const h = num(heightRaw)!;
    const w = num(weightRaw)!;
    update({
      units,
      body: {
        sex,
        heightCm: units === "metric" ? h : inToCm(h),
        weightKg: units === "metric" ? w : lbToKg(w),
        birthDate,
        activity,
      },
    });
    next();
  };

  const commitGoal = () => {
    update({
      plan: {
        ...fitness.plan,
        goal,
        weeklyRatePct: goal === "maintain" ? 0 : ratePct || 0.5,
      },
    });
    next();
  };

  const commitSplit = () => {
    update({ split: structuredClone(SPLIT_TEMPLATES[splitIdx]!) });
    next();
  };

  const finish = () => {
    setProfile({
      ...profile,
      ...draft,
      birthDate: /^\d{4}-\d{2}-\d{2}$/.test(birthDate) ? birthDate : profile.birthDate,
      patronId,
      onboarded: true,
    });
    router.replace("/(tabs)");
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={[styles.masthead, sacredSerif]}>KANON</Text>
      <Text style={styles.progress}>
        {idx + 1} / {STEPS.length}
      </Text>

      {step === "welcome" ? (
        <>
          <Text style={[styles.lede, sacredSerif]}>A rule of life for the body.</Text>
          <Text style={styles.body}>
            Kanon is a nutrition and training tracker that also knows the
            Church's calendar and fasting law. A few questions set up your
            plan — training first, then the fast. Everything can be changed
            later.
          </Text>
          <Primary label="Begin" onPress={next} />
        </>
      ) : null}

      {step === "body" ? (
        <>
          <Text style={sectionLabel}>Your body</Text>
          <Row>
            {(["imperial", "metric"] as UnitSystem[]).map((u) => (
              <Chip
                key={u}
                label={u === "imperial" ? "lb / in" : "kg / cm"}
                active={units === u}
                onPress={() => setUnits(u)}
              />
            ))}
          </Row>
          <Row>
            {(["male", "female"] as Sex[]).map((s) => (
              <Chip
                key={s}
                label={s === "male" ? "Male" : "Female"}
                active={sex === s}
                onPress={() => setSex(s)}
              />
            ))}
          </Row>
          <Field
            label={`Height (${heightUnitLabel(units)})`}
            value={heightRaw}
            onChange={setHeightRaw}
            placeholder={units === "metric" ? "178" : "70"}
          />
          <Field
            label={`Weight (${weightUnitLabel(units)})`}
            value={weightRaw}
            onChange={setWeightRaw}
            placeholder={units === "metric" ? "82" : "180"}
          />
          <Field
            label="Birth date"
            value={birthDate}
            onChange={setBirthDate}
            placeholder="YYYY-MM-DD"
            keyboard="default"
          />
          <Text style={styles.help}>
            Age shapes your calorie baseline — and which fasting obligations
            bind you.
          </Text>
          <View style={styles.chipCol}>
            {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((a) => (
              <Chip
                key={a}
                label={ACTIVITY_LABELS[a]}
                active={activity === a}
                onPress={() => setActivity(a)}
              />
            ))}
          </View>
          <Nav onBack={back} onNext={commitBody} nextEnabled={bodyValid} />
        </>
      ) : null}

      {step === "goal" ? (
        <>
          <Text style={sectionLabel}>Your goal</Text>
          <View style={styles.chipCol}>
            {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
              <Chip
                key={g}
                label={GOAL_LABELS[g]}
                active={goal === g}
                onPress={() => {
                  setGoal(g);
                  setRatePct(g === "maintain" ? 0 : 0.5);
                }}
              />
            ))}
          </View>
          {goal !== "maintain" ? (
            <View style={styles.chipCol}>
              {RATE_PRESETS.filter((p) => p.goal === goal).map((p) => (
                <Chip
                  key={p.id}
                  label={p.label}
                  active={ratePct === p.weeklyRatePct}
                  onPress={() => setRatePct(p.weeklyRatePct)}
                />
              ))}
            </View>
          ) : null}
          <Text style={styles.help}>
            Rates, macros, and every computed number stay adjustable — and
            overridable — in Plan.
          </Text>
          <Nav onBack={back} onNext={commitGoal} nextEnabled />
        </>
      ) : null}

      {step === "split" ? (
        <>
          <Text style={sectionLabel}>Your week</Text>
          <View style={styles.chipCol}>
            {SPLIT_TEMPLATES.map((t, i) => (
              <Chip
                key={t.name}
                label={t.name}
                active={splitIdx === i}
                onPress={() => setSplitIdx(i)}
              />
            ))}
          </View>
          <Text style={styles.help}>
            A starting point — rename sessions and reshape the week any time
            in Split.
          </Text>
          <Nav onBack={back} onNext={commitSplit} nextEnabled />
        </>
      ) : null}

      {step === "discipline" ? (
        <>
          <Text style={sectionLabel}>The fast</Text>
          <View style={styles.chipCol}>
            {DISCIPLINE_ORDER.map((d) => (
              <Pressable key={d} onPress={() => setDraft({ ...draft, discipline: d })}>
                <View
                  style={[
                    styles.option,
                    (draft.discipline ?? "of") === d && styles.optionActive,
                  ]}
                >
                  <Text style={styles.optionLabel}>{DISCIPLINES[d].label}</Text>
                  <Text style={styles.optionSub}>{DISCIPLINES[d].sublabel}</Text>
                </View>
              </Pressable>
            ))}
          </View>
          <Text style={styles.help}>
            If you're unsure, the current discipline is the usual answer —
            and a good question for your pastor.
          </Text>
          <Text style={sectionLabel}>Home country</Text>
          <View style={styles.chipCol}>
            {NORM_PROFILE_ORDER.map((n) => (
              <Chip
                key={n}
                label={NORM_PROFILE_INFO[n].label}
                active={(draft.normProfile ?? "us") === n}
                onPress={() => setDraft({ ...draft, normProfile: n })}
              />
            ))}
          </View>
          <Nav onBack={back} onNext={next} nextEnabled />
        </>
      ) : null}

      {step === "patron" ? (
        <>
          <Text style={sectionLabel}>A companion</Text>
          <Text style={styles.body}>
            Five patrons, five emphases. Benedict — balanced, sustainable —
            is the natural start; change any time.
          </Text>
          <View style={styles.chipCol}>
            {PATRON_IDS.map((id) => {
              const saint = patrons.saints[id];
              return (
                <Pressable key={id} onPress={() => setPatronId(id)}>
                  <View style={[styles.option, patronId === id && styles.optionActive]}>
                    <Text style={styles.optionLabel}>{saint.name}</Text>
                    <Text style={[styles.optionSub, sacredSerif]}>
                      {saint.selector_descriptor}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.navRow}>
            <Pressable onPress={back}>
              <Text style={styles.backLink}>Back</Text>
            </Pressable>
          </View>
          <Primary label="Begin the rule" onPress={finish} />
        </>
      ) : null}
    </ScrollView>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: active }}>
      <Text style={[styles.chip, active && styles.chipActive]}>{label}</Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard = "decimal-pad",
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder: string;
  keyboard?: "decimal-pad" | "default";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.grayInactive}
        keyboardType={keyboard}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

function Nav({
  onBack,
  onNext,
  nextEnabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextEnabled: boolean;
}) {
  return (
    <>
      <View style={styles.navRow}>
        <Pressable onPress={onBack}>
          <Text style={styles.backLink}>Back</Text>
        </Pressable>
      </View>
      <Primary label="Continue" onPress={onNext} disabled={!nextEnabled} />
    </>
  );
}

function Primary({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.primary, disabled && styles.primaryDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperWhite },
  content: { paddingHorizontal: 20, paddingTop: 84, paddingBottom: 48, gap: 12 },
  masthead: { fontSize: 24, letterSpacing: 8, color: colors.inkNavy },
  progress: { fontSize: 11, letterSpacing: 1.5, color: colors.grayLabel },
  lede: { fontSize: 20, fontStyle: "italic", color: colors.inkNavy, marginTop: 8 },
  body: { fontSize: 14, lineHeight: 21, color: colors.graySecondary },
  help: { fontSize: 12, lineHeight: 17, color: colors.grayLabel },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipCol: { gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.hairlineMajor,
    color: colors.graySecondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 13,
    overflow: "hidden",
  },
  chipActive: { borderColor: colors.inkNavy, color: colors.inkNavy, fontWeight: "600" },
  field: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  fieldLabel: { fontSize: 13, color: colors.graySecondary },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineMajor,
    minWidth: 120,
    textAlign: "right",
    paddingVertical: 5,
    fontSize: 15,
    color: colors.inkNavy,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.hairlineMajor,
    padding: 12,
    gap: 3,
  },
  optionActive: { borderColor: colors.inkNavy },
  optionLabel: { fontSize: 15, fontWeight: "600", color: colors.inkNavy },
  optionSub: { fontSize: 12.5, color: colors.graySecondary },
  navRow: { flexDirection: "row", marginTop: 6 },
  backLink: { fontSize: 13, color: colors.grayLabel },
  primary: {
    backgroundColor: colors.inkNavyDeep,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryDisabled: { opacity: 0.4 },
  primaryText: { color: colors.paperWhite, fontSize: 14, letterSpacing: 0.5 },
});
