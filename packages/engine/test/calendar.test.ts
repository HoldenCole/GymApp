/**
 * Seam tests run against the actual provisional fixture: the loader
 * validates it, and the resolver produces the golden expectations from
 * real imported day-facts — the same assertions that will gate the
 * verified Introibo import when it lands.
 */

import { describe, expect, it } from "vitest";
import fixture from "../../../data/packaged/calendar-2026-provisional.json";
import {
  CalendarData,
  loadCalendar,
  resolveObligation,
  UserProfile,
  validateCalendar,
} from "../src";

const data = fixture as CalendarData;
const calendar = loadCalendar(data);

const user = (over: Partial<UserProfile> = {}): UserProfile => ({
  discipline: "of",
  normProfile: "us",
  birthDate: "1990-01-01",
  ...over,
});

function resolve(date: string, profile: UserProfile) {
  const facts = calendar.dayFacts(date, profile.discipline);
  expect(facts, `${date} missing from calendar`).toBeDefined();
  return resolveObligation(facts!, profile);
}

describe("the import validates and loads", () => {
  it("passes structural validation", () => {
    expect(validateCalendar(data)).toEqual([]);
  });

  it("covers the whole year for both calendars", () => {
    expect(data.records).toHaveLength(365 * 2);
    expect(calendar.meta.provenance).toBe("provisional");
  });

  it("dates outside coverage return undefined, never fabricated facts", () => {
    expect(calendar.dayFacts("2027-01-01", "of")).toBeUndefined();
  });

  it("the omitted vigils are absent: Dec 7 EF carries no vigil fact", () => {
    expect(calendar.dayFacts("2026-12-07", "ef")!.vigil).toBeUndefined();
  });
});

describe("resolver × imported facts — the golden expectations hold", () => {
  it("Ash Wednesday under both disciplines", () => {
    const of = resolve("2026-02-18", user());
    expect([of.fast, of.abstinence]).toEqual([true, "abstinence"]);
    const ef = resolve("2026-02-18", user({ discipline: "ef" }));
    expect([ef.fast, ef.abstinence]).toEqual([true, "complete"]);
  });

  it("Ember Friday of Lent doubles as a Lenten Friday (EF fast + complete)", () => {
    const ef = resolve("2026-02-27", user({ discipline: "ef" }));
    expect([ef.fast, ef.abstinence]).toEqual([true, "complete"]);
    expect(ef.ruleRefs).toContain("B6");
    const of = resolve("2026-02-27", user());
    expect([of.fast, of.abstinence]).toEqual([false, "abstinence"]);
  });

  it("Sacred Heart Friday: OF lifts, EF Friday abstinence stands", () => {
    const of = resolve("2026-06-12", user());
    expect(of.lifted).toEqual({ by: "solemnity" });
    const ef = resolve("2026-06-12", user({ discipline: "ef" }));
    expect(ef.abstinence).toBe("complete");
    expect(ef.lifted).toBeNull();
  });

  it("Christmas on a Friday lifts under both (solemnity / precept outside Lent)", () => {
    const of = resolve("2026-12-25", user());
    expect(of.lifted).toEqual({ by: "solemnity" });
    const ef = resolve("2026-12-25", user({ discipline: "ef" }));
    expect(ef.lifted).toEqual({ by: "sunday_or_precept" });
  });

  it("Vigil of the Assumption on a Friday: EF fast + Friday complete abstinence, flag carried", () => {
    const ef = resolve("2026-08-14", user({ discipline: "ef" }));
    expect(ef.fast).toBe(true);
    expect(ef.abstinence).toBe("complete"); // B2 governs the Friday
    expect(ef.openFlags).toContain("assumption-vigil-abstinence");
  });

  it("Christmas Vigil (Thursday): EF fast + complete abstinence", () => {
    const ef = resolve("2026-12-24", user({ discipline: "ef" }));
    expect([ef.fast, ef.abstinence]).toEqual([true, "complete"]);
  });

  it("Pentecost Vigil (Saturday): EF fast + partial abstinence", () => {
    const ef = resolve("2026-05-23", user({ discipline: "ef" }));
    expect([ef.fast, ef.abstinence]).toEqual([true, "partial"]);
  });

  it("September Ember Wednesday: partial under US, complete under universal", () => {
    const us = resolve("2026-09-16", user({ discipline: "ef", normProfile: "us" }));
    expect(us.abstinence).toBe("partial");
    const universal = resolve(
      "2026-09-16",
      user({ discipline: "ef", normProfile: "universal" }),
    );
    expect(universal.abstinence).toBe("complete");
  });

  it("an ordinary Friday: OF US penance-or-abstinence; celebration label flows through", () => {
    const of = resolve("2026-07-10", user());
    expect(of.abstinence).toBe("penance_or_abstinence");
    expect(calendar.dayFacts("2026-06-12", "of")!.celebration).toBe(
      "The Most Sacred Heart of Jesus",
    );
  });
});

describe("validation catches broken imports", () => {
  it("weekday off-by-one, EF flags on OF records, unknown vigils", () => {
    const bad: CalendarData = {
      meta: data.meta,
      records: [
        { date: "2026-07-10", calendar: "of", weekday: "thursday", season: "ordinary" },
        {
          date: "2026-07-11",
          calendar: "of",
          weekday: "saturday",
          season: "ordinary",
          is_ember_day: true,
        },
        {
          date: "2026-12-07",
          calendar: "ef",
          weekday: "monday",
          season: "advent",
          vigil: "immaculate_conception" as never,
        },
      ],
    };
    const errors = validateCalendar(bad);
    expect(errors.some((e) => e.includes("≠ civil"))).toBe(true);
    expect(errors.some((e) => e.includes("EF-only facts"))).toBe(true);
    expect(errors.some((e) => e.includes("unknown vigil"))).toBe(true);
  });
});
