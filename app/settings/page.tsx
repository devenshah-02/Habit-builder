"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HabitForm } from "@/components/HabitForm";
import { HabitIcon } from "@/components/icons";
import { loadHabits, saveHabits } from "@/lib/storage";
import { Habit } from "@/lib/types";

function freqLabel(h: Habit): string {
  const f = h.frequency;
  if (f.kind === "daily") return "Every day";
  if (f.kind === "timesPerWeek") return `${f.n}x per week`;
  if (f.kind === "specificDays") {
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return f.days.map((d) => names[d]).join("/") || "No days set";
  }
  return "Monthly";
}

export default function SettingsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [adding, setAdding] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setHabits(loadHabits());
    setReady(true);
  }, []);

  function persist(next: Habit[]) {
    setHabits(next);
    saveHabits(next);
  }

  function handleSave(habit: Habit) {
    const exists = habits.some((h) => h.id === habit.id);
    const next = exists ? habits.map((h) => (h.id === habit.id ? habit : h)) : [...habits, habit];
    persist(next);
    setEditing(null);
    setAdding(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this habit? Past logged data for it stays in history, it just stops appearing going forward.")) return;
    persist(habits.filter((h) => h.id !== id));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...habits];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  }

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: "var(--color-bg)" }}>
      <div style={{ padding: "18px 22px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <Link href="/" style={{ color: "var(--color-muted)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            ← Home
          </Link>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 600, marginBottom: 18 }}>
          Habits
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {habits.map((h, i) => (
            <div key={h.id}>
              {editing?.id === h.id ? (
                <HabitForm initial={h} onSave={handleSave} onCancel={() => setEditing(null)} />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#FFFFFF",
                    border: "1.5px solid var(--color-row-border)",
                    borderRadius: 20,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: h.mandatory ? "rgba(194,70,27,0.1)" : "rgba(140,132,121,0.12)",
                      color: h.mandatory ? "#C2461B" : "#8C8479",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                    }}
                  >
                    <HabitIcon name={h.icon} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{h.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--color-muted)", marginTop: 1 }}>
                      {freqLabel(h)} · {h.mandatory ? "Mandatory" : "Bonus"}
                      {h.type === "quantity" ? ` · target ${h.target}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flex: "none" }}>
                    <button onClick={() => move(i, -1)} disabled={i === 0} style={iconBtn(i === 0)}>
                      ↑
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === habits.length - 1} style={iconBtn(i === habits.length - 1)}>
                      ↓
                    </button>
                    <button onClick={() => setEditing(h)} style={iconBtn(false)}>
                      ✎
                    </button>
                    <button onClick={() => handleDelete(h.id)} style={iconBtn(false)}>
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          {adding ? (
            <HabitForm initial={null} onSave={handleSave} onCancel={() => setAdding(false)} />
          ) : (
            <button
              onClick={() => setAdding(true)}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 16,
                border: "1.5px dashed var(--color-idle-border)",
                background: "transparent",
                color: "var(--color-muted)",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Add habit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function iconBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 30,
    height: 30,
    borderRadius: 9,
    border: "1.5px solid var(--color-row-border)",
    background: "#FFFFFF",
    color: disabled ? "#DDD2C2" : "var(--color-muted)",
    fontSize: 14,
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}
