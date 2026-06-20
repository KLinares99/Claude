import { useCallback, useEffect, useRef, useState } from 'react';

type WakeLockSentinelLike = { release: () => Promise<void> } | null;

/**
 * Keeps the screen awake while a timer runs (Wake Lock API).
 * Re-acquires automatically when the tab becomes visible again.
 * NOTE: true background audio (screen locked) requires a native wrapper
 * (Capacitor) — this only covers screen-on. Documented as a future step.
 */
export function useWakeLock() {
  const [active, setActive] = useState(false);
  const [supported] = useState(() => typeof navigator !== 'undefined' && 'wakeLock' in navigator);
  const sentinel = useRef<WakeLockSentinelLike>(null);
  const wantRef = useRef(false);

  const acquire = useCallback(async () => {
    wantRef.current = true;
    if (!supported) return;
    try {
      const wl = (navigator as unknown as { wakeLock: { request: (t: string) => Promise<WakeLockSentinelLike> } }).wakeLock;
      sentinel.current = await wl.request('screen');
      setActive(true);
    } catch {
      setActive(false);
    }
  }, [supported]);

  const release = useCallback(async () => {
    wantRef.current = false;
    try {
      await sentinel.current?.release();
    } catch {
      /* ignore */
    }
    sentinel.current = null;
    setActive(false);
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && wantRef.current) void acquire();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [acquire]);

  return { active, supported, acquire, release };
}
