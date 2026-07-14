#!/usr/bin/env python3
"""Generate the PROVISIONAL 2026 calendar fixture.

NOT Introibo data. This is a hand-checked stand-in so the liturgical
layer runs end-to-end before the verified import lands. Every record is
marked provenance=provisional and the app labels it as such. Introibo's
verified calendar (7,671 entries) replaces this file through the same
seam (packages/engine/src/calendar.ts); nothing else changes.

Dates hand-checked for 2026: Easter Apr 5; Ash Wednesday Feb 18; Good
Friday Apr 3; Pentecost May 24; Advent I Nov 29. US observances used
(Epiphany and Corpus Christi on Sunday; Ascension kept on Thursday —
provinces that transfer it will differ, which is exactly the kind of
thing the real import settles).
"""

import datetime as dt
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
YEAR = 2026

WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

# Season boundaries, 2026 (inclusive).
SEASONS = [
    ("2026-01-01", "2026-01-11", "christmastide"),  # through Baptism of the Lord
    ("2026-01-12", "2026-02-17", "ordinary"),
    ("2026-02-18", "2026-04-04", "lent"),
    ("2026-04-05", "2026-05-24", "eastertide"),  # through Pentecost
    ("2026-05-25", "2026-11-28", "ordinary"),
    ("2026-11-29", "2026-12-24", "advent"),
    ("2026-12-25", "2026-12-31", "christmastide"),
]

KEY_DAYS = {
    "2026-02-18": "ash_wednesday",
    "2026-04-03": "good_friday",
}

# OF solemnities, 2026 US observances.
OF_SOLEMNITIES = {
    "2026-01-01": "Solemnity of Mary, Mother of God",
    "2026-01-04": "Epiphany of the Lord",
    "2026-03-19": "Solemnity of St. Joseph",
    "2026-03-25": "Solemnity of the Annunciation",
    "2026-04-05": "Easter Sunday",
    "2026-05-14": "Ascension of the Lord",
    "2026-05-24": "Pentecost",
    "2026-05-31": "The Most Holy Trinity",
    "2026-06-07": "Corpus Christi",
    "2026-06-12": "The Most Sacred Heart of Jesus",
    "2026-06-24": "Nativity of St. John the Baptist",
    "2026-06-29": "Sts. Peter and Paul",
    "2026-08-15": "Assumption of the Blessed Virgin Mary",
    "2026-11-01": "All Saints",
    "2026-11-22": "Christ the King",
    "2026-12-08": "Immaculate Conception",
    "2026-12-25": "The Nativity of the Lord",
}

# EF 1962 feasts of precept (US set).
EF_PRECEPT = {
    "2026-01-01": "The Circumcision of Our Lord",
    "2026-05-14": "The Ascension of Our Lord",
    "2026-08-15": "The Assumption of the Blessed Virgin Mary",
    "2026-11-01": "All Saints",
    "2026-12-08": "The Immaculate Conception",
    "2026-12-25": "The Nativity of Our Lord",
}

# EF Ember days, 2026 — all four sets.
EF_EMBER = {
    "2026-02-25": "Ember Wednesday of Lent",
    "2026-02-27": "Ember Friday of Lent",
    "2026-02-28": "Ember Saturday of Lent",
    "2026-05-27": "Ember Wednesday of Pentecost",
    "2026-05-29": "Ember Friday of Pentecost",
    "2026-05-30": "Ember Saturday of Pentecost",
    "2026-09-16": "Ember Wednesday of September",
    "2026-09-18": "Ember Friday of September",
    "2026-09-19": "Ember Saturday of September",
    "2026-12-16": "Ember Wednesday of Advent",
    "2026-12-18": "Ember Friday of Advent",
    "2026-12-19": "Ember Saturday of Advent",
}

# EF retained fast-day vigils, 2026. (Immaculate Conception and All
# Saints vigils do not exist in the 1962 calendar — deliberately absent.)
EF_VIGILS = {
    "2026-05-23": ("pentecost", "Vigil of Pentecost"),
    "2026-08-14": ("assumption", "Vigil of the Assumption"),
    "2026-12-24": ("christmas", "Vigil of the Nativity"),
}

EF_KEY_NAMES = {
    "2026-02-18": "Ash Wednesday",
    "2026-04-03": "Good Friday",
}


def season_of(iso: str) -> str:
    for start, end, season in SEASONS:
        if start <= iso <= end:
            return season
    raise ValueError(iso)


def main() -> None:
    records = []
    day = dt.date(YEAR, 1, 1)
    while day.year == YEAR:
        iso = day.isoformat()
        weekday = WEEKDAYS[day.weekday()]
        season = season_of(iso)

        of = {"date": iso, "calendar": "of", "weekday": weekday, "season": season}
        if iso in KEY_DAYS:
            of["key"] = KEY_DAYS[iso]
            of["celebration"] = EF_KEY_NAMES[iso]
        if iso in OF_SOLEMNITIES:
            of["is_solemnity"] = True
            of["celebration"] = OF_SOLEMNITIES[iso]
        records.append(of)

        ef = {"date": iso, "calendar": "ef", "weekday": weekday, "season": season}
        if iso in KEY_DAYS:
            ef["key"] = KEY_DAYS[iso]
            ef["celebration"] = EF_KEY_NAMES[iso]
        if iso in EF_PRECEPT:
            ef["is_feast_of_precept"] = True
            ef["celebration"] = EF_PRECEPT[iso]
        if iso in EF_EMBER:
            ef["is_ember_day"] = True
            ef["celebration"] = EF_EMBER[iso]
        if iso in EF_VIGILS:
            vigil, name = EF_VIGILS[iso]
            ef["vigil"] = vigil
            ef["celebration"] = name
        records.append(ef)

        day += dt.timedelta(days=1)

    out = {
        "meta": {
            "source": "tools/generate_calendar_fixture.py — PROVISIONAL stand-in, NOT Introibo",
            "provenance": "provisional",
            "coverage": {"from": f"{YEAR}-01-01", "to": f"{YEAR}-12-31"},
        },
        "records": records,
    }
    path = ROOT / "data" / "packaged" / "calendar-2026-provisional.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)} ({len(records)} records)")


if __name__ == "__main__":
    main()
