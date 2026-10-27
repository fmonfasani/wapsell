"use client";

import Link from "next/link";
import { Button } from "./ui/Button";

interface LandingHeroProps {
  locale?: string;
}

export function LandingHero({ locale = "es" }: LandingHeroProps) {
  const isDemos = locale === "en" ? "Try Demo" : "Probar Demo";
  const isWhatsApp = locale === "en" ? "Chat on WhatsApp" : "Chat en WhatsApp";
  const isTitle = locale === "en"
    ? "Sales automation for WhatsApp"
    : "Automatización de ventas por WhatsApp";
  const isSubtitle = locale === "en"
    ? "Close deals faster. Manage conversations in one place. Never miss a lead."
    : "Cierra ventas más rápido. Gestiona conversaciones en un solo lugar. Nunca pierdas un cliente.";

  return (
    <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 via-transparent to-white -z-10" />

      <div className="section">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="mb-8 inline-block">
            <span className="eyebrow px-4 py-2 bg-brand-50 rounded-full">
              ✨ {locale === "en" ? "Trusted by sales teams" : "Confiado por equipos de ventas"}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tightest text-neutral-900 mb-6">
            {isTitle}
          </h1>

          {/* Subtitle */}
          <p className="subtitle text-neutral-600 max-w-2xl mx-auto mb-12">
            {isSubtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href={`/${locale}/demo`}>
              <Button variant="primary" size="lg">
                {isDemos}
              </Button>
            </Link>
            <a
              href={`https://wa.me/?text=${encodeURIComponent("Hola Wapsell!")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg">
                {isWhatsApp}
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚀</span>
              <span>{locale === "en" ? "Fast setup" : "Configuración rápida"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <span>{locale === "en" ? "Secure & private" : "Seguro y privado"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <span>{locale === "en" ? "WhatsApp native" : "Nativo de WhatsApp"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="mt-16 md:mt-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-100/20 to-transparent h-96 blur-3xl -z-10" />
        <div className="section">
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-800 rounded-2xl p-8 md:p-12 min-h-[300px] flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-sm uppercase tracking-wider mb-4 text-neutral-400">
                {locale === "en" ? "Dashboard Preview" : "Vista Previa del Dashboard"}
              </p>
              <p className="text-xl md:text-2xl font-semibold">
                {locale === "en" ? "Coming soon..." : "Próximamente..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
