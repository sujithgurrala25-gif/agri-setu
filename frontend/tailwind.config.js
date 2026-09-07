export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F4F1EA",
        paper: "#FFFFFF",
        ink: "#141414",
        mute: "#6B675F",
        line: "#E7E2D8",
        sage: "#2F6B4F",
        sky: "#3B6AE1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 30px rgba(20, 20, 20, 0.05)",
      },
      borderRadius: {
        card: "24px",
      },
    },
  },
  plugins: [],
};
