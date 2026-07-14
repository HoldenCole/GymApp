/**
 * Fast-while-training guidance (content pack Part 3) — the USER-FACING
 * copy, packaged verbatim. Principles, never prescriptions: no zones,
 * no RPE, no percentages, no calorie figures (a test enforces this).
 *
 * Status: drafted — awaiting the medically literate review and the
 * water/medicine canonical record (the §3 copy stays purely prudential
 * and makes no claim about what does or doesn't break the fast until
 * the priest confirms that record).
 *
 * Standing rules carried in the copy itself: the workout bends, the
 * fast does not (the frame); and training hard through a fast is not a
 * spiritual achievement (5b) — nothing may reward severity.
 */

export const GUIDANCE_STATUS =
  "General guidance, drafted — medical review pending.";

export const GUIDANCE_FRAME =
  "The obligation is the Church's, and it is fixed. The training adjustment is yours, and it is prudential.";

export interface GuidanceSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export const GUIDANCE_SECTIONS: GuidanceSection[] = [
  {
    id: "disclaimer",
    title: "Before anything else",
    paragraphs: [
      "This is general guidance, not medical advice, and it can't account for you specifically. If you have a health condition, or if you are pregnant, nursing, diabetic, or taking any medication affected by fasting or meal timing, talk with your doctor before fasting while training. Many of these situations are also already excused from the fast — see your exemptions.",
    ],
  },
  {
    id: "distinction",
    title: "Abstinence days and fast days are different days",
    paragraphs: [
      "A day of abstinence means no meat — but a normal amount of food. From a training point of view this is close to an ordinary day. You're choosing different foods, not eating less of them, so most training is unaffected. Kanon's meal suggestions will handle the meatless side for you.",
      "A day of fast means a reduced amount of food. This is the day worth thinking about before a hard session, because you're training on less fuel than usual.",
      "A few days are both (for example Ash Wednesday and Good Friday): less food and no meat. Treat these as fast days for training purposes.",
    ],
  },
  {
    id: "intensity",
    title: "Training on a fast day",
    paragraphs: [
      "On a fast day, let the kind of session decide. Generally fine on reduced fuel: easy aerobic work, walking, mobility, stretching, technique and skill practice, light-to-moderate sessions. Worth easing or moving: hard intervals, heavy or near-maximal strength work, long endurance efforts — anything you'd normally want to be well-fueled for.",
      "If your numbers are down on a fast day, that's expected information, not a personal failing. It isn't something to push past, and it isn't something to feel bad about.",
    ],
  },
  {
    id: "hydration",
    title: "Hydration",
    paragraphs: [
      "Drink water through the day, and a little more if you're training — a fast is a reason to eat less, never a reason to drink less. Don't let a hard session on a fast day catch you underhydrated.",
    ],
  },
  {
    id: "move_the_session",
    title: "Move the session, not the day",
    paragraphs: [
      "If a hard session lands on a fast day, the simplest answer is usually to move the session, not the day. Let the fast day carry your easy or recovery work, and reschedule the hard effort for a day you'll be fully fueled. The fast stays where the Church put it; the workout is the part that flexes.",
    ],
  },
  {
    id: "not_an_achievement",
    title: "The fast is not a training goal",
    paragraphs: [
      "The fast is kept by keeping the Church's law about food — that's the whole of it. Training hard on top of it adds nothing spiritually, and skipping or easing a workout on a fast day takes nothing away. Don't measure the day by how hard the session was.",
    ],
  },
];

/**
 * The §4 default nudge for a fast-day collision with a planned session.
 * A nudge, never a lock — and on feast days the app softens rather than
 * prompting as usual (Part 3 reviewer checklist).
 */
export const TRAINING_COLLISION_NUDGE =
  "Today's a fast day — consider moving a hard session and keeping today's work easy.";
