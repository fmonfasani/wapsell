import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Wapsell Brand: Modern SaaS with warm editorial palette
        // Primary: Terracotta (#D97757) — energy, trust, action
        // Secondary: Deep Ink (#1A1815) — content, text
        // Background: Cream (#FAF9F5) — spacious, premium feel

        // Brand colors - primary actions & identity
        brand: {
          DEFAULT: "#D97757", // primary terracotta
          50: "#FEF5F3",
          100: "#FCE8E2",
          200: "#F9D0C4",
          300: "#F5B8A7",
          400: "#F0A08A",
          500: "#E8886E",
          600: "#D97757", // main brand
          700: "#C75D40",
          800: "#B5452F",
          900: "#8E3623",
        },

        // Neutral palette - text, borders, backgrounds
        neutral: {
          50: "#FAF9F5",  // premium cream background
          100: "#F5F3ED",
          200: "#E8E5DC",
          300: "#D9D5C9",
          400: "#C0B9AC",
          500: "#A89A8A",
          600: "#8B8076",
          700: "#6B655D",
          800: "#3C3935",
          900: "#1A1815", // deep ink - primary text
        },

        // Semantic colors
        success: {
          DEFAULT: "#2D4A3E",
          light: "#C9EAD9",
        },
        warning: {
          DEFAULT: "#E4A33B",
          light: "#FBE6BC",
        },
        error: {
          DEFAULT: "#C04A2B",
          light: "#F4CDBE",
        },
        info: {
          DEFAULT: "#4B7BA0",
          light: "#D6E4F1",
        },
      },
      fontFamily: {
        // Premium typography stack
        display: [
          "Fraunces",
          "Literata",
          "Georgia",
          "ui-serif",
          "serif",
        ],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Typography scale (0.875rem base)
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "3.5rem" }],
        "6xl": ["3.75rem", { lineHeight: "4.5rem" }],
        "7xl": ["4.5rem", { lineHeight: "5.5rem" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tight: "-0.02em",
        normal: "0",
        wide: "0.02em",
        eyebrow: "0.08em",
        wider: "0.15em",
      },
      spacing: {
        // Consistent spacing scale (4px base unit)
        0: "0",
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
        6: "1.5rem",
        8: "2rem",
        10: "2.5rem",
        12: "3rem",
        16: "4rem",
        20: "5rem",
        24: "6rem",
        32: "8rem",
      },
      maxWidth: {
        container: "1280px",
        prose: "720px",
        chat: "480px",
        form: "600px",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        base: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        none: "none",
        xs: "0 1px 2px 0 rgba(26, 24, 21, 0.05)",
        sm: "0 1px 3px 0 rgba(26, 24, 21, 0.1), 0 1px 2px 0 rgba(26, 24, 21, 0.06)",
        base: "0 4px 6px -1px rgba(26, 24, 21, 0.1), 0 2px 4px -1px rgba(26, 24, 21, 0.06)",
        md: "0 10px 15px -3px rgba(26, 24, 21, 0.1), 0 4px 6px -2px rgba(26, 24, 21, 0.05)",
        lg: "0 20px 25px -5px rgba(26, 24, 21, 0.1), 0 10px 10px -5px rgba(26, 24, 21, 0.04)",
        xl: "0 25px 50px -12px rgba(26, 24, 21, 0.15)",
        "2xl": "0 25px 50px -12px rgba(26, 24, 21, 0.25)",
        soft: "0 10px 30px rgba(26, 24, 21, 0.08)",
        inset: "inset 0 2px 4px 0 rgba(26, 24, 21, 0.05)",
      },
      backgroundColor: {
        DEFAULT: "#FAF9F5",
      },
      textColor: {
        DEFAULT: "#1A1815",
      },
      borderColor: {
        DEFAULT: "#D9D5C9",
      },
    },
  },
  plugins: [],
};

export default config;
