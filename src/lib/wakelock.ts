/**
 * Global screen wake-lock manager, shared by the GPS tracker and the
 * interval timer. Re-acquires automatically when the tab becomes visible
 * again while a session is active.
 */
type Sentinel = { release: () => Promise<void> } | null;

let sentinel: Sentinel = null;
let wanted = false;

const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

export async function acquireWakeLock() {
  wanted = true;
  if (!supported) return;
  try {
    const wl = (navigator as unknown as { wakeLock: { request: (t: string) => Promise<Sentinel> } }).wakeLock;
    sentinel = await wl.request('screen');
  } catch {
    sentinel = null;
  }
}

export async function releaseWakeLock() {
  wanted = false;
  try {
    await sentinel?.release();
  } catch {
    /* ignore */
  }
  sentinel = null;
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wanted) void acquireWakeLock();
  });
}
