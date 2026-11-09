/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gj: {
          lime: '#D4FF00', // Electric neon lime accent from screenshots
          'lime-hover': '#BEEC00',
          black: '#090909',
          dark: '#111111',
          card: '#161616',
          panel: '#1A1A1A',
          border: '#262626',
          borderLight: '#333333',
          muted: '#808080',
          subtle: '#A6A6A6',
          white: '#F4F4F4'
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Syne"', 'Impact', 'sans-serif'],
        condensed: ['"Anton"', '"Bebas Neue"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      animation: {
        'marquee': 'marquee 22s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}

