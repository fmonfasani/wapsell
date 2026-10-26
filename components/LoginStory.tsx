"use client";

import { useTranslations } from "next-intl";
import { colors } from "@/lib/design-tokens";

export function LoginStory() {
  const t = useTranslations("auth.login.story");

  return (
    <div
      className="hidden lg:flex flex-col justify-between p-12 rounded-lg"
      style={{
        backgroundColor: colors.neutral.dark,
        color: colors.neutral.light,
      }}
    >
      {/* Logo/Brand */}
      <div>
        <div
          className="text-4xl font-bold mb-8"
          style={{ color: colors.primary.orange }}
        >
          W
        </div>
      </div>

      {/* Quote/Story */}
      <div className="space-y-6">
        <blockquote>
          <p
            className="text-2xl font-semibold leading-relaxed"
            style={{ color: colors.neutral.light }}
          >
            "{t("quote")}"
          </p>
        </blockquote>

        <div>
          <p
            className="font-semibold"
            style={{ color: colors.primary.orange }}
          >
            {t("author_name")}
          </p>
          <p
            className="text-sm"
            style={{ color: colors.neutral.text_tertiary }}
          >
            {t("author_title")}
          </p>
        </div>

        {/* Trust Badges */}
        <div className="space-y-3 pt-6 border-t" style={{
          borderColor: "rgba(255,255,255,0.1)"
        }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <span className="text-sm">{t("badge_security")}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="text-sm">{t("badge_speed")}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📈</span>
            <span className="text-sm">{t("badge_growth")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
