/**
 * Patron feast days from the packaged catalog — fixed calendar dates, so
 * they work before the Introibo import. Softening is an emphasis change,
 * never a canonical claim: the app eases its tone on these days but must
 * not tell the user an obligation is lifted (Part 5 §2 — softening tone
 * ≠ dispensing). Rank-lift decisions stay with the rule resolver.
 */

import patrons from "@kanon/content/packaged/patrons.json";
import type { PatronId } from "./profile";

export interface TodaysFeast {
  saintId: PatronId;
  saintName: string;
  label: string;
  softens: boolean;
  note?: { heading: string; paragraphs: string[] };
}

const MONTHS: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};

function headingDate(heading: string): string | null {
  const m = heading.match(/^([A-Z][a-z]+) (\d+)/);
  if (!m || !MONTHS[m[1]!]) return null;
  return `${MONTHS[m[1]!]}-${m[2]!.padStart(2, "0")}`;
}

/** The feast falling on a date (MM-DD), if any patron keeps it. */
export function feastOn(dateISO: string): TodaysFeast | null {
  const mmdd = dateISO.slice(5);
  const feast = patrons.feasts.find((f) => f.date === mmdd);
  if (!feast) return null;
  const saintId = feast.saint as PatronId;
  const saint = patrons.saints[saintId];
  const note = saint.feast_notes.find((n) => headingDate(n.heading) === mmdd);
  return {
    saintId,
    saintName: saint.name,
    label: feast.label,
    softens: feast.softens,
    note,
  };
}
