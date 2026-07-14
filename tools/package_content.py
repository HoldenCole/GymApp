#!/usr/bin/env python3
"""Package the verified Kanon source documents into machine-readable JSON.

Reads the canonical sources:
  - content/Kanon_Patron_Content_v1.docx     -> content/packaged/patrons.json
  - data/Kanon_Recipe_Database_v2.xlsx       -> data/packaged/recipes.json
                                                data/packaged/products.json

The fasting rule corpus and food vocabulary are hand-encoded (they are
rule-shaped, not bulk data) in content/packaged/fasting-rules.json and
content/packaged/food-vocabulary.json and are not generated here.

Re-run after any edit to the source documents; the JSON is generated,
never hand-edited. The docx/xlsx remain the human-review source of truth
until the review gates close.
"""

import json
import re
import sys
from pathlib import Path

import docx
import openpyxl

ROOT = Path(__file__).resolve().parent.parent

SAINT_IDS = {
    "1": "joseph",
    "2": "benedict",
    "3": "hyacinth",
    "4": "therese",
    "5": "anthony",
}

# Feast index: date (MM-DD) -> feast metadata. Dates from the feast-day notes
# in the catalog itself. `calendar` marks feasts kept on a different day in
# the older (1962) calendar, per the notes.
FEASTS = [
    {"date": "03-19", "saint": "joseph", "label": "Solemnity of St. Joseph", "softens": True},
    {"date": "05-01", "saint": "joseph", "label": "St. Joseph the Worker", "softens": True},
    {"date": "07-11", "saint": "benedict", "label": "Feast of St. Benedict", "softens": True,
     "note": "The older calendar keeps March 21 (the Transitus)."},
    {"date": "08-17", "saint": "hyacinth", "label": "Feast of St. Hyacinth", "softens": True},
    {"date": "10-01", "saint": "therese", "label": "Feast of St. Thérèse of Lisieux", "softens": True,
     "note": "The traditional calendar keeps October 3."},
    {"date": "01-17", "saint": "anthony", "label": "Feast of St. Anthony of the Desert", "softens": True},
]

CHARISM_LABELS = [
    ("Charism in one sentence", "charism"),
    ("Training emphasis", "training_emphasis"),
    ("Eating / table", "eating_table"),
    ("Fasting note", "fasting_note"),
    ("Who this patron is for", "who_for"),
]

QUOTE_RE = re.compile(r"^(.*\S)\s+\((.+)\)$")
ABOUT_RE = re.compile(r"^(.+?)\s*\(about \d+ words\)$")
READING_RE = re.compile(r"^Reading (\d+): (.+?)\s*\(about \d+ words\)$")


