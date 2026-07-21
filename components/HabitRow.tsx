"use client";

import { Habit } from "@/lib/types";
import { progress } from "@/lib/scoring";
import { CheckIcon, HabitIcon } from "./icons";

export function HabitRow({
  habit,
  value,
  due,
  onToggle,
  onInc,
  onDec,
}: {
  habit: Habit;
  value: number | undefined;
  due: boolean;
  onToggle: () => void;
  onInc: () => void;
  onDec: () => void;
}) {
  const done = progress(habit, value) >= 1;
  const isQty = habit.type === "quantity";
  const count = value ?? 0;
  const target = habit.target ?? 1;

  const iconColor = done ? "#1BB6A6" : habit.mandatory ? "#C2461B" : "#8C8479";
  const iconBg = done
    ? "rgba(27,182,166,0.12)"
    : habit.mandatory
    ? "rgba(194,70,27,0.1)"
    : "rgba(140,132,121,0.12)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        background: done ? "var(--color-row-complete-bg)" : "#FFFFFF",
        border: done ? "1.5px solid transparent" : "1.5px solid var(--color-row-border)",
        borderRadius: 20,
        padding: "13px 14px",
        boxShadow: done ? "none" : "0 2px 0 rgba(34,29,24,0.04)",
        transition: "background 120ms, border-color 120ms",
        opacity: due ? 1 : 0.55, // not-due-today habits (e.g. weekly, already satisfied) recede visually
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: iconBg,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            transition: "all 120ms",
          }}
        >
          <HabitIcon name={habit.icon} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 15.5,
                fontWeight: 600,
                color: done && !isQty ? "var(--color-muted)" : "var(--color-text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {habit.name}
            </span>
            {!habit.mandatory && (
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#C2461B",
                  background: "rgba(194,70,27,0.12)",
                  padding: "2px 6px",
                  borderRadius: 5,
                }}
              >
                Bonus
              </span>
            )}
          </div>
          {isQty && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              {Array.from({ length: target }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: i < count ? "#C2461B" : "var(--color-empty-dot)",
                    transition: "background 120ms",
                  }}
                />
              ))}
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted)", marginLeft: 4 }}>
                {count}/{target}
              </span>
            </div>
          )}
        </div>
      </div>

      {isQty ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
          <button
            onClick={onDec}
            disabled={count === 0}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: "1.5px solid var(--color-row-border)",
              background: "transparent",
              color: count > 0 ? "var(--color-muted)" : "#DDD2C2",
              fontSize: 20,
              fontWeight: 600,
              cursor: count > 0 ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            −
          </button>
          <button
            onClick={onInc}
            disabled={count >= target}
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              border: "none",
              background: "#C2461B",
              color: "#FBF6EF",
              fontSize: 22,
              fontWeight: 600,
              cursor: count < target ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            +
          </button>
        </div>
      ) : (
        <button
          onClick={onToggle}
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            border: done ? "2px solid #1BB6A6" : "2px solid var(--color-idle-border)",
            background: done ? "#1BB6A6" : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            transition: "all 130ms",
            padding: 0,
          }}
        >
          {done ? <CheckIcon size={20} color="#FBF6EF" /> : <CheckIcon size={20} color="#CFC3B2" />}
        </button>
      )}
    </div>
  );
}
