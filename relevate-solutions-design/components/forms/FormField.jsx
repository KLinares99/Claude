import React from 'react';

/**
 * FormField — labeled input/select/textarea matching the theme's ".form-field"
 * inputs (cloud background, silver border, cyan focus ring).
 */
export function FormField({ label, as = 'input', type = 'text', options = [], placeholder, style }) {
  const fieldStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: 15.5,
    color: 'var(--ink)',
    background: 'var(--cloud)',
    border: '1.5px solid var(--border)',
    borderRadius: 10,
    padding: '13px 15px',
    width: '100%',
    boxSizing: 'border-box',
  };
  let field;
  if (as === 'select') {
    field = React.createElement('select', { style: fieldStyle }, options.map((o, i) => React.createElement('option', { key: i }, o)));
  } else if (as === 'textarea') {
    field = React.createElement('textarea', { style: { ...fieldStyle, minHeight: 110 }, placeholder });
  } else {
    field = React.createElement('input', { type, style: fieldStyle, placeholder });
  }
  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', marginBottom: 20, ...style } },
    label && React.createElement('label', { style: { fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13.5, color: 'var(--navy-900)', marginBottom: 7 } }, label),
    field
  );
}
