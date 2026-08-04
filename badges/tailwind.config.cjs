// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 100%, 55%)',
        secondary: 'hsl(280, 70%, 60%)',
        glass: 'rgba(255, 255, 255, 0.2)'
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px'
      }
    }
  },
  plugins: []
};
