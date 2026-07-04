import { Home, User, Circle, UtensilsCrossed } from 'lucide-react';

export type Tab = 'home' | 'record' | 'nutrition' | 'you';

export default function Nav({
  active,
  recording,
  onChange
}: {
  active: Tab;
  recording: boolean;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-card/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-[480px] mx-auto grid grid-cols-4">
        <NavButton on={active === 'home'} label="Home" onClick={() => onChange('home')}>
          <Home size={22} strokeWidth={active === 'home' ? 2.5 : 2} />
        </NavButton>

        {/* record button */}
        <button onClick={() => onChange('record')} className="flex flex-col items-center gap-1 py-1.5" aria-label="Record">
          <span
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              active === 'record' ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
            }`}
          >
            {recording ? <span className="w-3.5 h-3.5 rounded-[3px] bg-current rec-dot" /> : <Circle size={20} strokeWidth={3} />}
          </span>
          <span className={`text-[10px] font-semibold tracking-wide ${active === 'record' ? 'text-brand' : 'text-dim'}`}>
            Record
          </span>
        </button>

        <NavButton on={active === 'nutrition'} label="Nutrition" onClick={() => onChange('nutrition')}>
          <UtensilsCrossed size={22} strokeWidth={active === 'nutrition' ? 2.5 : 2} />
        </NavButton>

        <NavButton on={active === 'you'} label="You" onClick={() => onChange('you')}>
          <User size={22} strokeWidth={active === 'you' ? 2.5 : 2} />
        </NavButton>
      </div>
    </nav>
  );
}

function NavButton({
  on, label, onClick, children
}: { on: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${on ? 'text-brand' : 'text-dim hover:text-ink'}`}
    >
      {children}
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </button>
  );
}
