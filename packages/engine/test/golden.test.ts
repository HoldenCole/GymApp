/**
 * Golden test suite for the fasting engine (Project Master §4, item 1).
 *
 * A table of dates × user profiles → expected obligation, derived from the
 * priest-confirmed corpora in content/Kanon_Fasting_Engine_Content_Pack.md.
 * Every case cites its corpus record. Day-facts are supplied by the test
 * exactly as the calendar import would supply them — the resolver never
 * re-derives the calendar, so the fixtures stand in for Introibo's data.
 *
 * The dates are real (weekday fixtures are verified against the civil
 * calendar below) so the table doubles as documentation.
 */

import { describe, expect, it } from "vitest";
import {
  Abstinence,
  DayFacts,
  Obligation,
  UserProfile,
  completedYears,
  resolveObligation,
} from "../src";

const ADULT = "1990-01-01"; // age 36 on every fixture date — bound everywhere

function profile(p: Partial<UserProfile>): UserProfile {
  return { discipline: "of", normProfile: "us", birthDate: ADULT, ...p };
}

interface GoldenCase {
  name: string;
  day: DayFacts;
  profile: UserProfile;
  expect: {
    fast: boolean;
    abstinence: Abstinence;
    binds?: { fast: boolean; abstinence: boolean };
    lifted?: Obligation["lifted"];
    vigilDropped?: Obligation["vigilDropped"];
    ruleRefs?: string[];
  };
}

// ——— Fixture days (as the calendar import would supply them) ———————————

const ASH_WEDNESDAY_2026: DayFacts = {
  date: "2026-02-18", weekday: "wednesday", season: "lent", key: "ash_wednesday",
};
const GOOD_FRIDAY_2026: DayFacts = {
  date: "2026-04-03", weekday: "friday", season: "lent", key: "good_friday",
};
/** Solemnity of St. Joseph falling on a Friday of Lent. */
const ST_JOSEPH_2027: DayFacts = {
  date: "2027-03-19", weekday: "friday", season: "lent", isSolemnity: true,
};
/** Sacred Heart: a solemnity on a Friday outside Lent — NOT a feast of precept. */
const SACRED_HEART_2026: DayFacts = {
  date: "2026-06-12", weekday: "friday", season: "ordinary", isSolemnity: true,
};
/** The Assumption falling on a Friday: OF solemnity AND EF feast of precept. */
const ASSUMPTION_2025: DayFacts = {
  date: "2025-08-15", weekday: "friday", season: "ordinary",
  isSolemnity: true, isFeastOfPrecept: true,
};
const ORDINARY_FRIDAY_2026: DayFacts = {
  date: "2026-07-10", weekday: "friday", season: "ordinary",
};
const LENTEN_FRIDAY_2026: DayFacts = {
  date: "2026-02-27", weekday: "friday", season: "lent",
};
const LENTEN_MONDAY_2026: DayFacts = {
  date: "2026-03-02", weekday: "monday", season: "lent",
};
const LENTEN_SATURDAY_2026: DayFacts = {
  date: "2026-03-07", weekday: "saturday", season: "lent",
};
const EMBER_WEDNESDAY_SEP_2026: DayFacts = {
  date: "2026-09-16", weekday: "wednesday", season: "ordinary", isEmberDay: true,
};
const EMBER_FRIDAY_SEP_2026: DayFacts = {
  date: "2026-09-18", weekday: "friday", season: "ordinary", isEmberDay: true,
};
/** Vigil of the Assumption on a Saturday — the retained vigil that must not be missing. */
const ASSUMPTION_VIGIL_2027: DayFacts = {
  date: "2027-08-14", weekday: "saturday", season: "ordinary", vigil: "assumption",
};
/** Vigil of Christmas falling on a Sunday — dropped that year, not anticipated. */
const CHRISTMAS_VIGIL_2028: DayFacts = {
  date: "2028-12-24", weekday: "sunday", season: "advent", vigil: "christmas",
};
/**
 * Dec 7 under the 1962 calendar: the old Immaculate Conception Vigil was
 * OMITTED from the 1962 calendar, so the day-facts carry no vigil at all —
 * absent, not a `none`-obligation vigil (B7). A plain Advent Monday.
 */
const DEC_7_2026: DayFacts = {
  date: "2026-12-07", weekday: "monday", season: "advent",
};

// ——— The golden table ————————————————————————————————————————————————

