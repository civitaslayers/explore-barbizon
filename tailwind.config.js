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
        moss: "#5F6F52",
        forest: "#4A5E3A",
        "secondary-container": "#fed6b0",
        "on-secondary-container": "#795b3d",
        surface: "#faf9f9",
        "surface-container-low": "#f5f3f3",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#e3e2e2",
        "on-surface-variant": "#444840",
        "outline-variant": "#c5c8bd",
        "primary-container": "#5f6f52",
        "on-primary": "#ffffff"
      },
      fontFamily: {
        serif: ["Newsreader", ...defaultTheme.fontFamily.serif],
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
        card: "0 20px 45px rgba(0, 0, 0, 0.06)",
        ambient: "0 4px 40px rgba(121, 91, 61, 0.04)"
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

