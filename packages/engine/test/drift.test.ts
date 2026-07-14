/**
 * Anti-drift checks: the TypeScript constants in the resolver must match
 * the packaged JSON generated/encoded from the verified documents. If a
 * corpus value changes in review, it changes in the JSON and this test
 * forces the code to follow (and vice versa).
 */

import { describe, expect, it } from "vitest";
import rules from "../../../content/packaged/fasting-rules.json";
import vocabulary from "../../../content/packaged/food-vocabulary.json";
import { EF_AGES, FAST_CATEGORIES, NORM_PROFILES, OF_AGES } from "../src";

describe("resolver constants match content/packaged/fasting-rules.json", () => {
  it("OF binding ages", () => {
    const of = rules.disciplines.of.binding_ages;
    expect(OF_AGES.fastFrom).toBe(of.fast.from_completed_year);
    expect(OF_AGES.fastUntilStartOfYear).toBe(of.fast.until_start_of_year);
    expect(OF_AGES.abstinenceFrom).toBe(of.abstinence.from_completed_year);
  });

  it("EF binding ages and per-profile fast age", () => {
    const ef = rules.disciplines.ef.binding_ages;
    expect(EF_AGES.abstinenceFrom).toBe(ef.abstinence.from_completed_year);
    expect(NORM_PROFILES.us.efFastAgeFrom).toBe(ef.fast.from_completed_year_by_profile.us);
    expect(NORM_PROFILES.universal.efFastAgeFrom).toBe(
      ef.fast.from_completed_year_by_profile.universal,
    );
  });

  it("norm profiles carry the linked values together", () => {
    expect(NORM_PROFILES.us.efFastAgeFrom).toBe(rules.norm_profiles.us.ef_fast_age_from);
    expect(`${NORM_PROFILES.us.efEmberWedSat}_abstinence_ef`).toBe(
      rules.norm_profiles.us.ef_ember_wed_sat,
    );
    expect(NORM_PROFILES.universal.efFastAgeFrom).toBe(
      rules.norm_profiles.universal.ef_fast_age_from,
    );
    expect(`${NORM_PROFILES.universal.efEmberWedSat}_abstinence_ef`).toBe(
      rules.norm_profiles.universal.ef_ember_wed_sat,
    );
    expect(NORM_PROFILES.us.ofFridaySubstitutionPermitted).toBe(
      rules.norm_profiles.us.of_friday_substitution_permitted,
    );
    expect(NORM_PROFILES.universal.ofFridaySubstitutionPermitted).toBe(
      rules.norm_profiles.universal.of_friday_substitution_permitted,
    );
  });

  it("the two rank-lift thresholds are distinct and correctly labeled", () => {
    expect(rules.disciplines.of.rank_lift.threshold).toBe("solemnity");
    expect(rules.disciplines.ef.rank_lift.threshold).toBe("feast_of_precept_or_sunday");
    expect(rules.disciplines.ef.rank_lift.lent_exception).toBe(true);
  });
});

describe("vocabulary matches content/packaged/food-vocabulary.json", () => {
  it("the seven controlled categories, in one source of truth", () => {
    expect([...FAST_CATEGORIES]).toEqual(vocabulary.categories.map((c) => c.code));
  });

  it("sweets is the only dish-driven category", () => {
    const dishDriven = vocabulary.categories
      .filter((c) => c.tagging_mode === "dish")
      .map((c) => c.code);
    expect(dishDriven).toEqual(["sweets"]);
  });
});
