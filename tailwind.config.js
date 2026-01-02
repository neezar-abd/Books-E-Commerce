/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Original colors
        primary: '#20392B',
        secondary: '#F5BE30',
        surface: '#F8F9FA',
        card: '#FFFFFF',
        muted: '#8A8A8A',
        lightGreen: '#E8F1EE',
        // Horizon UI colors
        'brand': {
          50: '#E9E3FF',
          100: '#C0B8FE',
          200: '#A195FD',
          300: '#8171FC',
          400: '#7551FF',
          500: '#422AFB',
          600: '#3311DB',
          700: '#2111A5',
          800: '#190793',
          900: '#11047A',
        },
        'navy': {
          50: '#d0dcfb',
          100: '#aac0fe',
          200: '#a3b9f8',
          300: '#728fea',
          400: '#3652ba',
          500: '#1b3bbb',
          600: '#24388a',
          700: '#1B254B',
          800: '#111c44',
          900: '#0b1437',
        },
        'lightPrimary': '#F4F7FE',
        'background': {
          100: '#F4F7FE',
          900: '#0b1437',
        },
        'shadow': {
          500: 'rgba(112, 144, 176, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0,0,0,0.04)',
        'card': '0 4px 20px rgba(0,0,0,0.03)',
        '3xl': '14px 17px 40px 4px',
        'shadow-500': 'rgba(112, 144, 176, 0.08)',
      },
      screens: {
        '3xl': '1920px',
      }
    }
  },
  plugins: [],
};
