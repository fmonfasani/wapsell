import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Editorial cream + amber + deep green palette (Stitch design system).
        // We avoid pure black/white — everything sits in warm tones.
        cream: {
          DEFAULT: "#FAF7F2", // background — warm cream
          50: "#FFFBF7",
          100: "#FAF7F2",
          200: "#F5F0E6", // problem section bg (cream darker)
          300: "#E8E3D9", // borders / dividers
        },
        ink: {
          DEFAULT: "#1A1815", // text primary — deep espresso
          muted: "#6B655D", // text secondary — warm taupe
        },
        amber: {
          DEFAULT: "#E4A33B", // primary CTA — the lever metaphor
          hover: "#D89224",
          soft: "#FBE6BC",
        },
        forest: {
          DEFAULT: "#2D4A3E", // contract-signed green — trust elements + footer
          hover: "#243C32",
          soft: "#C9EAD9",
        },
        terracotta: "#C04A2B", // error / accent rare
      },
      fontFamily: {
        // Fraunces if available locally, fallback to Literata (what Stitch
        // chose), then system serif. Inter for everything UI.
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
      letterSpacing: {
        tightest: "-0.04em",
        eyebrow: "0.15em",
      },
      maxWidth: {
        container: "1200px",
        prose: "720px",
        chat: "480px",
      },
      borderRadius: {
        pill: "9999px",
      },
      boxShadow: {
        // Stitch DESIGN.md spec: low-diffusion warm shadow only for floating.
        soft: "0 10px 30px rgba(26, 24, 21, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
