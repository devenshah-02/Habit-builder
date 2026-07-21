import { AppMeta, DayRecord, Habit } from "./types";

const HABITS_KEY = "ht:habits";
const DAYS_KEY = "ht:days"; // Record<string /*date*/, DayRecord>
const META_KEY = "ht:meta";

// Seed habits mirror Deven's real routine: mixed cadence + one bonus item,
// so the frequency engine (daily / weekly / quantity) is exercised from day one.
// Edit via the Settings screen once it's built (see PRD roadmap) — no code change needed after that.
export const DEFAULT_HABITS: Habit[] = [
  { id: "d3", name: "Vitamin D3", icon: "sun", type: "binary", mandatory: true, frequency: { kind: "timesPerWeek", n: 1 }, weight: 1 },
  { id: "mino", name: "Minoxidil", icon: "leaf", type: "binary", mandatory: true, frequency: { kind: "daily" }, weight: 1 },
  { id: "vitamin", name: "Multivitamin", icon: "pill", type: "binary", mandatory: true, frequency: { kind: "daily" }, weight: 1 },
  { id: "water", name: "Water", icon: "drop", type: "quantity", mandatory: true, frequency: { kind: "daily" }, target: 8, weight: 1 },
  { id: "steps", name: "Steps", icon: "dumbbell", type: "quantity", mandatory: true, frequency: { kind: "daily" }, target: 10, weight: 1 }, // target in thousands (10 = 10k)
  { id: "read", name: "Read", icon: "book", type: "binary", mandatory: false, frequency: { kind: "daily" }, weight: 1 },
];

export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return todayStr(dt);
}

export function loadHabits(): Habit[] {
  if (typeof window === "undefined") return DEFAULT_HABITS;
  const raw = window.localStorage.getItem(HABITS_KEY);
  if (!raw) {
    window.localStorage.setItem(HABITS_KEY, JSON.stringify(DEFAULT_HABITS));
    return DEFAULT_HABITS;
  }
  try {
    return JSON.parse(raw) as Habit[];
  } catch {
    return DEFAULT_HABITS;
  }
}

export function saveHabits(habits: Habit[]) {
  window.localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function loadDays(): Record<string, DayRecord> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(DAYS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, DayRecord>;
  } catch {
    return {};
  }
}

export function saveDays(days: Record<string, DayRecord>) {
  window.localStorage.setItem(DAYS_KEY, JSON.stringify(days));
}

export function loadMeta(): AppMeta {
  const fallback: AppMeta = {
    streak: 0,
    freeze: 0,
    perfectStreakSinceLastToken: 0,
    lastFinalizedDate: null,
    lastBannerShownDate: null,
  };
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(META_KEY);
  if (!raw) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(raw) as AppMeta) };
  } catch {
    return fallback;
  }
}

export function saveMeta(meta: AppMeta) {
  window.localStorage.setItem(META_KEY, JSON.stringify(meta));
}
