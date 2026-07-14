# Integration handoff — the two external inputs Kanon is waiting on

Everything in the app runs today on labeled stand-ins. This file is the
handoff for whoever (or whichever session) wires the real sources.

## 1. Introibo — the verified liturgical calendar

**Source of truth:** the Introibo calendar (7,671 verified entries), in the
`HoldenCole/CatholicApp` repo. The calendar is imported, never re-derived.

**Where it plugs in:** `packages/engine/src/calendar.ts` defines the seam —
`CalendarRecord` (the import format), `validateCalendar` (structural
checks), `loadCalendar` (indexing). The app reads through
`apps/mobile/src/dayFacts.ts`, which currently loads
`data/packaged/calendar-2026-provisional.json` — a generated, hand-checked
2026 stand-in (see `tools/generate_calendar_fixture.py`). **Replacing that
JSON file with the verified export is the entire integration.** The
provenance field flips from `provisional` to `introibo` and the in-app
"provisional calendar" notes disappear on their own.

**What each record needs** (one row per date per calendar):

| Field | Notes |
|---|---|
| `date` | ISO, the OBSERVED date — transfers already applied |
| `calendar` | `of` (modern) or `ef` (1962) |
| `weekday` | validated against the civil calendar on load |
| `season` | `advent · christmastide · lent · eastertide · ordinary` |
| `key` | `ash_wednesday` / `good_friday` where applicable |
| `celebration` | display label, optional |
| `is_solemnity` | OF only (A5 rank lift) |
| `is_feast_of_precept` | EF only (B9 rank lift) |
| `is_ember_day` | EF only (B6) |
| `vigil` | EF only: `christmas` / `assumption` / `pentecost` — omitted vigils must be ABSENT, never named |
| `transferred_from` | nominal date when transferred, optional |

No fasting logic in the export — the resolver owns the obligation mapping.

**Acceptance gates:** `packages/engine/test/calendar.test.ts` (repoint the
import at the new file) plus the full golden suite. Also pin the open
item: the **Assumption Vigil's abstinence status** against the 1962
calendar data (`meta.open_items` in `content/packaged/fasting-rules.json`).

**Access note:** a session scoped to GymApp only cannot reach CatholicApp;
mid-session `add_repo` repeatedly failed at the approval layer. Start the
session with BOTH repos as sources, or commit the export into this repo.

## 2. USDA FoodData Central

**Where it plugs in:** `packages/food/src/catalog.ts` defines the
`FoodDataSource` seam (`search(query) → FoodSearchResult[]`). The add-food
screen (`apps/mobile/app/add-food.tsx`) says "USDA FoodData Central search
lands here" — wire the client and replace the manual-entry note.

**Needs:** an api.nal.usda.gov key (free). Two jobs:
1. **Add-food search** — live lookup in the app.
2. **The database re-pull** — every macro value in
   `data/packaged/recipes.json` is a USDA-aligned placeholder BY DESIGN
   (the `Ingredient build` sheet in the source xlsx holds per-ingredient
   FDC references); a `tools/` script should re-pull per-100g values and
   recompute, making FDC the source of truth the master doc requires.

**Caution:** diary entries denormalize macros on purpose — a re-pull must
not rewrite logged history.

## Also blocked externally

- **64 SKU label checks** — some product rows carry placeholder zeros
  (e.g. P010). Worklist: `data/Kanon_Product_Verification_Worklist.xlsx`.
- **The four human review gates** — priest (incl. the encoded-rules
  sign-off and `open_items` flags), medical (the guidance screen ships
  labeled "review pending"), wellbeing (accumulation thresholds are
  reviewer-tunable parameters in `packages/engine/src/personal.ts`),
  editorial (single editions).
