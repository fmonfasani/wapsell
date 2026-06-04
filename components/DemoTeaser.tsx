import Link from "next/link";
import { ChatMockup } from "./ChatMockup";

// Product-shot of the landing: short chat conversation + link to /demo-tour
// where the full conversation lives. White background so it pops against the
// cream sections above and below.
export function DemoTeaser() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="section">
        <ChatMockup
          variant="forest"
          caption="Esto es un agente real, no un script. Contesta cualquier consulta sobre tu catálogo."
        />

        <div className="mt-10 text-center">
          <Link
            href="/demo-tour"
            className="text-amber font-medium underline underline-offset-4 hover:text-amber-hover"
          >
            Mirá el demo completo →
          </Link>
        </div>
      </div>
    </section>
  );
}
