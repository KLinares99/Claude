import { Heart, SkipForward, ArrowRight, X, RotateCcw, PartyPopper } from 'lucide-react';
import { useGame, type GameState } from '../lib/store';
import { cardById, pickNext, remainingCards, resolveCard, eligibleCards } from '../lib/deck';
import { toast } from '../lib/toast';
import Setup from './Setup';
import GameCard from './GameCard';
import Confetti from './Confetti';

// Compute the next session state after handling the current card.
// `count` = the card was actually played (advances turn + tallies), vs a skip.
function advance(s: GameState, count: boolean): GameState {
  const cur = s.session.currentId;
  const drawn = cur && !s.session.drawn.includes(cur) ? [...s.session.drawn, cur] : s.session.drawn;
  const played = s.session.played + (count ? 1 : 0);
  const turn: 0 | 1 = count ? (s.session.turn === 0 ? 1 : 0) : s.session.turn;
  const probe: GameState = { ...s, session: { ...s.session, drawn, played, turn } };
  const next = pickNext(remainingCards(probe), played);
  return {
    ...s,
    session: { ...s.session, drawn, played, turn, currentId: next ? next.id : null },
    stats: count ? { ...s.stats, totalPlayed: s.stats.totalPlayed + 1 } : s.stats,
  };
}

export default function Play() {
  const { state, update } = useGame();
  const { session, players } = state;

  if (!session.active) {
    return <Setup onStart={() => {
      // draw the first card right after Setup flips the session on
      update((s) => {
        const first = pickNext(remainingCards(s), 0);
        return { ...s, session: { ...s.session, currentId: first ? first.id : null } };
      });
    }} />;
  }

  const card = cardById(session.currentId);

  const endGame = () =>
    update((s) => ({ ...s, session: { ...s.session, active: false, currentId: null } }));

  const playAgain = () =>
    update((s) => {
      const probe: GameState = { ...s, session: { ...s.session, drawn: [], played: 0, turn: 0 } };
      const first = pickNext(remainingCards(probe), 0);
      return {
        ...s,
        session: { active: true, drawn: [], played: 0, turn: 0, currentId: first ? first.id : null, startedAt: Date.now() },
        stats: { ...s.stats, games: s.stats.games + 1 },
      };
    });

  // ---- ran out of cards ----
  if (!card) {
    const total = eligibleCards(state).length;
    return (
      <div className="panel p-8 text-center space-y-4 animate-pop-in relative overflow-hidden">
        <Confetti />
        <PartyPopper size={48} className="mx-auto text-tou-rose relative" />
        <h2 className="text-2xl font-display font-bold text-tou-ink relative">That's the whole deck!</h2>
        <p className="text-tou-dim relative">
          You two went through <b className="text-tou-ink">{session.played}</b> cards together
          {total ? ` out of ${total}` : ''}. Nicely done. 💛
        </p>
        <div className="flex flex-col gap-2 pt-2 relative">
          <button onClick={playAgain} className="btn-primary w-full">
            <RotateCcw size={18} /> Shuffle & play again
          </button>
          <button onClick={endGame} className="btn-ghost w-full">
            Change decks
          </button>
        </div>
      </div>
    );
  }

  const { text, onSpot, drawer } = resolveCard(card, players, session.turn);
  const saved = state.favorites.includes(card.id);
  const remaining = remainingCards(state).length;

  const toggleSave = () =>
    update((s) => {
      const has = s.favorites.includes(card.id);
      toast(has ? 'Removed from Saved' : 'Saved to your jar 💛');
      return {
        ...s,
        favorites: has ? s.favorites.filter((x) => x !== card.id) : [...s.favorites, card.id],
      };
    });

  return (
    <div className="space-y-5">
      {/* turn + progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-full bg-tou-rose text-white grid place-items-center font-bold text-sm shadow-pop">
            {drawer.slice(0, 1).toUpperCase()}
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold text-tou-ink">{drawer}'s turn</div>
            <div className="text-[11px] text-tou-dim">{session.played} played · {remaining} left</div>
          </div>
        </div>
        <button onClick={endGame} className="btn-soft text-sm !py-2">
          <X size={16} /> End
        </button>
      </div>

      <GameCard card={card} text={text} onSpot={onSpot} saved={saved} />

      {/* actions */}
      <div className="grid grid-cols-[auto_1fr] gap-3">
        <button onClick={toggleSave} className="btn-ghost !px-4" aria-label="Save card">
          <Heart size={20} fill={saved ? '#FF5D8F' : 'none'} className={saved ? 'text-tou-rose' : ''} />
        </button>
        <button onClick={() => update((s) => advance(s, true))} className="btn-primary text-lg">
          Next card <ArrowRight size={20} />
        </button>
      </div>
      <button
        onClick={() => update((s) => advance(s, false))}
        className="w-full flex items-center justify-center gap-2 text-tou-dim text-sm font-semibold py-1 hover:text-tou-ink"
      >
        <SkipForward size={15} /> Not feeling this one — skip it
      </button>
    </div>
  );
}