def parse_patrons(path):
    doc = docx.Document(path)
    paras = []
    for p in doc.paragraphs:
        t = p.text.strip()
        if t:
            style = p.style.name if p.style else ""
            paras.append((style, t))

    saints = {}
    intentions = {"free_tier": [], "full_pool": [], "tone_note": None}
    cur_saint = None
    cur_section = None
    intent_mode = None

    for style, text in paras:
        if style == "Heading 1":
            m = re.match(r"^(\d)\. (St\. .+)$", text)
            if m and m.group(1) in SAINT_IDS:
                sid = SAINT_IDS[m.group(1)]
                cur_saint = {
                    "id": sid,
                    "name": m.group(2),
                    "tagline": None,
                    "wellbeing_note": None,
                    "selector_descriptor": None,
                    "overview": [],
                    "charism_notes": {},
                    "quotes": [],
                    "quotes_slot_note": None,
                    "quotes_register_note": None,
                    "scripture": [],
                    "scripture_note": None,
                    "offering_line": None,
                    "readings": [],
                    "feast_notes": [],
                }
                saints[sid] = cur_saint
                cur_section = "tagline"
            elif text.startswith("6."):
                cur_saint = None
                cur_section = "intentions"
            elif text.startswith("7."):
                cur_saint = None
                cur_section = None  # verification appendix: editorial, not app data
            else:
                cur_saint = None
                cur_section = None
            continue

        if style == "Heading 3" and cur_saint:
            m = re.match(r"^\d\.(\d) ", text)
            cur_section = {"1": "selector", "2": "overview", "3": "charism",
                           "4": "quotes", "5": "scripture", "6": "offering",
                           "7": "readings", "8": "feasts"}.get(m.group(1)) if m else None
            continue

        if cur_section == "intentions":
            if text.startswith("Free tier"):
                intent_mode = "free"
            elif text.startswith("Full preset pool"):
                intent_mode = "full"
            elif text.startswith("A note on tone"):
                intentions["tone_note"] = text
                intent_mode = None
            elif intent_mode and (text.startswith("For ") or text.startswith("In thanksgiving")):
                intentions["free_tier" if intent_mode == "free" else "full_pool"].append(text)
            elif intent_mode is None and intentions["tone_note"] is None and not intentions["free_tier"]:
                intentions.setdefault("intro", text)
            continue

        if not cur_saint:
            continue

        s = cur_saint
        if cur_section == "tagline":
            if text.startswith("Wellbeing"):
                s["wellbeing_note"] = text
            elif s["tagline"] is None:
                s["tagline"] = text
        elif cur_section == "selector":
            s["selector_descriptor"] = text
        elif cur_section == "overview":
            s["overview"].append(text)
        elif cur_section == "charism":
            for label, key in CHARISM_LABELS:
                if text.startswith(label):
                    cut = text.find(". ")
                    s["charism_notes"][key] = text[cut + 2:] if cut != -1 else text
                    break
        elif cur_section == "quotes":
            m = QUOTE_RE.match(text)
            if m and not s["quotes"] and s["quotes_slot_note"] is None and len(text) > 300:
                s["quotes_slot_note"] = text
            elif m:
                s["quotes"].append({"text": m.group(1), "attribution": m.group(2)})
            elif s["quotes"]:
                s["quotes_register_note"] = text
            else:
                s["quotes_slot_note"] = text
        elif cur_section == "scripture":
            if text.startswith("Douay-Rheims"):
                s["scripture_note"] = text
            else:
                cut = text.find(": ")
                s["scripture"].append({
                    "reference": text[:cut],
                    "text_and_gloss": text[cut + 2:],
                })
        elif cur_section == "offering":
            s["offering_line"] = text
        elif cur_section == "readings":
            m = READING_RE.match(text)
            if m:
                s["readings"].append({"title": m.group(2), "paragraphs": []})
            elif s["readings"]:
                s["readings"][-1]["paragraphs"].append(text)
        elif cur_section == "feasts":
            m = ABOUT_RE.match(text)
            if m and not READING_RE.match(text):
                s["feast_notes"].append({"heading": m.group(1), "paragraphs": []})
            elif s["feast_notes"]:
                s["feast_notes"][-1]["paragraphs"].append(text)

    return saints, intentions


def parse_recipes(path):
    wb = openpyxl.load_workbook(path, read_only=True)
    ws = wb["Data export (AI)"]
    rows = list(ws.iter_rows(values_only=True))
    hdr = [str(h) for h in rows[0]]
    recipes, products = [], []
    for row in rows[1:]:
        rec = dict(zip(hdr, row))
        if rec.get("id") is None:
            continue
        for key in ("fast_codes_pipe", "allergen_codes_pipe", "training_tags_pipe"):
            val = rec.pop(key)
            rec[key.replace("_pipe", "")] = (
                [v.strip() for v in str(val).split("|") if v.strip()] if val else []
            )
        for key in ("abstinence_friendly", "verified"):
            rec[key] = str(rec[key]).lower() == "true" if rec[key] is not None else None
        (products if rec["type"] == "product" else recipes).append(rec)
    return recipes, products


