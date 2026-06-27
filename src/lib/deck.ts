// Deck engine — filtering + drawing cards for a game.
import { CARDS, type Card } from '../data/cards';
import type { GameState } from './store';

/** Cards eligible given the current config (selected decks, depth, spice gate). */
export function eligibleCards(state: GameState): Card[] {
  const { decks, maxLevel, spicyUnlocked } = state.config;
  return CARDS.filter((card) => {
    if (!decks.includes(card.deck)) return false;
    if (card.level > maxLevel) return false;
    if (card.deck === 'spicy' && !spicyUnlocked) return false;
    return true;
  });
}

/** Cards still un-drawn this game. */
export function remainingCards(state: GameState): Card[] {
  const seen = new Set(state.session.drawn);
  return eligibleCards(state).filter((card) => !seen.has(card.id));
}

/** Pick a random card from a pool, lightly favoring lower levels early so the
 *  conversation eases in before it goes deep. */
export function pickNext(pool: Card[], played: number): Card | null {
  if (pool.length === 0) return null;
  // Early in a game, bias toward gentler cards; later, anything goes.
  const warmingUp = played < 4;
  const candidates = warmingUp ? pool.filter((c) => c.level === 1) : pool;
  const from = candidates.length > 0 ? candidates : pool;
  return from[Math.floor(Math.random() * from.length)];
}

export function cardById(id: string | null): Card | null {
  if (!id) return null;
  return CARDS.find((c) => c.id === id) ?? null;
}

/** Resolve {partner} tokens and figure out the human-readable "who's on" line. */
export function resolveCard(
  card: Card,
  players: { a: string; b: string },
  turn: 0 | 1
) {
  const drawer = turn === 0 ? players.a : players.b;
  const other = turn === 0 ? players.b : players.a;
  const text = card.text.replace(/\{partner\}/g, other || 'your partner');

  let onSpot: string;
  if (card.type === 'guess') {
    onSpot = `${drawer || 'You'}, take a guess`;
  } else if (card.to === 'both') {
    onSpot = 'Both of you';
  } else if (card.to === 'partner') {
    onSpot = `${other || 'Your partner'} answers`;
  } else {
    onSpot = card.type === 'dare' ? `${drawer || 'You'} — go for it` : `${drawer || 'You'}, your turn`;
  }
  return { text, onSpot, drawer: drawer || 'Player 1', other: other || 'Player 2' };
}
