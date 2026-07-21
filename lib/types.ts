export type HabitType = "binary" | "quantity";

export type Frequency =
  | { kind: "daily" }
  | { kind: "timesPerWeek"; n: number }
  | { kind: "specificDays"; days: number[] } // 0=Sun..6=Sat
  | { kind: "monthly" }; // bonus habits only (per PRD: monthly cadence can't live in daily Core Score)

export interface Habit {
  id: string;
  name: string;
  icon: IconName;
  type: HabitType;
  mandatory: boolean; // false => Bonus Quest, never affects Core Score
  frequency: Frequency;
  target?: number; // quantity habits only
  weight: number; // default 1
}

export type IconName = "pill" | "drop" | "dumbbell" | "book" | "sun" | "leaf";

/** One day's raw logged progress per habit id. Binary: 0|1. Quantity: running count. */
export type DayLog = Record<string, number>;

export interface DayRecord {
  date: string; // YYYY-MM-DD
  log: DayLog;
  score: number; // Core Score for that day, computed at finalize time
  finalized: boolean;
  loggedLate: boolean; // true if any entry in this day was created/edited after the day closed
}

export interface AppMeta {
  streak: number;
  freeze: number; // 0..2
  perfectStreakSinceLastToken: number; // consecutive 100% finalized days counted toward next token
  lastFinalizedDate: string | null; // YYYY-MM-DD
  lastBannerShownDate: string | null;
}

export interface Tier {
  label: "Perfect" | "Good" | "Okay" | "Rough";
  color: string;
  glow: string;
  bannerBg: string;
}

/** Static profile facts — set once, not logged repeatedly. */
export interface Profile {
  heightCm: number | null;
}

/** A single body-metrics log entry. Fully separate from Core Score/streak by design. */
export interface BodyMetricEntry {
  date: string; // YYYY-MM-DD
  weightKg?: number;
  bodyFatPct?: number;
}
