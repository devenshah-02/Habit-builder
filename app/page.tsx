"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CoreScoreRing } from "@/components/CoreScoreRing";
import { FreezeTokens } from "@/components/FreezeTokens";
import { HabitRow } from "@/components/HabitRow";
import { TierBanner } from "@/components/TierBanner";
import { pickMessage } from "@/lib/messages";
import { computeCoreScore, isDueToday, remainingCount, tierOf } from "@/lib/scoring";
import {
  loadDays,
  loadHabits,
  loadMeta,
  saveDays,
  saveHabits,
  saveMeta,
  todayStr,
} from "@/lib/storage";
import { finalizeMissedDays } from "@/lib/streak";
import { AppMeta, DayLog, DayRecord, Habit } from "@/lib/types";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false); // drives the 0->score ring fill
  const [habits, setHabits] = useState<Habit[]>([]);
  const [days, setDays] = useState<Record<string, DayRecord>>({});
  const [meta, setMeta] = useState<AppMeta>({
    streak: 0,
    freeze: 0,
    perfectStreakSinceLastToken: 0,
    lastFinalizedDate: null,
    lastBannerShownDate: null,
  });
  const [bannerOpen, setBannerOpen] = useState(false);
  const [perfectBurst, setPerfectBurst] = useState(false);
  const wasPerfect = useRef(false);
  const freezeJustEarned = useRef(false);

  const today = todayStr();

  // ---- Boot: load state, run finalize-on-open, decide whether to show today's banner ----
  useEffect(() => {
    const loadedHabits = loadHabits();
    const loadedDays = loadDays();
    const loadedMeta = loadMeta();
    const prevFreeze = loadedMeta.freeze;

    const { days: finalizedDays, meta: finalizedMeta } = finalizeMissedDays(
      loadedHabits,
      loadedDays,
      loadedMeta
    );

    freezeJustEarned.current = finalizedMeta.freeze > prevFreeze;

    setHabits(loadedHabits);
    setDays(finalizedDays);
    setMeta(finalizedMeta);
    saveDays(finalizedDays);
    saveMeta(finalizedMeta);

    setBannerOpen(finalizedMeta.lastBannerShownDate !== today);
    setReady(true);
    requestAnimationFrame(() => setTimeout(() => setMounted(true), 60));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const todayLog: DayLog = days[today]?.log ?? {};

  const score = useMemo(
    () => (ready ? computeCoreScore(habits, todayLog, today, days) : 0),
    [ready, habits, todayLog, today, days]
  );
  const tier = tierOf(score);
  const remaining = useMemo(
    () => (ready ? remainingCount(habits, todayLog, today, days) : 0),
    [ready, habits, todayLog, today, days]
  );

  // Fire the 100% burst once on the transition into Perfect, not on every re-render at 100%.
  useEffect(() => {
    if (!ready) return;
    if (score >= 100 && !wasPerfect.current) {
      wasPerfect.current = true;
      setPerfectBurst(true);
      const t = setTimeout(() => setPerfectBurst(false), 1400);
      return () => clearTimeout(t);
    }
    if (score < 100) wasPerfect.current = false;
  }, [score, ready]);

  function updateLog(habitId: string, value: number) {
    setDays((prev) => {
      const rec = prev[today] ?? { date: today, log: {}, score: 0, finalized: false, loggedLate: false };
      const nextRec: DayRecord = { ...rec, log: { ...rec.log, [habitId]: value } };
      const next = { ...prev, [today]: nextRec };
      saveDays(next);
      return next;
    });
  }

  function toggleBinary(h: Habit) {
    const current = todayLog[h.id] ?? 0;
    updateLog(h.id, current >= 1 ? 0 : 1);
  }
  function incQty(h: Habit) {
    const current = todayLog[h.id] ?? 0;
    updateLog(h.id, Math.min(current + 1, h.target ?? 1));
  }
  function decQty(h: Habit) {
    const current = todayLog[h.id] ?? 0;
    updateLog(h.id, Math.max(current - 1, 0));
  }

  function dismissBanner() {
    setBannerOpen(false);
    const nextMeta = { ...meta, lastBannerShownDate: today };
    setMeta(nextMeta);
    saveMeta(nextMeta);
  }

  const dateLabel = useMemo(() => {
    const [y, m, d] = today.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const day = dt.toLocaleDateString("en-US", { weekday: "short" });
    const mon = dt.toLocaleDateString("en-US", { month: "short" });
    return `${day} · ${mon} ${d}`.toUpperCase();
  }, [today]);

  if (!ready) return null;

  return (
    <div
      style={{
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100vh",
        background: "var(--color-bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "0 22px 140px", position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 18 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", color: "var(--color-muted)" }}>
              {dateLabel}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 600, color: "var(--color-text)", marginTop: 2 }}>
              Morning, you.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FreezeTokens freeze={meta.freeze} justEarned={freezeJustEarned.current} />
            <Link
              href="/settings"
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                border: "1.5px solid var(--color-idle-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-muted)",
                textDecoration: "none",
                fontSize: 15,
              }}
              aria-label="Settings"
            >
              ⚙
            </Link>
          </div>
        </div>

        {/* Core Score ring */}
        <CoreScoreRing score={score} mounted={mounted} tier={tier} streak={meta.streak} perfect={perfectBurst} />

        {/* Tier label */}
        <div
          style={{
            textAlign: "center",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: tier.color,
            transition: "color 500ms ease",
            marginTop: 4,
          }}
        >
          {tier.label}
        </div>

        {/* Remaining counter */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22, marginBottom: 14 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--color-text)" }}>
            {remaining}
          </span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-muted)" }}>
            {remaining === 0 ? "— all clear." : remaining === 1 ? "thing left today" : "things left today"}
          </span>
          <div style={{ height: 1, background: "var(--color-hairline)", flex: 1 }} />
        </div>

        {/* Habit list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {habits.map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              value={todayLog[h.id]}
              due={h.mandatory ? isDueToday(h, today, days) : true}
              onToggle={() => toggleBinary(h)}
              onInc={() => incQty(h)}
              onDec={() => decQty(h)}
            />
          ))}
        </div>
      </div>

      <TierBanner
        open={bannerOpen}
        tier={tier}
        score={score}
        message={pickMessage(tier.label, today)}
        onDismiss={dismissBanner}
      />
    </div>
  );
}
