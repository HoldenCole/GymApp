/**
 * Binding-age math. Civil date arithmetic only — no liturgical logic.
 *
 * Reading of "to the start of the 60th year" (OF c. 1252; EF B10): the
 * 60th year of life begins on the 59th birthday, so the fast obligation
 * ceases once the 59th birthday is reached (completed years >= 59).
 * Flagged in the golden suite for the dual-competence reviewer to confirm
 * against the popular "ages 18–59 inclusive" phrasing.
 */

/** Completed years of age on a given date. */
export function completedYears(birthDateISO: string, onDateISO: string): number {
  const [by, bm, bd] = birthDateISO.split("-").map(Number) as [number, number, number];
  const [oy, om, od] = onDateISO.split("-").map(Number) as [number, number, number];
  let years = oy - by;
  if (om < bm || (om === bm && od < bd)) years -= 1;
  return years;
}

/** OF binding ages (A6): fast completed 18th yr to start of 60th; abstinence from completed 14th. */
export const OF_AGES = {
  fastFrom: 18,
  fastUntilStartOfYear: 60,
  abstinenceFrom: 14,
} as const;

/** EF binding ages (B10): abstinence from completed 7th yr; fast age is norm-profile-dependent. */
export const EF_AGES = {
  abstinenceFrom: 7,
  fastUntilStartOfYear: 60,
} as const;

export function fastBinds(age: number, from: number): boolean {
  // Start of the 60th year of life = the 59th birthday.
  return age >= from && age < 59;
}
