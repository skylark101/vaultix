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
          border: '#1e1e2e',
          muted: '#2a2a3e',
          accent: '#6366f1',
          'accent-dim': '#4f46e5',
          text: '#e2e2f0',
          subtle: '#6b6b8a',
        }
      }
    },
  },
  plugins: [],
}