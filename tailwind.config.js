// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        /** Ember green — aligned with biodrops map / dashboard chrome */
        ember: {
          sidebar: "#0B5D3D",
          "sidebar-hover": "#094A35",
          surface: "#0B5D3D",
          "surface-muted": "#073628",
          primary: "#3DA660",
          "primary-hover": "#2D8B5E",
          accent: "#8CC63F",
          "light-lime": "#D4E8A8",
          card: "#F8FBFA",
          border: "#E0E8E4",
          text: "#1F1F1F",
          "text-secondary": "#555555",
          success: "#2FA377",
          warning: "#F5A623",
          error: "#DC3545",
          info: "#0099CC",
          disabled: "#CCCCCC",
          "chat-dark": "#1E2E26",
          "chat-bubble-mid": "#073628",
          "gradient-mid": "#052A1C",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      screens: {
        sm: "640px",
        md: "768px",
        tablet: { max: "1023px", min: "768px" },
        lg: "1024px",
        xl: "1280px",
      },
      keyframes: {
        satelliteMove: {
          "0%": { transform: "translateX(-20%)" },
          "50%": { transform: "translateX(10%)" },
          "100%": { transform: "translateX(-20%)" },
        },
        floatUp: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
          "100%": { transform: "translateY(0)" },
        },
        floatDown: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(20px)" },
          "100%": { transform: "translateY(0)" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "spin-reverse": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(-360deg)" },
        },
        flip: {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(180deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.8)", opacity: "0.5" },
          "60%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        pulsate: {
          "0%": { opacity: "1" },
          "50%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        satelliteMove: "satelliteMove 4s ease-in-out infinite",
        floatUp: "floatUp 4s ease-in-out infinite",
        floatDown: "floatDown 4s ease-in-out infinite",
        spin: "spin 20s linear infinite",
        "spin-reverse": "spin-reverse 20s linear infinite",
        flip: "flip 1.2s linear infinite",
        fadeIn: "fadeIn 1s ease-in-out",
        bounceIn: "bounceIn 1s ease-in-out",
        pulsate: "pulsate 1.5s infinite ease-in-out",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
