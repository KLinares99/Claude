# Relevate Solutions — Design System

A modern, trustworthy, bilingual identity for **Relevate Solutions Inc.** — an accounting, tax, payroll, and financial-coaching firm serving churches, small businesses, and families across the Hudson Valley (Chester, NY), in English and Spanish.

> "Financial Stability & Growth for Your Church or Small Business."

---

## Company at a glance

| | |
|---|---|
| **Legal name** | Relevate Solutions Inc. |
| **What they do** | Accounting & bookkeeping, tax preparation, sales tax filing, audit resolution, payroll & business support, life & financial coaching, websites & media, permits/licensing & translation |
| **Region** | Chester, NY — serving Hudson Valley, Orange County NY, Rockland County NY |
| **Audiences** | Churches & ministries · small businesses (19 named trades) · individuals & families |
| **Leadership** | Raymond Castro (CEO, Life & Financial Coach) · George Chacko (Accountant, Operations) |
| **Languages** | Fully bilingual — English y Español, in every product and page |
| **Phone** | (845) 584-2118 · (845) 826-1802 |
| **Website** | relevatesolutionsinc.com |
| **Rating** | 5.0 / 5 client rating, 20+ years combined experience, 24/7 availability |

### Positioning

The all-in-one financial partner for faith communities and growing businesses — accounting, tax, coaching, and digital presence under one trusted roof, in English and Spanish.

---

## Sources

This system was built directly from Relevate's real production assets — not invented:

- `uploads/relevate-theme-1.2.0/` — the live WordPress theme (`css/style.css`, `front-page.php`, `page-about.php`, `page-contact.php`, `page-resources.php`, `page-industries.php`, and 19 industry landing pages). This is the ground truth for color, type, spacing, and every component below.
- `uploads/brand-kit.html` — Relevate's brand guidelines v1.0 (July 2026): mission, values, voice & tone, color rationale, audience messaging.
- `uploads/relevate-theme-1.2.0/assets/` — real logo files (`relevate-globe.png`, `relevate-lockup.png`) and the VSL video poster.
- `uploads/A1–A7*.png` — real campaign photography (advisor meetings, church, main street, bookkeeping desk) used across marketing statics.

---

## Content fundamentals

### Voice

Sounds like a **trusted advisor, not a bank.** Warm, plain-spoken, confident without being salesy, service-hearted. Relevate speaks to people who lead — pastors, business owners, working families — with respect for their time and their books.

### Tone

- **Plain language over jargon.** "Focus on your mission — we'll handle the books," not "best-in-class synergistic accounting solutions."
- **Outcomes first.** "Every deduction you're entitled to. Nothing missed," not "maximize fiscal optimization outcomes."
- **Warmth with confidence.** "Questions don't keep office hours. Neither do we."
- **Bilingual and proud of it** — Spanish is woven into headlines and CTAs ("Hablamos tu idioma — English y Español"), never hidden in a footnote.

### Person & address

- Second person primary: "your business," "your community," "your goals."
- First-person plural for the firm: "we," "our team" — Relevate is a partner, not a vendor.

### Casing

- Title Case for headlines and CTAs ("Schedule a Free Consultation").
- Sentence case for body copy.
- UPPERCASE with wide tracking for eyebrow labels only ("WHAT WE DO," "WHO WE SERVE").

### Emoji

Used sparingly and functionally on contact/utility cards (📞 Phone, ✉️ Email, 🕑 Availability, 🌐 bilingual badges) — never in headlines, buttons, or long-form copy.

### Voice samples — DO
- *"Lead your congregation. We'll keep the books board-ready."*
- *"From where you are to where you want to be — with a coach beside you."*
- *"Financial questions don't keep office hours. Neither do we."*

### Voice samples — DON'T
- ❌ "Synergize your KPIs with cross-functional ideation." — jargon
- ❌ "Contact us during normal business hours." — contradicts the 24/7 promise
- ❌ Burying bilingual service in a footnote

---

## Visual foundations

### Color

Trusted Modern: cool navy + cyan, warm gold used sparingly. Ratio guide — **60%** cloud/white, **25%** navy tones, **10%** cyan, **5%** gold.

| Token | Hex | Use |
|---|---|---|
| `--navy-900` (Midnight Navy) | `#0A2540` | Headlines, footer, dark sections |
| `--navy` (Relevate Navy) | `#0B4E86` | Primary brand color, links, from the logo |
| `--cyan` (Elevation Cyan) | `#21AEE4` | CTAs, accents, active nav — from the swoosh |
| `--gold` (Stewardship Gold) | `#E8B54D` | Sparing accent — quote rule, stars, one tag variant |
| `--slate` | `#55677A` | Body & secondary text |
| `--silver` | `#D5DEE6` | Borders, dividers |
| `--cloud` | `#F5F8FA` | Page background, card fields |
| `--cyan-soft` | `#E3F4FC` | Tinted sections, icon chips |

Dark sections (`.section-dark`, hero, CTA bands) use a **navy → navy-700 diagonal gradient**, never a flat fill — this is the system's one recurring gradient motif, plus soft ring/circle decorations (large low-opacity cyan or white rings bleeding off the section edge).

### Type

- **Headings & UI — Manrope**, 700/800 weight. Tight `line-height: 1.15`.
- **Body — Inter**, 400–600. `line-height: 1.65`, base size `16.5px`.
- **Editorial accent — Lora italic**, reserved *only* for pull-quotes and testimonials, set in navy with a gold left rule.

