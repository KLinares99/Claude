import { LayoutDashboard, Activity, Dumbbell, BookOpen, CalendarDays } from 'lucide-react';

export type Tab = 'dashboard' | 'run' | 'cal' | 'knowledge' | 'schedule';

const items: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'run', label: 'Run', icon: Activity },
  { id: 'cal', label: 'Skills', icon: Dumbbell },
  { id: 'knowledge', label: 'Learn', icon: BookOpen },
  { id: 'schedule', label: 'Plan', icon: CalendarDays }
];

export default function Nav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-forge-border bg-forge-panel/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-[480px] mx-auto grid grid-cols-5">
        {items.map(({ id, label, icon: Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                on ? 'text-forge-teal' : 'text-forge-dim hover:text-slate-300'
              }`}
            >
              <Icon size={22} strokeWidth={on ? 2.5 : 2} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
