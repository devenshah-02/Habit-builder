# Habit Tracker

Home screen built to spec from `Design_base_reference.zip`. Data model, scoring engine, and
streak/freeze logic implement the rules locked in the PRD (see `habit-tracker-PRD.md` /
`habit-tracker-design-brief.md` from earlier in this thread).

## What's built (v1 — Home only, per the design handoff's own scope)
- Core Score ring, tier system (Perfect/Good/Okay/Rough), streak + freeze tokens
- Tap-to-complete (binary) and tap-to-increment (quantity) habit rows
- Due-today engine: weekly habits (e.g. D3) only count on days they're actually due
- Bonus habits tracked but never affect Core Score
- Day finalization on app open (no backend cron — matches PRD's local-first plan)
- Tier message banner, once per day, dismissible
- Installable PWA (manifest.json included)

## What's NOT built yet (explicitly out of scope for this pass)
- **Settings / habit CRUD screen** — habits are currently seeded in `lib/storage.ts`
  (`DEFAULT_HABITS`). Editing them today means editing that file. This was marked
  "not yet designed" in the design handoff — build this next once you have a screen spec for it.
- **Log / Habit Detail screen with 3-day backdating** — the data model supports it
  (`DayRecord.loggedLate`, per-date logs), but the UI to edit a past day isn't wired up yet.
- **Stats / heatmap screen** — same story, data's there (`ht:days` in localStorage), no UI yet.
- **App icons** — `manifest.json` points at `/icon-192.png` and `/icon-512.png`, which don't
  exist yet. Drop two PNGs into `/public` before deploying, or the home-screen icon will be blank.

## Local dev
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Deploy (per PRD: Vercel)
```bash
npx vercel
```
or connect the repo in the Vercel dashboard. No environment variables needed — everything is
local-first (`localStorage`), no backend.

## Installing on iPhone (per our earlier walkthrough)
1. Open the deployed URL in **Safari** (not Chrome — iOS PWA install only works through Safari).
2. Tap the **Share icon** → **Add to Home Screen** → **Add**.
3. Requires **iOS 16.4+** for the standalone/manifest behavior to fully apply.

## A note on fonts
`Fraunces` loads via `next/font/google` (self-hosted at build time — no runtime dependency on
Google's CDN). `Switzer` is loaded from Fontshare's CDN in `app/layout.tsx` since it isn't on
Google Fonts; if you'd rather self-host it, download the files from fontshare.com and swap the
`<link>` tag for local `@font-face` rules.

## Known gap worth flagging
The `timesPerWeek` due-today logic (used for D3) determines "due" by checking prior completions
*this week* — it doesn't yet handle backdated edits reshuffling that count retroactively, since
backdating itself isn't wired into the UI yet. Once the Log/Detail screen is built, revisit
`isDueToday` in `lib/scoring.ts` alongside it.
