import React from 'react';

/**
 * Card — the theme's white bordered ".card" surface, with variants matching
 * the site's real usage: default, featured (icon + cyan top border),
 * person (avatar initials, team bios), contact (utility card with heading icon).
 */
export function Card({ variant = 'default', icon, avatar, eyebrow, title, children, footer, style, ...rest }) {
  const base = {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 30,
    transition: '.2s',
    ...(variant === 'featured' ? { borderTop: '4px solid var(--cyan)' } : {}),
    ...(variant === 'person' || variant === 'contact' ? { textAlign: variant === 'person' ? 'center' : 'left' } : {}),
    ...style,
  };

  return React.createElement(
    'div',
    { style: base, ...rest },
    variant === 'featured' && icon &&
      React.createElement('div', {
        style: { width: 52, height: 52, borderRadius: 12, background: 'var(--cyan-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      }, icon),
    variant === 'person' && avatar &&
      React.createElement('div', {
        style: { width: 120, height: 120, borderRadius: '50%', margin: '0 auto 18px', background: 'linear-gradient(135deg,var(--navy),var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 38, color: '#fff' },
      }, avatar),
    variant === 'numbered' && eyebrow &&
      React.createElement('div', { style: { fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, color: 'var(--cyan)', letterSpacing: '.12em' } }, eyebrow),
    title && React.createElement('h3', { style: { fontSize: variant === 'person' ? 21 : 20, margin: '14px 0 9px', color: 'var(--navy-900)', fontFamily: 'var(--font-heading)' } }, title),
    React.createElement('div', { style: { color: 'var(--slate)', fontSize: 15 } }, children),
    footer && React.createElement('div', { style: { marginTop: 12 } }, footer)
  );
}
