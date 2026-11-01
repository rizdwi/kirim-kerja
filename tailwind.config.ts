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
          500: "#2673A6",
          600: "#1F5F8B",
          700: "#184B6E",
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
          600: "#2E7D4F",
          700: "#23633E",
        },
        warning: {
          50: "#FFF9E6",
          600: "#A56A00",
          700: "#805300",
        },
        danger: {
          50: "#FDF2F1",
          600: "#B3261E",
          700: "#8C1D17",
        },
        ai: {
          50: "#F4F8FC",
          100: "#EAF2FA",
          200: "#D5E5F5",
          800: "#143D5C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Source Serif 4", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
