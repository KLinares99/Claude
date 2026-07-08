import React from 'react';

/**
 * Nav — sticky site header with globe logo, wordmark + eyebrow tagline,
 * horizontal link list, and CTA buttons (".site-header").
 */
export function Nav({ logoSrc, links = [], activeHref, actions, style }) {
  return React.createElement(
    'header',
    {
      style: {
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border)',
        ...style,
      },
    },
    React.createElement(
      'div',
      { style: { maxWidth: 1140, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, height: 76 } },
      React.createElement(
        'a', { href: '/', style: { display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', flexShrink: 0 } },
        logoSrc && React.createElement('img', { src: logoSrc, alt: 'Relevate Solutions logo', style: { height: 44, width: 'auto' } }),
        React.createElement(
          'span', { style: { fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 19, color: 'var(--navy-900)', lineHeight: 1.1, whiteSpace: 'nowrap' } },
          'Relevate Solutions',
          React.createElement('small', { style: { display: 'block', fontWeight: 600, fontSize: 10.5, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--cyan)' } }, 'Accounting \u00b7 Tax \u00b7 Coaching')
        )
      ),
      React.createElement(
        'ul', { style: { display: 'flex', alignItems: 'center', gap: 22, listStyle: 'none', margin: 0, padding: 0, flexWrap: 'nowrap' } },
        links.map((l, i) => React.createElement('li', { key: i },
          React.createElement('a', { href: l.href, style: { fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, color: l.href === activeHref ? 'var(--cyan)' : 'var(--navy-900)', textDecoration: 'none', whiteSpace: 'nowrap' } }, l.label)
        ))
      ),
      React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 } }, actions)
    )
  );
}
