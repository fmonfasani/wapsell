import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { HowItWorks } from "@/components/HowItWorks";
import { FullDemo } from "@/components/FullDemo";
import { Comparison } from "@/components/Comparison";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { BRAND, WA_LINK } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${BRAND.name} — Demo completo + precios + FAQ`,
  description:
    "Mirá cómo Wapsell califica leads inmobiliarios, agenda visitas y se integra a tu CRM. Precios, comparativa con SDRs humanos y preguntas frecuentes.",
};

// Hero specific to /demo-tour — shorter, with the CTA front-and-center
// because visitors landing here are already convinced and want the deep dive.
function TourHero() {
  return (
    <section className="section text-center py-20 md:py-28">
      <p className="eyebrow mb-5">Demo completo</p>
      <h1 className="font-display font-semibold text-4xl md:text-6xl leading-[1.1] max-w-3xl mx-auto">
        Así vende {BRAND.name} — paso a paso.
      </h1>
      <p className="mt-6 max-w-xl mx-auto text-lg text-ink-muted">
        Hablá con el bot mientras leés. Te muestra en vivo lo que la página
        explica abajo.
      </p>
      <div className="mt-8">
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-base"
        >
          Hablá con {BRAND.name} ahora →
        </a>
      </div>
    </section>
  );
}

export default function DemoTourPage() {
  return (
    <>
      <Nav />
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
