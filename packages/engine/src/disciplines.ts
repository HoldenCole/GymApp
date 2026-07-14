/**
 * User-facing metadata for the discipline and country-profile selections
 * (onboarding + Settings). One source of truth for the labels so the
 * selector, Settings, and any copy referencing a discipline agree.
 *
 * Naming: "Novus Ordo" and "Traditional Latin Mass" are included in the
 * sublabels because they are the terms users actually search for; the
 * canonical terms lead. Neither option is framed as more serious or more
 * devout than the other — the choice states which body of law applies,
 * nothing else (wellbeing layer: the app never adjudicates).
 */

import type { Discipline, NormProfileId } from "./types";

export const DISCIPLINES: Record<
  Discipline,
  { label: string; sublabel: string; description: string }
> = {
  of: {
    label: "Current discipline",
    sublabel: "Ordinary Form · Novus Ordo (modern calendar)",
    description:
      "The discipline most Catholics follow today: the 1983 Code of Canon Law with your bishops' conference norms. Fast binds 18–59, abstinence from 14; a solemnity lifts Friday abstinence.",
  },
  ef: {
    label: "1962 discipline",
    sublabel: "Extraordinary Form · Traditional Latin Mass",
    description:
      "The 1962 discipline as practiced: complete and partial abstinence, Lenten weekday fasts, Ember days, and the retained fast-day vigils. Abstinence binds from 7; the fast age depends on your country profile.",
  },
};

/** Presentation order for selectors: the current discipline first. */
export const DISCIPLINE_ORDER: Discipline[] = ["of", "ef"];

export const NORM_PROFILE_INFO: Record<
  NormProfileId,
  { label: string; description: string }
> = {
  us: {
    label: "United States",
    description:
      "USCCB norms: Friday penance may be substituted outside Lent; under the 1962 discipline the fast binds from 18 and Ember Wednesday/Saturday carry partial abstinence.",
  },
  universal: {
    label: "Universal law",
    description:
      "The Church's universal norms, used when your country's conference norms aren't authored yet. Your country's bishops may specify differently — check with your parish.",
  },
};

export const NORM_PROFILE_ORDER: NormProfileId[] = ["us", "universal"];
