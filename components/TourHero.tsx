import { useTranslations } from "next-intl";
import { BRAND, buildWaLink } from "@/lib/constants";

// Compact hero for /demo-tour — already-convinced visitors land here, so the
// CTA sits right under the headline, no long sub-copy.
export function TourHero() {
  const t = useTranslations();
  const greeting = t("wa.greeting", { brand: BRAND.name });
  const waLink = buildWaLink(greeting);

  return (
    <section className="section text-center py-20 md:py-28">
      <p className="eyebrow mb-5">{t("tourHero.eyebrow")}</p>

      <h1 className="font-display font-semibold text-4xl md:text-6xl leading-[1.1] max-w-3xl mx-auto">
        {t("tourHero.title", { brand: BRAND.name })}
      </h1>

      <p className="mt-6 max-w-xl mx-auto text-lg text-ink-muted">
        {t("tourHero.sub")}
      </p>

      <div className="mt-8">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-base"
        >
          {t("tourHero.cta", { brand: BRAND.name })}
        </a>
      </div>
    </section>
  );
}
