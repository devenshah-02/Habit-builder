"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { bmiCategory, computeBMI } from "@/lib/bodyMetrics";
import { loadBodyMetrics, loadProfile, saveBodyMetrics, saveProfile, todayStr } from "@/lib/storage";
import { BodyMetricEntry, Profile } from "@/lib/types";

export default function ProfilePage() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile>({ heightCm: null });
  const [entries, setEntries] = useState<BodyMetricEntry[]>([]);
  const [heightInput, setHeightInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [fatInput, setFatInput] = useState("");

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setHeightInput(p.heightCm ? String(p.heightCm) : "");
    setEntries(loadBodyMetrics().sort((a, b) => (a.date < b.date ? 1 : -1)));
    setReady(true);
  }, []);

  const sorted = useMemo(() => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)), [entries]);
  const latest = sorted[0];
  const bmi = latest?.weightKg && profile.heightCm ? computeBMI(latest.weightKg, profile.heightCm) : null;
  const category = bmi !== null ? bmiCategory(bmi) : null;

  function saveHeight() {
    const h = parseFloat(heightInput);
    const next = { heightCm: isNaN(h) ? null : h };
    setProfile(next);
    saveProfile(next);
  }

  function addEntry() {
    const w = parseFloat(weightInput);
    const f = parseFloat(fatInput);
    if (isNaN(w) && isNaN(f)) return;
    const today = todayStr();
    const withoutToday = entries.filter((e) => e.date !== today);
    const entry: BodyMetricEntry = {
      date: today,
      weightKg: isNaN(w) ? undefined : w,
      bodyFatPct: isNaN(f) ? undefined : f,
    };
    const next = [...withoutToday, entry];
    setEntries(next);
    saveBodyMetrics(next);
    setWeightInput("");
    setFatInput("");
  }

  function deleteEntry(date: string) {
    if (!confirm("Remove this entry?")) return;
    const next = entries.filter((e) => e.date !== date);
    setEntries(next);
    saveBodyMetrics(next);
  }

  // Simple weight trend line — last 20 entries with a weight value, oldest to newest.
  const chartPoints = useMemo(() => {
    const withWeight = [...entries].filter((e) => e.weightKg != null).sort((a, b) => (a.date < b.date ? -1 : 1));
    const last = withWeight.slice(-20);
    if (last.length < 2) return null;
    const weights = last.map((e) => e.weightKg as number);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min || 1;
    const w = 320;
    const h = 100;
    const pts = last.map((e, i) => {
      const x = (i / (last.length - 1)) * w;
      const y = h - ((e.weightKg! - min) / range) * h;
      return `${x},${y}`;
    });
    return { pts: pts.join(" "), min, max, w, h };
  }, [entries]);

  if (!ready) return null;

  const label = { fontSize: 13, fontWeight: 600, color: "var(--color-muted)", marginBottom: 6, display: "block" };
  const input = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1.5px solid var(--color-row-border)",
    fontSize: 15,
    background: "#FFFFFF",
    color: "var(--color-text)",
  } as React.CSSProperties;

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: "var(--color-bg)" }}>
      <div style={{ padding: "18px 22px 60px" }}>
        <Link href="/" style={{ color: "var(--color-muted)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          ← Home
        </Link>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 600, margin: "12px 0 4px" }}>
          Profile
        </div>
        <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 20 }}>
          Separate from your daily score — this is just a trend to look back on.
        </div>

        {/* Height (static) */}
        <div style={{ marginBottom: 20 }}>
          <label style={label}>Height (cm)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={input}
              type="number"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              placeholder="e.g. 175"
            />
            <button
              onClick={saveHeight}
              style={{
                padding: "0 18px",
                borderRadius: 12,
                border: "none",
                background: "#C2461B",
                color: "#FBF6EF",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </div>

        {/* Current BMI */}
        {bmi !== null && category && (
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid var(--color-row-border)",
              borderRadius: 20,
              padding: 16,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 12.5, color: "var(--color-muted)", fontWeight: 600 }}>Current BMI</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, marginTop: 2 }}>
                {bmi}
              </div>
            </div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: category.color,
                background: `${category.color}1A`,
                padding: "6px 12px",
                borderRadius: 100,
              }}
            >
              {category.label}
            </div>
          </div>
        )}
        {!profile.heightCm && (
          <div style={{ fontSize: 12.5, color: "var(--color-muted)", marginBottom: 20 }}>
            Add your height above to see BMI computed automatically from your latest weight entry.
          </div>
        )}

        {/* Weight trend chart */}
        {chartPoints && (
          <div style={{ marginBottom: 20 }}>
            <div style={label}>Weight trend</div>
            <div style={{ background: "#FFFFFF", border: "1.5px solid var(--color-row-border)", borderRadius: 20, padding: "16px 12px" }}>
              <svg width="100%" viewBox={`0 0 ${chartPoints.w} ${chartPoints.h}`} preserveAspectRatio="none" height={100}>
                <polyline points={chartPoints.pts} fill="none" stroke="#C2461B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-muted)", marginTop: 4 }}>
                <span>{chartPoints.min} kg</span>
                <span>{chartPoints.max} kg</span>
              </div>
            </div>
          </div>
        )}

        {/* Add entry */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid var(--color-row-border)",
            borderRadius: 20,
            padding: 16,
            marginBottom: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700 }}>Log today</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Weight (kg)</label>
              <input style={input} type="number" step="0.1" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Body fat %</label>
              <input style={input} type="number" step="0.1" value={fatInput} onChange={(e) => setFatInput(e.target.value)} />
            </div>
          </div>
          <button
            onClick={addEntry}
            style={{
              padding: "11px 0",
              borderRadius: 13,
              border: "none",
              background: "#C2461B",
              color: "#FBF6EF",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Save entry
          </button>
        </div>

        {/* History list */}
        <div style={label}>History</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--color-muted)" }}>No entries yet.</div>
          )}
          {sorted.map((e) => (
            <div
              key={e.date}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#FFFFFF",
                border: "1.5px solid var(--color-row-border)",
                borderRadius: 14,
                padding: "10px 14px",
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{e.date}</div>
              <div style={{ fontSize: 13.5, color: "var(--color-muted)", display: "flex", gap: 10 }}>
                {e.weightKg != null && <span>{e.weightKg} kg</span>}
                {e.bodyFatPct != null && <span>{e.bodyFatPct}% fat</span>}
              </div>
              <button
                onClick={() => deleteEntry(e.date)}
                style={{ border: "none", background: "transparent", color: "var(--color-muted)", cursor: "pointer", fontSize: 15 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
