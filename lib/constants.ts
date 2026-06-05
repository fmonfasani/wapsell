// Non-translatable brand identity + the WhatsApp endpoint. Everything visible
// to the visitor — taglines, CTAs, copy — lives in messages/{locale}.json.

export const BRAND = {
  name: "Wapsell",
  // Pivot-point symbol; rendered inline next to the wordmark.
  symbol: "─●",
  domain: "wapsell.com",
  // Commercial contact for the footer, legal pages and any inbound flows.
  // Routed via Namecheap Email Forwarding (free) into the founder's
  // personal inbox until a managed mailbox is set up.
  contactEmail: "contact@wapsell.com",
} as const;

// E.164 without "+". Swap to the dedicated Twilio number once registered.
// One change here propagates to every CTA via `buildWaLink(greeting)`.
export const WA_NUMBER = "5493585614524";

/** Build a wa.me link with a localized greeting message. */
export function buildWaLink(greeting: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(greeting)}`;
}

// External demo (the Pipaas bot). Kept available for internal links.
export const DEMO_DEPLOY_URL = "https://pipaas.com";
