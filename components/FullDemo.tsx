import { useTranslations } from "next-intl";
import { ChatMockup, type Turn } from "./ChatMockup";
import { BRAND } from "@/lib/constants";

export function FullDemo() {
  const t = useTranslations("fullDemo");

  const turns: Turn[] = [
    { role: "lead", text: t("turn1Lead") },
    { role: "bot", text: t("turn1Bot", { brand: BRAND.name }) },
    { role: "lead", text: t("turn2Lead") },
    { role: "bot", text: t("turn2Bot") },
    { role: "lead", text: t("turn3Lead") },
    { role: "bot", text: t("turn3Bot") },
    { role: "lead", text: t("turn4Lead") },
    { role: "bot", text: t("turn4Bot") },
    { role: "lead", text: t("turn5Lead") },
    { role: "bot", text: t("turn5Bot") },
    { role: "lead", text: t("turn6Lead") },
    { role: "bot", text: t("turn6Bot") },
  ];

  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="section">
        <div className="text-center mb-12">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight max-w-2xl mx-auto">
            {t("title", { brand: BRAND.name })}
          </h2>
        </div>

        <ChatMockup variant="forest" turns={turns} />

        <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          <Stat n={t("stat1Number")} label={t("stat1Label")} />
          <Stat n={t("stat2Number")} label={t("stat2Label")} />
          <Stat n={t("stat3Number")} label={t("stat3Label")} />
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
