import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#eecd2b",
        "warm-orange": "#f59e0b",
        "stitch-brown": "#78350f",
        "leather": "#b45309",
        "background-light": "#fdfaf3",
        "background-dark": "#221f10",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
} satisfies Config