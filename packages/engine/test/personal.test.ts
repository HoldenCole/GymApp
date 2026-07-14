import { describe, expect, it } from "vitest";
import {
  accumulationCheck,
  ACCUMULATION_NOTICE_COPY,
  activeAvoidSet,
  CUSTOM_ADVISORY_COPY,
  DEFAULT_ACCUMULATION_THRESHOLDS,
  fastAppliesOn,
  PersonalFast,
  resumeOn,
  SET_ASIDE_COPY,
  setAsideOn,
} from "../src";

let seq = 0;
function fast(over: Partial<PersonalFast>): PersonalFast {
  seq += 1;
  return {
    id: `f${seq}`,
    origin: "chosen",
    name: "Test commitment",
    avoidCategories: [],
    schedule: { kind: "daily" },
    startDate: "2026-02-18",
    createdAt: "2026-02-18",
    setAsideDates: [],
    ...over,
  };
}

describe("schedules and windows", () => {
  it("applies daily inside the window, not before or after", () => {
    const f = fast({ startDate: "2026-02-18", endDate: "2026-04-04" });
    expect(fastAppliesOn(f, "2026-02-17", "tuesday")).toBe(false);
    expect(fastAppliesOn(f, "2026-03-02", "monday")).toBe(true);
    expect(fastAppliesOn(f, "2026-04-05", "sunday")).toBe(false);
  });

  it("weekday schedules apply only on their days", () => {
    const f = fast({ schedule: { kind: "weekdays", days: ["wednesday", "friday"] } });
    expect(fastAppliesOn(f, "2026-03-04", "wednesday")).toBe(true);
    expect(fastAppliesOn(f, "2026-03-05", "thursday")).toBe(false);
  });

  it("open-ended commitments run until ended", () => {
    const f = fast({ endDate: undefined });
    expect(fastAppliesOn(f, "2030-01-01", "tuesday")).toBe(true);
  });
});

describe("set aside — the breakage rule", () => {
  it("a set-aside day relaxes the commitment for that day only", () => {
    const f = setAsideOn(fast({}), "2026-03-06");
    expect(fastAppliesOn(f, "2026-03-06", "friday")).toBe(false);
    expect(fastAppliesOn(f, "2026-03-07", "saturday")).toBe(true);
  });

  it("resume undoes a set-aside", () => {
    const f = resumeOn(setAsideOn(fast({}), "2026-03-06"), "2026-03-06");
    expect(fastAppliesOn(f, "2026-03-06", "friday")).toBe(true);
  });

  it("the copy carries no sin or shame framing", () => {
    for (const copy of [SET_ASIDE_COPY, ACCUMULATION_NOTICE_COPY, CUSTOM_ADVISORY_COPY]) {
      const lower = copy.toLowerCase();
      expect(lower).not.toContain("you must");
      expect(lower).not.toContain("broke your fast");
      expect(lower).not.toContain("failure");
      expect(lower).not.toContain("cheat");
    }
    expect(SET_ASIDE_COPY).toContain("nothing to confess");
  });
});

describe("the avoid set feeding the food filter", () => {
  it("unions categories across applying commitments", () => {
    const fasts = [
      fast({ avoidCategories: ["meat"] }),
      fast({ avoidCategories: ["sweets", "alcohol"] }),
      fast({
        avoidCategories: ["dairy"],
        schedule: { kind: "weekdays", days: ["friday"] },
      }),
    ];
    const monday = activeAvoidSet(fasts, "2026-03-02", "monday");
    expect(monday.categories.sort()).toEqual(["alcohol", "meat", "sweets"]);
    const friday = activeAvoidSet(fasts, "2026-03-06", "friday");
    expect(friday.categories.sort()).toEqual(["alcohol", "dairy", "meat", "sweets"]);
  });

  it("custom text is advisory — separate from the filterable categories", () => {
    const fasts = [
      fast({ customText: "No coffee", avoidCategories: [] }),
      fast({ avoidCategories: ["sweets"] }),
    ];
    const out = activeAvoidSet(fasts, "2026-03-02", "monday");
    expect(out.categories).toEqual(["sweets"]);
    expect(out.customAdvisory).toEqual(["No coffee"]);
  });

  it("a custom commitment mapped onto a category filters normally", () => {
    // "No butter" mapped by the user onto dairy: the category does the work.
    const f = fast({ customText: "No butter", avoidCategories: ["dairy"] });
    const out = activeAvoidSet([f], "2026-03-02", "monday");
    expect(out.categories).toEqual(["dairy"]);
  });

  it("a set-aside commitment contributes nothing that day", () => {
    const f = setAsideOn(fast({ avoidCategories: ["meat"] }), "2026-03-02");
    expect(activeAvoidSet([f], "2026-03-02", "monday").categories).toEqual([]);
  });
});

