import React from 'react';

/**
 * Badge — the theme's rounded ".tagpill" chip.
 * tone: cyan (default) | gold
 */
export function Badge({ tone = 'cyan', children, style, as = 'span', href, ...rest }) {
  const tones = {
    cyan: { background: 'var(--cyan-soft)', color: 'var(--navy)' },
    gold: { background: 'var(--gold-soft)', color: 'var(--gold-ink)' },
  };
  const base = {
    display: 'inline-block',
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '.04em',
    borderRadius: 99,
    padding: '5px 13px',
    textDecoration: 'none',
    ...tones[tone],
    ...style,
  };
  const Tag = href ? 'a' : as;
  return React.createElement(Tag, { href, style: base, ...rest }, children);
}
