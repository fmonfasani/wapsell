"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "./Button";
import { colors, typography } from "@/lib/design-tokens";

export function LandingHero() {
  const t = useTranslations("hero");

  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden"
      style={{ backgroundColor: colors.neutral.light }}
    >
      {/* Gradient Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-20 pointer-events-none">
        <div
          className="w-full h-full rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${colors.primary.orange} 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="absolute bottom-0 left-0 w-72 h-72 opacity-15 pointer-events-none">
        <div
          className="w-full h-full rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${colors.secondary.blue} 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Headline */}
        <div className="space-y-4">
          <h1
            className="font-bold leading-tight"
            style={{
              fontSize: "3.5rem",
              lineHeight: "1.1",
              color: colors.neutral.text_primary,
            }}
          >
            {t("title")}
          </h1>

          <p
            className="text-xl max-w-2xl mx-auto"
            style={{
              color: colors.neutral.text_secondary,
              fontSize: "1.25rem",
              lineHeight: "1.75rem",
            }}
          >
            {t("subtitle")}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/auth/register">
            <Button size="lg" variant="primary">
              {t("cta_primary")}
            </Button>
          </Link>

          <Link href="/demo">
            <Button size="lg" variant="outline">
              {t("cta_secondary")}
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="pt-8 space-y-4">
          <p
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: colors.neutral.text_tertiary }}
          >
            {t("trust_label")}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <span style={{ color: colors.neutral.text_secondary }}>
              ✓ {t("trust_1")}
            </span>
            <span style={{ color: colors.neutral.text_secondary }}>
              ✓ {t("trust_2")}
            </span>
            <span style={{ color: colors.neutral.text_secondary }}>
              ✓ {t("trust_3")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
