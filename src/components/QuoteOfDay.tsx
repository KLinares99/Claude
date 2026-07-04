import { useState } from 'react';
import { X } from 'lucide-react';
import Logo from './Logo';
import Mascot from './Mascot';
import { quoteForToday } from '../data/quotes';
import { localDateISO } from '../lib/nutrition';

const SHOWN_KEY = 'runner:quoteShown';

/** Quote / tip of the day — shows once per calendar day as the app opens. */
export default function QuoteOfDay() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(SHOWN_KEY) !== localDateISO();
    } catch {
      return false;
    }
  });

  if (!open) return null;

  const q = quoteForToday();
  const dismiss = () => {
    try {
      localStorage.setItem(SHOWN_KEY, localDateISO());
    } catch { /* ignore */ }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6" onClick={dismiss}>
      <div
        className="bg-card rounded-3xl w-full max-w-[400px] p-6 shadow-sheet text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="label">Ptak's boost of the day</span>
          <button onClick={dismiss} className="text-dim hover:text-ink p-1 -mr-1" aria-label="Dismiss">
            <X size={20} />
          </button>
        </div>
        <div className="mx-auto w-fit">
          <Mascot pose="wave" size={112} fallback={<Logo size={44} />} />
        </div>
        <p className="text-lg font-bold leading-snug">“{q.text}”</p>
        {q.by && <p className="text-sm text-dim">— {q.by}</p>}
        <button className="btn-primary w-full py-3" onClick={dismiss}>Let's go</button>
      </div>
    </div>
  );
}
