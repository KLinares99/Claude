import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { onToast } from '../../lib/toast';

interface Item {
  id: number;
  msg: string;
}

export default function Toast() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    return onToast((msg) => {
      const id = Date.now() + Math.random();
      setItems((cur) => [...cur, { id, msg }]);
      window.setTimeout(() => {
        setItems((cur) => cur.filter((i) => i.id !== id));
      }, 2200);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
      style={{ bottom: 'calc(84px + env(safe-area-inset-bottom))' }}
    >
      {items.map((i) => (
        <div
          key={i.id}
          className="flex items-center gap-2 rounded-xl bg-ink text-white px-4 py-2.5 shadow-lg max-w-[480px] w-full"
        >
          <CheckCircle2 size={18} className="text-good shrink-0" />
          <span className="text-sm font-medium">{i.msg}</span>
        </div>
      ))}
    </div>
  );
}
