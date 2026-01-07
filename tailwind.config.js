/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1',
          light: '#818cf8'
        },
        dark: {
          bg: 'var(--bg-color)',
          card: 'var(--card-bg)',
          border: 'var(--border-color)'
        },
        primary: 'var(--text-color)',
        secondary: 'var(--text-secondary)',
        inverse: 'var(--text-inverse)',
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'chat-user-bg': 'var(--bg-chat-user)',
        'chat-bot-bg': 'var(--bg-chat-bot)',
        'chat-user-text': 'var(--text-chat-user)',
        'chat-bot-text': 'var(--text-chat-bot)',
        betfun: {
          bg: '#100146',     // Azul Principal (70%)
          dark: '#1C1256',   // Azul Institucional
          magenta: '#F5207A', // Set Magenta
          cyan: '#42A6D6',    // Set Cyan
          green: '#8BBE43',   // Set Verde
          violet: '#EC5EFE',  // Set Violeta
          white: '#FFFFFF'
        },
        // Semantic aliases for theming
        brand: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          primary: '#100146',   // Maps to betfun.bg
          secondary: '#1C1256', // Maps to betfun.dark
          accent: '#42A6D6',    // Maps to betfun.cyan
          success: '#8BBE43',   // Maps to betfun.green
          warning: '#F5207A',   // Maps to betfun.magenta
          info: '#EC5EFE',      // Maps to betfun.violet
          // Presentation Palette
          'pres-bg': '#0D0D0D',
          'pres-card': '#1A1A1A',
          'pres-teal': '#00F0B5',
          'pres-pink': '#FF0099',
          'pres-blue': '#38BDF8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Poppins', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [],
}
