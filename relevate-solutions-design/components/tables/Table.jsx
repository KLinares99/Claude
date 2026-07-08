import React from 'react';

/**
 * Table — the theme's "table.rs" pattern: navy header row, silver dividers,
 * soft shadow, rounded corners.
 */
export function Table({ headers = [], rows = [], style }) {
  return React.createElement(
    'table',
    { style: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', ...style } },
    React.createElement(
      'thead',
      null,
      React.createElement(
        'tr',
        null,
        headers.map((h, i) => React.createElement('th', { key: i, style: { background: 'var(--navy-900)', color: '#fff', textAlign: 'left', padding: '15px 20px', fontFamily: 'var(--font-heading)', fontSize: 14.5 } }, h))
      )
    ),
    React.createElement(
      'tbody',
      null,
      rows.map((row, ri) =>
        React.createElement(
          'tr',
          { key: ri },
          row.map((cell, ci) => React.createElement('td', { key: ci, style: { padding: '15px 20px', borderTop: '1px solid var(--border)', fontSize: 15, color: 'var(--slate)', verticalAlign: 'top' } }, cell))
        )
      )
    )
  );
}
