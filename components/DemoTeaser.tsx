import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChatMockup, type Turn } from "./ChatMockup";

export function DemoTeaser() {
  const t = useTranslations();
  const tChat = useTranslations("shortChat");
  const locale = useLocale();
  const demoCta = locale === "en" ? "Try it yourself →" : "Probalo vos mismo →";

  const turns: Turn[] = [
    { role: "lead", text: tChat("leadTurn1") },
    { role: "bot", text: tChat("botTurn1") },
    { role: "bot", text: tChat("botTurn2") },
    { role: "bot", text: tChat("botTurn3") },
  ];

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="section">
        <ChatMockup
          variant="forest"
          turns={turns}
          caption={t("demoTeaser.caption")}
        />

        <div className="mt-10 flex flex-col items-center gap-3">
          <Link href="/demo/chat" className="btn-primary text-base">
            {demoCta}
          </Link>
          <Link
            href="/demo-tour"
            className="text-amber font-medium underline underline-offset-4 hover:text-amber-hover"
          >
            {t("demoTeaser.linkFullDemo")}
          </Link>
        </div>
      </div>
    </section>
  );
}
