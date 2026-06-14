import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TourHero } from "@/components/TourHero";
import { HowItWorks } from "@/components/HowItWorks";
import { FullDemo } from "@/components/FullDemo";
import { Comparison } from "@/components/Comparison";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("tourTitle", { brand: BRAND.name }),
    description: t("tourDescription", { brand: BRAND.name }),
  };
}

export default async function DemoTourPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <main>
        <TourHero />
        <HowItWorks />
        <FullDemo />
        <Comparison />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
