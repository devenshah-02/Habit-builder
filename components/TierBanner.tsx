"use client";

import { Tier } from "@/lib/types";

export function TierBanner({
  open,
  tier,
  score,
  message,
  onDismiss,
}: {
  open: boolean;
  tier: Tier;
  score: number;
  message: string;
  onDismiss: () => void;
}) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", left: 16, right: 16, bottom: 22, zIndex: 5, animation: "bannerIn 480ms cubic-bezier(0.22,1,0.36,1)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: tier.bannerBg,
          color: "#FBF6EF",
          padding: "15px 16px",
          borderRadius: 22,
          boxShadow: "0 16px 34px -12px rgba(34,29,24,0.5)",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7 }}>
            {tier.label.toUpperCase()} · {score}%
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 600, lineHeight: 1.25, marginTop: 2 }}>
            {message}
          </div>
        </div>
        <button
          onClick={onDismiss}
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            border: "none",
            color: "inherit",
            fontSize: 17,
            cursor: "pointer",
            flex: "none",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
