import { useTranslations } from "next-intl";
import { BRAND } from "@/lib/constants";

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  const steps = [
    {
      n: "01",
      title: t("step1Title"),
      body: t("step1Body"),
    },
    {
      n: "02",
      title: t("step2Title"),
      body: t("step2Body", { brand: BRAND.name }),
    },
    {
      n: "03",
      title: t("step3Title", { brand: BRAND.name }),
      body: t("step3Body"),
    },
  ];

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="section">
        <div className="text-center mb-16">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight max-w-2xl mx-auto">
            {t("title", { brand: BRAND.name })}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-8 max-w-4xl mx-auto">
          {steps.map((s) => (
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
