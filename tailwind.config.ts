import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stone: { 950: '#0c0a09', 900: '#1c1917', 800: '#292524', 700: '#44403c' },
        brand: { DEFAULT: '#ff4d00', hover: '#e64500', light: 'rgba(255, 77, 0, 0.1)' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(255, 77, 0, 0.4)',
      }
    },
  },
  plugins: [],
} satisfies Config
