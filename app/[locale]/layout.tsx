import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BRAND } from "@/lib/constants";
import { Navbar } from "@/components/Navbar";
import { Analytics } from "@/components/Analytics";
import { CookieBanner } from "@/components/CookieBanner";
import "../globals.css";

// Static rendering for all locales — next-intl needs the locale set per-request
// even on static pages, so we call setRequestLocale inside the layout.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("homeTitle", { brand: BRAND.name }),
    description: t("homeDescription", { brand: BRAND.name }),
    metadataBase: new URL(`https://${BRAND.domain}`),
    openGraph: {
      title: t("homeTitle", { brand: BRAND.name }),
      description: t("homeDescription", { brand: BRAND.name }),
      type: "website",
      locale: locale === "es" ? "es_AR" : "en_US",
      siteName: BRAND.name,
    },
    alternates: {
      canonical: `https://${BRAND.domain}/${locale}`,
      languages: {
        es: `https://${BRAND.domain}/es`,
        en: `https://${BRAND.domain}/en`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate the locale — if someone hits /fr we 404 instead of crashing.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Required for static rendering with next-intl v4.
  setRequestLocale(locale);

  return (
    <html lang={locale === "es" ? "es-AR" : "en"}>
      <head>
        <Analytics />
      </head>
      <body>
        <NextIntlClientProvider>
          <Navbar />
          {children}
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
