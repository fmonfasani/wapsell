"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { buildWaLink } from "@/lib/constants";

// WhatsApp-faithful demo chat. No login: each visitor gets a persistent lead
// id (localStorage) and chats against the real RAG + persona API. After the
// 3rd message the API flags `should_capture` and we slide in a contact card.

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.wapsell.com";

type Role = "user" | "agent";
interface ChatMsg {
  id: string;
  role: Role;
  text: string;
  time: Date;
  kind?: "text" | "capture" | "captured";
}

// Self-contained i18n so we don't depend on message-catalog keys.
type Strings = {
  online: string;
  typing: string;
  back: string;
  placeholder: string;
  welcome: string;
  examples: string;
  captureTitle: string;
  captureSubtitle: string;
  name: string;
  email: string;
  phone: string;
  submit: string;
  skip: string;
  capturedMsg: string;
  errorMsg: string;
};
const STR: Record<"es" | "en", Strings> = {
  es: {
    online: "en línea",
    typing: "escribiendo…",
    back: "Volver",
    placeholder: "Escribí un mensaje",
    welcome:
      "¡Hola! 👋 Soy el asistente de Wapsell. Contame qué estás buscando: zona, presupuesto, ambientes… y te muestro opciones al instante.",
    examples: "Probá: \"Busco depto de lujo en Palermo\" · \"Algo barato\" · \"Para invertir\"",
    captureTitle: "¿Seguimos por WhatsApp? 🟢",
    captureSubtitle:
      "Te paso estas opciones y novedades directo a tu WhatsApp. Dejame tus datos:",
    name: "Nombre",
    email: "Email",
    phone: "WhatsApp (ej: +54 9 11 …)",
    submit: "Continuar por WhatsApp",
    skip: "Seguir viendo en el chat",
    capturedMsg:
      "¡Genial! 🙌 Te vamos a contactar por WhatsApp con las mejores opciones. Mientras tanto, seguí preguntando lo que quieras.",
    errorMsg: "Uy, hubo un problema. Probá de nuevo en un momento.",
  },
  en: {
    online: "online",
    typing: "typing…",
    back: "Back",
    placeholder: "Type a message",
    welcome:
      "Hi! 👋 I'm the Wapsell assistant. Tell me what you're looking for — area, budget, rooms… and I'll show you options instantly.",
    examples: "Try: \"Looking for a luxury flat in Palermo\" · \"Something cheap\" · \"To invest\"",
    captureTitle: "Continue on WhatsApp? 🟢",
    captureSubtitle:
      "I'll send these options and updates straight to your WhatsApp. Leave your details:",
    name: "Name",
    email: "Email",
    phone: "WhatsApp (e.g. +54 9 11 …)",
    submit: "Continue on WhatsApp",
    skip: "Keep browsing in chat",
    capturedMsg:
      "Awesome! 🙌 We'll reach out on WhatsApp with the best options. Meanwhile, keep asking anything.",
    errorMsg: "Oops, something went wrong. Try again in a moment.",
  },
} as const;

