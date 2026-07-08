import React from 'react';

/**
 * Footer — dark navy site footer with brand column, three link columns,
 * and a bottom copyright bar (".site-footer").
 */
export function Footer({ logoSrc, columns = [], bottomLeft, bottomRight, style }) {
  return React.createElement(
    'footer',
    { style: { background: 'var(--navy-900)', color: '#9FB4C7', paddingTop: 64, ...style } },
    React.createElement(
      'div', { style: { maxWidth: 1140, margin: '0 auto', padding: '0 28px' } },
      React.createElement(
        'div', { style: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.4fr', gap: 40, paddingBottom: 44 } },
        React.createElement(
          'div', null,
          React.createElement('a', { href: '/', style: { display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' } },
            logoSrc && React.createElement('img', { src: logoSrc, style: { height: 44 } }),
            React.createElement('span', { style: { fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 19, color: '#fff' } }, 'Relevate Solutions')
          ),
          React.createElement('p', { style: { fontSize: 14.5, maxWidth: 300, marginTop: 14 } }, 'Financial stability & growth for churches, small businesses, and families \u2014 with accuracy, stewardship, and heart.'),
          React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(33,174,228,.14)', border: '1px solid rgba(33,174,228,.4)', color: '#CFE9F8', borderRadius: 99, padding: '6px 16px', fontSize: 13, fontWeight: 600, marginTop: 16 } }, '\ud83c\udf10 We serve you in English y Espa\u00f1ol')
        ),
        columns.map((col, i) => React.createElement(
          'div', { key: i },
          React.createElement('h4', { style: { color: '#fff', fontSize: 15, marginBottom: 16, letterSpacing: '.06em', fontFamily: 'var(--font-heading)' } }, col.title),
          col.links.map((l, j) => React.createElement('a', { key: j, href: l.href, style: { color: '#9FB4C7', fontSize: 14.5, display: 'block', marginBottom: 9, textDecoration: 'none' } }, l.label))
        ))
      ),
      React.createElement(
        'div', { style: { borderTop: '1px solid rgba(255,255,255,.1)', padding: '20px 0', fontSize: 13, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' } },
        React.createElement('span', null, bottomLeft),
        React.createElement('span', null, bottomRight)
      )
    )
  );
}
