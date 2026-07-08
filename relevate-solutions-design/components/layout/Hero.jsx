import React from 'react';

/**
 * Hero — dark navy gradient hero with ring decoration (".hero" / ".page-hero").
 * variant: 'home' (large, badges, two CTAs) | 'page' (compact interior hero)
 */
export function Hero({ variant = 'home', eyebrow, title, lede, actions, badges = [], style }) {
  const isHome = variant === 'home';
  return React.createElement(
    'div',
    {
      style: {
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg,var(--navy-900) 0%,var(--navy) 68%,var(--navy-700) 100%)',
        color: '#fff',
        padding: isHome ? '96px 28px 88px' : '72px 28px 60px',
        ...style,
      },
    },
    React.createElement('div', { style: { position: 'absolute', right: -140, top: -100, width: 520, height: 520, borderRadius: '50%', border: '80px solid rgba(33,174,228,.10)' } }),
    React.createElement(
      'div', { style: { position: 'relative', zIndex: 1, maxWidth: 1140, margin: '0 auto' } },
      eyebrow && React.createElement('span', { style: { display: 'inline-block', color: 'var(--cyan)', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', fontSize: 12.5, marginBottom: 16 } }, eyebrow),
      React.createElement('h1', { style: { fontSize: isHome ? 52 : 42, fontWeight: 800, color: '#fff', maxWidth: 760, margin: '0 0 18px', fontFamily: 'var(--font-heading)', lineHeight: 1.15 } }, title),
      lede && React.createElement('p', { style: { fontSize: isHome ? 19.5 : 18, color: '#B9CBDA', maxWidth: 620, margin: '0 0 32px' } }, lede),
      actions && React.createElement('div', { style: { display: 'flex', gap: 14, flexWrap: 'wrap' } }, actions),
      isHome && badges.length > 0 && React.createElement(
        'div', { style: { display: 'flex', gap: 26, flexWrap: 'wrap', marginTop: 42 } },
        badges.map((b, i) => React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: '#CFE0EE', fontWeight: 500 } }, b))
      )
    )
  );
}
