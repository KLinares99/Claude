export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // RUNNER palette — Apple iOS light-mode system colors + one accent.
        // The accent is CSS-variable driven (see src/lib/theme.ts) so users can
        // recolor the whole app; channels keep Tailwind's /opacity modifiers.
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          dark: 'rgb(var(--brand-dark) / <alpha-value>)',
          soft: 'rgb(var(--brand-soft) / <alpha-value>)'
        },
        ink: '#000000',    // label
        dim: '#6C6C70',    // secondaryLabel
        faint: '#AEAEB2',  // tertiaryLabel
        line: '#E5E5EA',   // separator
        paper: '#F2F2F7',  // systemGroupedBackground
        card: '#FFFFFF',   // secondarySystemGroupedBackground
        fill: '#EEEEF0',   // tertiarySystemFill (buttons, inputs, tracks)
        good: '#248A3D',
        bad: '#FF3B30'
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: 'none',
        sheet: '0 -8px 30px rgba(22, 24, 29, 0.16)'
      }
    }
  },
  plugins: []
}
