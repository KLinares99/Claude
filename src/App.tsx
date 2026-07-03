import { useState, useSyncExternalStore } from 'react';
import Nav, { type Tab } from './components/Nav';
import Logo from './components/Logo';
import Home from './screens/Home';
import Record from './screens/Record';
import Profile from './screens/Profile';
import Toast from './components/ui/Toast';
import { trackerSubscribe, trackerGet } from './lib/tracker';
import { fmtClock, metersToMiles } from './lib/run';

const titles: Record<Tab, string> = {
  home: 'Runner',
  record: 'Record',
  you: 'You'
};

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const tracker = useSyncExternalStore(trackerSubscribe, trackerGet);
  const recording = tracker.phase !== 'idle';

  return (
    <div className="min-h-screen bg-paper">
      <header
        className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[480px] mx-auto px-4 h-14 flex items-center gap-2.5">
          <Logo size={26} />
          <h1 className="font-black tracking-tight text-lg">{titles[tab]}</h1>
        </div>
      </header>

      <main className="max-w-[480px] mx-auto px-4 pt-4 pb-32">
        {tab === 'home' && <Home />}
        {/* Record stays mounted so the map, timer and GPS session never
            reset on tab switches — it's only hidden with CSS. */}
        <div className={tab === 'record' ? '' : 'hidden'}>
          <Record active={tab === 'record'} />
        </div>
        {tab === 'you' && <Profile />}
      </main>

      {/* live session banner when recording on another tab */}
      {recording && tab !== 'record' && (
        <button
          onClick={() => setTab('record')}
          className="fixed inset-x-0 z-40 flex justify-center px-4"
          style={{ bottom: 'calc(76px + env(safe-area-inset-bottom))' }}
        >
          <span className="flex items-center gap-2.5 bg-ink text-white rounded-full pl-3 pr-4 py-2 shadow-lg max-w-[480px] w-full justify-center">
            <span className={`w-2.5 h-2.5 rounded-full ${tracker.phase === 'running' ? 'bg-brand rec-dot' : 'bg-faint'}`} />
            <span className="text-sm font-bold nums">
              {tracker.phase === 'running' ? 'Recording' : 'Paused'} · {fmtClock(tracker.elapsed)} · {metersToMiles(tracker.meters).toFixed(2)} mi
            </span>
          </span>
        </button>
      )}

      <Nav active={tab} recording={recording} onChange={setTab} />
      <Toast />
    </div>
  );
}
