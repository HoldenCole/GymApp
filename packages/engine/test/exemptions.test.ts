import { describe, expect, it } from "vitest";
import {
  EXEMPTION_CHOSEN_NOTE,
  EXEMPTION_CLAIMED_COPY,
  EXEMPTION_COPY,
  obligationAvoids,
  resolveObligation,
  withExemption,
} from "../src";

const ASH_WEDNESDAY = resolveObligation(
  { date: "2026-02-18", weekday: "wednesday", season: "lent", key: "ash_wednesday" },
  { discipline: "of", normProfile: "us", birthDate: "1990-01-01" },
);

describe("withExemption — the person is excused, the law is unchanged", () => {
  it("removes binding without touching the day's statement", () => {
    const excused = withExemption(ASH_WEDNESDAY);
    expect(excused.fast).toBe(true); // the law still says fast
    expect(excused.abstinence).toBe("abstinence");
    expect(excused.binds).toEqual({ fast: false, abstinence: false });
    expect(excused.exempted).toBe(true);
  });

  it("an excused day stops feeding the food filter", () => {
    expect(obligationAvoids(ASH_WEDNESDAY)).toEqual(["meat"]);
    expect(obligationAvoids(withExemption(ASH_WEDNESDAY))).toEqual([]);
  });

  it("takes no reason — the signature itself forbids collecting one", () => {
    // One argument only: there is nowhere to put a justification.
    expect(withExemption.length).toBe(1);
  });
});

describe("the copy keeps the §2 framing", () => {
  it("frames the easing as the Church's provision, not the user opting out", () => {
    expect(EXEMPTION_COPY).toContain("the Church's own provision");
    expect(EXEMPTION_COPY).toContain("not a shortcut");
    expect(EXEMPTION_CLAIMED_COPY).toContain("nothing to track");
  });

  it("no copy demands justification or manufactures doubt", () => {
    for (const copy of [EXEMPTION_COPY, EXEMPTION_CLAIMED_COPY, EXEMPTION_CHOSEN_NOTE]) {
      const lower = copy.toLowerCase();
      expect(lower).not.toContain("are you sure");
      expect(lower).not.toContain("reason");
      expect(lower).not.toContain("prove");
      expect(lower).not.toContain("really");
    }
  });
});
