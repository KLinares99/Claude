import { Home, User, CircleDot, UtensilsCrossed, Square } from 'lucide-react';

export type Tab = 'home' | 'record' | 'nutrition' | 'you';

/** iOS 26 tab bar: a floating Liquid Glass capsule; the active tab sits on
 *  a brighter glass "lens". Every label stays on one baseline. */
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
      className="fixed bottom-0 inset-x-0 z-40 px-4 pointer-events-none"
      style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}
    >
      <div className="glass pointer-events-auto max-w-[420px] mx-auto grid grid-cols-4 p-1 rounded-full">
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
      className={`flex flex-col items-center gap-0.5 pt-1.5 pb-1 rounded-full transition-all duration-200 active:scale-95 ${
        on ? 'text-brand bg-white/75 shadow-[0_1px_4px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]' : 'text-ink/60'
      }`}
    >
      <span className="h-6 flex items-center">{children}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
