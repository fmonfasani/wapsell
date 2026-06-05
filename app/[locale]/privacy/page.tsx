import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PrivacyEs } from "@/components/legal/PrivacyEs";
import { PrivacyEn } from "@/components/legal/PrivacyEn";
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
        ? `Política de Privacidad — ${BRAND.name}`
        : `Privacy Policy — ${BRAND.name}`,
    description:
      locale === "es"
        ? `Cómo Wapsell recolecta, usa y protege tu información personal.`
        : `How Wapsell collects, uses, and protects your personal information.`,
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return locale === "es" ? <PrivacyEs /> : <PrivacyEn />;
}
