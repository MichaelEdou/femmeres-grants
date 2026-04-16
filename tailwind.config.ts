import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        // Femmeres brand palette — deep rose/plum primary, warm gold accent
        brand: {
          50: "#fdf2f5",
          100: "#fbe7ec",
          200: "#f7cfda",
          300: "#f1a7ba",
          400: "#e87293",
          500: "#d94873",
          600: "#c42a5c",
          700: "#9d2449",
          800: "#841f40",
          900: "#6f1d3a",
          950: "#3e0a1d",
        },
        gold: {
          50: "#fdf8ee",
          100: "#faedd2",
          200: "#f4d9a0",
          300: "#ecbf6c",
          400: "#e5a544",
          500: "#d4a574",
          600: "#b8801e",
          700: "#986018",
          800: "#7c4a17",
          900: "#663e17",
        },
        ink: {
          50: "#f8f7f5",
          100: "#ebe9e4",
          200: "#d7d3ca",
          300: "#bab3a4",
          400: "#9a8f7c",
          500: "#7d7260",
          600: "#5c5344",
          700: "#433c30",
          800: "#2a2620",
          900: "#1a1713",
          950: "#0f0d0a",
        },
        cream: "#faf7f2",
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26, 23, 19, 0.04), 0 8px 24px -4px rgba(26, 23, 19, 0.06)",
        hover: "0 2px 4px rgba(26, 23, 19, 0.06), 0 16px 40px -8px rgba(157, 36, 73, 0.12)",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
} satisfies Config;
