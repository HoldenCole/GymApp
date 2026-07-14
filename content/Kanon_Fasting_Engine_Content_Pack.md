# KANON — Fasting Engine Content Pack

*A Lampstand product. Consolidated authoring output for the fasting engine, assembled from
the five working documents produced for this engine. Scope: Roman only — Ordinary Form
(current discipline) and Extraordinary Form (1962); Orthodox to follow.*

---

## About this document

This is the single consolidated pack. It gathers everything authored so far into one place,
organized to track the brief. Each part below was authored to the brief's standard:
canonical determinations are sourced to primary texts and confirmed by the dual-competence
priest review; the novel and product content (training guidance, food vocabulary, wellbeing
layer) is authored to the brief's wellbeing and medical-disclaimer rules.

Throughout: **USER-FACING** blocks are app-ready copy. **AUTHORING NOTE / DESIGN NOTE**
blocks are for the dev, priest, and reviewers and do not ship as written. Checkbox lists
are review/build checklists.

### What's in the pack

- **Part 1 — The two rule corpora (brief §§1, 3, 7).** Both disciplines, sourced and
  priest-confirmed, plus the dispensation/transfer rules, the scope decision, and the
  country selector.
- **Part 2 — The applicability & wellbeing layer (brief §§2, 5).** Age bindings,
  exemptions, the "who decides" boundary, the obligation-vs-free-choice distinction, and
  the accumulation check.
- **Part 3 — Fast-while-training guidance (brief §4).** The novel content, principles only.
- **Part 4 — Shared food vocabulary (brief §5).** The one controlled list for personal
  fasts and recipe tags.
- **Part 5 — System cross-checks (brief §6).** Calendar seam, feast-day softening, and the
  two-discipline switch — written as a test spec to be run against the live systems.

### Status at a glance

- **Canonical rules (Part 1):** sourced and **priest-confirmed**, both corpora. Three
  corrections from the review are applied (EF fast age by country, the vigil set incl.
  Assumption, the US Ember norm).
- **Wellbeing, training, vocabulary (Parts 2–4):** drafted and complete; awaiting the
  **medical review** (training guidance) and the **formal wellbeing sign-off** — the human
  gates the brief puts on the critical path.
- **Cross-checks (Part 5):** drafted as a spec; to be **run** against Introibo's calendar
  and the patron content, which aren't available to the author.


---

# Part 1 — The Two Rule Corpora

*Brief §§1 (the two corpora), 3 (dispensations & transfers), 7 (scope).*

