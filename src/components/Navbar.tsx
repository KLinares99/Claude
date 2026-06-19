import { Activity, BarChart2, BookOpen, Dumbbell, Heart, Zap } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'zones', label: 'Training Zones', icon: Heart },
  { id: 'plans', label: 'Training Plans', icon: Zap },
  { id: 'nutrition', label: 'Nutrition', icon: BarChart2 },
  { id: 'recovery', label: 'Recovery', icon: Dumbbell },
  { id: 'science', label: 'Science Hub', icon: BookOpen }
];

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg leading-none">Running Hub</span>
              <p className="text-sky-400 text-xs leading-none mt-0.5">Science-backed training for men 20s-30s</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1 pb-2 overflow-x-auto scrollbar-hide">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
