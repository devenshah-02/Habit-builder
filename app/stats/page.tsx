"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { tierOf } from "@/lib/scoring";
import { addDays, loadDays, todayStr } from "@/lib/storage";
import { DayRecord } from "@/lib/types";

const DAYS_SHOWN = 84; // 12 weeks — kept mobile-scrollable rather than a full year grid

export default function StatsPage() {
  const [ready, setReady] = useState(false);
  const [days, setDays] = useState<Record<string, DayRecord>>({});
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setDays(loadDays());
    setReady(true);
  }, []);

  const today = todayStr();

  const grid = useMemo(() => {
    const dates: string[] = [];
    for (let i = DAYS_SHOWN - 1; i >= 0; i--) dates.push(addDays(today, -i));
    // Pad the front so the grid aligns to calendar weeks (columns = weeks, rows = Sun..Sat)
    const firstDow = new Date(dates[0]).getDay();
    const padded = Array(firstDow).fill(null).concat(dates);
    const columns: (string | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) columns.push(padded.slice(i, i + 7));
    return columns;
  }, [today]);

  const stats = useMemo(() => {
    const scored = Object.values(days).filter((d) => d.finalized);
    if (scored.length === 0) return null;
    const avg = Math.round(scored.reduce((a, d) => a + d.score, 0) / scored.length);
    const perfectDays = scored.filter((d) => d.score >= 100).length;
    return { avg, perfectDays, total: scored.length };
  }, [days]);

  if (!ready) return null;

  const selectedRecord = selected ? days[selected] : null;
  const isToday = selected === today;

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: "var(--color-bg)" }}>
      <div style={{ padding: "18px 22px 60px" }}>
        <Link href="/" style={{ color: "var(--color-muted)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          ← Home
        </Link>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 600, margin: "12px 0 4px" }}>
          History
        </div>
        <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 18 }}>
          Last {DAYS_SHOWN} days. Tap a square for that day's breakdown.
        </div>

        {stats && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Avg score", value: `${stats.avg}%` },
              { label: "Perfect days", value: stats.perfectDays },
              { label: "Days tracked", value: stats.total },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: "#FFFFFF",
                  border: "1.5px solid var(--color-row-border)",
                  borderRadius: 16,
                  padding: "12px 10px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Heatmap grid */}
        <div style={{ overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {grid.map((col, ci) => (
              <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {col.map((date, ri) => {
                  if (!date) return <div key={ri} style={{ width: 14, height: 14 }} />;
                  const rec = days[date];
                  const color = rec?.finalized || date === today
                    ? tierOf(rec?.score ?? 0).color
                    : "var(--color-track)";
                  const opacity = rec ? 1 : 0.35;
                  return (
                    <div
                      key={ri}
                      onClick={() => setSelected(date)}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 4,
                        background: color,
                        opacity: date === today ? 1 : opacity,
                        border: date === today ? "1.5px solid var(--color-text)" : "none",
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 11, color: "var(--color-muted)" }}>
          {(["Perfect", "Good", "Okay", "Rough"] as const).map((label) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: tierOf(label === "Perfect" ? 100 : label === "Good" ? 85 : label === "Okay" ? 60 : 20).color }} />
              {label}
            </div>
          ))}
        </div>

        {/* Selected day detail */}
        {selected && (
          <div
            style={{
              marginTop: 20,
              background: "#FFFFFF",
              border: "1.5px solid var(--color-row-border)",
              borderRadius: 20,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700 }}>{selected}</div>
            {selectedRecord ? (
              <div style={{ marginTop: 6, fontSize: 13.5, color: "var(--color-muted)" }}>
                Score: <strong style={{ color: "var(--color-text)" }}>{selectedRecord.score}%</strong> ·{" "}
                {tierOf(selectedRecord.score).label}
                {selectedRecord.loggedLate && " · logged late"}
                {!selectedRecord.finalized && " · in progress"}
              </div>
            ) : isToday ? (
              <div style={{ marginTop: 6, fontSize: 13.5, color: "var(--color-muted)" }}>Today — still in progress.</div>
            ) : (
              <div style={{ marginTop: 6, fontSize: 13.5, color: "var(--color-muted)" }}>No data logged this day.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
