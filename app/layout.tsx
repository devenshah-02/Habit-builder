import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

// Fraunces is on Google Fonts, loaded via next/font (self-hosted at build time, no runtime fetch).
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Daily habit + medication adherence tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Habits",
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF6EF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fraunces.variable}>
      <head>
        {/* Switzer isn't on Google Fonts — Fontshare's CDN is the standard source.
            If you self-host fonts elsewhere, swap this link for a local @font-face. */}
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
