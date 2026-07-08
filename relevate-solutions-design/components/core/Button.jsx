import React from 'react';

/**
 * Button — primary CTA styles from Relevate's theme .btn classes.
 * variant: primary (cyan) | dark (navy-900) | outline (navy border) | light (white)
 * size: default | sm
 */
export function Button({ variant = 'primary', size = 'default', href, onClick, children, style, ...rest }) {
  const base = {
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
    fontSize: size === 'sm' ? 14 : 15,
    borderRadius: 10,
    padding: size === 'sm' ? '9px 18px' : '13px 26px',
    display: 'inline-block',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    textDecoration: 'none',
    border: 'none',
    transition: '.18s',
    ...style,
  };
  const variants = {
    primary: { background: 'var(--cyan)', color: 'var(--navy-900)' },
    dark: { background: 'var(--navy-900)', color: '#fff' },
    outline: { background: 'transparent', color: 'var(--navy)', border: '2px solid var(--navy)' },
    light: { background: '#fff', color: 'var(--navy-900)' },
  };
  const combined = { ...base, ...variants[variant] };
  const Tag = href ? 'a' : 'button';
  return React.createElement(Tag, { href, onClick, style: combined, ...rest }, children);
}
