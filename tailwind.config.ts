import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // FOODPULSE palette (design Nov 2026): Verde Bosco #1B5E20 = brand-600,
        // Verde Fresh #7CB342 = brand-400, Verde Chiaro #EAF6E5 = brand-50
        brand: {
          50: "#EAF6E5",
          100: "#D9EDCF",
          200: "#BCDDA9",
          300: "#9CCC65",
          400: "#7CB342",
          500: "#2E7D32",
          600: "#1B5E20",
          700: "#164D1A",
          800: "#123F15",
          900: "#0D2E10",
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
        // Crema background and Arancione accent
        cream: "#FFF8EE",
        accent: { light: "#FFE9D8", DEFAULT: "#FF8A3D", dark: "#E8722A" },
        // sponsored products
        plum: { 50: "#F5F0FC", 100: "#EAE0F8", 500: "#8E5BD6", 600: "#7442BF" },
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,94,32,0.04), 0 4px 16px rgba(27,94,32,0.06)",
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