const CASES: GoldenCase[] = [
  // Ash Wednesday under both disciplines (A1 / B3)
  {
    name: "Ash Wednesday, OF: fast and abstinence",
    day: ASH_WEDNESDAY_2026,
    profile: profile({ discipline: "of" }),
    expect: { fast: true, abstinence: "abstinence", ruleRefs: ["A1"] },
  },
  {
    name: "Ash Wednesday, EF: fast and complete abstinence",
    day: ASH_WEDNESDAY_2026,
    profile: profile({ discipline: "ef" }),
    expect: { fast: true, abstinence: "complete" },
  },

  // Good Friday (A2 / B4) — paschal fast is a recommendation, asserted below
  {
    name: "Good Friday, OF: fast and abstinence",
    day: GOOD_FRIDAY_2026,
    profile: profile({ discipline: "of" }),
    expect: { fast: true, abstinence: "abstinence", ruleRefs: ["A2"] },
  },
  {
    name: "Good Friday, EF: fast and complete abstinence",
    day: GOOD_FRIDAY_2026,
    profile: profile({ discipline: "ef" }),
    expect: { fast: true, abstinence: "complete" },
  },

  // Solemnity-on-Friday lift vs the Lenten non-lift (A5 vs B9)
  {
    name: "St. Joseph on a Lenten Friday, OF: solemnity lifts the abstinence",
    day: ST_JOSEPH_2027,
    profile: profile({ discipline: "of" }),
    expect: { fast: false, abstinence: "none", lifted: { by: "solemnity" } },
  },
  {
    name: "St. Joseph on a Lenten Friday, EF: penance stands (Lent exception; not a precept day)",
    day: ST_JOSEPH_2027,
    profile: profile({ discipline: "ef" }),
    expect: { fast: true, abstinence: "complete", lifted: null },
  },
  {
    name: "Sacred Heart Friday, OF: solemnity lifts",
    day: SACRED_HEART_2026,
    profile: profile({ discipline: "of" }),
    expect: { fast: false, abstinence: "none", lifted: { by: "solemnity" } },
  },
  {
    name: "Sacred Heart Friday, EF: not a feast of precept — Friday abstinence stands",
    day: SACRED_HEART_2026,
    profile: profile({ discipline: "ef" }),
    expect: { fast: false, abstinence: "complete", lifted: null },
  },
  {
    name: "Assumption on a Friday, OF: lifted (solemnity)",
    day: ASSUMPTION_2025,
    profile: profile({ discipline: "of" }),
    expect: { fast: false, abstinence: "none", lifted: { by: "solemnity" } },
  },
  {
    name: "Assumption on a Friday, EF: lifted (feast of precept, outside Lent)",
    day: ASSUMPTION_2025,
    profile: profile({ discipline: "ef" }),
    expect: { fast: false, abstinence: "none", lifted: { by: "sunday_or_precept" } },
  },

  // Ordinary Fridays (A3 / A4 / B2)
  {
    name: "Friday of Lent, OF: abstinence",
    day: LENTEN_FRIDAY_2026,
    profile: profile({ discipline: "of" }),
    expect: { fast: false, abstinence: "abstinence", ruleRefs: ["A3"] },
  },
  {
    name: "Friday outside Lent, OF + US: penance, substitution permitted",
    day: ORDINARY_FRIDAY_2026,
    profile: profile({ discipline: "of", normProfile: "us" }),
    expect: { fast: false, abstinence: "penance_or_abstinence", ruleRefs: ["A4"] },
  },
  {
    name: "Friday outside Lent, OF + universal fallback: abstinence binds as written",
    day: ORDINARY_FRIDAY_2026,
    profile: profile({ discipline: "of", normProfile: "universal" }),
    expect: { fast: false, abstinence: "abstinence", ruleRefs: ["A4"] },
  },
  {
    name: "Friday outside Lent, EF: complete abstinence, no fast",
    day: ORDINARY_FRIDAY_2026,
    profile: profile({ discipline: "ef" }),
    expect: { fast: false, abstinence: "complete", ruleRefs: ["B2"] },
  },

  // Lenten weekdays under EF (B5) — and OF's silence on them
  {
    name: "Lenten Monday, EF: fast + partial abstinence",
    day: LENTEN_MONDAY_2026,
    profile: profile({ discipline: "ef" }),
    expect: { fast: true, abstinence: "partial", ruleRefs: ["B5b"] },
  },
  {
    name: "Lenten Saturday, EF: fast + complete abstinence",
    day: LENTEN_SATURDAY_2026,
    profile: profile({ discipline: "ef" }),
    expect: { fast: true, abstinence: "complete", ruleRefs: ["B5a"] },
  },
  {
    name: "Lenten Monday, OF: no obligation",
    day: LENTEN_MONDAY_2026,
    profile: profile({ discipline: "of" }),
    expect: { fast: false, abstinence: "none" },
  },

  // Ember days under US vs universal (B6) — the two linked values move together
  {
    name: "Ember Wednesday, EF + US: fast + partial abstinence (1949 US norm)",
    day: EMBER_WEDNESDAY_SEP_2026,
    profile: profile({ discipline: "ef", normProfile: "us" }),
    expect: { fast: true, abstinence: "partial", ruleRefs: ["B6"] },
  },
  {
    name: "Ember Wednesday, EF + universal: fast + complete abstinence",
    day: EMBER_WEDNESDAY_SEP_2026,
    profile: profile({ discipline: "ef", normProfile: "universal" }),
    expect: { fast: true, abstinence: "complete", ruleRefs: ["B6"] },
  },
  {
    name: "Ember Friday, EF: fast + complete abstinence under either profile",
    day: EMBER_FRIDAY_SEP_2026,
    profile: profile({ discipline: "ef", normProfile: "us" }),
    expect: { fast: true, abstinence: "complete" },
  },
  {
    name: "Ember days are an EF fact — OF sees an ordinary Wednesday",
    day: EMBER_WEDNESDAY_SEP_2026,
    profile: profile({ discipline: "of" }),
    expect: { fast: false, abstinence: "none" },
  },

  // Vigils (B7): Assumption present, Immaculate Conception absent, Sunday drop
  {
    name: "Vigil of the Assumption, EF: a fast day (the easy gap to miss)",
    day: ASSUMPTION_VIGIL_2027,
    profile: profile({ discipline: "ef" }),
    expect: { fast: true, abstinence: "none", ruleRefs: ["B7"] },
  },
  {
    name: "Vigil of Christmas on a Sunday, EF: dropped that year, not anticipated",
    day: CHRISTMAS_VIGIL_2028,
    profile: profile({ discipline: "ef" }),
    expect: { fast: false, abstinence: "none", vigilDropped: "christmas" },
  },
  {
    name: "Dec 7 (old Immaculate Conception Vigil), EF: no vigil exists in 1962 — no obligation",
    day: DEC_7_2026,
    profile: profile({ discipline: "ef" }),
    expect: { fast: false, abstinence: "none" },
  },

  // Binding ages (A6 / B10) — the OF↔EF switch changes ages, not just days
  {
    name: "OF, age 17 on Ash Wednesday: abstinence binds, fast does not",
    day: ASH_WEDNESDAY_2026,
    profile: profile({ discipline: "of", birthDate: "2008-06-01" }),
    expect: { fast: true, abstinence: "abstinence", binds: { fast: false, abstinence: true } },
  },
  {
    name: "OF, age 18 on Ash Wednesday: both bind",
    day: ASH_WEDNESDAY_2026,
    profile: profile({ discipline: "of", birthDate: "2008-01-01" }),
    expect: { fast: true, abstinence: "abstinence", binds: { fast: true, abstinence: true } },
  },
  {
    name: "OF, age 13 on a Lenten Friday: abstinence does not bind",
    day: LENTEN_FRIDAY_2026,
    profile: profile({ discipline: "of", birthDate: "2012-06-01" }),
    expect: { fast: false, abstinence: "abstinence", binds: { fast: false, abstinence: false } },
  },
  {
    name: "OF, age 58: fast still binds",
    day: ASH_WEDNESDAY_2026,
    profile: profile({ discipline: "of", birthDate: "1967-06-01" }),
    expect: { fast: true, abstinence: "abstinence", binds: { fast: true, abstinence: true } },
  },
  {
    name: "OF, age 59 (60th year begun): fast no longer binds, abstinence does — reading of 'start of 60th' flagged for reviewer",
    day: ASH_WEDNESDAY_2026,
    profile: profile({ discipline: "of", birthDate: "1967-01-01" }),
    expect: { fast: true, abstinence: "abstinence", binds: { fast: false, abstinence: true } },
  },
  {
    name: "EF, age 8 on a Lenten Friday: abstinence binds (from completed 7th year)",
    day: LENTEN_FRIDAY_2026,
    profile: profile({ discipline: "ef", birthDate: "2018-01-01" }),
    expect: { fast: true, abstinence: "complete", binds: { fast: false, abstinence: true } },
  },
  {
    name: "Same 8-year-old under OF: abstinence does NOT bind (from 14) — the switch changes ages",
    day: LENTEN_FRIDAY_2026,
    profile: profile({ discipline: "of", birthDate: "2018-01-01" }),
    expect: { fast: false, abstinence: "abstinence", binds: { fast: false, abstinence: false } },
  },
  {
    name: "EF, age 19 + US profile: fast binds (US indult, 18)",
    day: LENTEN_MONDAY_2026,
    profile: profile({ discipline: "ef", normProfile: "us", birthDate: "2007-01-01" }),
    expect: { fast: true, abstinence: "partial", binds: { fast: true, abstinence: true } },
  },
  {
    name: "EF, age 19 + universal profile: fast does NOT bind (universal 1962 age, 21)",
    day: LENTEN_MONDAY_2026,
    profile: profile({ discipline: "ef", normProfile: "universal", birthDate: "2007-01-01" }),
    expect: { fast: true, abstinence: "partial", binds: { fast: false, abstinence: true } },
  },
];

