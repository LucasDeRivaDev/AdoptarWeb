/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm cream background — main app surface
        cream: {
          DEFAULT: '#FFF8F0',
          50: '#FFFCF9',
          100: '#FFF8F0',
          200: '#FFEEDD',
        },
        // Terracotta / coral — primary brand color
        coral: {
          50: '#FFF0EC',
          100: '#FFD9CE',
          200: '#FFB09D',
          300: '#FF8770',
          400: '#F4694F',
          500: '#E05A3A',
          600: '#C44A2C',
          700: '#A33A20',
        },
        // Sage green — secondary, used for positive actions / health indicators
        sage: {
          50: '#F1F7F4',
          100: '#D9EDE4',
          200: '#B3DAC9',
          300: '#7EC0A8',
          400: '#55A68A',
          500: '#3D8F73',
          600: '#2E7259',
        },
        // Soft amber — accent, countdown, highlights
        amber: {
          soft: '#F2CC8F',
          warm: '#E8B86D',
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
        card: '0 2px 20px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.12)',
        soft: '0 1px 8px rgba(0,0,0,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
