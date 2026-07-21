"use client";

import { Tier } from "@/lib/types";
import { FlameIcon } from "./icons";

const R = 112;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function CoreScoreRing({
  score,
  mounted,
  tier,
  streak,
  perfect,
}: {
  score: number;
  mounted: boolean;
  tier: Tier;
  streak: number;
  perfect: boolean;
}) {
  const shown = mounted ? score : 0;
  const offset = CIRCUMFERENCE * (1 - shown / 100);
  const confetti = perfect
    ? Array.from({ length: 14 }, (_, i) => {
        const ang = (i / 14) * Math.PI * 2;
        const dx = Math.cos(ang) * 70;
        const dy = Math.sin(ang) * 40;
        const color = i % 2 ? "#1BB6A6" : "#C2461B";
        return { dx, dy, color, delay: i * 20 };
      })
    : [];

  return (
    <div style={{ position: "relative", width: 260, height: 260, margin: "18px auto 0" }}>
      {/* Glow layer */}
      <div
        style={{
          position: "absolute",
          inset: 14,
          borderRadius: "50%",
          background: tier.glow,
          filter: "blur(26px)",
          opacity: 0.5,
          transition: "background 500ms ease",
        }}
      />
      {/* Perfect pulse overlay */}
      <div
        style={{
          position: "absolute",
          inset: 14,
          borderRadius: "50%",
          boxShadow: "0 0 40px 6px #1BB6A6",
          opacity: perfect ? undefined : 0,
          animation: perfect ? "perfectPulse 1200ms ease" : undefined,
        }}
      />
      <svg width={260} height={260} style={{ transform: "rotate(-90deg)", position: "relative" }}>
        <circle cx={130} cy={130} r={R} fill="none" stroke="var(--color-track)" strokeWidth={20} />
        <circle
          cx={130}
          cy={130}
          r={R}
          fill="none"
          stroke={tier.color}
          strokeWidth={20}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{
            transition:
              "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1), stroke 500ms ease",
          }}
        />
      </svg>

      {/* Confetti burst */}
      {confetti.map((c, i) => (
        <div
          key={i}
          style={
            {
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 8,
              height: 8,
              borderRadius: 2,
              background: c.color,
              "--dx": `${c.dx}px`,
              "--dy": `${c.dy}px`,
              animation: `confettiUp 1100ms ${c.delay}ms ease-out forwards`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Center numeral + streak pill */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 74,
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            color: "var(--color-text)",
          }}
        >
          {shown}
          <span style={{ fontSize: 34, verticalAlign: "super", color: "var(--color-muted)" }}>%</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(194,70,27,0.1)",
            padding: "5px 12px",
            borderRadius: 100,
          }}
        >
          <FlameIcon size={14} color="#C2461B" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "#C2461B" }}>
            {streak}
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)" }}>day streak</span>
        </div>
      </div>
    </div>
  );
}
