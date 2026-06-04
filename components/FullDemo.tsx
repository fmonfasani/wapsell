import { ChatMockup } from "./ChatMockup";

// Long-form conversation showing pre-qualification + objection handling +
// appointment booking. 12 turns total. Stats row below.
const FULL_TURNS = [
  {
    role: "lead" as const,
    text: "Hola, vi su aviso en MercadoLibre por el departamento en Palermo.",
  },
  {
    role: "bot" as const,
    text:
      "¡Hola! Soy Wapsell, te ayudo con la consulta. ¿Estás buscando para mudarte vos o como inversión?",
  },
  { role: "lead" as const, text: "Inversión." },
  {
    role: "bot" as const,
    text:
      "Genial. Tenemos 4 unidades en Palermo activas hoy. ¿Tenés rango de precio en mente?",
  },
  { role: "lead" as const, text: "Hasta 350 mil dólares." },
  {
    role: "bot" as const,
    text:
      "Perfecto, todas entran. ¿Con balcón o no es determinante para vos?",
  },
  { role: "lead" as const, text: "Mejor con balcón." },
  {
    role: "bot" as const,
    text:
      "Listo. Te paso las 2 que mejor encajan:\n▸ Honduras 5400 — USD 320k\n▸ Soler 4100 — USD 285k",
  },
  { role: "lead" as const, text: "El de Honduras me gusta. Cuándo lo puedo ver?" },
  {
    role: "bot" as const,
    text:
      "Tengo huecos esta semana con Martín, nuestro asesor de Palermo: jueves 17h o viernes 11h. ¿Cuál te queda mejor?",
  },
  { role: "lead" as const, text: "Jueves 17h." },
  {
    role: "bot" as const,
    text:
      "Reservado. Martín te confirma por WhatsApp en los próximos minutos con la dirección exacta. ¿Algo más?",
  },
];

export function FullDemo() {
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="section">
        <div className="text-center mb-12">
          <p className="eyebrow mb-4">Conversación real</p>
          <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight max-w-2xl mx-auto">
            Así califica y agenda Wapsell.
          </h2>
        </div>

        <ChatMockup variant="forest" turns={FULL_TURNS} />

        <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          <Stat n="5 seg" label="tiempo de respuesta" />
          <Stat n="12 turnos" label="para cerrar la visita" />
          <Stat n="0 humanos" label="involucrados" />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display font-semibold text-2xl md:text-3xl text-forest">
        {n}
      </p>
      <p className="text-xs md:text-sm uppercase tracking-eyebrow text-ink-muted mt-1">
        {label}
      </p>
    </div>
  );
}
