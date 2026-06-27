import { useState } from 'react';
import { Heart, ShieldCheck, RefreshCw } from 'lucide-react';
import { useGame, resetAll } from '../lib/store';
import { CARDS } from '../data/cards';

export default function About() {
  const { state } = useGame();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="space-y-5">
      <div className="panel p-6 text-center">
        <Heart size={40} className="mx-auto text-tou-rose" fill="currentColor" />
        <h2 className="mt-2 text-2xl font-display font-bold text-tou-ink">Two of Us</h2>
        <p className="text-tou-dim text-sm mt-1">
          A little card game for two — funny, tender, and sometimes a bit spicy. Made for putting
          the phone down and actually talking. 💛
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ['Cards', CARDS.length],
          ['Played', state.stats.totalPlayed],
          ['Games', state.stats.games],
        ].map(([label, n]) => (
          <div key={label as string} className="panel p-4 text-center">
            <div className="text-2xl font-display font-bold text-tou-rose nums">{n as number}</div>
            <div className="label mt-0.5">{label as string}</div>
          </div>
        ))}
      </div>

      <div className="panel p-5 space-y-3">
        <p className="label">How to play</p>
        <ol className="space-y-2 text-sm text-tou-ink list-decimal list-inside marker:text-tou-rose marker:font-bold">
          <li>Sit together with one phone between you.</li>
          <li>Take turns. Whoever's turn it is reads the card out loud.</li>
          <li>Answer honestly, guess playfully, or do the dare.</li>
          <li>Tap <Heart size={13} className="inline -mt-0.5 text-tou-rose" fill="currentColor" /> to save the ones you love.</li>
        </ol>
      </div>

      <div className="panel p-5 flex gap-3">
        <ShieldCheck size={22} className="text-tou-mint shrink-0" />
        <div>
          <p className="font-bold text-tou-ink text-sm">Totally private</p>
          <p className="text-tou-dim text-sm">
            No accounts, no sign-up, nothing sent anywhere. Everything — including the spicy stuff —
            stays on this device. Works offline once loaded.
          </p>
        </div>
      </div>

      <div className="panel p-5 space-y-3">
        <p className="label">Reset</p>
        {!confirm ? (
          <button onClick={() => setConfirm(true)} className="btn-ghost w-full text-tou-berry">
            <RefreshCw size={17} /> Reset everything
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-tou-dim">
              This clears saved cards, names, stats, and the spicy unlock. Can't be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { resetAll(); setConfirm(false); }}
                className="btn-primary flex-1 !bg-tou-berry"
              >
                Yes, reset
              </button>
              <button onClick={() => setConfirm(false)} className="btn-soft">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-tou-dim pb-2">Made with 💛 for the two of you.</p>
    </div>
  );
}
