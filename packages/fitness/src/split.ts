/**
 * Training splits — fully customizable. A split is user-named sessions
 * (any names, any count) plus a weekday → session mapping. The templates
 * are starting points to edit, not fixed programs.
 *
 * Templates default Sunday to rest. Nothing enforces that — it's just the
 * natural default for this app's audience.
 */

import type { Weekday } from "@kanon/engine";

export const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const REST = "rest";

export interface SessionType {
  id: string;
  /** User-editable — "Push", "Squat day", "Sprints", anything. */
  name: string;
}

export interface Split {
  name: string;
  sessions: SessionType[];
  /** Every weekday maps to a session id or REST. */
  week: Record<Weekday, string>;
}

export const SPLIT_TEMPLATES: Split[] = [
  {
    name: "Full body · 3 days",
    sessions: [{ id: "full", name: "Full body" }],
    week: {
      monday: "full",
      tuesday: REST,
      wednesday: "full",
      thursday: REST,
      friday: "full",
      saturday: REST,
      sunday: REST,
    },
  },
  {
    name: "Upper / Lower · 4 days",
    sessions: [
      { id: "upper", name: "Upper" },
      { id: "lower", name: "Lower" },
    ],
    week: {
      monday: "upper",
      tuesday: "lower",
      wednesday: REST,
      thursday: "upper",
      friday: "lower",
      saturday: REST,
      sunday: REST,
    },
  },
  {
    name: "Push / Pull / Legs · 6 days",
    sessions: [
      { id: "push", name: "Push" },
      { id: "pull", name: "Pull" },
      { id: "legs", name: "Legs" },
    ],
    week: {
      monday: "push",
      tuesday: "pull",
      wednesday: "legs",
      thursday: "push",
      friday: "pull",
      saturday: "legs",
      sunday: REST,
    },
  },
];

/** The session scheduled for a weekday, or null on a rest day. */
export function sessionFor(split: Split, weekday: Weekday): SessionType | null {
  const id = split.week[weekday];
  if (id === REST) return null;
  return split.sessions.find((s) => s.id === id) ?? null;
}

/**
 * Structural validity: every weekday mapped, every mapping points at a
 * real session or REST, no duplicate session ids, no empty names.
 */
export function validateSplit(split: Split): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const s of split.sessions) {
    if (!s.name.trim()) errors.push(`session ${s.id}: empty name`);
    if (ids.has(s.id)) errors.push(`duplicate session id ${s.id}`);
    ids.add(s.id);
  }
  for (const day of WEEKDAYS) {
    const target = split.week[day];
    if (target === undefined) errors.push(`${day}: unmapped`);
    else if (target !== REST && !ids.has(target)) {
      errors.push(`${day}: unknown session ${target}`);
    }
  }
  return errors;
}

/** Cycle a weekday through rest → session 1 → session 2 → … → rest. */
export function cycleDay(split: Split, weekday: Weekday): Split {
  const current = split.week[weekday];
  const order = [REST, ...split.sessions.map((s) => s.id)];
  const idx = order.indexOf(current);
  const next = order[(idx + 1) % order.length] ?? REST;
  return { ...split, week: { ...split.week, [weekday]: next } };
}
