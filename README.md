# Two of Us — a couples card game 💛

A playful, mobile-first card game for two people and one phone. You take turns
drawing prompt cards that range from **funny** to **deeply personal** to
**a little spicy** — all designed to put the phone down and actually talk.

> Warm, candy-bright aesthetic. Fully private: no accounts, no network, nothing
> leaves the device. Works offline as an installable PWA.

## Stack
- **React + Vite + TypeScript**, Tailwind, lucide-react
- **PWA**: web manifest, service worker (offline app shell), installable, app icon
- **localStorage** single namespaced store (`twoofus:v1`) — players, config,
  favorites, session progress, lifetime stats
- No backend. Intimate content stays on-device by design.

## How it plays
1. **Setup** — enter two names, pick your decks, choose how deep to go tonight
   (Warm up → Going deeper → No filter).
2. **Play** — one card at a time on a big colorful face. Turns alternate; the
   active player reads it out loud. Cards are tagged by who's on the spot
   (you / your partner / both) and by type:
   - **Question** — answer honestly
   - **Guess** — predict what your partner will say, then find out
   - **Dare** — a small playful action
   The game eases in with gentle cards before going deep.
3. **Save** — tap the heart to keep prompts that spark something; they collect
   in your **Saved jar**.

## The four decks
| Deck | Vibe |
|------|------|
| 🍿 **Sweet & Funny** | Easy, playful warm-ups and silly hypotheticals |
| 📸 **Memories & Us** | First impressions, favorite moments, inside jokes |
| 🌙 **Deep & Personal** | Honest, tender questions that open real conversation |
| 🔥 **Spicy** | Flirty to steamy — **18+**, locked behind a confirm gate |

## Data model (`twoofus:v1`)
```
{ players{a,b}, config{decks,maxLevel,spicyUnlocked}, session{...}, favorites[], stats{...} }
```

## Develop
```bash
npm install
npm run dev      # vite dev server
npm run build    # tsc + vite build -> dist/
npm run preview  # serve the production build (base path /Claude/)
npm run icons    # regenerate PWA icons into public/
```

## Adding cards
Everything lives in `src/data/cards.ts`. Each card has a stable `id`, a `deck`,
a `level` (1–3), a `type` (`ask` / `guess` / `dare`), and `to`
(`self` / `partner` / `both`, relative to whoever drew it). Use `{partner}` in
the text to inject the other player's name.
