/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A5276',
          light: '#2980B9',
          dark: '#0E2F44',
          50: '#D6EAF8',
          100: '#D6EAF8',
          300: '#5DADE2',
          500: '#2980B9',
          700: '#1A5276',
          900: '#0E2F44',
        },
        secondary: {
          DEFAULT: '#1E8449',
          light: '#27AE60',
          50: '#D5F5E3',
          300: '#7DCEA0',
          500: '#27AE60',
          700: '#1E8449',
          900: '#145A32',
        },
        accent: {
          DEFAULT: '#E67E22',
          light: '#F39C12',
          50: '#FDEBD0',
          300: '#F8C471',
          500: '#F39C12',
          700: '#E67E22',
          900: '#784212',
        },
        warm: '#C0392B',
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F4F6F8',
        },
        background: '#FAFBFC',
        border: '#E5E8EB',
        text: {
          primary: '#1C2833',
          secondary: '#5D6D7E',
          light: '#ABB2B9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'modal': '16px',
      },
    },
  },
  plugins: [],
};
