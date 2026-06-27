import { Heart, Trash2 } from 'lucide-react';
import { useGame } from '../lib/store';
import { cardById } from '../lib/deck';
import { DECK_MAP } from '../data/cards';

export default function Saved({ onPlay }: { onPlay: () => void }) {
  const { state, update } = useGame();
  const cards = state.favorites.map(cardById).filter((c): c is NonNullable<typeof c> => !!c);

  const remove = (id: string) =>
    update((s) => ({ ...s, favorites: s.favorites.filter((x) => x !== id) }));

  if (cards.length === 0) {
    return (
      <div className="panel p-8 text-center space-y-3">
        <Heart size={44} className="mx-auto text-tou-rose" />
        <h2 className="text-xl font-display font-bold text-tou-ink">Your jar is empty</h2>
        <p className="text-tou-dim text-sm">
          Tap the <Heart size={14} className="inline -mt-0.5 text-tou-rose" fill="currentColor" /> on any card
          to save the prompts that spark something. They'll wait here for you.
        </p>
        <button onClick={onPlay} className="btn-primary mt-2">Start playing</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-display font-bold text-tou-ink">Saved cards</h2>
        <p className="text-tou-dim text-sm">{cards.length} prompt{cards.length === 1 ? '' : 's'} worth coming back to.</p>
      </div>

      <div className="space-y-3">
        {cards.map((card) => {
          const deck = DECK_MAP[card.deck];
          const text = card.text.replace(/\{partner\}/g, state.players.b || 'your partner');
          return (
            <div key={card.id} className="panel p-4 flex gap-3">
              <span
                className="shrink-0 h-10 w-10 rounded-2xl grid place-items-center text-lg"
                style={{ background: `linear-gradient(150deg, ${deck.from}, ${deck.to})` }}
              >
                {deck.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-tou-dim">{deck.name}</div>
                <p className="text-tou-ink font-medium leading-snug mt-0.5">{text}</p>
              </div>
              <button
                onClick={() => remove(card.id)}
                className="shrink-0 self-start text-tou-dim hover:text-tou-berry p-1"
                aria-label="Remove from saved"
              >
                <Trash2 size={17} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
