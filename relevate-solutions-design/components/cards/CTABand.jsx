import React from 'react';

/**
 * CTABand — the dark gradient call-to-action band with corner ring decoration
 * (".cta-band"). Used to close nearly every page.
 */
export function CTABand({ title, subtitle, actions, style }) {
  return React.createElement(
    'div',
    {
      style: {
        background: 'linear-gradient(120deg,var(--navy-900),var(--navy) 60%,var(--navy-700))',
        borderRadius: 20,
        padding: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 32,
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      },
    },
    React.createElement('div', {
      style: { content: "''", position: 'absolute', right: -80, top: -120, width: 320, height: 320, borderRadius: '50%', border: '50px solid rgba(33,174,228,.12)' },
    }),
    React.createElement(
      'div',
      { style: { position: 'relative' } },
      React.createElement('h2', { style: { color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 30, margin: '0 0 8px' } }, title),
      subtitle && React.createElement('p', { style: { color: '#B9CBDA', margin: 0 } }, subtitle)
    ),
    React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative' } }, actions)
  );
}
