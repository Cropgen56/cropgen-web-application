/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          700: "#5a7c6b",
          900: "#344e41",
        },
        white: "#f8f8f8",
      },
    },
  },
  plugins: [],
};