// ——— Runner ———————————————————————————————————————————————————————————

describe("fixture integrity", () => {
  it("every fixture weekday matches the civil calendar", () => {
    const names = [
      "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
    ];
    for (const c of CASES) {
      const actual = names[new Date(`${c.day.date}T00:00:00Z`).getUTCDay()];
      expect(`${c.day.date} is ${actual}`).toBe(`${c.day.date} is ${c.day.weekday}`);
    }
  });

  it("adult profile is of binding age on every fixture date", () => {
    for (const c of CASES) {
      const age = completedYears(ADULT, c.day.date);
      expect(age).toBeGreaterThanOrEqual(18);
      expect(age).toBeLessThan(59);
    }
  });
});

describe("golden table: dates × profiles → expected obligation", () => {
  for (const c of CASES) {
    it(c.name, () => {
      const got = resolveObligation(c.day, c.profile);
      expect(got.fast).toBe(c.expect.fast);
      expect(got.abstinence).toBe(c.expect.abstinence);
      // Unspecified means "no lift expected" — every lifting case names its lift.
      expect(got.lifted).toEqual(c.expect.lifted ?? null);
      if (c.expect.binds) expect(got.binds).toEqual(c.expect.binds);
      if (c.expect.vigilDropped) expect(got.vigilDropped).toBe(c.expect.vigilDropped);
      for (const ref of c.expect.ruleRefs ?? []) {
        expect(got.ruleRefs).toContain(ref);
      }
    });
  }
});

