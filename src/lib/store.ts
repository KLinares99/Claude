// Two of Us — local, private game state.
// Everything lives in one namespaced localStorage object. No accounts, no
// network: intimate content never leaves the device.
import { useCallback, useEffect, useState } from 'react';
import type { DeckId, Level } from '../data/cards';

export const STORAGE_KEY = 'twoofus:v1';

export interface GameState {
  players: { a: string; b: string };
  config: {
    decks: DeckId[];
    maxLevel: Level;
    spicyUnlocked: boolean;
  };
  session: {
    active: boolean;
    drawn: string[];      // ids already shown this game (no repeats)
    currentId: string | null;
    turn: 0 | 1;          // whose turn it is to draw (0 = player A)
    played: number;       // cards completed this game
    startedAt: number | null;
  };
  favorites: string[];    // saved card ids
  stats: {
    totalPlayed: number;  // lifetime cards completed
    games: number;        // lifetime games started
  };
}

export function defaultState(): GameState {
  return {
    players: { a: '', b: '' },
    config: { decks: ['sweet', 'memories', 'deep'], maxLevel: 2, spicyUnlocked: false },
    session: { active: false, drawn: [], currentId: null, turn: 0, played: 0, startedAt: null },
    favorites: [],
    stats: { totalPlayed: 0, games: 0 },
  };
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const p = JSON.parse(raw) as Partial<GameState>;
    const base = defaultState();
    return {
      players: { ...base.players, ...(p.players ?? {}) },
      config: { ...base.config, ...(p.config ?? {}) },
      session: { ...base.session, ...(p.session ?? {}) },
      favorites: p.favorites ?? base.favorites,
      stats: { ...base.stats, ...(p.stats ?? {}) },
    };
  } catch {
    return defaultState();
  }
}

function save(s: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable — game still runs in-memory */
  }
}

// --- single shared source of truth, synced across components & tabs ---------

let listeners: Array<(s: GameState) => void> = [];
let memory: GameState | null = null;

function mem(): GameState {
  if (!memory) memory = loadState();
  return memory;
}

export function useGame() {
  const [state, setState] = useState<GameState>(mem);

  useEffect(() => {
    const fn = (s: GameState) => setState(s);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);

  const update = useCallback((mut: (s: GameState) => GameState) => {
    const next = mut(structuredClone(mem()));
    memory = next;
    save(next);
    listeners.forEach((l) => l(next));
  }, []);

  return { state, update };
}

export function resetAll() {
  memory = defaultState();
  save(memory);
  listeners.forEach((l) => l(memory!));
}
