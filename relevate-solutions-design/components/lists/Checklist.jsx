import React from 'react';

/**
 * Checklist — bulleted list with a cyan-chip checkmark bullet (".checklist").
 * items: array of ReactNode (may include <b> for emphasis)
 */
export function Checklist({ items = [], columns = 1, style }) {
  return React.createElement(
    'ul',
    {
      style: {
        listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: columns > 1 ? `repeat(${columns}, 1fr)` : '1fr',
        gap: '12px 36px',
        margin: 0,
        padding: 0,
        ...style,
      },
    },
    items.map((item, i) =>
      React.createElement(
        'li',
        { key: i, style: { position: 'relative', paddingLeft: 34, color: 'var(--slate)', fontSize: 15.5 } },
        React.createElement('span', {
          style: { position: 'absolute', left: 0, top: 3, width: 20, height: 20, borderRadius: '50%', background: 'var(--cyan-soft)' },
        }),
        React.createElement('span', {
          style: { position: 'absolute', left: 5, top: 0, color: 'var(--navy)', fontWeight: 800, fontSize: 12 },
        }, '\u2713'),
        item
      )
    )
  );
}
