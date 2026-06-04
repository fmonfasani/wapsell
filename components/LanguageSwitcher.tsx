"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

// Two-pill toggle: ES | EN. Preserves the current path when switching, so
// /es/demo-tour → /en/demo-tour and vice versa.
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("lang");

  const switchTo = (next: "es" | "en") => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div
      className="inline-flex items-center rounded-pill border border-cream-300 text-xs font-semibold overflow-hidden"
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => switchTo("es")}
        aria-pressed={locale === "es"}
        className={`px-3 h-8 transition-colors ${
          locale === "es"
            ? "bg-ink text-cream"
            : "bg-transparent text-ink-muted hover:text-ink"
        }`}
      >
        {t("shortEs")}
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        className={`px-3 h-8 transition-colors ${
          locale === "en"
            ? "bg-ink text-cream"
            : "bg-transparent text-ink-muted hover:text-ink"
        }`}
      >
        {t("shortEn")}
      </button>
    </div>
  );
}
