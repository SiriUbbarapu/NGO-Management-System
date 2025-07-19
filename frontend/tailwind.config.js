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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        kalam: {
          orange: '#ff6b35',
          blue: '#004e89',
          green: '#00a86b',
          gray: '#f8f9fa',
        }
      },
      boxShadow: {
        'neumorphic': '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
        'neumorphic-inset': 'inset 8px 8px 16px #d1d9e6, inset -8px -8px 16px #ffffff',
        'neumorphic-sm': '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff',
        'neumorphic-lg': '12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff',
      },
      borderRadius: {
        'neumorphic': '20px',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
