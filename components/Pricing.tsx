import { WA_LINK } from "@/lib/constants";

// Three tiers. Pro is featured (amber border + recommended badge). Prices in
// USD per the latest pricing call. JetBrains Mono for the big numbers — the
// "magazine pull-quote" treatment from the Stitch design system.

type Tier = {
  name: string;
  price: string;
  cadence?: string;
  setup?: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Starter",
    price: "$99",
    cadence: "/mes",
    features: [
      "500 conversaciones / mes",
      "1 número WhatsApp",
      "Catálogo único",
      "Soporte por email",
    ],
    cta: "Probá Wapsell",
    ctaHref: WA_LINK,
  },
  {
    name: "Pro",
    price: "$299",
    cadence: "/mes",
    features: [
      "2.000 conversaciones / mes",
      "1 número WhatsApp",
      "Catálogo + RAG semántico",
      "Soporte WhatsApp prioritario",
      "Integración CRM (HubSpot, Pipedrive)",
      "Templates de mensajes",
    ],
    cta: "Probá Wapsell",
    ctaHref: WA_LINK,
    featured: true,
  },
  {
    name: "Enterprise",
    price: "A medida",
    features: [
      "Conversaciones ilimitadas",
      "Multi-número",
      "CSM dedicado",
      "Integraciones custom",
      "SLA garantizado",
    ],
    cta: "Call with sales →",
    ctaHref: WA_LINK,
  },
];

export function Pricing() {
  return (
    <section id="precios" className="bg-cream py-24 md:py-32">
      <div className="section">
        <div className="text-center mb-12">
          <p className="eyebrow mb-4">Precios</p>
          <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight">
            Transparentes. En dólares.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TIERS.map((t) => (
            <PricingCard key={t.name} tier={t} />
          ))}
        </div>

        <p className="text-center text-xs text-ink-muted mt-10">
          Setup inicial sin cargo. Sin permanencia.
        </p>
      </div>
    </section>
  );
}

function PricingCard({ tier }: { tier: Tier }) {
  const featuredCls = tier.featured
    ? "border-2 border-amber bg-white relative md:-translate-y-3"
    : "border border-cream-300 bg-white";

  return (
    <div className={`rounded-2xl p-8 flex flex-col ${featuredCls}`}>
      {tier.featured ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-ink text-xs font-semibold uppercase tracking-eyebrow px-3 py-1 rounded-pill">
          Recomendado
        </span>
      ) : null}

      <p className="eyebrow mb-4">{tier.name}</p>

      <div className="flex items-baseline gap-1 mb-6">
        <span className="font-mono font-medium text-5xl text-ink">
          {tier.price}
        </span>
        {tier.cadence ? (
          <span className="text-ink-muted text-base">{tier.cadence}</span>
        ) : null}
      </div>

      <ul className="space-y-3 text-sm text-ink-muted flex-1 mb-8">
        {tier.features.map((f) => (
          <li key={f} className="flex gap-2">
            <span aria-hidden className="text-forest mt-0.5">
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={tier.ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className={
          tier.featured
            ? "btn-primary text-sm !h-12"
            : "btn-secondary text-sm !h-12"
        }
      >
        {tier.cta}
      </a>
    </div>
  );
}
