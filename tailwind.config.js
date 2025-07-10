module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      screens: {
      sm: "640px",
      md: "768px",     // default md
      tablet: { max: "1023px", min: "768px" }, // custom tablet
      lg: "1024px",
      xl: "1280px",
    },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],

};
