import React from 'react';

/**
 * Quote — Lora-italic pull quote with gold left rule (".blockquote" pattern).
 * Reserved for testimonials and mission-statement pull quotes only.
 */
export function Quote({ by, children, style }) {
  return React.createElement(
    'blockquote',
    {
      style: {
        fontFamily: 'var(--font-editorial)',
        fontStyle: 'italic',
        fontSize: 22,
        color: 'var(--navy)',
        borderLeft: '4px solid var(--gold)',
        paddingLeft: 22,
        margin: '8px 0',
        lineHeight: 1.5,
        ...style,
      },
    },
    children,
    by && React.createElement('div', { style: { fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--slate)', marginTop: 14, fontStyle: 'normal' } }, by)
  );
}
