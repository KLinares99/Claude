import { useState } from 'react';
import Nav, { type Tab } from './components/Nav';
import Dashboard from './components/Dashboard';
import RunHub from './components/run/RunHub';
import CalisthenicsHub from './components/cal/CalisthenicsHub';
import Knowledge from './components/Knowledge';
import Schedule from './components/Schedule';

const titles: Record<Tab, string> = {
  dashboard: 'FORGE',
  run: 'Run',
  cal: 'Calisthenics',
  knowledge: 'Knowledge',
  schedule: 'Schedule'
};

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-forge-bg">
      <header
        className="sticky top-0 z-30 border-b border-forge-border bg-forge-bg/90 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[480px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-forge-orange text-xl">🔥</span>
            <h1 className="font-black tracking-tight text-lg text-white">{titles[tab]}</h1>
          </div>
          {tab === 'dashboard' && (
            <span className="text-[11px] text-forge-dim">Forged, not given</span>
          )}
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
    </div>
  );
}
