/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F1E8',
        gold: '#C6A15B',
        champagne: '#E9D9B5',
        blush: '#E8C4C2',
        lavender: '#C5B9D9',
        plum: '#463344',
        ink: '#382F35',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
