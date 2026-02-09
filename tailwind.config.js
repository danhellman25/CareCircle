/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A90B8',
          light: '#E8F4F8',
          dark: '#3A7A9E',
        },
        secondary: {
          DEFAULT: '#7BB89F',
          light: '#E8F5EE',
          dark: '#5FA080',
        },
        accent: {
          DEFAULT: '#F5A623',
          light: '#FEF3E2',
        },
        background: '#FAFAF7',
        card: '#FFFFFF',
        text: {
          DEFAULT: '#2D3748',
          light: '#718096',
          muted: '#A0AEC0',
        },
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
