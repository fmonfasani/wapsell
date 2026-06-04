import { useTranslations } from "next-intl";
import { BRAND } from "@/lib/constants";

// Color variants:
//  - "cream":  lead = white card,         bot = amber  (original spec)
//  - "forest": lead = deep green bubble,  bot = amber  (Stitch default)
export type ChatVariant = "cream" | "forest";

export type Turn = {
  role: "lead" | "bot";
  text: string;
};

export function ChatMockup({
  variant = "forest",
  turns,
  caption,
}: {
  variant?: ChatVariant;
  turns: Turn[];
  caption?: string;
}) {
  const t = useTranslations("chatHeader");

  return (
    <div className="mx-auto max-w-chat">
      <div className="rounded-3xl border border-cream-300 bg-cream-100 p-5 md:p-7">
        {/* Header row identifying the bot. */}
        <div className="flex items-center gap-3 pb-4 border-b border-cream-300 mb-4">
          <span
            aria-hidden
            className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-soft text-amber text-sm font-bold"
          >
            {BRAND.symbol}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">
              {t("name", { brand: BRAND.name })}
            </p>
            <p className="text-xs text-forest">{t("online")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {turns.map((turn, i) => (
            <Bubble key={i} role={turn.role} variant={variant}>
              {turn.text}
            </Bubble>
          ))}
        </div>
      </div>

      {caption ? (
        <p className="mt-6 text-center text-sm italic text-ink-muted leading-relaxed">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

function Bubble({
  role,
  variant,
  children,
}: {
  role: "lead" | "bot";
  variant: ChatVariant;
  children: React.ReactNode;
}) {
  const isLead = role === "lead";
  const leadClass =
    variant === "cream"
      ? "bg-white border border-cream-300 text-ink self-start"
      : "bg-forest text-white self-start";
  const botClass = "bg-amber text-ink self-end";

  return (
    <div
      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
        isLead ? leadClass : botClass
      }`}
    >
      {children}
    </div>
  );
}
