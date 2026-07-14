/**
 * Marian Ink — the locked palette (UI Design Brief §1.1).
 *
 * Deep set on light grounds; the brighter gold only on dark ink.
 * Color carries meaning or it doesn't appear: each macro owns a color,
 * oxblood is liturgical (fast days, binding obligations, rubric links),
 * gold marks sacred accents and active protein. Nothing decorative.
 */

export const colors = {
  inkNavy: "#0F1729",
  inkNavyDeep: "#10131A",
  paperWhite: "#FFFFFF",
  parchment: "#F6F2E8", // Rule-tab ground only
  goldDeep: "#C09210", // protein, sacred accents on light
  goldBright: "#D4A017", // only on dark ink
  teal: "#177A5E", // carbs, weight trend, positive deltas
  burntCoral: "#B34A22", // fat
  oxblood: "#8B1A1A", // liturgical: fast days, obligations, rubric links
  grayLabel: "#9A968C",
  grayInactive: "#B4B0A6",
  graySecondary: "#6E6A60",
  hairlineMajor: "#ECEAE4",
  hairlineMinor: "#F4F2EC",
} as const;

/**
 * One label system app-wide (UI brief §1.2): small caps-style section
 * labels, letterspaced, semibold, warm gray. This is the wayfinding.
 */
export const sectionLabel = {
  fontSize: 11,
  letterSpacing: 1.5,
  fontWeight: "600" as const,
  color: colors.grayLabel,
  textTransform: "uppercase" as const,
};

/**
 * Serif for the sacred, sans for the functional (§1.2). EB Garamond is
 * the target sacred face; until the font asset lands, the platform serif
 * stands in so the covenant is visible in the scaffold.
 */
export const sacredSerif = {
  fontFamily: "Georgia",
} as const;
