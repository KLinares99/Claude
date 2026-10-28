import { useEffect, useState, useSyncExternalStore } from 'react';
import Nav, { type Tab } from './components/Nav';
import Home from './screens/Home';
import Record from './screens/Record';
import Nutrition from './screens/Nutrition';
import Profile from './screens/Profile';
import Toast from './components/ui/Toast';
import { trackerSubscribe, trackerGet } from './lib/tracker';
import { useStore } from './lib/storage';
import { applyAccent } from './lib/theme';
import { fmtClock, metersToMiles } from './lib/run';

const titles: Record<Tab, string> = {
  home: 'Home',
  record: 'Record',
  nutrition: 'Nutrition',
  you: 'You'
};

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const tracker = useSyncExternalStore(trackerSubscribe, trackerGet);
  const { data } = useStore();
  const recording = tracker.phase !== 'idle';

  // scroll-edge effect: the glass top bar (with a compact title) fades in
  // once the large title has scrolled away
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 44);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  // recolor the whole app whenever the accent setting changes
  useEffect(() => {
    applyAccent(data.settings.accent);
  }, [data.settings.accent]);

  return (
    <div className="min-h-screen bg-paper">
      <div
        className={`glass-bar fixed top-0 inset-x-0 z-30 transition-opacity duration-200 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
        aria-hidden={!scrolled}
      >
        <div className="h-11 flex items-center justify-center text-[17px] font-semibold">{titles[tab]}</div>
      </div>
      <main
        className="max-w-[480px] mx-auto px-4 pb-32"
        style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}
      >
        {/* iOS large title — scrolls with the content */}
        <h1 className="large-title pt-2 mb-4">{titles[tab]}</h1>

        {tab === 'home' && <Home />}
        {/* Record stays mounted so the map, timer and GPS session never
            reset on tab switches — it's only hidden with CSS. */}
        <div className={tab === 'record' ? '' : 'hidden'}>
          <Record active={tab === 'record'} />
        </div>
        {tab === 'nutrition' && <Nutrition />}
        {tab === 'you' && <Profile onOpenNutrition={() => setTab('nutrition')} />}
      </main>

      {/* live session banner when recording on another tab */}
      {recording && tab !== 'record' && (
        <button
          onClick={() => setTab('record')}
          className="fixed inset-x-0 z-40 flex justify-center px-4"
          style={{ bottom: 'calc(84px + env(safe-area-inset-bottom))' }}
        >
          <span className="glass-dark flex items-center gap-2.5 rounded-full pl-3 pr-4 py-2 max-w-[420px] w-full justify-center">
            <span className={`w-2.5 h-2.5 rounded-full ${tracker.phase === 'running' ? 'bg-brand rec-dot' : 'bg-faint'}`} />
            <span className="text-sm font-semibold nums">
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
