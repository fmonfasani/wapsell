import { BRAND } from "@/lib/constants";

// Two color variants:
//  - "cream": original spec (lead = white card, bot = amber)
//  - "forest": Stitch's mobile choice (lead = deep green, bot = amber)
// Toggle with the variant prop so we can A/B visually side-by-side before
// committing to one in prod.
export type ChatVariant = "cream" | "forest";

type Turn = {
  role: "lead" | "bot";
  text: string;
};

const SHORT_TURNS: Turn[] = [
  { role: "lead", text: "Busco 3 amb en Palermo, mejor que tenga balcón." },
  {
    role: "bot",
    text: "¡Hola! Tenemos 4 unidades que encajan. Te paso 2 con balcón:",
  },
  {
    role: "bot",
    text: "▸ Honduras 5400 — USD 320k\n▸ Soler 4100 — USD 285k",
  },
  {
    role: "bot",
    text: "¿Visitás esta semana? Tengo huecos jueves 17h y viernes 11h.",
  },
];

export function ChatMockup({
  variant = "forest",
  turns = SHORT_TURNS,
  caption,
}: {
  variant?: ChatVariant;
  turns?: Turn[];
  caption?: string;
}) {
  return (
    <div className="mx-auto max-w-chat">
      {/* Chat container: rounded card, soft border, no pure shadows. */}
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
              {BRAND.name} AI
            </p>
            <p className="text-xs text-forest">● En línea</p>
          </div>
        </div>

        {/* Turn stack. */}
        <div className="flex flex-col gap-3">
          {turns.map((t, i) => (
            <Bubble key={i} role={t.role} variant={variant}>
              {t.text}
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

  // Style mapping per variant. The bot always uses amber; only the lead bubble
  // color changes between variants.
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
