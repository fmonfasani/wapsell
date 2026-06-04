// Three numbered steps. Numbers in amber circle, headline + body below.
// Stacks on mobile, 3-column on desktop. No icons (would dilute the editorial feel).

const STEPS = [
  {
    n: "01",
    title: "Conectá tu WhatsApp Business",
    body:
      "En 5 minutos vía Meta Embedded Signup. Sin código, sin integraciones complejas.",
  },
  {
    n: "02",
    title: "Cargá tu catálogo y tu marca",
    body:
      "Subí tu inventario de propiedades y el tono de tu equipo. Wapsell aprende cómo hablan.",
  },
  {
    n: "03",
    title: "Wapsell responde 24/7 y te pasa los hot leads",
    body:
      "Los leads fríos los califica solo. Los calientes te los agenda en la agenda de tu vendedor.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="section">
        <div className="text-center mb-16">
          <p className="eyebrow mb-4">Cómo funciona</p>
          <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight max-w-2xl mx-auto">
            Tres pasos para que Wapsell sume a tu equipo.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-8 max-w-4xl mx-auto">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center md:text-left">
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-soft text-amber font-display font-semibold text-base mb-5"
              >
                {s.n}
              </span>
              <h3 className="font-display font-semibold text-xl mb-2 text-ink">
                {s.title}
              </h3>
              <p className="text-ink-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
