# 🔥 FORGE — Unified Training App

A science-backed personal training PWA that combines a **running tracker**
(Rockland Lake 3.2mi loop, chasing sub-32) with a **skills-focused
calisthenics engine** (muscle-up, handstand, levers, planche) — sharing one
data store, one streak, and one combined dashboard.

> Working title **FORGE**. Branding/icon are easy to swap (see `scripts/generate-icons.mjs`).

## Stack
- **React + Vite + TypeScript**, Tailwind, Recharts, lucide-react
- **PWA**: web manifest, service worker (offline app shell), installable, app icon
- **Wake Lock API** for the timer screens (true background audio needs a native
  Capacitor wrapper — documented as a future step)
- **Web Audio** metronome + cue beeps via a lookahead scheduler
- **localStorage** single namespaced store (`forge:v1`) shared by both engines

## Five sections
1. **Dashboard** — combined snapshot: PR + ring to sub-32, featured skill,
   mastered-node counts, push/pull balance, unified streak, next session, week.
2. **Run** — Log (PR hero, sub-32 ring, chart vs target, add-run, history) ·
   Interval Timer (4 phases, run/walk cues, cadence metronome, wake lock) ·
   Game Plan (4 phases + 3 rules).
3. **Calisthenics** — skill trees (Muscle-Up, Handstand, Front/Back Lever,
   Planche) as progression ladders + per-node rep logger / hold timer +
   graduation logic, plus balance/accessory loggers.
4. **Knowledge** — citation-driven science library (running + calisthenics).
5. **Schedule** — merged weekly plan, color-coded, with 3:1 deload indicator.

## Data model (`forge:v1`)
```
{ runs[], cal: { nodes{}, maxes{} }, sessions[], settings{} }
```
Every run log and every calisthenics log also appends to `sessions`, which
drives the unified streak (consecutive days with ≥1 entry) and weekly count.

## Develop
```bash
npm install
npm run dev      # vite dev server
npm run build    # tsc + vite build -> dist/
npm run preview  # serve the production build (base path /Claude/)
npm run icons    # regenerate PWA icons into public/
```

## Deploy
GitHub Pages via `.github/workflows/deploy.yml` (base path `/Claude/`).

## Graduation rules (science-backed)
- **Holds** (handstand, levers, planche): master at **3 sessions ≥ target hold**.
- **Reps** (muscle-up ladder, pulls, dips): master at **3 sets × target reps**.
- Skills go **fresh, first** (CNS-demanding) — encoded as in-app guidance.
- **Greasing the Groove** (Pavel), **leverage overload** (Convict Conditioning),
  **3:1 periodization** (Bompa), **push/pull balance** tracking.
