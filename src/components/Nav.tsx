import { Home, User, CircleDot, UtensilsCrossed, Dumbbell, Square } from 'lucide-react';

export type Tab = 'home' | 'record' | 'train' | 'nutrition' | 'you';

/** Standard iOS tab bar: translucent material, hairline top edge, tinted
 *  active item, every label on one baseline. */
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
      className="fixed bottom-0 inset-x-0 z-40 border-t border-black/10 bg-card/80 backdrop-blur-xl backdrop-saturate-150"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-[480px] mx-auto grid grid-cols-5">
        <NavButton on={active === 'home'} label="Home" onClick={() => onChange('home')}>
          <Home size={24} strokeWidth={active === 'home' ? 2.4 : 1.8} />
        </NavButton>

        <NavButton on={active === 'record'} label={recording ? 'Recording' : 'Record'} onClick={() => onChange('record')}>
          {recording ? (
            <Square size={22} className="text-bad rec-dot" fill="currentColor" />
          ) : (
            <CircleDot size={24} strokeWidth={active === 'record' ? 2.4 : 1.8} />
          )}
        </NavButton>

        <NavButton on={active === 'train'} label="Train" onClick={() => onChange('train')}>
          <Dumbbell size={24} strokeWidth={active === 'train' ? 2.4 : 1.8} />
        </NavButton>

        <NavButton on={active === 'nutrition'} label="Nutrition" onClick={() => onChange('nutrition')}>
          <UtensilsCrossed size={24} strokeWidth={active === 'nutrition' ? 2.4 : 1.8} />
        </NavButton>

        <NavButton on={active === 'you'} label="You" onClick={() => onChange('you')}>
          <User size={24} strokeWidth={active === 'you' ? 2.4 : 1.8} />
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
      aria-current={on ? 'page' : undefined}
      className={`flex flex-col items-center gap-0.5 pt-2 pb-1.5 transition-colors ${on ? 'text-brand' : 'text-faint'}`}
    >
      <span className="h-6 flex items-center">{children}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
