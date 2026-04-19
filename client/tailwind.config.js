/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        scout: {
          bg: '#0A0E1A',
          surface: '#111827',
          'surface-2': '#1C2333',
          border: '#1E2D40',
          accent: '#2563EB',
          'accent-2': '#0EA5E9',
          'text-1': '#F1F5F9',
          'text-2': '#94A3B8',
          'text-3': '#475569',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        heading: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
