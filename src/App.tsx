import { useState } from 'react';
import Nav, { type Tab } from './components/Nav';
import Play from './components/Play';
import Decks from './components/Decks';
import Saved from './components/Saved';
import About from './components/About';
import Toast from './components/ui/Toast';
import Logo from './components/Logo';

export default function App() {
  const [tab, setTab] = useState<Tab>('play');

  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-30 border-b border-tou-sand bg-tou-cream/80 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[480px] mx-auto px-4 h-14 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Logo size={26} />
            <h1 className="font-display font-bold tracking-tight text-xl text-tou-ink">
              Two of Us
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[480px] mx-auto px-4 pt-5 pb-28">
        {tab === 'play' && <Play />}
        {tab === 'decks' && <Decks />}
        {tab === 'saved' && <Saved onPlay={() => setTab('play')} />}
        {tab === 'about' && <About />}
      </main>

      <Nav active={tab} onChange={setTab} />
      <Toast />
    </div>
  );
}
