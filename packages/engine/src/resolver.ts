/**
 * The Kanon rule resolver: day-facts in → obligation out.
 *
 * Encodes the two priest-confirmed corpora from
 * content/Kanon_Fasting_Engine_Content_Pack.md (record ids A1–A6, B1–B10
 * kept as ruleRefs). The two disciplines have different days, different
 * binding ages, AND different rank-lift thresholds — encoding one
 * threshold for both calendars is the single likeliest correctness bug
 * (A5 vs B9), so the two branches below share no lift logic.
 *
 * A drift test asserts the constants here match
 * content/packaged/fasting-rules.json.
 */

import {
  Abstinence,
  DayFacts,
  NormProfileId,
  Obligation,
  Recommendation,
  UserProfile,
} from "./types";
import { completedYears, EF_AGES, fastBinds, OF_AGES } from "./ages";

/**
 * One profile carries all country-dependent values together (Part D):
 * the EF fast age and the Ember Wed/Sat rule must move as a unit.
 */
export const NORM_PROFILES: Record<
  NormProfileId,
  {
    efFastAgeFrom: number;
    efEmberWedSat: Extract<Abstinence, "partial" | "complete">;
    ofFridaySubstitutionPermitted: boolean;
  }
> = {
  us: {
    efFastAgeFrom: 18,
    efEmberWedSat: "partial", // the 1949 US modification (B6)
    ofFridaySubstitutionPermitted: true, // USCCB 1966, c. 1253 (A4)
  },
  universal: {
    efFastAgeFrom: 21,
    efEmberWedSat: "complete",
    ofFridaySubstitutionPermitted: false,
  },
};

const PASCHAL_FAST: Recommendation = {
  id: "paschal_fast",
  note: "USCCB recommends continuing the Good Friday fast to the Easter Vigil — a recommendation, never surfaced as binding.",
  binding: false,
};

/** Severity order for combining EF abstinence layers. */
const EF_SEVERITY: Record<Abstinence, number> = {
  none: 0,
  penance_or_abstinence: 1, // OF-only; never produced by the EF branch
  abstinence: 1, //            OF-only; never produced by the EF branch
  partial: 2,
  complete: 3,
};

export function resolveObligation(day: DayFacts, profile: UserProfile): Obligation {
  const age = completedYears(profile.birthDate, day.date);
  return profile.discipline === "of"
    ? resolveOF(day, profile, age)
    : resolveEF(day, profile, age);
}

function resolveOF(day: DayFacts, profile: UserProfile, age: number): Obligation {
  const refs: string[] = [];
  const recommendations: Recommendation[] = [];
  let fast = false;
  let abstinence: Abstinence = "none";
  let lifted: Obligation["lifted"] = null;

  if (day.key === "ash_wednesday") {
    fast = true;
    abstinence = "abstinence";
    refs.push("A1");
  } else if (day.key === "good_friday") {
    fast = true;
    abstinence = "abstinence";
    recommendations.push(PASCHAL_FAST);
    refs.push("A2");
  } else if (day.weekday === "friday") {
    if (day.season === "lent") {
      abstinence = "abstinence";
      refs.push("A3");
    } else {
      abstinence = NORM_PROFILES[profile.normProfile].ofFridaySubstitutionPermitted
        ? "penance_or_abstinence"
        : "abstinence";
      refs.push("A4");
    }
    // OF rank threshold = solemnity (A5) — including Lenten Fridays,
    // c. 1251 "unless a solemnity should fall on a Friday".
    if (day.isSolemnity) {
      abstinence = "none";
      lifted = { by: "solemnity" };
      refs.push("A5");
    }
  }

  return {
    discipline: "of",
    fast,
    abstinence,
    binds: {
      fast: fast && fastBinds(age, OF_AGES.fastFrom),
      abstinence: abstinence !== "none" && age >= OF_AGES.abstinenceFrom,
    },
    lifted,
    recommendations,
    ruleRefs: refs,
  };
}

function resolveEF(day: DayFacts, profile: UserProfile, age: number): Obligation {
  const refs: string[] = [];
  const openFlags: string[] = [];
  const norm = NORM_PROFILES[profile.normProfile];
  let fast = false;
  let abstinence: Abstinence = "none";
  let lifted: Obligation["lifted"] = null;
  let vigilDropped: Obligation["vigilDropped"];

  const raise = (kind: Abstinence) => {
    if (EF_SEVERITY[kind] > EF_SEVERITY[abstinence]) abstinence = kind;
  };

  if (day.key === "ash_wednesday") {
    fast = true;
    raise("complete");
    refs.push("B3");
  }
  if (day.key === "good_friday") {
    fast = true;
    raise("complete");
    refs.push("B4");
  }

  // B7 — retained fast-day vigils. A vigil falling on a Sunday is dropped
  // that year, not anticipated to Saturday (B9).
  if (day.vigil) {
    if (day.weekday === "sunday") {
      vigilDropped = day.vigil;
      refs.push("B7", "B9");
    } else {
      fast = true;
      refs.push("B7");
      if (day.vigil === "christmas") raise("complete");
      if (day.vigil === "pentecost") raise("partial");
      if (day.vigil === "assumption") {
        // Abstinence status open until pinned against Introibo's calendar.
        openFlags.push("assumption-vigil-abstinence");
      }
    }
  }

  // B6 — Ember days: fast; Friday complete, Wed/Sat by norm profile.
  if (day.isEmberDay) {
    fast = true;
    raise(day.weekday === "friday" ? "complete" : norm.efEmberWedSat);
    refs.push("B6");
  }

  // B5 — Lenten weekdays (Ash Wednesday & Good Friday already covered above).
  if (day.season === "lent" && !day.key) {
    if (day.weekday === "friday" || day.weekday === "saturday") {
      fast = true;
      raise("complete");
      refs.push("B5a");
    } else if (day.weekday !== "sunday") {
      fast = true;
      raise("partial"); // flagged: ef-b5-primary-source
      refs.push("B5b");
    }
  }

  // B2 — all Fridays of the year: complete abstinence.
  if (day.weekday === "friday") {
    raise("complete");
    refs.push("B2");
  }

  // B9 — EF rank lift: Sunday or feast of precept lifts a coinciding
  // penitential day, EXCEPT during Lent, where the penance stands.
  // Narrower than the OF solemnity threshold — never shared with it.
  const liftable = fast || abstinence !== "none";
  if (
    liftable &&
    day.season !== "lent" &&
    (day.weekday === "sunday" || day.isFeastOfPrecept)
  ) {
    fast = false;
    abstinence = "none";
    lifted = { by: "sunday_or_precept" };
    refs.push("B9");
  }

  return {
    discipline: "ef",
    fast,
    abstinence,
    binds: {
      fast: fast && fastBinds(age, norm.efFastAgeFrom),
      abstinence: abstinence !== "none" && age >= EF_AGES.abstinenceFrom,
    },
    lifted,
    ...(vigilDropped ? { vigilDropped } : {}),
    recommendations: [],
    ruleRefs: refs,
    ...(openFlags.length ? { openFlags } : {}),
  };
}
