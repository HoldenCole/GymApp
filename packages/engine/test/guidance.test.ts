import { describe, expect, it } from "vitest";
import {
  GUIDANCE_FRAME,
  GUIDANCE_SECTIONS,
  TRAINING_COLLISION_NUDGE,
} from "../src";

const allCopy = [
  GUIDANCE_FRAME,
  TRAINING_COLLISION_NUDGE,
  ...GUIDANCE_SECTIONS.flatMap((s) => [s.title, ...s.paragraphs]),
].join("\n");

describe("Part 3 guidance — principles, never prescriptions", () => {
  it("no numbers crept in: no zones, percentages, RPE, or calorie figures", () => {
    expect(allCopy).not.toMatch(/\d+\s*%/);
    expect(allCopy).not.toMatch(/\bRPE\b/i);
    expect(allCopy).not.toMatch(/\bbpm\b/i);
    expect(allCopy).not.toMatch(/\d+\s*(kcal|calorie)/i);
    expect(allCopy).not.toMatch(/zone\s*\d/i);
  });

  it("the disclaimer is the FIRST section and names the populations", () => {
    const first = GUIDANCE_SECTIONS[0]!;
    expect(first.id).toBe("disclaimer");
    const text = first.paragraphs.join(" ");
    for (const pop of ["pregnant", "nursing", "diabetic", "medication"]) {
      expect(text).toContain(pop);
    }
    expect(text).toContain("exemptions"); // easing arrives with the warning
  });

  it("the abstinence-day 'normal amount of food' line is present — load-bearing against under-eating", () => {
    expect(allCopy).toContain("a normal amount of food");
  });

  it("5b holds: severity is not an achievement, and no copy rewards it", () => {
    expect(allCopy).toContain("adds nothing spiritually");
    expect(allCopy.toLowerCase()).not.toContain("push through");
    expect(allCopy.toLowerCase()).not.toContain("no excuses");
  });

  it("hydration makes no canonical claim about breaking the fast (record still dangling)", () => {
    const hydration = GUIDANCE_SECTIONS.find((s) => s.id === "hydration")!;
    expect(hydration.paragraphs.join(" ").toLowerCase()).not.toContain("break");
  });

  it("the nudge is a nudge: 'consider', never a command", () => {
    expect(TRAINING_COLLISION_NUDGE).toContain("consider");
    expect(TRAINING_COLLISION_NUDGE.toLowerCase()).not.toContain("must");
  });
});
