# Kanon — a Lampstand product

A Catholic physical-and-spiritual training app: a nutrition and gym tracker that knows
the Church's calendar and fasting law. Fitness first; faith as the unmatchable capability.

**Start with `Kanon_Project_Master.docx`** — vision, current state (~30% overall),
the full open-issues register, what to do before/alongside coding, and the longer-term plan.

## Layout

- `Kanon_Project_Master.docx` — read first
- `docs/` — the briefs and checklists (UI design brief; fasting/patron/recipe authoring
  briefs; SKU verification instructions; pre-ship checklist)
- `content/` — the verified content itself (patron catalog; fasting rule corpora +
  wellbeing/training/vocabulary pack; allergen research report), plus
  `content/packaged/` — the machine-readable JSON the app loads (see its README)
- `data/` — canonical recipe database (v2 — supersedes all earlier copies), the
  64-row SKU verification worklist, and `data/packaged/` recipe/product JSON
- `packages/engine/` — the rule resolver (day-facts in → obligation out) with the
  **golden test suite**: dates × profiles → expected obligation, derived from the
  priest-confirmed corpora
- `apps/mobile/` — the Expo app shell: five tabs (Home, Fasting, Macros, Food, Rule)
  per the locked design system
- `tools/` — content packaging (`package_content.py` regenerates the JSON from the
  source documents)

## Development

npm workspaces monorepo (Node 20+). The liturgical calendar is **imported, never
re-derived** — until the Introibo seam lands, the app runs on placeholder civil
day-facts and says so in the UI.

```sh
npm install
npm test           # engine golden suite (dates × profiles → expected obligation)
npm run typecheck  # engine + mobile
npm run package-content  # regenerate packaged JSON from the source docs
cd apps/mobile && npx expo start   # run the app shell
```

## The four review gates (start immediately — they run parallel to the build)

1. Dual-competence priest review (formation + both fasting corpora + flagged items)
2. 64 SKU physical-label checks (worklist + instructions in this repo)
3. Medical read of the fast-while-training guidance
4. Wellbeing sign-off on the Part-2 layer

## Non-negotiables (studio cut lines)

No surveillance, ads, or data sale. No gamification of spiritual progress. Obligation vs.
free choice always visually and verbally distinct. Exemptions surfaced generously.
"Begin again," never shame.
