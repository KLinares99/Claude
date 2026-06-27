import { Heart, MessageCircleQuestion, Sparkles, Flame } from 'lucide-react';
import type { Card } from '../data/cards';
import { DECK_MAP } from '../data/cards';

const TYPE_META: Record<Card['type'], { label: string; icon: typeof Heart }> = {
  ask: { label: 'Question', icon: MessageCircleQuestion },
  guess: { label: 'Guess', icon: Sparkles },
  dare: { label: 'Dare', icon: Flame },
};

export default function GameCard({
  card,
  text,
  onSpot,
  saved,
}: {
  card: Card;
  text: string;
  onSpot: string;
  saved: boolean;
}) {
  const deck = DECK_MAP[card.deck];
  const Type = TYPE_META[card.type];

  return (
    <div
      key={card.id}
      className="relative w-full rounded-[2rem] p-6 shadow-card animate-card-in overflow-hidden"
      style={{
        background: `linear-gradient(150deg, ${deck.from} 0%, ${deck.to} 100%)`,
        color: deck.ink,
        minHeight: 360,
      }}
    >
      {/* playful corner glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-25 blur-2xl"
        style={{ background: '#ffffff' }}
      />

      <div className="relative flex items-center justify-between">
        <span className="chip bg-black/10 backdrop-blur-sm" style={{ color: deck.ink }}>
          <span className="text-base leading-none">{deck.emoji}</span>
          {deck.name}
        </span>
        <span className="chip bg-black/10" style={{ color: deck.ink }}>
          <Type.icon size={15} />
          {Type.label}
        </span>
      </div>

      {/* level dots */}
      <div className="relative mt-4 flex items-center gap-1.5">
        {[1, 2, 3].map((lv) => (
          <span
            key={lv}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: lv <= card.level ? 22 : 10,
              background: lv <= card.level ? deck.ink : 'rgba(0,0,0,0.18)',
              opacity: lv <= card.level ? 0.9 : 0.6,
            }}
          />
        ))}
        <span className="ml-1 text-[11px] font-bold uppercase tracking-wider opacity-70">
          {card.level === 1 ? 'Warm up' : card.level === 2 ? 'Going deeper' : 'No filter'}
        </span>
      </div>

      <p className="relative mt-7 text-[1.6rem] leading-snug font-semibold font-display">
        {text}
      </p>

      <div className="relative mt-7 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold"
          style={{ background: 'rgba(255,255,255,0.85)', color: deck.to }}
        >
          {onSpot}
        </span>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold opacity-80">
            <Heart size={14} fill="currentColor" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
