import { DayLog, DayRecord, Frequency, Habit, Tier } from "./types";

/** Progress 0..1 for a single habit given its logged value today. */
export function progress(habit: Habit, loggedValue: number | undefined): number {
  if (habit.type === "binary") return loggedValue ? 1 : 0;
  const target = habit.target ?? 1;
  return Math.min((loggedValue ?? 0) / target, 1);
}

function dayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay(); // 0=Sun..6=Sat
}

function isSameWeek(a: string, b: string): boolean {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = new Date(ay, am - 1, ad);
  const db = new Date(by, bm - 1, bd);
  const startOfWeek = (d: Date) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() - copy.getDay()); // back to Sunday
    copy.setHours(0, 0, 0, 0);
    return copy.getTime();
  };
  return startOfWeek(da) === startOfWeek(db);
}

/**
 * Is this habit "due" on the given date, given completion history?
 * A habit not due today never enters the score denominator — this is the
 * core fix for weekly habits (e.g. D3) not dragging the score down on off-days.
 */
export function isDueToday(
  habit: Habit,
  dateStr: string,
  days: Record<string, DayRecord>
): boolean {
  const freq: Frequency = habit.frequency;
  if (freq.kind === "daily") return true;
  if (freq.kind === "specificDays") return freq.days.includes(dayOfWeek(dateStr));
  if (freq.kind === "monthly") return false; // bonus-only cadence, never enters daily due-set
  if (freq.kind === "timesPerWeek") {
    // Count completions earlier this week (not including today) for this habit.
    let completedThisWeek = 0;
    for (const [d, rec] of Object.entries(days)) {
      if (d === dateStr) continue;
      if (!isSameWeek(d, dateStr)) continue;
      if (progress(habit, rec.log[habit.id]) >= 1) completedThisWeek += 1;
    }
    return completedThisWeek < freq.n;
  }
  return true;
}

/** Core Score: mandatory + due-today habits only. Bonus habits never enter this calc. */
export function computeCoreScore(
  habits: Habit[],
  log: DayLog,
  dateStr: string,
  days: Record<string, DayRecord>
): number {
  const dueMandatory = habits.filter((h) => h.mandatory && isDueToday(h, dateStr, days));
  if (dueMandatory.length === 0) return 100; // nothing due => trivially clear, avoids divide-by-zero
  const totalWeight = dueMandatory.reduce((a, h) => a + h.weight, 0);
  const earned = dueMandatory.reduce((a, h) => a + progress(h, log[h.id]) * h.weight, 0);
  return Math.round((earned / totalWeight) * 100);
}

export function tierOf(score: number): Tier {
  if (score >= 100)
    return { label: "Perfect", color: "#1BB6A6", glow: "rgba(27,182,166,0.55)", bannerBg: "#1BB6A6" };
  if (score >= 80)
    return { label: "Good", color: "#C2461B", glow: "rgba(194,70,27,0.5)", bannerBg: "#C2461B" };
  if (score >= 50)
    return { label: "Okay", color: "#D18A6E", glow: "rgba(209,138,110,0.4)", bannerBg: "#C2461B" };
  return { label: "Rough", color: "#8C8479", glow: "rgba(140,132,121,0.35)", bannerBg: "#6E675E" };
}

export function remainingCount(
  habits: Habit[],
  log: DayLog,
  dateStr: string,
  days: Record<string, DayRecord>
): number {
  const dueMandatory = habits.filter((h) => h.mandatory && isDueToday(h, dateStr, days));
  return dueMandatory.filter((h) => progress(h, log[h.id]) < 1).length;
}
