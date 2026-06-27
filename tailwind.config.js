export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Two of Us — warm, playful candy palette
        tou: {
          cream: '#FFF4EC',   // app background
          paper: '#FFFFFF',   // cards / sheets
          sand: '#FBE7DA',    // soft borders / wells
          ink: '#3A2B4A',     // primary text (deep plum)
          dim: '#9A8AA0',     // secondary text
          rose: '#FF5D8F',    // primary brand
          coral: '#FF7A5C',
          sun: '#FFC93C',
          grape: '#7B5EA7',
          berry: '#C9184A',   // spicy
          mint: '#2EC4A6',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'SF Pro Rounded', 'system-ui', 'sans-serif'],
        sans: ['ui-rounded', 'SF Pro Rounded', '-apple-system', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pop: '0 10px 30px -8px rgba(255, 93, 143, 0.35)',
        card: '0 18px 40px -16px rgba(58, 43, 74, 0.45)',
        soft: '0 4px 14px -6px rgba(58, 43, 74, 0.25)',
      },
      keyframes: {
        'card-in': {
          '0%': { opacity: '0', transform: 'translateY(14px) rotate(-2deg) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotate(0) scale(1)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '60%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'card-in': 'card-in 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
        'pop-in': 'pop-in 0.35s ease-out',
        float: 'float 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
