import { useState } from 'react';
import { Play as PlayIcon, Lock } from 'lucide-react';
import { DECKS, type DeckId, type Level } from '../data/cards';
import { useGame } from '../lib/store';

const DEPTHS: { lv: Level; label: string; sub: string }[] = [
  { lv: 1, label: 'Warm up', sub: 'easy & playful' },
  { lv: 2, label: 'Deeper', sub: 'open up a bit' },
  { lv: 3, label: 'No filter', sub: 'go all in' },
];

export default function Setup({ onStart }: { onStart: () => void }) {
  const { state, update } = useGame();
  const [a, setA] = useState(state.players.a);
  const [b, setB] = useState(state.players.b);
  const [decks, setDecks] = useState<DeckId[]>(state.config.decks);
  const [maxLevel, setMaxLevel] = useState<Level>(state.config.maxLevel);
  const [confirmSpicy, setConfirmSpicy] = useState(false);

  const toggleDeck = (id: DeckId, adult?: boolean) => {
    if (adult && !state.config.spicyUnlocked) {
      setConfirmSpicy(true);
      return;
    }
    setDecks((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  };

  const unlockSpicy = () => {
    update((s) => ({ ...s, config: { ...s.config, spicyUnlocked: true } }));
    setDecks((d) => (d.includes('spicy') ? d : [...d, 'spicy']));
    setConfirmSpicy(false);
  };

  const start = () => {
    const nameA = a.trim() || 'Player 1';
    const nameB = b.trim() || 'Player 2';
    update((s) => ({
      ...s,
      players: { a: nameA, b: nameB },
      config: { ...s.config, decks, maxLevel },
      session: { active: true, drawn: [], currentId: null, turn: 0, played: 0, startedAt: Date.now() },
      stats: { ...s.stats, games: s.stats.games + 1 },
    }));
    onStart();
  };

  const canStart = decks.length > 0;

  return (
    <div className="space-y-5">
      <div className="pt-1">
        <div className="overflow-hidden rounded-[1.75rem] border border-tou-sand shadow-soft">
          <img
            src={`${import.meta.env.BASE_URL}hero.webp`}
            alt="A couple sitting together on a couch, smiling and playing a card game"
            className="w-full h-48 object-cover"
            style={{ objectPosition: 'center 45%' }}
          />
        </div>
        <div className="text-center mt-4">
          <h2 className="text-2xl font-display font-bold text-tou-ink">Just the two of you.</h2>
          <p className="text-tou-dim text-sm mt-1">
            One phone, taking turns. Pick your decks and how deep you want to go.
          </p>
        </div>
      </div>

      <div className="panel p-5 space-y-3">
        <p className="label">Who's playing</p>
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Player 1" value={a} maxLength={16} onChange={(e) => setA(e.target.value)} />
          <input className="input" placeholder="Player 2" value={b} maxLength={16} onChange={(e) => setB(e.target.value)} />
        </div>
      </div>

      <div className="panel p-5 space-y-3">
        <p className="label">Decks</p>
        <div className="flex flex-wrap gap-2">
          {DECKS.map((d) => {
            const on = decks.includes(d.id);
            const locked = d.adult && !state.config.spicyUnlocked;
            return (
              <button
                key={d.id}
                onClick={() => toggleDeck(d.id, d.adult)}
                className="chip border-2"
                style={{
                  background: on ? d.from : '#fff',
                  borderColor: on ? d.to : '#FBE7DA',
                  color: on ? d.ink : '#3A2B4A',
                }}
              >
                <span className="text-base leading-none">{d.emoji}</span>
                {d.name}
                {locked && <Lock size={13} className="opacity-60" />}
              </button>
            );
          })}
        </div>
        {confirmSpicy && (
          <div className="rounded-2xl bg-tou-berry/10 border border-tou-berry/30 p-4 animate-pop-in">
            <p className="text-sm font-semibold text-tou-berry">🔥 Spicy deck is 18+</p>
            <p className="text-xs text-tou-dim mt-1">
              Flirty and intimate prompts. Both players should be adults and into it.
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={unlockSpicy} className="btn-primary !py-2 text-sm flex-1">
                We're 18+ — unlock
              </button>
              <button onClick={() => setConfirmSpicy(false)} className="btn-soft text-sm">
                Not now
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="panel p-5 space-y-3">
        <p className="label">How deep tonight?</p>
        <div className="grid grid-cols-3 gap-2">
          {DEPTHS.map((d) => {
            const on = maxLevel === d.lv;
            return (
              <button
                key={d.lv}
                onClick={() => setMaxLevel(d.lv)}
                className={`rounded-2xl px-2 py-3 text-center transition-all border-2 ${
                  on ? 'bg-tou-rose text-white border-tou-rose shadow-pop' : 'bg-white border-tou-sand text-tou-ink'
                }`}
              >
                <div className="font-bold text-sm">{d.label}</div>
                <div className={`text-[11px] ${on ? 'text-white/80' : 'text-tou-dim'}`}>{d.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={start} disabled={!canStart} className="btn-primary w-full text-lg !py-4">
        <PlayIcon size={20} fill="currentColor" />
        {canStart ? 'Start playing' : 'Pick at least one deck'}
      </button>
    </div>
  );
}
