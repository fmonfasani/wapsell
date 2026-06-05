import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { BRAND } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-forest text-white">
      <div className="section py-14 md:py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <Link
            href="/"
            className="flex items-baseline gap-1.5 font-display font-semibold text-xl"
          >
            <span>{BRAND.name}</span>
            <span aria-hidden className="text-amber text-sm tracking-tighter">
              {BRAND.symbol}
            </span>
          </Link>

          <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/80">
            <Link href="/demo-tour" className="hover:text-white">
              {t("product")}
            </Link>
            <Link href="/demo-tour#precios" className="hover:text-white">
              {t("pricing")}
            </Link>
            <Link href="/demo-tour#faq" className="hover:text-white">
              {t("faq")}
            </Link>
            <a
              href={`mailto:${BRAND.contactEmail}`}
              className="hover:text-white"
            >
              {t("contact")}
            </a>
          </nav>

          <div className="flex flex-col md:items-end gap-2 text-xs text-white/60">
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-white">
                {t("privacyLink")}
              </Link>
              <Link href="/terms" className="hover:text-white">
                {t("termsLink")}
              </Link>
            </div>
            <p>{t("rights", { year, brand: BRAND.name })}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
