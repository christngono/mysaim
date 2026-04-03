/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saim: {
          50:  '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float-in':    'floatIn 0.7s ease both',
        'fade-up':     'fadeUp 0.5s ease both',
        'pop-in':      'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'bounce-slow': 'bounce 2s infinite',
        'marquee':     'marquee 30s linear infinite',
      },
      keyframes: {
        floatIn: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        popIn:   { from: { opacity: '0', transform: 'scale(0.7)' },      to: { opacity: '1', transform: 'scale(1)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      }
    },
  },
  plugins: [],
}