import React from 'react';

/**
 * StatBand — the dark navy stats strip (".section-dark .stats").
 * stats: array of { value, label }
 */
export function StatBand({ stats = [], style }) {
  return React.createElement(
    'div',
    {
      style: {
        background: 'var(--navy-900)',
        borderRadius: 0,
        padding: '48px 28px',
        display: 'grid',
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        gap: 20,
        textAlign: 'center',
        ...style,
      },
    },
    stats.map((s, i) =>
      React.createElement(
        'div',
        { key: i },
        React.createElement('b', { style: { display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 40, color: 'var(--cyan)' } }, s.value),
        React.createElement('span', { style: { fontSize: 14, color: '#B9CBDA', fontWeight: 500 } }, s.label)
      )
    )
  );
}