const LS_ID = "wapsell_demo_id";
const LS_CAPTURED = "wapsell_demo_captured";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function DemoChatPage() {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "es") as "es" | "en";
  const t = STR[locale];

  const [demoId, setDemoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [booting, setBooting] = useState(true);
  const [captured, setCaptured] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // --- boot: get/create lead identity + load real history ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const alreadyCaptured = localStorage.getItem(LS_CAPTURED) === "1";
        if (alreadyCaptured) setCaptured(true);

        let id = localStorage.getItem(LS_ID);
        if (!id) {
          const res = await fetch(`${API_BASE}/demo/session`, { method: "POST" });
          const data = await res.json();
          id = data.demo_id;
          localStorage.setItem(LS_ID, id!);
        }
        if (cancelled) return;
        setDemoId(id);

        const hist = await fetch(`${API_BASE}/messages?user_id=${id}`);
        let loaded: ChatMsg[] = [];
        if (hist.ok) {
          const data = await hist.json();
          loaded = (data.messages || []).map((m: any) => ({
            id: m.id,
            role: m.role as Role,
            text: m.content,
            time: new Date(m.created_at),
            kind: "text" as const,
          }));
        }
        if (loaded.length === 0) {
          loaded = [
            { id: uid(), role: "agent", text: t.welcome, time: new Date(), kind: "text" },
          ];
        }
        if (!cancelled) setMessages(loaded);
      } catch {
        if (!cancelled) {
          setMessages([
            { id: uid(), role: "agent", text: t.welcome, time: new Date(), kind: "text" },
          ]);
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const pushCaptureCard = () => {
    setMessages((prev) =>
      prev.some((m) => m.kind === "capture")
        ? prev
        : [...prev, { id: uid(), role: "agent", text: "", time: new Date(), kind: "capture" }]
    );
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || !demoId) return;

    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", text, time: new Date(), kind: "text" },
    ]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/chat/message?user_id=${demoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "agent", text: data.reply, time: new Date(), kind: "text" },
      ]);
      if (data.should_capture && !captured) {
        setTimeout(pushCaptureCard, 700);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "agent", text: t.errorMsg, time: new Date(), kind: "text" },
      ]);
    } finally {
      setSending(false);
    }
  };

  const submitContact = async (name: string, email: string, phone: string) => {
    if (!demoId) return;
    try {
      await fetch(`${API_BASE}/demo/contact?demo_id=${demoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
    } catch {
      /* best-effort; we still advance the UX */
    }
    localStorage.setItem(LS_CAPTURED, "1");
    setCaptured(true);
    setMessages((prev) => [
      ...prev.filter((m) => m.kind !== "capture"),
      { id: uid(), role: "agent", text: t.capturedMsg, time: new Date(), kind: "text" },
    ]);
    const greeting =
      locale === "es"
        ? "Hola, vengo del chat de Wapsell y quiero ver más propiedades."
        : "Hi, I'm coming from the Wapsell chat and want to see more properties.";
    window.open(buildWaLink(greeting), "_blank");
  };

  const dismissCapture = () => {
    setMessages((prev) => prev.filter((m) => m.kind !== "capture"));
  };

  return (
    <div className="flex min-h-[100dvh] items-stretch justify-center bg-gradient-to-br from-slate-200 to-slate-400 sm:items-center sm:p-4 md:p-6">
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-black/5 sm:h-[88vh] sm:max-h-[820px] sm:max-w-md sm:rounded-2xl">
      {/* Header */}
      <header
        style={{ background: "#008069" }}
        className="flex items-center gap-3 px-4 py-2.5 text-white shadow-md"
      >
        <Link href={`/${locale}`} aria-label={t.back} className="text-white/90 hover:text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div
          className="flex items-center justify-center rounded-full font-bold"
          style={{ width: 40, height: 40, background: "#ffffff", color: "#008069" }}
        >
          W
        </div>
        <div className="leading-tight">
          <p className="font-semibold">Wapsell</p>
          <p className="text-xs text-white/80">{sending ? t.typing : t.online}</p>
        </div>
      </header>

      {/* Messages */}
      <main
        className="flex-1 overflow-y-auto px-3 py-4 md:px-8"
        style={{
          backgroundColor: "#efeae2",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23000000' fill-opacity='0.025'%3E%3Cpath d='M30 5l3 7-3 7-3-7zM10 25l7 3-7 3-3-7zM50 25l3 7-7-3 3-7zM30 45l3 7-3 7-3-7z'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-1.5">
          {messages.map((m) =>
            m.kind === "capture" ? (
              <CaptureCard key={m.id} t={t} onSubmit={submitContact} onSkip={dismissCapture} />
            ) : (
              <Bubble key={m.id} role={m.role} text={m.text} time={m.time} />
            )
          )}
          {sending && <TypingBubble />}
          {!booting && messages.length <= 1 && (
            <p className="mx-auto mt-3 max-w-md rounded-lg bg-[#ffffffcc] px-3 py-1.5 text-center text-xs text-[#54656f]">
              {t.examples}
            </p>
          )}
          <div ref={endRef} />
        </div>
      </main>

      {/* Composer */}
      <form
        onSubmit={send}
        style={{ background: "#f0f2f5" }}
        className="flex items-center gap-2 px-3 py-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          disabled={booting}
          className="flex-1 rounded-full border-none bg-white px-4 py-2.5 text-[15px] text-[#111b21] outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="send"
          style={{ background: "#008069" }}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white disabled:opacity-50"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
      </div>
    </div>
  );
}

function Bubble({ role, text, time }: { role: Role; text: string; time: Date }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className="relative max-w-[80%] whitespace-pre-line px-2.5 py-1.5 text-[14.5px] leading-snug shadow-sm"
        style={{
          background: isUser ? "#d9fdd3" : "#ffffff",
          color: "#111b21",
          borderRadius: 8,
          borderTopRightRadius: isUser ? 0 : 8,
          borderTopLeftRadius: isUser ? 8 : 0,
        }}
      >
        <span>{text}</span>
        <span className="ml-2 inline-flex translate-y-1 items-center gap-1 text-[11px] text-[#667781]">
          {time.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          {isUser && (
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden>
              <path d="M11.07.66 5.3 7.5 3.4 5.3l-.9.8 2.8 3.2L12 1.4zM15.6.66 9.83 7.5 9.3 6.9l-.78.66 1.36 1.55L16.5 1.4z" fill="#53bdeb" />
            </svg>
          )}
        </span>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-1 px-3 py-2.5 shadow-sm"
        style={{ background: "#ffffff", borderRadius: 8, borderTopLeftRadius: 0 }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-2 w-2 rounded-full bg-[#9aa0a6]"
            style={{ animation: "wa-blink 1.2s infinite", animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <style>{`@keyframes wa-blink{0%,60%,100%{opacity:.3}30%{opacity:1}}`}</style>
    </div>
  );
}

function CaptureCard({
  t,
  onSubmit,
  onSkip,
}: {
  t: Strings;
  onSubmit: (name: string, email: string, phone: string) => void;
  onSkip: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const valid = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 6;

  return (
    <div className="flex justify-start">
      <div
        className="w-[88%] max-w-sm p-4 shadow-md"
        style={{ background: "#ffffff", borderRadius: 12, borderTopLeftRadius: 0 }}
      >
        <p className="text-[15px] font-bold text-[#111b21]">{t.captureTitle}</p>
        <p className="mt-1 text-[13px] text-[#54656f]">{t.captureSubtitle}</p>
        <div className="mt-3 flex flex-col gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.name}
            className="rounded-lg border border-[#e0e0e0] bg-[#f7f8fa] px-3 py-2 text-sm outline-none focus:border-[#008069]"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.email}
            type="email"
            className="rounded-lg border border-[#e0e0e0] bg-[#f7f8fa] px-3 py-2 text-sm outline-none focus:border-[#008069]"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phone}
            type="tel"
            className="rounded-lg border border-[#e0e0e0] bg-[#f7f8fa] px-3 py-2 text-sm outline-none focus:border-[#008069]"
          />
        </div>
        <button
          onClick={() => valid && onSubmit(name.trim(), email.trim(), phone.trim())}
          disabled={!valid}
          style={{ background: valid ? "#25D366" : "#a8d5b5" }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[15px] font-semibold text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M.06 24l1.69-6.16a11.87 11.87 0 01-1.6-5.96C.15 5.32 5.5 0 12.06 0a11.8 11.8 0 018.4 3.49 11.78 11.78 0 013.48 8.4c0 6.55-5.35 11.88-11.92 11.88a12 12 0 01-5.7-1.45L.06 24zm6.6-3.8c1.68.99 3.28 1.59 5.4 1.59 5.45 0 9.9-4.43 9.9-9.88a9.82 9.82 0 00-2.9-7 9.78 9.78 0 00-6.99-2.9c-5.46 0-9.9 4.43-9.9 9.88 0 2.23.65 3.9 1.74 5.65l-1 3.65 3.75-.99zm11.39-5.55c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.47s1.07 2.86 1.22 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42z" />
          </svg>
          {t.submit}
        </button>
        <button
          onClick={onSkip}
          className="mt-2 w-full text-center text-[13px] text-[#54656f] underline"
        >
          {t.skip}
        </button>
      </div>
    </div>
  );
}