describe("the accumulation check — commitments in, never intake", () => {
  it("quiet for a single modest commitment", () => {
    const out = accumulationCheck(
      [fast({ avoidCategories: ["sweets"], schedule: { kind: "weekdays", days: ["friday"] } })],
      "2026-03-02",
    );
    expect(out.signals).toEqual([]);
    expect(out.noticeSuggested).toBe(false);
  });

  it("stacked categories at the threshold fires", () => {
    const out = accumulationCheck(
      [
        fast({
          avoidCategories: ["meat", "dairy", "eggs", "sweets"],
          schedule: { kind: "weekdays", days: ["friday"] },
        }),
      ],
      "2026-03-02",
    );
    expect(out.signals).toContain("stacked_categories");
  });

  it("daily coverage fires most_days_running and free_days_covered", () => {
    const out = accumulationCheck([fast({ avoidCategories: ["meat"] })], "2026-03-02");
    expect(out.signals).toContain("most_days_running");
    expect(out.signals).toContain("free_days_covered");
  });

  it("weekday-only commitments that skip Sunday do not flag free days", () => {
    const out = accumulationCheck(
      [
        fast({
          avoidCategories: ["meat"],
          schedule: {
            kind: "weekdays",
            days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
          },
        }),
      ],
      "2026-03-02",
    );
    expect(out.signals).toContain("most_days_running"); // 6 days ≥ threshold
    expect(out.signals).not.toContain("free_days_covered");
  });

  it("rapid escalation: three commitments inside the window", () => {
    const fasts = [
      fast({ createdAt: "2026-02-25", schedule: { kind: "weekdays", days: ["monday"] } }),
      fast({ createdAt: "2026-02-28", schedule: { kind: "weekdays", days: ["tuesday"] } }),
      fast({ createdAt: "2026-03-01", schedule: { kind: "weekdays", days: ["friday"] } }),
    ];
    const out = accumulationCheck(fasts, "2026-03-02");
    expect(out.signals).toContain("rapid_escalation");
  });

  it("the same three spread out over months do not", () => {
    const fasts = [
      fast({ createdAt: "2025-11-01", schedule: { kind: "weekdays", days: ["monday"] } }),
      fast({ createdAt: "2025-12-15", schedule: { kind: "weekdays", days: ["tuesday"] } }),
      fast({ createdAt: "2026-03-01", schedule: { kind: "weekdays", days: ["friday"] } }),
    ];
    const out = accumulationCheck(fasts, "2026-03-02");
    expect(out.signals).not.toContain("rapid_escalation");
  });

  it("thresholds are parameters, not constants — the reviewer can tune them", () => {
    const strict = { ...DEFAULT_ACCUMULATION_THRESHOLDS, stackedCategories: 2 };
    const fasts = [
      fast({
        avoidCategories: ["meat", "sweets"],
        schedule: { kind: "weekdays", days: ["friday"] },
      }),
    ];
    expect(accumulationCheck(fasts, "2026-03-02").signals).toEqual([]);
    expect(accumulationCheck(fasts, "2026-03-02", strict).signals).toContain(
      "stacked_categories",
    );
  });

  it("expired commitments do not count", () => {
    const out = accumulationCheck(
      [fast({ avoidCategories: ["meat", "dairy", "eggs", "sweets"], endDate: "2026-01-01" })],
      "2026-03-02",
    );
    expect(out.signals).toEqual([]);
  });
});
