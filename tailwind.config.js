/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7f6',
          100: '#b3e8e4',
          200: '#80d9d3',
          300: '#4dcac1',
          400: '#26bfb4',
          500: '#00b2a6',
          600: '#009e94',
          700: '#008a82',
          800: '#00766f',
          900: '#00524d',
          DEFAULT: '#00b2a6',
        },
      },
    },
  },
  plugins: [],
}
