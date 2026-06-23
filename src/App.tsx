import { useState } from 'react';
import { Database } from 'lucide-react';
import Nav, { type Tab } from './components/Nav';
import Dashboard from './components/Dashboard';
import RunHub from './components/run/RunHub';
import CalisthenicsHub from './components/cal/CalisthenicsHub';
import Knowledge from './components/Knowledge';
import Schedule from './components/Schedule';
import DataPanel from './components/DataPanel';
import Toast from './components/ui/Toast';

const titles: Record<Tab, string> = {
  dashboard: 'INVINCIBLE',
  run: 'Run',
  cal: 'Calisthenics',
  knowledge: 'Knowledge',
  schedule: 'Schedule'
};

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showData, setShowData] = useState(false);

  return (
    <div className="min-h-screen bg-forge-bg">
      <header
        className="sticky top-0 z-30 border-b border-forge-border bg-forge-bg/90 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[480px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center font-black text-sm leading-none"
              style={{ background: '#1f4ea1', color: '#ffd21e' }}
            >
              I
            </span>
            <h1 className="font-black tracking-tight text-lg text-white">{titles[tab]}</h1>
          </div>
          <button
            onClick={() => setShowData(true)}
            className="flex items-center gap-1.5 text-forge-dim hover:text-forge-teal"
            aria-label="Data and backup"
          >
            <Database size={18} />
            <span className="text-[11px] font-semibold">Data</span>
          </button>
        </div>
      </header>

      <main className="max-w-[480px] mx-auto px-4 pt-4 pb-28">
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'run' && <RunHub />}
        {tab === 'cal' && <CalisthenicsHub />}
        {tab === 'knowledge' && <Knowledge />}
        {tab === 'schedule' && <Schedule />}
      </main>

      <Nav active={tab} onChange={setTab} />
      {showData && <DataPanel onClose={() => setShowData(false)} />}
      <Toast />
    </div>
  );
}
