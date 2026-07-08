import React from 'react';

/**
 * ResourceItem — a linked row from the client Resources page (".res-item"):
 * title + description on the left, a Badge on the right.
 */
export function ResourceItem({ title, description, tag, href = '#', style }) {
  return React.createElement(
    'a',
    {
      href,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 18,
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '18px 22px',
        textDecoration: 'none',
        transition: '.18s',
        ...style,
      },
    },
    React.createElement(
      'span',
      null,
      React.createElement('span', { style: { fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy-900)', fontSize: 15.5, display: 'block' } }, title),
      React.createElement('span', { style: { fontSize: 13.5, color: 'var(--slate)' } }, description)
    ),
    tag
  );
}
