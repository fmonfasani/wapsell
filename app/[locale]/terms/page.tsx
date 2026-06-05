import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { TermsEs } from "@/components/legal/TermsEs";
import { TermsEn } from "@/components/legal/TermsEn";
import { BRAND } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "es"
        ? `Términos del Servicio — ${BRAND.name}`
        : `Terms of Service — ${BRAND.name}`,
    description:
      locale === "es"
        ? `Reglas y condiciones de uso del servicio Wapsell.`
        : `Rules and conditions for using the Wapsell service.`,
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return locale === "es" ? <TermsEs /> : <TermsEn />;
}