def main():
    saints, intentions = parse_patrons(ROOT / "content" / "Kanon_Patron_Content_v1.docx")

    # Sanity checks — fail loudly rather than package a bad parse.
    expect = {
        "joseph": {"quotes": 11, "scripture": 6, "readings": 3, "feast_notes": 2},
        "benedict": {"quotes": 12, "scripture": 6, "readings": 3, "feast_notes": 1},
        "hyacinth": {"quotes": 11, "scripture": 6, "readings": 3, "feast_notes": 1},
        "therese": {"quotes": 11, "scripture": 6, "readings": 3, "feast_notes": 1},
        "anthony": {"quotes": 12, "scripture": 6, "readings": 3, "feast_notes": 1},
    }
    errors = []
    for sid, counts in expect.items():
        s = saints.get(sid)
        if not s:
            errors.append(f"missing saint {sid}")
            continue
        for field, n in counts.items():
            got = len(s[field])
            if got != n:
                errors.append(f"{sid}.{field}: expected {n}, got {got}")
        for field in ("selector_descriptor", "offering_line", "tagline"):
            if not s[field]:
                errors.append(f"{sid}.{field}: missing")
        if not s["overview"]:
            errors.append(f"{sid}.overview: empty")
    if len(intentions["free_tier"]) != 5:
        errors.append(f"intentions.free_tier: expected 5, got {len(intentions['free_tier'])}")
    # The doc lists the full pool as "the above five, plus fifteen".
    if len(intentions["full_pool"]) != 15:
        errors.append(f"intentions.full_pool: expected 15 additional, got {len(intentions['full_pool'])}")
    else:
        intentions["full_pool"] = intentions["free_tier"] + intentions["full_pool"]
    if errors:
        sys.exit("PARSE ERRORS:\n  " + "\n  ".join(errors))

    patrons_out = {
        "meta": {
            "source": "content/Kanon_Patron_Content_v1.docx",
            "generated_by": "tools/package_content.py",
            "status": "draft — priest review, single scripture edition, and one editor holding the voice remain on the critical path",
            "editorial_flags": [
                "‘Begin again’ is Kanon's own phrase echoing Benedict's spirit — never set it in quotation marks attributed to St. Benedict.",
                "The ‘May today there be peace within’ passage is NOT Thérèse and stays blacklisted.",
                "Hyacinth left no recorded words; the Kiev lines are Our Lady's, correctly attributed.",
                "Scripture wording is verified Douay-Rheims; punctuation/spelling await single-edition standardization.",
            ],
        },
        "saints": saints,
        "feasts": FEASTS,
        "intentions": intentions,
    }

    recipes, products = parse_recipes(ROOT / "data" / "Kanon_Recipe_Database_v2.xlsx")
    if len(recipes) != 413:
        sys.exit(f"expected 413 recipes, got {len(recipes)}")
    if len(products) != 87:
        sys.exit(f"expected 87 products, got {len(products)}")

    recipes_out = {
        "meta": {
            "source": "data/Kanon_Recipe_Database_v2.xlsx — 'Data export (AI)' sheet",
            "generated_by": "tools/package_content.py",
            "note": "Macro values are USDA-aligned placeholders by design; the build re-pulls from USDA FoodData Central as the source of truth.",
        },
        "recipes": recipes,
    }
    products_out = {
        "meta": {
            "source": "data/Kanon_Recipe_Database_v2.xlsx — 'Data export (AI)' sheet",
            "generated_by": "tools/package_content.py",
            "note": "64 SKU physical-label checks pending (data/Kanon_Product_Verification_Worklist.xlsx). Allergen lines are the safety field.",
        },
        "products": products,
    }

    (ROOT / "content" / "packaged").mkdir(exist_ok=True)
    (ROOT / "data" / "packaged").mkdir(exist_ok=True)
    for path, data in [
        (ROOT / "content" / "packaged" / "patrons.json", patrons_out),
        (ROOT / "data" / "packaged" / "recipes.json", recipes_out),
        (ROOT / "data" / "packaged" / "products.json", products_out),
    ]:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"wrote {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
