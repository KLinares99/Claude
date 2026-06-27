import { Lock, Unlock, Check } from 'lucide-react';
import { DECKS, deckCounts } from '../data/cards';
import { useGame } from '../lib/store';
import { toast } from '../lib/toast';
import DeckArt from './DeckArt';

export default function Decks() {
  const { state, update } = useGame();
  const counts = deckCounts();

  const unlockSpicy = () =>
    update((s) => {
      const next = !s.config.spicyUnlocked;
      toast(next ? '🔥 Spicy deck unlocked' : 'Spicy deck locked');
      return {
        ...s,
        config: {
          ...s.config,
          spicyUnlocked: next,
          decks: next ? s.config.decks : s.config.decks.filter((d) => d !== 'spicy'),
        },
      };
    });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-display font-bold text-tou-ink">The decks</h2>
        <p className="text-tou-dim text-sm">Four moods, from giggles to goosebumps. Mix any of them.</p>
      </div>

      <div className="space-y-4">
        {DECKS.map((d) => {
          const locked = d.adult && !state.config.spicyUnlocked;
          return (
            <div
              key={d.id}
              className="rounded-3xl p-5 shadow-card relative overflow-hidden"
              style={{ background: `linear-gradient(150deg, ${d.from} 0%, ${d.to} 100%)`, color: d.ink }}
            >
              <DeckArt color={d.ink} />
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="text-3xl">{d.emoji}</div>
                  <h3 className="mt-1.5 text-xl font-display font-bold">{d.name}</h3>
                  <p className="text-sm opacity-90 mt-0.5 max-w-[16rem]">{d.blurb}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,0.85)', color: d.to }}
                >
                  {counts[d.id]} cards
                </span>
              </div>

              {d.adult && (
                <button
                  onClick={unlockSpicy}
                  className="relative mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,0.9)', color: d.to }}
                >
                  {locked ? <Lock size={15} /> : <Unlock size={15} />}
                  {locked ? 'Unlock (18+)' : 'Unlocked — tap to lock'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="panel p-5">
        <p className="label">Depth levels</p>
        <ul className="mt-2 space-y-2 text-sm text-tou-ink">
          {[
            ['Warm up', 'Light, playful, low-stakes — a gentle way in.'],
            ['Going deeper', 'More honest and personal. The good stuff.'],
            ['No filter', 'Bold, vulnerable, all-in. Save it for when you both feel it.'],
          ].map(([t, s]) => (
            <li key={t} className="flex gap-2">
              <Check size={16} className="text-tou-mint shrink-0 mt-0.5" />
              <span>
                <b>{t}.</b> <span className="text-tou-dim">{s}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
