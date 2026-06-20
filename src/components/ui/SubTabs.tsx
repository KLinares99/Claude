interface SubTabsProps {
  active: string;
  onChange: (id: string) => void;
  tabs: { id: string; label: string }[];
}

export default function SubTabs({ active, onChange, tabs }: SubTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-forge-panel border border-forge-border rounded-xl overflow-x-auto no-scrollbar">
      {tabs.map((t) => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              on ? 'bg-forge-teal text-[#06222a]' : 'text-forge-dim hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
