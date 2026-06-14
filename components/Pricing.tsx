import { useTranslations } from "next-intl";
import { BRAND, buildWaLink } from "@/lib/constants";

type Tier = {
  name: string;
  price: string;
  priceSub?: string;
  cadence?: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

export function Pricing() {
  const t = useTranslations("pricing");
  const tWa = useTranslations("wa");
  const waLink = buildWaLink(tWa("greeting", { brand: BRAND.name }));

  const tiers: Tier[] = [
    {
      name: t("starterName"),
      price: t("starterPrice"),
      priceSub: t("starterUsd"),
      cadence: t("perMonth"),
      features: [
        t("starterF1"),
        t("starterF2"),
        t("starterF3"),
        t("starterF4"),
      ],
      cta: t("starterCta", { brand: BRAND.name }),
    },
    {
      name: t("proName"),
      price: t("proPrice"),
      priceSub: t("proUsd"),
      cadence: t("perMonth"),
      features: [
        t("proF1"),
        t("proF2"),
        t("proF3"),
        t("proF4"),
        t("proF5"),
        t("proF6"),
      ],
      cta: t("proCta", { brand: BRAND.name }),
      featured: true,
    },
    {
      name: t("enterpriseName"),
      price: t("enterprisePrice"),
      features: [
        t("enterpriseF1"),
        t("enterpriseF2"),
        t("enterpriseF3"),
        t("enterpriseF4"),
        t("enterpriseF5"),
      ],
      cta: t("enterpriseCta"),
    },
  ];

  return (
    <section id="precios" className="bg-cream py-24 md:py-32">
      <div className="section">
        <div className="text-center mb-12">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight">
            {t("title")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.name}
              tier={tier}
              recommendedLabel={t("recommended")}
              ctaHref={waLink}
            />
          ))}
        </div>

        <p className="text-center text-xs text-ink-muted mt-10">
          {t("footnote")}
        </p>
      </div>
    </section>
  );
}

function PricingCard({
  tier,
  recommendedLabel,
  ctaHref,
}: {
  tier: Tier;
  recommendedLabel: string;
  ctaHref: string;
}) {
  const featuredCls = tier.featured
    ? "border-2 border-amber bg-white relative md:-translate-y-3"
    : "border border-cream-300 bg-white";

  return (
    <div className={`rounded-2xl p-8 flex flex-col ${featuredCls}`}>
      {tier.featured ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-ink text-xs font-semibold uppercase tracking-eyebrow px-3 py-1 rounded-pill">
          {recommendedLabel}
        </span>
      ) : null}

      <p className="eyebrow mb-4">{tier.name}</p>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="font-mono font-medium text-3xl md:text-4xl text-ink">
            {tier.price}
          </span>
          {tier.cadence ? (
            <span className="text-ink-muted text-base">{tier.cadence}</span>
          ) : null}
        </div>
        {tier.priceSub ? (
          <p className="text-ink-muted text-sm mt-1">{tier.priceSub}{tier.cadence}</p>
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
        href={ctaHref}
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
