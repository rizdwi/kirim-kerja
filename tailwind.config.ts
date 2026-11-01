import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0F7FB",
          100: "#DCEEF7",
          200: "#BFE0F1",
          300: "#7FB3D5",
          400: "#4E94C4",
          500: "#2673A6",
          600: "#1F5F8B",
          700: "#184B6E",
          800: "#123F5D",
          900: "#0D2F46",
        },
        surface: {
          0: "#FFFFFF",
          1: "#F6F7F9",
          2: "#EBEDF0",
        },
        text: {
          900: "#1B1F24",
          600: "#5B6470",
          400: "#8C95A0",
        },
        success: {
          50: "#F0F8F3",
          200: "#CDE8D6",
          300: "#8FC7A3",
          400: "#5BAE7C",
          600: "#2E7D4F",
          700: "#23633E",
          800: "#1D4F31",
          900: "#143A24",
        },
        warning: {
          50: "#FFF9E6",
          200: "#F5E3B3",
          300: "#EACD7E",
          400: "#DDB84F",
          600: "#A56A00",
          700: "#805300",
          800: "#6B4500",
          900: "#4F3300",
        },
        danger: {
          50: "#FDF2F1",
          200: "#F3C5C1",
          300: "#E89A94",
          400: "#D96A62",
          600: "#B3261E",
          700: "#8C1D17",
          800: "#6E1510",
          900: "#520F0C",
        },
        ai: {
          50: "#F4F8FC",
          100: "#EAF2FA",
          200: "#D5E5F5",
          300: "#9CC3E2",
          400: "#6FA3CF",
          600: "#1E5A86",
          700: "#174A6E",
          800: "#143D5C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Source Serif 4", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(16 24 40 / 0.05)",
        "card-hover": "0 4px 12px rgb(16 24 40 / 0.08)",
        pop: "0 12px 32px rgb(16 24 40 / 0.18)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
        "slide-up": "slide-up 0.22s ease-out",
        "scale-in": "scale-in 0.16s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
