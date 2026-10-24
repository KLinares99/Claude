import { useState } from 'react';
import { X } from 'lucide-react';
import { quoteForToday } from '../data/quotes';
import { unseenChanges } from '../lib/changelog';
import { localDateISO } from '../lib/nutrition';

const SHOWN_KEY = 'runner:quoteShown';

/** Quote / tip of the day — an inline card at the top of Home, once per
 *  calendar day until dismissed. Skipped when a What's-new banner is
 *  waiting, so an update never opens with two "read me first" moments
 *  stacked; the quote returns tomorrow. */
export default function QuoteOfDay() {
  const [open, setOpen] = useState(() => {
    try {
      if (unseenChanges().length > 0) return false;
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
    <div className="card-pad card-in relative">
      <button onClick={dismiss} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-fill text-dim flex items-center justify-center active:opacity-60" aria-label="Dismiss">
        <X size={15} strokeWidth={2.5} />
      </button>
      <div className="label mb-1">Quote of the Day</div>
      <p className="text-[17px] font-semibold leading-snug pr-8">“{q.text}”</p>
      {q.by && <p className="text-sm text-dim mt-1">{q.by}</p>}
    </div>
  );
}
