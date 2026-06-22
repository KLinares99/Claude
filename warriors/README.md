# The Warriors Project — "The Warrior's Path" (concept demo)

An interactive, journey-themed web demo for **The Warriors Project** by
**Robert Lindenberg**. It presents the full 14-day workbook as a single
walkable path: **Module 0 is built in full** from the approved *Final Draft*,
and **Modules 1–14 are scaffolded skeletons** ready to receive approved copy.

> **Mission:** Transforming Pain Into Power · *Heal. Find Purpose. Be Restored.*

## What's here

| File | Purpose |
| --- | --- |
| `index.html` | The journey landing page — hero, the Six Pillars, and the winding **Warrior's Path** with a station for every module. |
| `module.html?id=N` | The module reader. `id=0` renders the full Welcome experience; `id=1…14` render the seven-part module scaffold. |
| `assets/data.js` | All content — Module 0 in full, plus each module's title, core idea, anchor scriptures, pillar, and creed. |
| `assets/app.js` | Rendering, routing, reveal-on-scroll, and device-local progress + journaling. |
| `assets/styles.css` | The brand system (see below). |

## Design system (from the Warriors brand kit)

- **Palette — "Hope & Depth / Deep Sovereign" (Navy + Gold).** Chosen because the
  brand kit notes it *"works equally well for men, women, churches, and
  organizations."* Deep navy `#0A1628`, steel `#1A3A5C`, gold `#C9992A` /
  `#E0B44A`, cream `#F5F0E8`.
- **Type — Cinzel** (display, Roman-stone authority) + **Cormorant Garamond**
  (serif body) + **DM Sans** (UI labels). This is the kit's recommended
  *"Authority & Grace"* pairing, echoing Module 0's roman-numeral structure.
- **Journey theme.** The workbook calls itself a *path* to be *walked*; the six
  pillars become phases along a trail, and each module is a lit station. Progress
  and journal entries are saved per-device via `localStorage`.

## Run it

It's fully static — no build step. Open `index.html` in a browser, or serve the
folder (`npx serve warriors`). On this branch it also auto-deploys to GitHub
Pages via `.github/workflows/deploy-warriors.yml`.

## Notes for the team

- **Pillar groupings** of Modules 1–14 are a proposed structure for the demo and
  are trivial to re-map in `assets/data.js`.
- **Modules 8 & 11** are marked *"Outline pending"* — the master workbook draft
  duplicates Modules 7 & 10 and has no distinct copy for 8 & 11 yet. Drop the
  approved teaching into `data.js` and the scaffold fills in automatically.
- Branding assets (banners, logo/icon options, avatars) live in
  *Drive / 02 - Robert Lindenberg / 2. Branding* and can be wired in to replace
  the inline SVG sigil.
