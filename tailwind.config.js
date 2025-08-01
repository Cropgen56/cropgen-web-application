// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
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
      animation: {
        satelliteGlide: "satelliteGlide 3s ease-in-out infinite",
        floatUpDown: "floatUpDown 3s ease-in-out infinite",
        floatDownUp: "floatDownUp 3s ease-in-out infinite",
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
      },
      animation: {
        satelliteMove: "satelliteMove 4s ease-in-out infinite",
        floatUp: "floatUp 4s ease-in-out infinite",
        floatDown: "floatDown 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
