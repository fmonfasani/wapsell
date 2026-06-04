import { BRAND } from "@/lib/constants";

// Two-step punchline: pain → solution. Cream-darker bg breaks the visual rhythm
// between hero (cream) and demo (white) so the eye gets a beat. No images.
export function ProblemSection() {
  return (
    <section className="bg-cream-200 py-28 md:py-40">
      <div className="section text-center">
        <p className="eyebrow mb-6">El verdadero costo de escalar ventas</p>

        <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight max-w-3xl mx-auto">
          Contratar un SDR cuesta{" "}
          <span className="whitespace-nowrap">$1M+/año</span> y tarda 3 meses en
          producir.
        </h2>

        <h2 className="mt-10 font-display font-semibold text-3xl md:text-5xl leading-tight max-w-3xl mx-auto text-forest">
          {BRAND.name} arranca mañana y atiende sin pausa.
        </h2>
      </div>
    </section>
  );
}
