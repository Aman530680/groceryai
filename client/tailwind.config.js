/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        gray: {
          950: '#0a0a0f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-green': '0 0 30px rgba(34,197,94,0.3)',
        'glow-sm': '0 0 15px rgba(34,197,94,0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in':       'fadeIn 0.3s ease-out',
        'fade-in-up':    'fadeInUp 0.5s ease-out',
        'fade-in-down':  'fadeInDown 0.4s ease-out',
        'slide-up':      'slideUp 0.3s ease-out',
        'scale-in':      'scaleIn 0.3s ease-out',
        'bounce-in':     'bounceIn 0.6s cubic-bezier(0.36,0.07,0.19,0.97)',
        'float':         'float 3s ease-in-out infinite',
        'spin-slow':     'spin 8s linear infinite',
        'ping-slow':     'pingSlow 2s cubic-bezier(0,0,0.2,1) infinite',
        'gradient':      'gradientShift 8s ease infinite',
        'wiggle':        'wiggle 0.5s ease-in-out',
        'shimmer':       'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:        { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeInUp:      { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeInDown:    { from: { opacity: 0, transform: 'translateY(-24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp:       { from: { transform: 'translateY(10px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        scaleIn:       { from: { opacity: 0, transform: 'scale(0.9)' }, to: { opacity: 1, transform: 'scale(1)' } },
        bounceIn:      { '0%': { transform: 'scale(0.3)', opacity: 0 }, '50%': { transform: 'scale(1.05)' }, '70%': { transform: 'scale(0.9)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
        float:         { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        pingSlow:      { '0%': { transform: 'scale(1)', opacity: 1 }, '75%,100%': { transform: 'scale(1.8)', opacity: 0 } },
        gradientShift: { '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
        wiggle:        { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        shimmer:       { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
      },
    },
  },
  plugins: [],
};
