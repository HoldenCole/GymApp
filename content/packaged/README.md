# Packaged content — machine-readable assets

The verified source documents converted into the JSON the app loads
(Project Master §4, item 5). The docx/xlsx sources remain the human-review
source of truth until the review gates close; these files are what the
build consumes.

| File | Source | How it's produced |
|---|---|---|
| `fasting-rules.json` | `content/Kanon_Fasting_Engine_Content_Pack.md` Part 1 + D | Hand-encoded (rule-shaped, not bulk data) |
| `food-vocabulary.json` | Content pack Part 4 | Hand-encoded |
| `patrons.json` | `content/Kanon_Patron_Content_v1.docx` | Generated — `python3 tools/package_content.py` |
| `../../data/packaged/recipes.json` | Recipe DB v2, "Data export (AI)" sheet | Generated — same script |
| `../../data/packaged/products.json` | Recipe DB v2, "Data export (AI)" sheet | Generated — same script |

Never hand-edit the generated files; re-run the script after a source edit.
The hand-encoded files carry `meta.open_items` / `meta.open_decisions`
mirroring the content pack's flags — they must be resolved (and the encoded
rules signed by the same dual-competence priest reviewer) before ship.
