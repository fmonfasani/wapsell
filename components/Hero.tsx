import { BRAND, WA_LINK } from "@/lib/constants";

// Full-viewport editorial hero. No image. Type carries the visual weight.
// H1 sizing follows Stitch DESIGN.md: 72px desktop / 36-44px mobile.
export function Hero() {
  return (
    <section className="section flex flex-col items-center text-center py-24 md:py-36">
      <p className="eyebrow mb-6">Para inmobiliarias premium</p>

      <h1 className="font-display font-semibold text-5xl md:text-7xl leading-[1.05] max-w-3xl">
        {BRAND.tagline}
      </h1>

      <p className="mt-7 max-w-xl text-lg md:text-xl text-ink-muted leading-relaxed">
        El equipo comercial que nunca duerme, califica leads y agenda visitas
        por vos.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3">
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-base"
        >
          Hablá con {BRAND.name} ahora →
        </a>
        <p className="text-sm text-ink-muted">
          Probá el bot en WhatsApp. Sin formulario.
        </p>
      </div>
    </section>
  );
}
