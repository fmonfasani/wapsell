import { useTranslations } from "next-intl";
import { BRAND } from "@/lib/constants";

export function Comparison() {
  const t = useTranslations("comparison");

  const rows = [
    { f: t("row1Feature"), s: t("row1SDR"), b: t("row1Brand") },
    { f: t("row2Feature"), s: t("row2SDR"), b: t("row2Brand") },
    { f: t("row3Feature"), s: t("row3SDR"), b: t("row3Brand") },
    { f: t("row4Feature"), s: t("row4SDR"), b: t("row4Brand") },
    { f: t("row5Feature"), s: t("row5SDR"), b: t("row5Brand") },
    { f: t("row6Feature"), s: t("row6SDR"), b: t("row6Brand") },
  ];

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="section">
        <div className="text-center mb-12">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight max-w-2xl mx-auto">
            {t("title", { brand: BRAND.name })}
          </h2>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="border-b border-cream-300">
                <th className="text-left py-4 font-semibold text-ink">
                  {t("colFeature")}
                </th>
                <th className="text-left py-4 px-4 font-semibold text-ink-muted">
                  {t("colSDR")}
                </th>
                <th className="text-left py-4 px-4 font-semibold text-ink border-l-2 border-amber bg-amber-soft/30">
                  {t("colBrand", { brand: BRAND.name })}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.f} className="border-b border-cream-300">
                  <td className="py-4 font-medium text-ink">{r.f}</td>
                  <td className="py-4 px-4 text-ink-muted">{r.s}</td>
                  <td className="py-4 px-4 text-ink border-l-2 border-amber bg-amber-soft/30 font-medium">
                    {r.b}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