describe("specific assertions beyond the table", () => {
  it("Good Friday OF carries the paschal fast as a recommendation, never binding", () => {
    const got = resolveObligation(GOOD_FRIDAY_2026, profile({ discipline: "of" }));
    const rec = got.recommendations.find((r) => r.id === "paschal_fast");
    expect(rec).toBeDefined();
    expect(rec!.binding).toBe(false);
  });

  it("EF Good Friday carries no OF recommendation — corpora never cross-wire", () => {
    const got = resolveObligation(GOOD_FRIDAY_2026, profile({ discipline: "ef" }));
    expect(got.recommendations).toEqual([]);
  });

  it("the Assumption Vigil result carries its open abstinence flag", () => {
    const got = resolveObligation(ASSUMPTION_VIGIL_2027, profile({ discipline: "ef" }));
    expect(got.openFlags).toContain("assumption-vigil-abstinence");
  });

  it("aging across the OF fast threshold flips binding on the birthday itself", () => {
    const before = resolveObligation(
      { ...ASH_WEDNESDAY_2026, date: "2026-02-18" },
      profile({ discipline: "of", birthDate: "2008-02-19" }), // turns 18 the day after
    );
    expect(before.binds.fast).toBe(false);
    const after = resolveObligation(
      GOOD_FRIDAY_2026,
      profile({ discipline: "of", birthDate: "2008-02-19" }), // 18 by April
    );
    expect(after.binds.fast).toBe(true);
  });

  it("a vigil dropped on Sunday reports the drop — it is not silently a free day", () => {
    const got = resolveObligation(CHRISTMAS_VIGIL_2028, profile({ discipline: "ef" }));
    expect(got.vigilDropped).toBe("christmas");
    expect(got.ruleRefs).toContain("B9");
  });
});
