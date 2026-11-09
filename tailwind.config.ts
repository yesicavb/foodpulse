import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Greens from the "Bag" logo
        brand: {
          50: "#EEF7F0",
          100: "#D7EEDD",
          200: "#AFDCBB",
          300: "#7EC493",
          400: "#4FA96B",
          500: "#2F8F52",
          600: "#1F7A43",
          700: "#186338",
          800: "#134E2D",
          900: "#0E3A22",
        },
        // Natural neutrals with a hint of green
        ink: {
          50: "#F6F6F1",
          100: "#EDEEE8",
          200: "#DCDFD7",
          300: "#BCC2B8",
          400: "#8D958A",
          500: "#646D63",
          600: "#4B5449",
          700: "#363D35",
          800: "#232822",
          900: "#151914",
        },
        leaf: "#C8E86B",
        sand: "#F3EFE4",
      },
      fontFamily: {
        sans: ["Figtree", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Archivo", "Figtree", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(21,25,20,0.04), 0 2px 10px rgba(21,25,20,0.05)",
        float: "0 -6px 26px rgba(21,25,20,0.10)",
      },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pop: { "0%": { transform: "scale(1)" }, "40%": { transform: "scale(1.06)" }, "100%": { transform: "scale(1)" } },
        sheet: { "0%": { transform: "translateY(24px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
      },
      animation: {
        rise: "rise 320ms ease-out both",
        pop: "pop 280ms ease-out",
        sheet: "sheet 260ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
