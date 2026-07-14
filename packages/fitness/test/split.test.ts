import { describe, expect, it } from "vitest";
import {
  cycleDay,
  REST,
  sessionFor,
  Split,
  SPLIT_TEMPLATES,
  trainingCollision,
  validateSplit,
  WEEKDAYS,
} from "../src";

describe("split templates", () => {
  it("every template is structurally valid", () => {
    for (const t of SPLIT_TEMPLATES) {
      expect(validateSplit(t)).toEqual([]);
    }
  });

  it("templates default Sunday to rest", () => {
    for (const t of SPLIT_TEMPLATES) {
      expect(t.week.sunday).toBe(REST);
    }
  });
});

describe("customization", () => {
  it("sessions take any user names", () => {
    const custom: Split = {
      name: "My week",
      sessions: [
        { id: "a", name: "Squat day" },
        { id: "b", name: "Sprints & carries" },
      ],
      week: {
        monday: "a", tuesday: REST, wednesday: "b", thursday: REST,
        friday: "a", saturday: "b", sunday: REST,
      },
    };
    expect(validateSplit(custom)).toEqual([]);
    expect(sessionFor(custom, "wednesday")?.name).toBe("Sprints & carries");
    expect(sessionFor(custom, "tuesday")).toBeNull();
  });

  it("cycleDay walks rest → each session → rest", () => {
    const ppl = SPLIT_TEMPLATES[2]!;
    let s = ppl;
    expect(s.week.sunday).toBe(REST);
    s = cycleDay(s, "sunday");
    expect(s.week.sunday).toBe("push");
    s = cycleDay(s, "sunday");
    expect(s.week.sunday).toBe("pull");
    s = cycleDay(s, "sunday");
    expect(s.week.sunday).toBe("legs");
    s = cycleDay(s, "sunday");
    expect(s.week.sunday).toBe(REST);
    // the original template is untouched
    expect(ppl.week.sunday).toBe(REST);
  });

  it("validation catches broken edits", () => {
    const broken: Split = {
      name: "broken",
      sessions: [{ id: "a", name: "" }],
      week: {
        monday: "ghost", tuesday: REST, wednesday: REST, thursday: REST,
        friday: REST, saturday: REST, sunday: REST,
      },
    };
    const errors = validateSplit(broken);
    expect(errors.some((e) => e.includes("empty name"))).toBe(true);
    expect(errors.some((e) => e.includes("unknown session"))).toBe(true);
  });

  it("weekday list covers the whole week once", () => {
    expect(WEEKDAYS).toHaveLength(7);
    expect(new Set(WEEKDAYS).size).toBe(7);
  });
});

describe("the fast-day collision nudge", () => {
  const session = (intensity?: "easy" | "moderate" | "hard") => ({
    id: "s",
    name: "Session",
    ...(intensity ? { intensity } : {}),
  });

  it("prompts for a scheduled session on a fast day — unset intensity treated as possibly hard", () => {
    expect(trainingCollision(true, session())).toBe(true);
    expect(trainingCollision(true, session("hard"))).toBe(true);
    expect(trainingCollision(true, session("moderate"))).toBe(true);
  });

  it("an easy session doesn't prompt; neither do rest days or non-fast days", () => {
    expect(trainingCollision(true, session("easy"))).toBe(false);
    expect(trainingCollision(true, null)).toBe(false);
    expect(trainingCollision(false, session("hard"))).toBe(false);
  });
});
