const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        md: "2rem"
      }
    },
    extend: {
      colors: {
        cream: "#F5F1E8",
        ink: "#111111",
        umber: "#7A5C3E",
        moss: "#5F6F52"
      },
      fontFamily: {
        serif: ["var(--font-playfair)", ...defaultTheme.fontFamily.serif],
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans]
      },
      maxWidth: {
        content: "70rem",
        measure: "42rem"
      },
      screens: {
        xs: "480px"
      },
      borderRadius: {
        card: "1.5rem"
      },
      boxShadow: {
        card: "0 20px 45px rgba(0, 0, 0, 0.06)"
      },
      transitionDuration: {
        250: "250ms"
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 0.61, 0.36, 1)"
      }
    }
  },
  plugins: []
};

