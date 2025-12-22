/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#20392B', // Deep Green
        secondary: '#F5BE30', // Mustard Yellow
        surface: '#F8F9FA', // Very Light Gray
        card: '#FFFFFF',
        muted: '#8A8A8A',
        lightGreen: '#E8F1EE'
      },
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0,0,0,0.04)',
        'card': '0 4px 20px rgba(0,0,0,0.03)',
      }
    }
  },
  plugins: [],
};
