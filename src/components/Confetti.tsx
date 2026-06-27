import { useMemo } from 'react';

const COLORS = ['#FF5D8F', '#FFC93C', '#FF7A5C', '#7B5EA7', '#2EC4A6'];

/** Lightweight celebratory confetti — pure CSS, no deps. Fills its
 *  (relatively-positioned, overflow-hidden) parent. */
export default function Confetti({ count = 40 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.4,
        dur: 1.8 + Math.random() * 1.6,
        color: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 7,
        rot: Math.random() * 360,
        round: Math.random() > 0.5,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.w,
            height: p.w * 0.62,
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
            transform: `rotate(${p.rot}deg)`,
            animation: `confetti-fall ${p.dur}s ${p.delay}s ease-in infinite`,
          }}
        />
      ))}
    </div>
  );
}
