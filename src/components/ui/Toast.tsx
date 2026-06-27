import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
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
      style={{ bottom: 'calc(72px + env(safe-area-inset-bottom))' }}
    >
      {items.map((i) => (
        <div
          key={i.id}
          className="flex items-center gap-2 rounded-2xl bg-tou-ink text-white px-4 py-2.5 shadow-card max-w-[480px] w-full"
        >
          <Heart size={16} className="text-tou-rose shrink-0" fill="currentColor" />
          <span className="text-sm">{i.msg}</span>
        </div>
      ))}
    </div>
  );
}
