import { loadDays, loadHabits, loadMeta, saveDays, saveHabits, saveMeta, todayStr } from "./storage";
import { AppMeta, DayRecord, Habit } from "./types";

interface BackupFile {
  exportedAt: string;
  version: 1;
  habits: Habit[];
  days: Record<string, DayRecord>;
  meta: AppMeta;
}

export function exportBackup() {
  const backup: BackupFile = {
    exportedAt: new Date().toISOString(),
    version: 1,
    habits: loadHabits(),
    days: loadDays(),
    meta: loadMeta(),
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `habit-tracker-backup-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restores from a backup file. This OVERWRITES current localStorage data —
 * caller is responsible for confirming with the user first (destructive action).
 * Returns an error message on failure, or null on success.
 */
export function importBackup(fileText: string): string | null {
  let parsed: BackupFile;
  try {
    parsed = JSON.parse(fileText);
  } catch {
    return "That file isn't valid JSON — is it actually a habit tracker backup?";
  }
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.habits) || typeof parsed.days !== "object") {
    return "That file doesn't match the expected backup format.";
  }
  saveHabits(parsed.habits);
  saveDays(parsed.days ?? {});
  saveMeta(
    parsed.meta ?? {
      streak: 0,
      freeze: 0,
      perfectStreakSinceLastToken: 0,
      lastFinalizedDate: null,
      lastBannerShownDate: null,
    }
  );
  return null;
}
