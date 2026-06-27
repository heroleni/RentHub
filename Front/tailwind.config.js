/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink:    { DEFAULT: "#0B1F1A", soft: "#13302A", line: "#1E433B" },
        moss:   { DEFAULT: "#2FB67C", deep: "#1E8A5C", glow: "#5BE3A6" },
        coral:  "#FF6B5B",
        amber:  "#F2C14E",
        lila:   "#C9A8FF",
        paper:  { DEFAULT: "#F7FAF8", dim: "#E7EFEA", mute: "#9DB3AB" },
      },
      fontFamily: {
        display: ['"Clash Display"', '"Space Grotesk"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        lift: "0 18px 50px -20px rgba(11,31,26,0.45)",
        card: "0 2px 18px -8px rgba(11,31,26,0.25)",
      },
      borderRadius: { xl2: "1.4rem" },
    },
  },
  plugins: [],
};
