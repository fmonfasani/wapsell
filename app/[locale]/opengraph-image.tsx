import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { BRAND } from "@/lib/constants";

// 1200x630 is the canonical OG/Twitter card size — what WhatsApp, LinkedIn,
// Slack and X all reach for when someone pastes the URL. Generated at build
// time per locale so /es and /en get their own card with the right tagline.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Wapsell";

export default async function OpengraphImage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "hero",
  });

  const tagline = t("title");
  const sub = t("sub");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAF7F2",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          fontFamily: "system-ui",
        }}
      >
        {/* Top row: brand wordmark + lever symbol. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "36px",
            fontWeight: 600,
            color: "#1A1815",
          }}
        >
          <span>{BRAND.name}</span>
          <span style={{ color: "#E4A33B", fontSize: "24px" }}>
            {BRAND.symbol}
          </span>
        </div>

        {/* Tagline — the visual hero of the card. */}
        <div
          style={{
            marginTop: "auto",
            fontSize: "92px",
            fontWeight: 700,
            color: "#1A1815",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            maxWidth: "950px",
          }}
        >
          {tagline}
        </div>

        {/* Sub — calmer, taupe. */}
        <div
          style={{
            marginTop: "28px",
            fontSize: "30px",
            color: "#6B655D",
            lineHeight: 1.4,
            maxWidth: "820px",
          }}
        >
          {sub}
        </div>

        {/* Footer: amber pill cue + domain. */}
        <div
          style={{
            marginTop: "48px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "22px",
            color: "#6B655D",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 24px",
              background: "#E4A33B",
              color: "#1A1815",
              borderRadius: "9999px",
              fontWeight: 600,
            }}
          >
            <span>Hablá con {BRAND.name} →</span>
          </div>
          <span>{BRAND.domain}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
