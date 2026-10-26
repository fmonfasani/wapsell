/**
 * Wapsell Design System Tokens
 * Centralized colors, spacing, typography, and other design constants
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    orange: "#D97757", // Main brand orange
    orange_dark: "#C85A42",
    orange_light: "#E89577",
  },

  // Secondary Colors
  secondary: {
    blue: "#6A9BCC", // Information, secondary actions
    blue_dark: "#5078A8",
    blue_light: "#8BADDB",
  },

  // Accent Colors
  accent: {
    green: "#A8DB85", // Success, positive states
    green_dark: "#8BC759",
    green_light: "#C0E69E",
  },

  // Neutral Colors
  neutral: {
    dark: "#141413", // Dark background, primary text
    light: "#FAF9F5", // Light background (cream)
    border: "#E8E3D9",
    text_primary: "#1A1815",
    text_secondary: "#6B655D",
    text_tertiary: "#9B9590",
  },

  // Semantic Colors
  semantic: {
    success: "#A8DB85",
    error: "#C04A2B",
    warning: "#E4A33B",
    info: "#6A9BCC",
  },
};

export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  xxl: "3rem", // 48px
  xxxl: "4rem", // 64px
};

export const typography = {
  // Font Families
  fontFamily: {
    display: [
      "Fraunces",
      "Literata",
      "Georgia",
      "ui-serif",
      "serif",
    ].join(", "),
    sans: [
      "Inter",
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "sans-serif",
    ].join(", "),
    mono: [
      '"JetBrains Mono"',
      "ui-monospace",
      "monospace",
    ].join(", "),
  },

  // Font Sizes
  fontSize: {
    xs: { size: "12px", lineHeight: "16px" },
    sm: { size: "14px", lineHeight: "20px" },
    base: { size: "16px", lineHeight: "24px" },
    lg: { size: "18px", lineHeight: "28px" },
    xl: { size: "20px", lineHeight: "28px" },
    "2xl": { size: "24px", lineHeight: "32px" },
    "3xl": { size: "30px", lineHeight: "36px" },
    "4xl": { size: "36px", lineHeight: "44px" },
    "5xl": { size: "48px", lineHeight: "52px" },
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Letter Spacing
  letterSpacing: {
    tightest: "-0.04em",
    tight: "-0.02em",
    normal: "0",
    wide: "0.02em",
    eyebrow: "0.15em",
  },
};

export const borderRadius = {
  none: "0",
  sm: "4px",
  base: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
};

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  soft: "0 10px 30px rgba(26, 24, 21, 0.04)",
};

export const breakpoints = {
  mobile: "320px",
  tablet: "768px",
  desktop: "1200px",
};

export const transitions = {
  fast: "150ms",
  base: "250ms",
  slow: "350ms",
};
