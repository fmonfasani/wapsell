import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/ProblemSection";
import { DemoTeaser } from "@/components/DemoTeaser";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <main>
        <Hero />
        <ProblemSection />
        <DemoTeaser />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
