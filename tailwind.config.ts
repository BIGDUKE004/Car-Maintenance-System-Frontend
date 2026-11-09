import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stone: { 100: '#f5f5f4', 200: '#e7e5e4', 300: '#e7e5e4', 400: '#d6d3d1', 500: '#b5b0aa', 600: '#8f8983', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' },
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
