/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        cream: "var(--cream)",
        card: "var(--card)",
        ink: "var(--ink)",
        ink2: "var(--ink2)",
        muted: "var(--muted)",
        border: "var(--border)",
        green: {
          DEFAULT: "var(--green)",
          light: "var(--green-light)",
          soft: "var(--green-soft)",
        },
        red: {
          DEFAULT: "var(--red)",
          light: "var(--red-light)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
        },
        blue: {
          DEFAULT: "var(--blue)",
          light: "var(--blue-light)",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "sans-serif"],
        serif: ['"Playfair Display"', "serif"],
        mono: ['"DM Mono"', "monospace"],
      },
      boxShadow: {
        DEFAULT: "var(--shadow)",
        lg: "var(--shadow-lg)",
      }
    },
  },
  plugins: [],
};
