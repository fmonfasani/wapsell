import { BRAND, WA_LINK } from "@/lib/constants";

// Closing punctuation of the landing. Same amber CTA as hero so visitors who
// scrolled past don't need to scroll back up to act.
export function FinalCTA() {
  return (
    <section className="bg-cream py-28 md:py-40">
      <div className="section text-center">
        <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight max-w-2xl mx-auto">
          ¿Cómo arranca tu equipo con {BRAND.name}?
        </h2>

        <div className="mt-10 flex flex-col items-center gap-4">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-base"
          >
            Hablá con {BRAND.name} ahora →
          </a>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Dot /> Sin tarjeta
            </span>
            <span className="flex items-center gap-1.5">
              <Dot /> Sin formulario
            </span>
            <span className="flex items-center gap-1.5">
              <Dot /> WhatsApp directo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      className="inline-block w-1.5 h-1.5 rounded-full bg-forest"
    />
  );
}
