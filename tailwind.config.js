export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // FORGE palette
        forge: {
          bg: '#0b1418',
          panel: '#111e24',
          panel2: '#16252c',
          border: '#1e333b',
          teal: '#37b6c4',
          orange: '#e8a14b',
          gold: '#f2c46a',
          green: '#5fc48a',
          red: '#d9695f',
          dim: '#7c93a0'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