Scale: H1 52px (42px on interior page-heroes) · H2 36px · H3 20px · lede 19.5px · body 16.5px · small 14px.

### Spacing & layout

- 12-column feel at **1140px max content width**, 28px gutters.
- Section vertical rhythm: 76px padding top/bottom. Cards: 30px interior padding, 22px grid gap.
- Sticky header, 76px tall, blurred white background on scroll.

### Radii & shadows

- Buttons: 10px. Cards, forms, tables: 14px. Hero video frame / CTA bands: 20px. Pills/tags: fully rounded.
- One soft shadow used everywhere: `0 4px 24px rgba(10,37,64,.08)` (navy-tinted, not neutral gray). A heavier `0 20px 60px rgba(10,37,64,.25)` shadow is reserved for the video frame only.
- Hairline `1px solid var(--silver)` borders on every card, table, and input.

### Backgrounds & motifs

- **Light-first**, alternating white → cloud (`--cloud`) → sky-tinted (`--cyan-soft`) sections for editorial pacing. Dark navy sections are used sparingly (stats band, hero, page-hero, CTA bands) and always carry the diagonal navy gradient + oversized faint ring decoration bleeding off one corner — never a flat dark fill.
- No illustration or clip-art. Real photography only: warm, film-grain, natural-light portraits of the actual founders/clients at work (desks, handshakes over paperwork, church interiors) — a deliberately warmer, more human counterpoint to the cool navy/cyan UI palette. Avoid stock "team pointing at laptop" energy; these read like editorial reportage.

### Hover & press states

| Interaction | Treatment |
|---|---|
| Primary button hover | Cyan steps to `--cyan-hover` (#3FBCEC) + `translateY(-1px)` |
| Dark/outline button hover | Dark button darkens to `--navy`; outline button inverts to filled navy |
| Card hover | Lifts `translateY(-3px)`, shadow appears |
| Link hover | Color shifts navy → cyan |
| Input focus | Border → cyan, background white, `0 0 0 3px rgba(33,174,228,.15)` focus ring |
| Industry tag hover | Border + background tint to cyan-soft, `translateY(-2px)` |

Transitions are quick and subtle — `.18s`–`.2s` ease, no bounce, no scale-down press effect.

### Borders

Hairline `1px solid var(--silver)` everywhere; no double borders or left-accent-bar cards.

---

## Iconography

- **Inline stroke SVGs**, hand-authored per service card: `viewBox="0 0 24 24"`, `stroke-width:2`, `stroke-linecap/linejoin: round`, no fill — sit inside a 52px rounded cyan-soft chip, stroked in navy. This is a small bespoke set (ledger, tax arrow, payroll/people, roadmap/checkmark, globe, shield-check), not a full icon-font library.
- **Emoji** are used functionally on the contact utility cards (📞 ✉️ 🕑) and a couple of footer badges (🌐) — the only place emoji appears.
- **Unicode glyphs** — `▾` for nav dropdowns, `☰`/`✕` for the mobile menu toggle, `→` for link flourishes, `★` for ratings — used instead of icon assets for these small utility marks.
- No external icon-font CDN is loaded; keep new icons in this same bespoke stroke style if you add more.

---

## Index

```
readme.md                    ← you are here
SKILL.md                     ← skill manifest (Claude Code / Agent Skills)
styles.css                   ← root entry — @imports tokens/*.css (link this)
tokens/
  colors.css                 ← palette + semantic aliases
  typography.css             ← font stacks, Google Fonts import, type scale
  spacing.css                ← spacing scale, layout constants
assets/
  relevate-globe.png         ← primary logomark (globe + cyan swoosh)
  relevate-lockup.png        ← horizontal logo lockup with wordmark
  vsl-poster.jpg             ← homepage video poster
  photo-*.jpg                ← real campaign photography (advisor meeting, church, main street, bookkeeping desk, sunrise valley, deadline calendar, receipts workbench) — recompressed for size
guidelines/
  colors.html · type.html · spacing.html · brand.html   ← @dsCard foundation specimens
components/
  core/            Button, Badge
  cards/           Card (default/featured/person/contact/numbered variants), StatBand, Quote, CTABand
  lists/           Checklist, ResourceItem
  forms/           FormField
  tables/          Table
  navigation/      Nav, Footer
  layout/          Hero
ui_kits/
  marketing-website/   ← Home, About, Contact, Resources, Industries — click-through recreation
```

## Components

`Button` · `Badge` · `Card` · `StatBand` · `Quote` · `CTABand` · `Checklist` · `ResourceItem` · `FormField` · `Table` · `Nav` · `Footer` · `Hero`

This inventory mirrors the component classes actually defined in the live theme's `css/style.css` (`.btn`, `.tagpill`, `.card`, `.stats`, `blockquote`, `.cta-band`, `.checklist`, `.res-item`, `.form-field`, `table.rs`, `.site-header`/`.nav`, `.site-footer`, `.hero`/`.page-hero`) — no families were added beyond what the source site defines.

---

## Caveats & open questions

- Iconography is a small bespoke inline-SVG set copied by hand from the theme's service cards — if Relevate wants a fuller icon system later, flag it and we'll pick a CDN set matching this stroke weight.
- The two founder headshots (Raymond Castro, George Chacko) render as initials-in-a-gradient-circle in the theme itself (no photo uploaded there) — reused as-is in the UI kit.
- Ask us to expand: interior service pages (Accounting, Tax, Payroll, Coaching, Websites & Media), the Spanish-language variants, or a slide template for external decks.
