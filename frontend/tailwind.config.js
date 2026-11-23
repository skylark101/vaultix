/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        vault: {
          bg: '#0a0a0f',
          surface: '#111118',
          inset: '#16161f',
          border: '#1e1e2e',
          muted: '#2a2a3e',
          accent: '#6366f1',
          'accent-dim': '#4f46e5',
          text: '#e2e2f0',
          subtle: '#6b6b8a',
          secondary: '#8b8ba8',
          link: '#818cf8',
          success: '#34d399',
          danger: '#f87171',
          warning: '#fbbf24',
          cat: {
            1: '#6366f1',
            2: '#5b8a9a',
            3: '#6b9080',
            4: '#8b7aa8',
            5: '#7a8fb8',
            6: '#a4ac86',
            7: '#c9b46a',
            8: '#6b6b8a',
          },
        },
      },
      fontSize: {
        display: ['2rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-sm': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
}