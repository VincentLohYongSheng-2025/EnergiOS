/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#006948",
          dark: "#004d34",
          light: "#10b981",
          accent: "#85f8c4",
        },
        slate: {
          850: "#131b2e",
          950: "#080c14",
        }
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      }
    },
  },
  plugins: [],
}
