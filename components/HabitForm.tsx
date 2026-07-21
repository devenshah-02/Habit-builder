"use client";

import { useState } from "react";
import { Frequency, Habit, HabitType, IconName } from "@/lib/types";
import { HabitIcon } from "./icons";

const ICONS: IconName[] = ["pill", "drop", "dumbbell", "book", "sun", "leaf"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type FreqKind = Frequency["kind"];

export function HabitForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Habit | null;
  onSave: (habit: Habit) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState<IconName>(initial?.icon ?? "pill");
  const [type, setType] = useState<HabitType>(initial?.type ?? "binary");
  const [mandatory, setMandatory] = useState(initial?.mandatory ?? true);
  const [freqKind, setFreqKind] = useState<FreqKind>(initial?.frequency.kind ?? "daily");
  const [timesPerWeek, setTimesPerWeek] = useState(
    initial?.frequency.kind === "timesPerWeek" ? initial.frequency.n : 1
  );
  const [specificDays, setSpecificDays] = useState<number[]>(
    initial?.frequency.kind === "specificDays" ? initial.frequency.days : []
  );
  const [target, setTarget] = useState(initial?.target ?? (type === "quantity" ? 8 : undefined));

  function toggleDay(d: number) {
    setSpecificDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  function buildFrequency(): Frequency {
    if (freqKind === "daily") return { kind: "daily" };
    if (freqKind === "timesPerWeek") return { kind: "timesPerWeek", n: Math.max(1, timesPerWeek) };
    if (freqKind === "specificDays") return { kind: "specificDays", days: specificDays };
    return { kind: "monthly" };
  }

  function handleSubmit() {
    if (!name.trim()) return;
    if (freqKind === "monthly" && mandatory) {
      // PRD rule: monthly cadence can't sit in a daily Core Score — guard rail, not a silent fix.
      alert("Monthly-cadence habits can only be Bonus (they can't be evaluated as 'due today').");
      return;
    }
    const habit: Habit = {
      id: initial?.id ?? `h_${Date.now()}`,
      name: name.trim(),
      icon,
      type,
      mandatory,
      frequency: buildFrequency(),
      target: type === "quantity" ? target ?? 1 : undefined,
      weight: initial?.weight ?? 1,
    };
    onSave(habit);
  }

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
    <div
      style={{
        background: "#FFFFFF",
        border: "1.5px solid var(--color-row-border)",
        borderRadius: 20,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div>
        <label style={label}>Name</label>
        <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Protein" />
      </div>

      <div>
        <label style={label}>Icon</label>
        <div style={{ display: "flex", gap: 8 }}>
          {ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: icon === ic ? "2px solid #C2461B" : "1.5px solid var(--color-row-border)",
                background: icon === ic ? "rgba(194,70,27,0.1)" : "#FFFFFF",
                color: icon === ic ? "#C2461B" : "var(--color-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <HabitIcon name={ic} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Type</label>
          <select style={input} value={type} onChange={(e) => setType(e.target.value as HabitType)}>
            <option value="binary">Yes/No</option>
            <option value="quantity">Quantity</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Category</label>
          <select
            style={input}
            value={mandatory ? "mandatory" : "bonus"}
            onChange={(e) => setMandatory(e.target.value === "mandatory")}
          >
            <option value="mandatory">Mandatory</option>
            <option value="bonus">Bonus (no score impact)</option>
          </select>
        </div>
      </div>

      {type === "quantity" && (
        <div>
          <label style={label}>Daily target</label>
          <input
            type="number"
            min={1}
            style={input}
            value={target ?? 1}
            onChange={(e) => setTarget(parseInt(e.target.value, 10) || 1)}
          />
        </div>
      )}

      <div>
        <label style={label}>Frequency</label>
        <select style={input} value={freqKind} onChange={(e) => setFreqKind(e.target.value as FreqKind)}>
          <option value="daily">Every day</option>
          <option value="timesPerWeek">N times per week</option>
          <option value="specificDays">Specific days</option>
          <option value="monthly">Monthly (Bonus only)</option>
        </select>
      </div>

      {freqKind === "timesPerWeek" && (
        <div>
          <label style={label}>Times per week</label>
          <input
            type="number"
            min={1}
            max={7}
            style={input}
            value={timesPerWeek}
            onChange={(e) => setTimesPerWeek(parseInt(e.target.value, 10) || 1)}
          />
        </div>
      )}

      {freqKind === "specificDays" && (
        <div>
          <label style={label}>Days</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DAY_LABELS.map((d, i) => (
              <button
                key={d}
                onClick={() => toggleDay(i)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: specificDays.includes(i) ? "2px solid #C2461B" : "1.5px solid var(--color-row-border)",
                  background: specificDays.includes(i) ? "rgba(194,70,27,0.1)" : "#FFFFFF",
                  color: specificDays.includes(i) ? "#C2461B" : "var(--color-muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button
          onClick={handleSubmit}
          style={{
            flex: 1,
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
          {initial ? "Save changes" : "Add habit"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "11px 18px",
            borderRadius: 13,
            border: "1.5px solid var(--color-row-border)",
            background: "#FFFFFF",
            color: "var(--color-muted)",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
