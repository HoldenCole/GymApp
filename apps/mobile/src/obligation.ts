/**
 * The one place today's obligation is computed for the UI: imported
 * day-facts → resolver → claimed exemption applied. Every surface that
 * shows or filters on the obligation goes through this hook, so an
 * excused day eases everywhere at once — quietly.
 */

import { Obligation, resolveObligation, withExemption } from "@kanon/engine";
import { DayFactsProvenance, todaysDayFacts } from "./dayFacts";
import { useFasts } from "./fasts";
import { useProfile } from "./profile";
import type { DayFacts } from "@kanon/engine";

export interface TodaysObligation {
  facts: DayFacts;
  provenance: DayFactsProvenance;
  /** Exemption already applied when claimed. */
  obligation: Obligation;
  /** The law before the exemption — for stating what the day asks. */
  law: Obligation;
  exemptedToday: boolean;
}

export function useTodaysObligation(): TodaysObligation {
  const { profile } = useProfile();
  const { state } = useFasts();
  const { facts, provenance } = todaysDayFacts(profile.discipline);
  const law = resolveObligation(facts, profile);
  const exemptedToday = state.exemptDates.includes(facts.date);
  return {
    facts,
    provenance,
    law,
    obligation: exemptedToday ? withExemption(law) : law,
    exemptedToday,
  };
}
