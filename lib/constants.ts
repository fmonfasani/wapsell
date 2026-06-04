// Shared constants — brand identity + CTA destinations. Keeping these in
// one place means a phone-number swap (Twilio number when it arrives, see
// the 6-week plan) is a one-line change.

export const BRAND = {
  name: "Wapsell",
  // Pivot-point symbol. Renders inline next to the wordmark.
  symbol: "─●",
  tagline: "Cerrá ventas mientras dormís.",
  domain: "wapsell.com",
} as const;

// E.164 without "+". Today this points to the founder's personal number;
// swap to the Twilio dedicated line once Fase 1 of the launch plan ships.
export const WA_NUMBER = "5493585614524";

export const WA_GREETING =
  "Hola, vi la web de Wapsell y quería saber cómo funciona el bot para mi inmobiliaria.";

export const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  WA_GREETING,
)}`;

// External demo (the deployed Pipaas bot — kept in the doc/internal links,
// not surfaced on the public landing per the spec).
export const DEMO_DEPLOY_URL = "https://pipaas.com";
