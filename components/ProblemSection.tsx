import { useTranslations } from "next-intl";
import { BRAND } from "@/lib/constants";

export function ProblemSection() {
  const t = useTranslations("problem");

  return (
    <section className="bg-cream-200 py-28 md:py-40">
      <div className="section text-center">
        <p className="eyebrow mb-6">{t("eyebrow")}</p>

        <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight max-w-3xl mx-auto">
          {t("line1", { price: t("line1Price") })}
        </h2>

        <h2 className="mt-10 font-display font-semibold text-3xl md:text-5xl leading-tight max-w-3xl mx-auto text-forest">
          {t("line2", { brand: BRAND.name })}
        </h2>
      </div>
    </section>
  );
}
