import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { BRAND, buildWaLink } from "@/lib/constants";

export function Hero() {
  const t = useTranslations();
  const locale = useLocale();
  const greeting = t("wa.greeting", { brand: BRAND.name });
  const waLink = buildWaLink(greeting);
  const demoCta = locale === "en" ? "Try the live demo" : "Probar el demo en vivo";
  const waCta = locale === "en" ? "Or chat with us on WhatsApp" : "O hablá con nosotros por WhatsApp";

  return (
    <section className="section flex flex-col items-center text-center py-24 md:py-36">
      <p className="eyebrow mb-6">{t("hero.eyebrow")}</p>

      <h1 className="font-display font-semibold text-5xl md:text-7xl leading-[1.05] max-w-3xl">
        {t("hero.title")}
      </h1>

      <p className="mt-7 max-w-xl text-lg md:text-xl text-ink-muted leading-relaxed">
        {t("hero.sub")}
      </p>

      <div className="mt-10 flex flex-col items-center gap-3">
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
        <p className="text-sm text-ink-muted">{t("hero.trust")}</p>
      </div>
    </section>
  );
}
