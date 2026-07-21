import { IconName } from "@/lib/types";

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HabitIcon({ name, size = 20 }: { name: IconName; size?: number }) {
  switch (name) {
    case "pill":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <path d="M10.5 20.5L20 11a5 5 0 00-7-7l-9.5 9.5a5 5 0 007 7z" />
          <path d="M8.5 8.5l7 7" />
        </svg>
      );
    case "drop":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <path d="M12 2.5S5 10 5 14.5a7 7 0 1014 0C19 10 12 2.5 12 2.5z" />
        </svg>
      );
    case "dumbbell":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />
        </svg>
      );
    case "book":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <path d="M4 4.5A2 2 0 016 3h6v16H6a2 2 0 00-2 1.5V4.5z" />
          <path d="M20 4.5A2 2 0 0018 3h-6v16h6a2 2 0 012 1.5V4.5z" />
        </svg>
      );
    case "sun":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "leaf":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <path d="M11 20A7 7 0 019 6c4-3 9-3 11-3 0 2 0 7-3 11a7 7 0 01-6 3z" />
          <path d="M9 17c3-6 6-8 9-9" />
        </svg>
      );
  }
}

export function SnowflakeIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2v20M4 7l16 10M20 7L4 17" strokeLinecap="round" />
    </svg>
  );
}

export function FlameIcon({ size = 14, color = "#C2461B" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2c1 3-2 4-2 7a4 4 0 108 0c0-1-.3-2-1-3 2 1 3 3.5 3 6a8 8 0 11-16 0c0-5 4-7 6-11 1 1 1.5 2 2 1z" />
    </svg>
  );
}

export function CheckIcon({ size = 20, color = "#FBF6EF" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5l5.5 5.5L20 6" />
    </svg>
  );
}
