/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8B5CF6", // Violet-500
        secondary: "#EC4899", // Pink-500
        accent: "#3B82F6", // Blue-500
        text: {
          primary: "#1e293b", // Slate-800
          secondary: "#64748b", // Slate-500
        },
        // Custom palette extracted from the image
        "glass-purple": "#a78bfa",
        "glass-pink": "#f472b6",
        "glass-blue": "#60a5fa",
      },
      backgroundImage: {
        "glass-gradient":
          "linear-gradient(135deg, #e0c3fc 0%, #d4d1ff 50%, #ffd1ff 100%)",
      },
      fontFamily: {
        sans: ['"Outfit"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