*Sourced from primary texts and **confirmed by the dual-competence priest review**
(both corpora). The two corpora are kept fully separate — different bodies of law, never
cross-wired. Three corrections came out of the review and are applied below; see the
changelog at C, within this part. (This part uses its own internal lettering — A = OF
records, B = EF records, C = changelog, D = scope — separate from the document's Parts 1–5.)*

**The two corpora, and the one rule that must never leak between them:** OF and EF differ
in their days, their binding ages, **and** their rank-lift threshold. Encoding one
threshold for both calendars is the single likeliest correctness bug — see A5 vs B9.

**Review status legend:** `confirmed` = priest-confirmed and ready to encode. All records
below are confirmed; Part C lists the post-review build checks that remain.

---

## Part A — Current discipline (Ordinary Form, 1983 Code + USCCB)

Sourced to primary texts and clear: 1983 *Code of Canon Law* cc. 1249–1253 (Vatican); the
USCCB *Fast & Abstinence* page and the 1966 *Pastoral Statement on Penance and Abstinence*.

### A1 · Ash Wednesday
| Field | Value |
|---|---|
| Obligation | Fast **and** abstinence |
| Binds whom | Fast: completed 18th yr to start of 60th. Abstinence: from completed 14th yr. |
| What satisfies it | Abstinence: no meat. Fast: one full meal + two smaller that together don't equal a full one. |
| Lifts / exceptions | State-based exemptions (Part-2 layer); pastor/confessor for individual hardship |
| Source | 1983 CIC c. 1251; USCCB *Fast & Abstinence* |
| Review status | `confirmed` |

### A2 · Good Friday
Same obligation and ages as A1 (fast **and** abstinence). USCCB additionally *recommends*
continuing the fast to the Easter Vigil as the "paschal fast" — a recommendation, not an
added obligation; tag it so it never surfaces as binding. Source: 1983 CIC c. 1251; USCCB.
Status: `confirmed`.

### A3 · Fridays of Lent
| Field | Value |
|---|---|
| Obligation | Abstinence (no meat) |
| Binds whom | From completed 14th yr |
| What satisfies it | No flesh meat that day |
| Lifts / exceptions | A solemnity on a Lenten Friday lifts the abstinence (see A5) |
| Source | 1983 CIC c. 1251; USCCB *Fast & Abstinence* |
| Review status | `confirmed` |

### A4 · Fridays outside Lent (the year-round Friday penance)
| Field | Value |
|---|---|
| Obligation | Friday remains penitential; abstinence from meat has "first place," and in the US another act of penance may be substituted |
| What satisfies it | Abstinence from meat, **or** another penance / work of charity chosen by the person (US norms, c. 1253) |
| Lifts / exceptions | Solemnity on a Friday |
| Source | 1983 CIC cc. 1250, 1253; USCCB 1966 *Pastoral Statement* |
| Review status | `confirmed` |

**Product note (not a canonical flag).** The app states the *practice* — Friday is
penitential, abstinence has first place, substitution is permitted — and deliberately
does **not** pronounce on whether omitting it is sinful. That gravity question belongs to
the user's pastor or confessor under the §2 "who decides" boundary, not to the engine.
Keeping it out of scope is a wellbeing/authority choice, not an uncertainty about the law.

### A5 · Solemnity falling on a day of abstinence
A solemnity falling on a Friday lifts the Friday abstinence — c. 1251 binds the Friday
abstinence "unless a solemnity should fall on a Friday." **OF rank threshold = solemnity.**
The most expert-checked feature in the engine. Source: 1983 CIC c. 1251. Status: `confirmed`
— the solemnity list comes from Introibo's calendar, never re-derived here.

### A6 · Binding ages (OF)
Fast: from the completed **18th** year to the start of the **60th**. Abstinence: from the
completed **14th** year. Source: USCCB *Fast & Abstinence*; 1983 CIC c. 1252. Status:
`confirmed`. (Different from EF — see B10; never cross-wire.)

---

## Part B — 1962 discipline (Extraordinary Form), as practiced

The EF corpus encodes the **1962 discipline as practiced**. The three core definitions are
carried forward unchanged from the 1917 Code and are clean; the day-by-day application is
the standard 1962 practice (Jone/Adelman *Moral Theology*, 1961 US adaptation; the
common SSPX/Angelus and OnePeterFive summaries, which agree on the shape below).

### B1 · The three definitions
- **Complete abstinence** — no flesh meat and no meat broth/soup; eggs, milk products
  (cheese, butter), and condiments/seasonings even from animal fat are permitted.
- **Partial abstinence** — meat permitted, but only at the one principal meal of the day.
- **Fast** — one full meal a day, plus a small morning and evening collation per approved
  local custom; meat and fish may be taken at the same meal.

Source (definitions): 1917 CIC cc. 1250–1251, carried forward into the 1962 discipline.
Status: `confirmed`.

### B2 · All Fridays of the year — complete abstinence
Lifts only outside Lent, and only for a feast of precept / Sunday (see B9). Source: 1962
discipline (c. 1252 §1). Status: `confirmed`.

### B3 · Ash Wednesday — fast **and** complete abstinence. Status: `confirmed`.
### B4 · Good Friday — fast **and** complete abstinence. Status: `confirmed`.

### B5 · Lenten weekdays
- **Fridays and Saturdays of Lent — fast + complete abstinence.**
- **Mondays–Thursdays of Lent — fast + partial abstinence** (meat at the principal meal only).

Source: 1962 discipline (c. 1252 §§2–3 + standard practice). Status: `confirmed`.
*(Post-review note: the weekday partial-abstinence pattern is sourced to the standard
summaries; flagged for primary-source confirmation by the priest at encode-review — see
"remaining build checks" in Part C.)*

### B6 · Ember Days — all four sets (Advent, Lent, Pentecost/summer, September) — *priest-confirmed (US norm)*
Each Ember week's Wednesday, Friday, and Saturday are **days of fast**. Abstinence on them:
- **Ember Friday — complete abstinence** (the Friday rule governs).
- **Ember Wednesday and Saturday — partial abstinence** — **this is the 1949 US
  modification**; the older *universal* practice was complete abstinence on all Ember days.
  Label this as the US norm in-app, and revisit if scope ever goes beyond the US (ties to
  the §7 scope decision).

The dates of all four sets come from Introibo's 1962 calendar; the engine attaches this
obligation. Source: 1962 discipline (US norm), priest-confirmed. Status: `confirmed`.

### B7 · Retained vigils carrying an obligation — *priest-confirmed, with correction*
The 1962 calendar's fast-day vigils are the **Vigils of Christmas, Pentecost, and the
Assumption** (Assumption belongs in this list — confirm it is not missing from the engine):
- **Vigil of Christmas — fast + complete abstinence.**
- **Vigil of the Assumption — fast.** (Confirm abstinence status against the calendar.)
- **Vigil of Pentecost — fast + partial abstinence.**

**Why the Immaculate Conception and All Saints vigils carry nothing** — and the reason
matters for how the engine models it: these vigils were **omitted from the 1962 calendar
itself**. It is *not* that an obligation lapsed while the vigil remained; the vigil days do
not exist in 1962. So the engine should carry no such vigil at all, rather than carrying
the day with a `none` obligation. (Aside the priest flagged: the old Immaculate Conception
*Vigil* had been complete abstinence but was **not** a fast day — an asymmetry, now moot
since the vigil is gone.)

The dates of the surviving vigils come from Introibo's 1962 calendar; the engine attaches
the obligation. Source: 1962 discipline, priest-confirmed. Status: `confirmed`
*(Assumption Vigil abstinence status: open until pinned against the calendar).*

### B9 · Rank-lift and Sunday interaction — *priest-confirmed*
- A **Sunday or feast of precept (Holy Day of Obligation)** lifts the abstinence/fast of a
  coinciding penitential day — **except during Lent**, where the penance stands.
- A **fast-day vigil falling on a Sunday** is **dropped that year**, not anticipated to
  Saturday.

**EF rank threshold = feast of precept / Sunday, outside Lent** — narrower than, and not
to be confused with, the OF "solemnity" threshold in A5. Source: 1962 discipline
(c. 1252 §4). Status: `confirmed` (feast-of-precept set and
transfers come from Introibo's calendar). *(Post-review note: the precise Lenten
Sunday/feast interaction is compressed here; flagged for primary-source confirmation at
encode-review.)*

*(Numbering note: there is no B8 — a renumbering scar, not a missing record. Confirmed
against the source working documents.)*

### B10 · Binding ages (EF) — *resolved: scope-dependent*
- **Abstinence** — from the completed **7th** year (the day after the 7th birthday).
- **Fast** — **universal 1962 law: completed 21st year** to start of 60th. **US particular
  law lowered this to 18.** Use the age that matches the app's scope.

**Why both "21" and "18" are correct.** The universal 1962 fasting age was 21; a US indult
lowered it to 18, and US-facing sources state the rule directly as 18. This was never an
error on either side — it's the §7 scope question in disguise. **Recommendation: 18 for a
US-scoped v1**, for consistency with the rest of this corpus, which already uses the US
norm (the Ember Wed/Sat partial abstinence in B6 is the 1949 US modification). If v1 ever
claims to give the *universal* 1962 discipline, the fast age is 21 and the Ember rule
changes too — the two must move together. Source: 1962 discipline + US particular law,
priest-confirmed and source-verified. Status: `confirmed` (scope-gated).

---

## Part C — Post-review: changelog and remaining build checks

**The priest review is done. Three corrections came out of it — all applied above:**

1. **EF fasting age is scope-dependent: 21 universal, 18 in the US** — not a flat error on
   either side. The universal 1962 age was 21; a US indult lowered it to 18. This is the §7
   scope decision wearing an age-question costume. **Recommended: 18 for a US-scoped v1**,
   to stay consistent with the US Ember norm already in B6. The fast age (21 vs 18) and the
   Ember Wed/Sat rule (complete vs partial abstinence) must move together — both universal
   or both US. (B10, B6.)
2. **Christmas Vigil carries a fast** (fast + complete abstinence), and **the Assumption
   Vigil is a retained fast-day vigil** that must not be missing from the engine. The
   Immaculate Conception and All Saints vigils carry nothing because **they don't exist in
   the 1962 calendar** — model them as absent, not as days with a `none` obligation. (B7.)
3. **Ember Wed/Sat partial abstinence is the 1949 US norm**, not universal 1962 practice
   (which was complete abstinence on all Ember days). Labeled as US norm in B6; ties to the
   §7 scope decision if scope ever broadens.

**Confirmations the review also gave** (no change needed): OF Q1/Q2 correct and complete;
EF abstinence age 7; the Lenten and Ember fast/abstinence assignments; and the B9 lift/
Sunday-vigil rule (the Code's wording: a vigil fast falling on a Sunday is dropped that
year, not anticipated to Saturday).

**What remains is engineering, not canon:**

- [ ] **Add the Assumption Vigil** as a fast-day vigil (confirm its abstinence status
      against Introibo's calendar). Easy gap to miss.
- [ ] **Model the omitted vigils as absent**, not as `none`-obligation days (B7).
- [ ] **Two separate rank-lift thresholds** wired separately — OF solemnity (A5),
      EF feast-of-precept/Sunday-except-Lent (B9).
- [ ] **No cross-wiring of binding ages** — OF 18/14 vs EF 18/7. The fast ages now
      coincide numerically (18) but are different rules; the abstinence ages still differ
      (14 vs 7). Test the OF↔EF switch changes ages, not just day rules.
- [ ] **Label US-specific EF norms** (Ember Wed/Sat) in-app per the §7 scope decision.
- [ ] **A4 framing** holds — app states the Friday practice, leaves gravity to a confessor.
- [ ] **Write the water/medicine record into §1.1** (what does and does not break the
      penitential fast) and have the priest confirm it — the training guidance (Part 3 §3)
      cross-links to this record and must not ship while it dangles.
- [ ] **Primary-source confirmation of two compressed EF rules** at encode-review:
      the Lenten weekday partial-abstinence pattern (B5) and the exact Lenten
      Sunday/feast-of-precept interaction (B9).

One standing caution for the build: the reviewer needs fluency in **both** disciplines.
The corrections above (especially the vigil structure and the US Ember norm) are exactly
the kind a priest formed only in the current discipline could miss — so confirm the same
dual-competence reviewer signs the final encoded rules, not just this draft.

---

## Part D — §7 scope decision (resolved): country selector

Onboarding captures a **home country**, which selects one **norm profile** that carries
*all* country-dependent values together — never as separate toggles. This is what keeps
the EF fast age and the Ember rule from ever drifting apart: US → {EF fast 18, Ember
Wed/Sat partial}; universal → {EF fast 21, Ember Wed/Sat complete}.

Three rules make it honest:
- **It mostly earns its keep on OF.** The Friday-penance norms are what differ by
  conference; this is the mechanism that lets v1 handle more than the US. EF is largely
  universal, so country only swings the two linked values above there.
- **Unauthored countries fall back to universal law, not US.** For any conference whose
  norms aren't authored yet, show the universal norms with a plain line ("your country's
  bishops may specify differently — check with your parish"). Never silently serve US
  rules to a non-US user.
- **Home country, not live location.** Norms tie to a stable setting from onboarding,
  changeable in settings — the engine does not auto-switch norms when a user travels.
  (Whether a traveler is bound by home or local law is a confessor question, not the
  toggle's to assume.)

---

## Sources

**Current discipline (OF):** 1983 *Code of Canon Law* cc. 1249–1253 (Vatican); USCCB,
*Fast & Abstinence*; USCCB, *Pastoral Statement on Penance and Abstinence* (1966).

**1962 discipline (EF):** core definitions from the 1917 *Code of Canon Law*, Title XIV,
cc. 1250–1251, carried forward unchanged (authoritative English: Edward N. Peters,
*The 1917 or Pio-Benedictine Code of Canon Law*, Ignatius Press, 2001); day-by-day 1962
application per Jone/Adelman, *Moral Theology* (1961 US adaptation) and the standard
SSPX/Angelus Press and OnePeterFive summaries, which agree on the shape encoded above.

---

# Part 2 — Applicability & Wellbeing Layer

*Brief §2 (bindings, states, exemptions) and §5 (personal layer & safeguards).*

*Authoring draft for the wellbeing reviewer. App-ready copy is marked **USER-FACING**;
**DESIGN NOTE** blocks are for the dev and reviewer and don't ship as written. This is the
deliverable the QA "Wellbeing sign-off" gate signs against.*

**Status:** drafted — awaiting wellbeing sign-off.

---

## Governing principle

The Church's law already contains its own moderation: it binds specific days and no more,
it excuses whole categories of people, it lifts fasts on Sundays and solemnities, and it
sends genuine doubt to a confessor rather than a rulebook. The app's wellbeing job is to
**make that built-in moderation as visible and as easy to reach as the obligation itself**
— so that devotion never curdles into scrupulosity, and a personal commitment never
hardens into something it was never meant to be. Two failure modes are in scope
throughout: **scrupulosity** (feeling bound when free) and **disordered restriction**
(self-imposed fasting stacking past prudence under religious cover).

---

## 1. Obligation vs. free-choice — the firm distinction

Every restriction the app shows has an **origin**, and the origin is never ambiguous.

**Data model.** Each active restriction carries `origin: church | chosen`. Church
obligations come from the rule engine (the OF/EF corpora); chosen commitments come from
the personal layer. The accumulation check (§4) and the breakage rules below both key off
this field, so it is not optional metadata — it is load-bearing.

**Visual rule.** Church obligations and chosen commitments render in two visibly different
treatments that a user could tell apart at a glance with the labels hidden. A self-imposed
commitment must **never** borrow the visual language of an obligation. (Exact treatments
are the designer's; the requirement is unmistakable separation.)

**Language rule.**
- Obligation: *"The Church asks…"* / *"Today is a day of abstinence."*
- Chosen: *"You've chosen…"* / *"Your Lent commitment."*

Never let the two voices blur — no *"you must"* on a chosen item, ever.

**Breakage rule (the most important one here).** Setting aside a *chosen* commitment is
**not a sin**, and the app must never imply it is — no red failure state, no broken-streak
shaming, no *"you broke your fast"* language on a self-imposed item. Compare:

> **USER-FACING — chosen item set aside**
> *"You set aside your own commitment today. That's yours to decide — nothing to confess,
> nothing to make up."*

Obligations, by contrast, route doubt to a confessor (§3) rather than the app declaring a
verdict either way.

---

## 2. Surfacing exemptions generously

Hiding legitimate easing is how scrupulosity is manufactured. So exemptions are surfaced
**at the moment of obligation**, not buried in settings.

**Where & how.** On any obligatory fast/abstinence day, the easing is one tap from the
obligation itself. Claiming it requires **no written justification and no confirmation
gauntlet** — no *"Are you sure?"*, no guilt prompt, no logging of a reason.

**Framing.** The exemption is the **Church's own provision**, not the user opting out:

> **USER-FACING**
> *"The Church doesn't bind everyone to this. If you're pregnant or nursing, unwell, older,
> doing hard physical work, travelling, or it would be a real hardship, you're excused —
> and that's the Church's own provision, not a shortcut."*

**Populations (from §2):** pregnancy, nursing, illness, advanced age, hard manual labor,
travel, and the general principle that grave inconvenience excuses.

**Privacy.** A claimed exemption is private and is **never scored, streaked, or counted
against the user**. It simply removes the obligation for that day, quietly.

**Interaction with chosen commitments.** If a user who qualifies for an exemption also has
a *self-imposed* fast running, the app gently notes that the easing applies and that
relaxing the chosen commitment is fully legitimate too — it does not silently leave them
bound by their own stricter rule when their health says otherwise.

---

## 3. The "who decides" boundary

The app states **what the law is**. It never poses as the authority who binds or dispenses
a particular person.

- Genuine doubt, scruples, or hardship → *"This is a good question for your pastor or
  confessor"* (and your doctor where health is involved). The app routes; it does not rule.
- No surface — copy, notification, or check — may read as the app adjudicating an
  individual conscience, declaring someone in or out of compliance, or pronouncing
  spiritual gravity. (This is why A4 in the rule drafts states the Friday practice but not
  whether omitting it is sinful.)

---

## 4. The accumulation check

The brief's hardest wellbeing feature: notice when self-imposed restriction stacks past
prudence, and respond **pastorally, never as a block**.

**What it watches — and what it must not become.** The check keys off **declared
commitments**, never measured food intake. Kanon is not a calorie or intake tracker, and
the accumulation check must not turn it into one. Signals are pattern-level and concern
only `origin: chosen` items:
- many food categories excluded at once through stacked personal fasts;
- self-imposed fasts layered on top of the obligatory days, especially most days running;
- chosen fasting extended onto days the Church leaves free (Sundays, solemnities, feast
  days the patron content softens);
- rapid escalation — restrictions added on top of restrictions over a short window.

**Thresholds are set by the reviewer, not hard-coded here.** Numeric cutoffs should be
tuned conservatively *with* the wellbeing reviewer, and they trigger on the commitment
patterns above, not on any quantity of food.

**The response.** Gentle, infrequent, dismissible, and it **widens** — toward food and
toward a person — rather than instructing on how to restrict:

> **USER-FACING — accumulation notice**
> *"You're carrying a few commitments on top of what the Church asks right now. That
> instinct toward devotion is a good one — and part of how the Church orders fasting is to
> keep it sustainable: it builds in feast days, rest, and generous exceptions. If it feels
> like a lot, it can be worth talking over with your confessor, or your doctor if it
> touches your health. Nothing here needs undoing — this is just a gentle check-in."*

**What the notice must never do:**
- never block, lock, or refuse to let the user proceed;
- never shame, never imply a verdict on their spiritual state or their eating;
- never name or suggest specific fasting *methods*, intensities, or "safe" ways to restrict
  — it points outward to a person, not inward to technique;
- never diagnose. The app does not tell anyone they have a disorder.

**When concern exceeds a gentle nudge.** If the pattern is severe or persistent, the app
still does not adjudicate — it offers support resources and routes to a person. For
eating-related concern specifically, direct users to the **National Alliance for Eating
Disorders** helpline. (Note for the dev: do **not** use NEDA's old helpline — it's
discontinued.) This is offered as care, never as an accusation, and remains dismissible.

---

## 5. Scrupulosity & anti-achievement guards (cross-cutting)

These apply across every surface, not just the personal layer:

- **Default to freedom.** Where the law gives freedom, the app presents freedom — it never
  silently rounds an obligation upward or implies more is required than the day binds.
- **Don't manufacture doubt.** No *"did you really keep it?"* re-prompts, no compliance
  audits, no perfectionism mechanics.
- **No severity-as-achievement.** Carried over from the training guidance (§4, rule 5b):
  no streak, badge, or notification rewards fasting harder, stacking restrictions, or
  never missing — and none frames an eased or set-aside *chosen* commitment as a lapse.
  Gamifying severity is exactly where disordered restriction gets religious cover.
- **Quiet, not nagging.** Wellbeing nudges are rare and gentle; the app is a tool for
  keeping the Church's law well, not a source of pressure to engage.

---

## Reviewer checklist (maps to the QA "Wellbeing sign-off")

- [ ] **Obligation vs. free-choice distinction firm** — visually and conceptually
      unmistakable; `origin` field present; chosen items never read as binding (§1).
- [ ] **Breakage of a chosen item carries no sin/shame framing** (§1).
- [ ] **Exemptions complete, accurate, and surfaced generously** — one tap, no
      justification, framed as the Church's provision, never scored (§2).
- [ ] **"Who decides" boundary holds** — app states the law, routes doubt to
      pastor/confessor, never adjudicates a conscience (§3).
- [ ] **Accumulation check present, pastoral, never a block** — commitment-based not
      intake-based, widens toward food and a person, thresholds reviewer-tuned (§4).
- [ ] **ED resource correct** — National Alliance for Eating Disorders helpline; no NEDA;
      offered as care, dismissible, no diagnosis (§4).
- [ ] **No severity-as-achievement anywhere** — streaks/badges/notifications checked
      against §4-5b and §5.
- [ ] **Scrupulosity guarded throughout** — defaults to freedom, manufactures no doubt (§5).

---

# Part 3 — Fast-While-Training Guidance

*Brief §4. The novel content with no canonical source — principles, not prescriptions.*

*Authoring draft for review. App-ready copy is marked **USER-FACING**; everything in
**AUTHORING NOTE** blocks is for the dev, the priest, and the medical reviewer and
does not ship as written.*

**Status:** drafted — awaiting medically literate review and the one canonical
confirmation flagged below.

---

## The frame this whole section sits inside

Everything here rests on one distinction, and it is repeated on purpose:

> **The obligation is the Church's, and it is fixed. The training adjustment is yours,
> and it is prudential.**

When the two pull against each other on a given day, the workout bends. The fast does
not. That ordering is the safeguard — it keeps "I'm training" from ever becoming a
reason to treat the obligation as negotiable, and it keeps the obligation from ever
becoming a reason to train in a way that's unwise.

---

## 1. The mechanical distinction that drives every suggestion

Most of the confusion users bring to this is collapsing two different days into one
word ("fasting"). They are not the same, and they affect training very differently.

> **USER-FACING**
>
> **A day of abstinence** means no meat — but a normal *amount* of food. From a training
> point of view this is close to an ordinary day. You're choosing different foods, not
> eating less of them, so most training is unaffected. Kanon's meal suggestions will
> handle the meatless side for you.
>
> **A day of fast** means a reduced *amount* of food. This is the day worth thinking
> about before a hard session, because you're training on less fuel than usual.
>
> **A few days are both** (for example Ash Wednesday and Good Friday): less food *and*
> no meat. Treat these as fast days for training purposes.

**AUTHORING NOTE.** This split is the single most useful thing the section teaches,
because "it's a fast day, so I shouldn't eat" is a common and wrong inference, and it's
also the doorway to disordered patterns. The recipe/meal layer carries the abstinence
side; this section only governs the *training* response. Keep the line "a normal amount
of food" on abstinence days prominent — it's load-bearing against under-eating.

---

## 2. Training intensity on a fast day

> **USER-FACING**
>
> On a fast day, let the *kind* of session decide:
>
> - **Generally fine on reduced fuel:** easy aerobic work, walking, mobility, stretching,
>   technique and skill practice, light-to-moderate sessions.
> - **Worth easing or moving:** hard intervals, heavy or near-maximal strength work, long
>   endurance efforts — anything you'd normally want to be well-fueled for.
>
> If your numbers are down on a fast day, that's expected information, not a personal
> failing. It isn't something to push past, and it isn't something to feel bad about.

**AUTHORING NOTE.** Principles, not thresholds — no heart-rate zones, no RPE numbers, no
"X% of max." Naming categories of effort is enough and stays clear of prescription. The
"don't chase the number" line is doing wellbeing work: it pre-empts the user who treats a
fast-day PB attempt as a test of devotion.

---

## 3. Hydration

> **USER-FACING**
>
> Drink water through the day, and a little more if you're training — a fast is a reason
> to eat less, never a reason to drink less. Don't let a hard session on a fast day catch
> you underhydrated.

**AUTHORING NOTE — FLAG FOR PRIEST REVIEW.** The *prudential* hydration advice above needs
no canonical source. But it sits next to a canonical question — whether water (and
medicine) breaks the penitential fast — and users *will* read the two as one. Common
understanding is that water does not break the penitential fast, but that claim belongs to
the §1.1 corpus and must be confirmed and stated precisely by the reviewing priest, then
cross-linked here. Until then, the user-facing copy stays purely prudential ("drink
water") and makes no claim about what does or doesn't break the fast.

---

## 4. When to move the session instead of pushing through

> **USER-FACING**
>
> If a hard session lands on a fast day, the simplest answer is usually to move the
> session, not the day. Let the fast day carry your easy or recovery work, and reschedule
> the hard effort for a day you'll be fully fueled. The fast stays where the Church put
> it; the workout is the part that flexes.

**AUTHORING NOTE.** This is the concrete form of the governing frame, and it's worth
surfacing as the default suggestion in the UI on fast days that collide with a planned
hard session: *"Today's a fast day — consider moving a hard session and keeping today's
work easy."* Phrased as a nudge, never a lock.

---

## 5. Two standing rules this section will not break

These are the brief's two hard checks, written as rules rather than reminders.

### 5a. This is general guidance, not medical advice.

> **USER-FACING**
>
> This is general guidance, not medical advice, and it can't account for you specifically.
> If you have a health condition, or if you are pregnant, nursing, diabetic, or taking any
> medication affected by fasting or meal timing, talk with your doctor before fasting while
> training. Many of these situations are also already excused from the fast — see your
> exemptions.

**AUTHORING NOTE.** The named populations match the brief exactly. Two requirements: this
appears near the *top* of the in-app experience for this feature, not buried at the
bottom; and it links to the exemptions in §2 so a pregnant or ill user meets *easing*
first, not just a warning. The disclaimer and the exemption should arrive together —
otherwise the disclaimer reads as "be careful" when the law's actual answer is often "you
are free."

### 5b. Training hard through a fast is not a spiritual achievement.

> **USER-FACING**
>
> The fast is kept by keeping the Church's law about food — that's the whole of it.
> Training hard on top of it adds nothing spiritually, and skipping or easing a workout on
> a fast day takes nothing away. Don't measure the day by how hard the session was.

**AUTHORING NOTE.** This is the most important line in the section and the one most likely
to get softened in editing — resist that. The risk being guarded against is specific:
athletic suffering dressed up as penance, which gives a disordered training pattern
religious cover and makes it harder to question. Nothing in the copy, the notifications,
or any streak/achievement mechanic may reward training *through* a fast, frame a missed or
eased fast-day workout as a lapse, or pair fast days with intensity prompts. Check this
section against the disordered-eating and scrupulosity rules, not just for tone.

---

## Reviewer checklist for this section

- [ ] **Medically literate review done.** A Catholic doctor, ideally, has read this against
      both the medical-disclaimer line (5a) and the wellbeing rules. *(QA: critical path.)*
- [ ] **Hydration/water canonical point confirmed by priest** and the §1.1 result
      cross-linked into §3.
- [ ] **Exemptions linked** from 5a so health-affected users see easing, not only a warning.
- [ ] **No numbers crept in** during editing — no zones, targets, calorie or macro figures.
- [ ] **No mechanic rewards severity** — streaks, badges, and notifications checked against 5b.
- [ ] **Feast-softening honored.** On feasts where the app softens fasting/tracking emphasis
      (per the patron content), the training nudges in §2 and §4 soften too, rather than
      prompting as usual.

---

# Part 4 — Shared Food Vocabulary

*Brief §5. The single controlled list shared by personal fasts and recipe tags.*

*Authoring draft. This is the **single** controlled list that the personal-fast UI, the
recipe tagger, and the meal recommender's hard filter all draw from. The brief's whole
point: design these as one list, not two that drift apart.*

**Status:** drafted — needs reconciliation against the existing recipe tag schema (QA:
"Shared vocabulary with recipe tags"), and two canonical/product decisions flagged below.
**Open decision (from the database review):** the shipped recipe database extends
`fast_codes` with `wheat` and `soy` (110 rows) beyond the seven categories below. Decide
explicitly: first-class fast categories (vocabulary becomes nine) or allergen tags reused
as fast filters — either is fine; it must be intentional, documented, and resolved to one
source of truth shared with the allergen list.

---

## The one rule that makes this work

Each category means **the same thing** whether the user is naming what they avoid or the
tagger is recording what a recipe contains. That single shared meaning is the anti-drift
mechanism. Concretely:

> A user's personal fast is a set of **avoided** categories.
> A recipe carries a set of **contained** categories.
> The recommender's hard filter allows a recipe **iff** its contained categories and the
> user's avoided categories do not overlap.
> `allowed = (recipe.categories ∩ user.avoided) is empty`

If "meat" means flesh-only on the user side but flesh-plus-stock on the recipe side, the
filter is wrong and no one will notice until a chicken-broth soup gets recommended on a
meat-free day. So every category below has **one** definition, used on both sides.

When a recipe is genuinely ambiguous, **the tagger errs toward including the category** —
i.e. toward the recipe being filtered *out*. Wrongly hiding a fine dish is a mild cost;
wrongly recommending a forbidden one is the real failure.

---

## The controlled list (v1)

The seven named categories from the brief, plus the custom field. Independently
selectable — a stricter user can avoid several at once (e.g. meat **and** fish).

| Category | User label | Means (and so this recipe tag means) | Includes derivatives | Does **not** include |
|---|---|---|---|---|
| `meat` | Meat | Flesh of mammals and birds | Meat stock/broth, lard, gelatin, drippings, bacon/meat bits, meat-based gravy | Fish/seafood (separate category) |
| `fish` | Fish & seafood | Aquatic animals: finfish, shellfish, crustaceans, mollusks | Fish stock, fish sauce, anchovy in dressings/Worcestershire | — |
| `dairy` | Dairy | Milk and milk products: milk, cheese, butter, cream, yogurt | Whey, casein, milk powder, butter used in cooking/baking | Eggs (separate); plant "milks" |
| `eggs` | Eggs | Eggs and egg-containing items | Mayonnaise, egg wash, egg pasta, egg in baked goods | — |
| `alcohol` | Alcohol | Alcoholic beverages, and alcohol added as a cooking ingredient | Wine/beer/spirits cooked into a dish as a named ingredient | Trace flavoring (e.g. vanilla extract) — see trace rule |
| `oil` | Oil | Added culinary oils and fats of plant origin (olive, seed, vegetable) | Added cooking oil, oil in dressings/frying | Fat naturally in whole foods (nuts, olives, avocado); animal fats route to their source — **lard → `meat`, butter → `dairy`** |
| `sweets` | Sweets | **Dish class:** desserts, confections, sweetened treats | Cake, cookies, candy, ice cream, sweet pastries, sugary drinks | Incidental sugar in a savory dish — see dish-class rule |
| `custom` | (user types it) | A commitment the user names in free text | n/a — see custom-field handling | n/a |

---

## Two things tag differently — the tagger must know which

Most categories are **ingredient-driven**: a recipe gets the tag if any ingredient belongs
to the category (derivatives included, above the trace line). `meat`, `fish`, `dairy`,
`eggs`, `oil`, `alcohol` all work this way.

**`sweets` is dish-driven, not ingredient-driven.** A user "giving up sweets" means
desserts and candy — not "no ketchup because it contains sugar." So `sweets` is applied at
the *dish* level (is this recipe a dessert/confection?), and a teaspoon of sugar in a
savory sauce does **not** trip it. This asymmetry is small for the user (they just tick a
box) but the recipe schema and the tagging pipeline must support both modes. Flag this for
the dev — it's the easiest place for the tagger to be built wrong.

### The trace rule

Derivatives that are a *structural* part of the dish count (a soup built on chicken stock
is `meat`; a sauce with a named pour of wine is `alcohol`). Flavoring agents present only
in trace amounts do **not** trip the category — the standing example is vanilla extract,
which contains alcohol but should not flag a recipe as `alcohol`. Where to draw the trace
line on a couple of borderline cases is a decision below, not something silently picked.

---

## The custom field — be honest about what it can't do

A free-text custom commitment ("no coffee," "no snacks between meals") **cannot be enforced
by the hard filter**, because recipes are not tagged with arbitrary user terms. The app
must not imply otherwise.

Proposed handling:
- A custom commitment is **tracked and displayed** for the user's own observance, and
- It is **advisory only** in the recommender — it does not filter recipes, **unless** the
  user maps their custom term onto an existing category (e.g. their custom "no butter"
  maps to `dairy`), in which case it filters normally.
- The UI says plainly which custom commitments the meal suggestions can and can't account
  for. Silent non-enforcement is the dishonest failure mode here.

---

## Single source of truth (this is the structural anti-drift guarantee)

The list lives in **one** place — one enum / config — imported by the personal-fast UI,
the recipe tagger, and the recommender. Adding or changing a category is a single schema
change that touches all consumers at once; it is never edited in one surface and not the
other. If the personal-fast list and the recipe-tag list can be edited independently, they
*will* drift, which is exactly what the brief is guarding against.

```
# illustrative — one definition, all consumers import it
FAST_CATEGORIES = [meat, fish, dairy, eggs, alcohol, oil, sweets]   # + custom (advisory)
# open decision: + wheat, soy (see status note above)

recipe.contained_categories ⊆ FAST_CATEGORIES        # tagger output
user_fast.avoided_categories ⊆ FAST_CATEGORIES        # personal fast
allowed(recipe, user) = recipe.contained_categories ∩ user_fast.avoided_categories == ∅
```

---

## Integration points (and one canonical boundary)

- **The obligation engine can reuse this same filter.** A day the engine rules as
  abstinence is, mechanically, a system-applied `avoid: meat` (with `fish` allowed — which
  is the whole reason fish and meat are separate categories). So the calendar/obligation
  layer, personal fasts, and recipe filtering can all run through one mechanism. That's a
  nice consolidation — but it only holds if `meat`/`fish` here are defined consistently
  with the canon.

- **FLAG — canonical alignment, owned by §1.** Whether meat *broth/stock* violates
  **abstinence** (as opposed to a personal meat-fast) is a canonical question that belongs
  to the §1.1/§1.2 corpora and the priest review. The `meat` *tag* includes
  stock/derivatives so the recommender errs safe — but note B1: the EF definition of
  complete abstinence explicitly excludes meat broth, so under the 1962 discipline the
  canonical-abstinence `meat` and the personal-fast `meat` already diverge. **Resolve
  before the single-filter consolidation is built:** the obligation layer's filter and the
  personal-fast filter may legitimately need different `meat` scopes. Cheap to design for
  up front, expensive to retrofit.

- **Orthodox bridge.** This list already maps closely onto the tiers of Orthodox fasting
  (meat / dairy+eggs / fish / wine / oil), which is why `oil` and `alcohol` are in a Roman
  v1 at all — they're the personal-layer hooks the brief uses to carry users until the
  Orthodox calendars ship. Two refinements to revisit when Orthodox lands: Orthodox
  practice distinguishes **wine** specifically (where `alcohol` is broader), and its
  **oil** restriction is traditionally about added olive oil. Note now, refine later;
  don't overbuild v1.

---

## Open decisions / review checklist for this section

- [ ] **Reconcile against the existing recipe tag schema.** The shipped database extends
      fast_codes with wheat/soy — resolve to one intentional shared list (see status note).
      *(QA: shared vocabulary with recipe tags.)*
- [ ] **Confirm the `meat` definition with §1's abstinence ruling** (broth/stock/gelatin)
      so the obligation-layer reuse is canonically correct — noting the EF B1 divergence.
- [ ] **Trace-line decisions:** does wine simmered into a long-cooked sauce trip `alcohol`?
      (Proposed: yes if named as an ingredient.) Where exactly does "trace flavoring" end?
      Reviewer to set.
- [ ] **`sweets` dish-class confirmed** in the tagger — applied at dish level, not on
      incidental sugar.
- [ ] **Custom-field honesty confirmed in UI** — advisory vs. mappable-to-category is
      stated plainly; no silent non-enforcement.
- [ ] **Single-source-of-truth enforced in code** — one enum, all consumers import it;
      adding a category touches every surface at once.

---

# Part 5 — System Cross-Checks

*Brief §6. Verification of the engine against the calendar import and the patron content.*

*A test spec, not a result. These checks verify the fasting engine against two systems
this draft can't see — Introibo's calendar and the patron feast content — so each is
written as a concrete case with an expected result, for whoever has those systems to run.*

**Status:** drafted — to be executed against the live calendar import and patron content.

---

## 1. Calendar import seam

**What it guards:** the engine consumes day-facts and never re-derives the calendar, so
Orthodox can slot in later as purely additive. No fasting rule may be entangled with
calendar computation.

- [ ] **Confirm the seam contract.** Pin down exactly what Introibo provides (verified
      date, rank, color, season, feast keys, transfer info) versus what the engine adds
      (the obligation mapping). Write it down as the interface; everything below assumes it.
- [ ] **No re-derivation.** The engine computes no dates, ranks, or transfers itself — it
      reads them. Grep the resolver for any date math or rank logic; there should be none.
      A fasting rule that recomputes "is this a solemnity" instead of reading the day-fact
      is the bug this check exists to catch.
- [ ] **Transfers are respected.** When the calendar transfers a feast, the fast/feast
      behavior follows the **transferred** date, not the nominal one. *Test case:* a feast
      that displaces a penitential day when transferred — confirm the obligation moves with
      it. (This is where re-derivation usually leaks in.)
- [ ] **Additive-only check.** Confirm a new tradition's calendar (the future Orthodox
      case) could be added as another day-fact source without touching the rule resolver.
      If adding a calendar would require editing the OF/EF rules, the seam isn't clean.

---

## 2. Feast-day softening matches the patron content

**What it guards:** the patron feast notes already promise the fasting/tracking emphasis
"softens today." The engine must actually produce that, or the formation content writes a
check the engine doesn't cash.

- [ ] **Enumerate the promise.** List the feasts where the patron content says the emphasis
      softens. This is the authoritative list to test against — pull it from the patron
      content, don't infer it.
- [ ] **Engine matches on each.** For every feast on that list, confirm the engine actually
      softens: the fasting/tracking prompts ease, and (per the training guidance §4) the
      training nudges soften too rather than prompting as usual.
- [ ] **No contradiction with obligation.** Softening is a UI/emphasis change, not a
      canonical claim — it must not read as the app lifting an obligation the calendar
      still binds. *Test case:* a feast the patron content softens that is **not** a
      solemnity lifting the day's fast — confirm the app eases its emphasis without telling
      the user they're free when they aren't. (Softening tone ≠ dispensing.)
- [ ] **The two lists are reconciled.** Where a feast both softens (patron) and lifts the
      obligation (rank threshold, A5/B9), confirm both fire and agree.

---

## 3. Two-discipline onboarding switch

**What it guards:** onboarding offers OF and EF; the two corpora must map cleanly onto that
choice, and a user switching disciplines must behave correctly.

- [ ] **Each corpus maps to its choice.** OF selection → OF rules only; EF selection → EF
      rules only. No leakage between them.
- [ ] **The switch changes ages, not just days.** *Test case (the important one):* a user
      toggles OF→EF and back. Confirm the **binding ages change** with the discipline
      (OF fast 18 / abstinence 14; EF fast 18-or-21-by-country / abstinence 7), not only
      the day rules. A user who is bound under one discipline and exempt-by-age under the
      other must flip correctly. This is the cross-wire the rule drafts keep warning about.
- [ ] **Rank threshold switches too.** Confirm the lift logic swaps with the discipline —
      OF uses the solemnity threshold (A5); EF uses feast-of-precept/Sunday-except-Lent
      (B9). Same calendar day can lift in one discipline and bind in the other; confirm both.
- [ ] **Country profile persists across the switch.** The §7 country norm profile (US vs
      universal) applies within whichever discipline is active; switching discipline doesn't
      reset it.

---

## What this spec can't do, and who closes it

These are written to be run, not signed off here. Executing them needs the live calendar
import and the patron content side by side with the engine — so they belong to whoever
holds those systems. Items in §2 also touch the patron formation content, so the person
who owns that content should confirm the softening list is authoritative. None of this
overlaps the priest/medical/wellbeing review gates; it's an engineering-and-content
consistency pass.
