export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // RUNNER palette — clean light UI with a single bold accent.
        // The accent is CSS-variable driven (see src/lib/theme.ts) so users can
        // recolor the whole app; channels keep Tailwind's /opacity modifiers.
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          dark: 'rgb(var(--brand-dark) / <alpha-value>)',
          soft: 'rgb(var(--brand-soft) / <alpha-value>)'
        },
        ink: '#16181D',
        dim: '#6B7280',
        faint: '#9CA3AF',
        line: '#E7E5E0',
        paper: '#F7F6F3',
        card: '#FFFFFF',
        good: '#16A34A',
        bad: '#DC2626'
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(22, 24, 29, 0.04), 0 2px 8px rgba(22, 24, 29, 0.04)',
        sheet: '0 -8px 30px rgba(22, 24, 29, 0.16)'
      }
    }
  },
  plugins: []
}
