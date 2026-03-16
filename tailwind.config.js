/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bafb',
          400: '#8194f8',
          500: '#6271f2',
          600: '#4c4ce4',
          700: '#3d3bc8',
          800: '#3234a2',
          900: '#1a2151',
          950: '#0f1630',
        },
      },
    },
  },
  plugins: [],
}

