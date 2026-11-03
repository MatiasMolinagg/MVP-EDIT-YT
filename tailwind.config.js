const mix = (v) => `color-mix(in srgb, var(${v}) calc(<alpha-value> * 100%), transparent)`
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--border)',
        ink: 'var(--text)',
        'ink-2': 'var(--text-2)',
        accent: { DEFAULT: mix('--accent'), hover: 'var(--accent-hover)', soft: 'var(--accent-soft)' },
      },
      boxShadow: { card: '0 1px 2px rgba(0,0,0,.05)' },
      screens: { xs: '400px' },
    },
  },
  plugins: [],
}
