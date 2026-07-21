"use client";

import { SnowflakeIcon } from "./icons";

export function FreezeTokens({ freeze, justEarned }: { freeze: number; justEarned: boolean }) {
  return (
    <div style={{ display: "flex", gap: 7 }}>
      {[0, 1].map((i) => {
        const filled = i < freeze;
        return (
          <div
            key={i}
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: filled ? "rgba(27,182,166,0.14)" : "transparent",
              border: filled ? "1.5px solid rgba(27,182,166,0.4)" : "1.5px solid var(--color-idle-border)",
              boxShadow: filled ? "0 0 10px rgba(27,182,166,0.35)" : undefined,
              animation: filled && justEarned && i === freeze - 1 ? "tokenPop 380ms ease" : undefined,
              color: filled ? "#1BB6A6" : "#CFC3B2",
            }}
          >
            <SnowflakeIcon size={17} />
          </div>
        );
      })}
    </div>
  );
}
