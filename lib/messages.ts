// Starter pools (8-10 per tier). Expand toward ~25/tier over time so it stays fresh —
// this is content work, not code work, so add lines here whenever you think of one.
export const MESSAGES: Record<"Perfect" | "Good" | "Okay" | "Rough", string[]> = {
  Perfect: [
    "Flawless. Insufferable, but flawless.",
    "10/10. Overachiever. Suspicious, honestly.",
    "Full clear. Your future self just texted 'thank you.'",
    "100%. Even the chores. Who ARE you today.",
    "Flawless victory. Minoxidil is shaking.",
    "Perfect day. Please don't make this a personality trait.",
    "Every box checked. Even we're a little impressed.",
    "Clean sweep. Tomorrow has a lot to live up to.",
  ],
  Good: [
    "Strong showing. Don't let it go to your head.",
    "So close it's almost annoying. Almost.",
    "Solid day. One thing ghosted you though.",
    "B+ effort. Your hair follicles will allow it.",
    "Nearly perfect — the 1% is judging you quietly.",
    "Good day. Not great. Good. Sit with that.",
    "Respectable. The gap between you and Perfect noticed you, though.",
  ],
  Okay: [
    "Middling. We've all had worse Tuesdays.",
    "Middle of the road. The road noticed.",
    "Half a win is still a win. A small, damp one.",
    "You showed up. Barely. But you showed up.",
    "Coin-flip energy today. Heads, you tried.",
    "Okay is a tier. You're standing in it.",
    "Not bad, not good, deeply medium. Iconic, in its way.",
  ],
  Rough: [
    "Rough one. Tomorrow's still yours.",
    "Zero judgment. Okay, slight judgment. But mostly none.",
    "The vitamins are still in the bottle, waiting patiently.",
    "That's a freeze-token day if I've ever seen one.",
    "Rough day. Nobody's revoking your membership.",
    "Today didn't work out. Today doesn't get a vote on tomorrow.",
    "Low score, still logged in. That's the actual habit.",
  ],
};

/** Deterministic no-repeat-until-cycle pick, seeded by date so it's stable across re-renders. */
export function pickMessage(tier: "Perfect" | "Good" | "Okay" | "Rough", dateStr: string): string {
  const pool = MESSAGES[tier];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
}
