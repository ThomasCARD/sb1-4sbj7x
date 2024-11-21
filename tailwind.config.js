/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#45b7d1',
          50: '#f0f9fb',
          100: '#e0f3f7',
          200: '#b8e4ee',
          300: '#8fd5e5',
          400: '#45b7d1',
          500: '#2c9eb8',
          600: '#237f9a',
          700: '#1b607c',
          800: '#12415e',
          900: '#0a2240',
        },
        accent: {
          DEFAULT: '#FF6600',
          50: '#FFF0E6',
          100: '#FFE1CC',
          200: '#FFC399',
          300: '#FFA566',
          400: '#FF8733',
          500: '#FF6600',
          600: '#CC5200',
          700: '#993D00',
          800: '#662900',
          900: '#331400',
        },
      },
      fontFamily: {
        sans: ['Work Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};