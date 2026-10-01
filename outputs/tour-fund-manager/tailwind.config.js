/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: { extend: { colors: { ink: '#14241f', forest: '#174c3b', mint: '#d9f3df', paper: '#f4f7f1' }, boxShadow: { card: '0 16px 40px -26px rgba(20,36,31,.28)' } } },
  plugins: []
};
