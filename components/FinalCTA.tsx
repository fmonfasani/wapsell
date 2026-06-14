import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { BRAND, buildWaLink } from "@/lib/constants";

export function FinalCTA() {
  const t = useTranslations();
  const locale = useLocale();
  const greeting = t("wa.greeting", { brand: BRAND.name });
  const waLink = buildWaLink(greeting);
  const demoCta = locale === "en" ? "Try the live demo" : "Probar el demo en vivo";
  const waCta = locale === "en" ? "Or chat on WhatsApp" : "O hablá por WhatsApp";

  return (
    <section className="bg-cream py-28 md:py-40">
      <div className="section text-center">
        <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight max-w-2xl mx-auto">
          {t("finalCTA.title", { brand: BRAND.name })}
        </h2>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link href={`/${locale}/demo/chat`} className="btn-primary text-base">
            {demoCta}
          </Link>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-ink-muted underline underline-offset-4 hover:text-ink"
          >
            {waCta}
          </a>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Dot /> {t("finalCTA.trust1")}
            </span>
            <span className="flex items-center gap-1.5">
              <Dot /> {t("finalCTA.trust2")}
            </span>
            <span className="flex items-center gap-1.5">
              <Dot /> {t("finalCTA.trust3")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      className="inline-block w-1.5 h-1.5 rounded-full bg-forest"
    />
  );
}
