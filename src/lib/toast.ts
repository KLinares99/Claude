// Tiny global toast bus — call toast('Saved ✓') from anywhere; the <Toast/>
// mounted in App renders it. Confirms that a log actually persisted.
type Listener = (msg: string) => void;

let listeners: Listener[] = [];

export function toast(message: string) {
  listeners.forEach((l) => l(message));
}

export function onToast(fn: Listener): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
