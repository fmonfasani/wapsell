import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { BRAND, buildWaLink } from "@/lib/constants";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Nav() {
  const t = useTranslations();
  const greeting = t("wa.greeting", { brand: BRAND.name });
  const waLink = buildWaLink(greeting);

  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur border-b border-cream-300">
      <nav className="section flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-baseline gap-1.5 font-display font-semibold text-xl text-ink"
        >
          <span>{BRAND.name}</span>
          <span aria-hidden className="text-amber text-sm tracking-tighter">
            {BRAND.symbol}
          </span>
        </Link>

        <div className="flex items-center gap-5 md:gap-7">
          <Link
            href="/demo-tour"
            className="hidden sm:inline text-sm font-medium text-ink hover:text-amber transition-colors"
          >
            {t("nav.product")}
          </Link>
          <Link
            href="/demo-tour#precios"
            className="hidden sm:inline text-sm font-medium text-ink hover:text-amber transition-colors"
          >
            {t("nav.pricing")}
          </Link>
          <LanguageSwitcher />
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !h-10 !px-5 text-sm"
          >
            {t("nav.cta", { brand: BRAND.name })}
          </a>
        </div>
      </nav>
    </header>
  );
}
