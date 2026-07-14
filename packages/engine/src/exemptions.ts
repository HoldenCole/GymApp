/**
 * Exemptions (content pack Part 2 §2): surfacing the Church's own easing
 * as generously as the obligation itself. Hiding legitimate easing is
 * how scrupulosity is manufactured.
 *
 * The rules, kept structurally:
 * - One tap from the obligation; NO written justification, NO
 *   confirmation gauntlet, NO logging of a reason. This module takes no
 *   reason parameter anywhere, so one cannot be collected.
 * - A claimed exemption is private and never scored, streaked, or
 *   counted against the user. It removes the obligation for that day,
 *   quietly. No API here aggregates claims.
 * - The exemption excuses the PERSON; it does not change the LAW. The
 *   day's obligation statement stands — only its binding is removed.
 * - Doubt routes to a pastor/confessor (§3); the app never adjudicates.
 */

import type { Obligation } from "./types";

/** USER-FACING (verbatim from the pack) — the framing of the easing. */
export const EXEMPTION_COPY =
  "The Church doesn't bind everyone to this. If you're pregnant or nursing, unwell, older, doing hard physical work, travelling, or it would be a real hardship, you're excused — and that's the Church's own provision, not a shortcut.";

/** USER-FACING — shown after a claim. Quiet; nothing to track or make up. */
export const EXEMPTION_CLAIMED_COPY =
  "You're excused today. That's the Church's own provision — nothing to track, nothing to make up.";

/**
 * USER-FACING — the §2 interaction with chosen commitments: a user who
 * qualifies for an exemption isn't silently left bound by their own
 * stricter rule.
 */
export const EXEMPTION_CHOSEN_NOTE =
  "Your own commitments can ease too — the same care applies, and relaxing them is fully legitimate.";

/** The populations named by the law (§2). Informational, never a form. */
export const EXEMPTION_POPULATIONS = [
  "pregnancy",
  "nursing",
  "illness",
  "advanced age",
  "hard manual labor",
  "travel",
  "grave inconvenience",
] as const;

/**
 * Apply a claimed exemption to a resolved obligation: the law's
 * statement is unchanged; nothing binds this user today.
 */
export function withExemption(obligation: Obligation): Obligation {
  return {
    ...obligation,
    binds: { fast: false, abstinence: false },
    exempted: true,
  };
}
