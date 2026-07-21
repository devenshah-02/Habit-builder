import { addDays, todayStr } from "./storage";
import { computeCoreScore } from "./scoring";
import { AppMeta, DayRecord, Habit } from "./types";

/**
 * Runs on every app open. Because there's no backend cron (per PRD — local-first PWA),
 * "midnight" isn't a moment that fires code; it's a boundary we check retroactively.
 * Walks forward from the day after lastFinalizedDate through yesterday, finalizing each:
 *   - >=100%  -> streak +1, progress toward a freeze token (1 per 7-day 100% stretch, max 2)
 *   - 50-99%  -> streak holds flat, no freeze earned or spent
 *   - <50%    -> streak breaks UNLESS a freeze token is available, in which case it's spent
 *                and the streak is preserved instead.
 * A day with zero mandatory habits due (e.g. all-bonus day) auto-scores 100 (see scoring.ts)
 * and is treated as a Perfect day for streak purposes.
 */
export function finalizeMissedDays(
  habits: Habit[],
  days: Record<string, DayRecord>,
  meta: AppMeta
): { days: Record<string, DayRecord>; meta: AppMeta } {
  const today = todayStr();
  const nextDays = { ...days };
  let nextMeta = { ...meta };

  // First-ever run: nothing to finalize, just anchor to yesterday so today stays live.
  if (!nextMeta.lastFinalizedDate) {
    nextMeta.lastFinalizedDate = addDays(today, -1);
    return { days: nextDays, meta: nextMeta };
  }

  let cursor = addDays(nextMeta.lastFinalizedDate, 1);
  while (cursor < today) {
    const existing = nextDays[cursor];
    const log = existing?.log ?? {};
    const score = computeCoreScore(habits, log, cursor, nextDays);

    if (score >= 100) {
      nextMeta.streak += 1;
      nextMeta.perfectStreakSinceLastToken += 1;
      if (nextMeta.perfectStreakSinceLastToken >= 7 && nextMeta.freeze < 2) {
        nextMeta.freeze += 1;
        nextMeta.perfectStreakSinceLastToken = 0;
      }
    } else if (score < 50) {
      if (nextMeta.freeze > 0) {
        nextMeta.freeze -= 1; // spend a token, streak survives
      } else {
        nextMeta.streak = 0;
      }
      nextMeta.perfectStreakSinceLastToken = 0;
    } else {
      // 50-99%: flat day, no reward, no penalty
      nextMeta.perfectStreakSinceLastToken = 0;
    }

    nextDays[cursor] = {
      date: cursor,
      log,
      score,
      finalized: true,
      loggedLate: existing?.loggedLate ?? false,
    };
    nextMeta.lastFinalizedDate = cursor;
    cursor = addDays(cursor, 1);
  }

  return { days: nextDays, meta: nextMeta };
}
