import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { unseenChanges, markChangesSeen, type ChangelogEntry } from '../lib/changelog';

/**
 * "What's new" banner — appears at the top of Home after an update ships,
 * lists the changes, and stays dismissed for that version.
 */
export default function WhatsNew() {
  const [entries, setEntries] = useState<ChangelogEntry[]>(() => unseenChanges());
  if (entries.length === 0) return null;
  const latest = entries[0];
  const dismiss = () => {
    markChangesSeen();
    setEntries([]);
  };

  return (
    <div className="card-pad border-l-4 !border-l-brand">
      <div className="flex items-start gap-2.5">
        <Sparkles size={18} className="text-brand shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-black text-base">What's new — {latest.title}</h2>
            <button onClick={dismiss} aria-label="Dismiss what's new" className="text-dim hover:text-ink p-1 -mr-1 shrink-0">
              <X size={18} />
            </button>
          </div>
          <ul className="mt-2 space-y-1.5">
            {latest.points.map((p, i) => (
              <li key={i} className="text-sm text-dim leading-snug flex gap-2">
                <span className="text-brand font-black shrink-0">·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          {entries.length > 1 && (
            <p className="text-[11px] text-faint mt-2">
              Plus {entries.length - 1} earlier update{entries.length > 2 ? 's' : ''} you haven't seen.
            </p>
          )}
          <button className="btn-primary w-full mt-3 py-2" onClick={dismiss}>Got it</button>
        </div>
      </div>
    </div>
  );
}
