import { Play, Layers, Heart, Info } from 'lucide-react';

export type Tab = 'play' | 'decks' | 'saved' | 'about';

const items: { id: Tab; label: string; icon: typeof Play }[] = [
  { id: 'play', label: 'Play', icon: Play },
  { id: 'decks', label: 'Decks', icon: Layers },
  { id: 'saved', label: 'Saved', icon: Heart },
  { id: 'about', label: 'About', icon: Info },
];

export default function Nav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-tou-sand bg-tou-paper/90 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-[480px] mx-auto grid grid-cols-4">
        {items.map(({ id, label, icon: Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                on ? 'text-tou-rose' : 'text-tou-dim hover:text-tou-ink'
              }`}
              aria-current={on ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={on ? 2.6 : 2} fill={on && id !== 'play' ? 'currentColor' : 'none'} />
              <span className="text-[10px] font-bold tracking-wide">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
