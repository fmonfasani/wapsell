"""
Wapsell sales agent knowledge base.

The demo agent SELLS Wapsell (and showcases the capability by being it).
Deterministic, fast, on-brand answers with REAL pricing — no LLM hallucinated
numbers. Bilingual (es/en). Pricing mirrors the landing (messages/*.json):
Starter $99, Pro $299, Enterprise a medida; setup sin cargo, sin permanencia.
"""

import re
import unicodedata

# --- intent keyword maps (es + en, accent-insensitive) ---
# Order matters: checked top-to-bottom in detect_intent().
INTENT_KEYWORDS = {
    "example": [
        "ejemplo", "mostrame", "mostra", "muestrame", "muestra", "mostras",
        "un ejemplo", "ejemplo en vivo", "simula", "como le responde",
        "como le responderias", "a un cliente", "probar el agente",
        "show me", "example", "demo it", "try it", "how would you reply",
    ],
    "pricing": [
        "precio", "precios", "cuesta", "cuanto sale", "cuanto cuesta", "cuanto",
        "sale", "plan", "planes", "suscripcion", "suscripciones", "tarifa",
        "tarifas", "vale", "mensualidad", "abono", "cobran", "price", "pricing",
        "cost", "how much", "subscription", "fee",
    ],
    "how_to_contract": [
        "contratar", "contrato", "empezar", "comenzar", "arrancar", "alta",
        "darme de alta", "registrarme", "comprar", "adquirir", "sumarme",
        "quiero wapsell", "lo quiero", "contratarlo", "como me sumo",
        "sign up", "get started", "buy", "hire", "subscribe", "onboard",
    ],
    "how_it_works": [
        "como funciona", "como anda", "como trabaja", "proceso", "procedimiento",
        "funciona", "implementa", "implementacion", "instalar",
        "configurar", "como se usa", "como lo uso", "pasos", "how it works",
        "how does it work", "process", "setup", "install",
    ],
    "integrations": [
        "integra", "integracion", "integraciones", "crm", "hubspot", "pipedrive",
        "api", "conecta", "conectar con", "integrate", "integration", "connect",
    ],
    "why": [
        "por que", "porque", "porqué", "ventaja", "ventajas", "beneficio",
        "beneficios", "conviene", "diferencia", "por que wapsell", "mejor",
        "why", "advantage", "benefit", "why wapsell",
    ],
    "what_is": [
        "que es", "que hace", "para que sirve", "de que se trata", "que ofrecen",
        "que es wapsell", "what is", "what does", "what do you do",
    ],
    "support": [
        "soporte", "ayuda tecnica", "atencion", "soporte tecnico",
        "support", "help desk",
    ],
}

# ---------------------------------------------------------------------------
# PRICING / QUOTE TABLE — single source of truth for auto-quoting.
# Prices in ARS (local) and USD. Edit here and everything (agent answers,
# /pricing, /quote) updates. Enterprise is "solicitar cotización" to the
# customer, but ENTERPRISE_TIERS lets us auto-quote it internally by volume.
# ---------------------------------------------------------------------------
PLANS = {
    "starter": {
        "name": "Starter", "usd": 99, "ars": 49000,
        "conversations": 500, "numbers": 1,
        "features_es": ["500 conversaciones/mes", "1 número WhatsApp",
                        "Catálogo único", "Soporte por email"],
        "features_en": ["500 conversations/mo", "1 WhatsApp number",
                        "Single catalog", "Email support"],
    },
    "pro": {
        "name": "Pro", "usd": 299, "ars": 249000,
        "conversations": 2000, "numbers": 1,
        "features_es": ["2.000 conversaciones/mes", "Catálogo + RAG semántico",
                        "CRM (HubSpot, Pipedrive)", "Soporte prioritario por WhatsApp"],
        "features_en": ["2,000 conversations/mo", "Catalog + semantic RAG",
                        "CRM (HubSpot, Pipedrive)", "Priority WhatsApp support"],
    },
    "enterprise": {
        "name": "Enterprise", "usd": None, "ars": None, "quote": True,
        "conversations": None, "numbers": None,
        "features_es": ["Alto volumen", "Multi-número", "A medida"],
        "features_en": ["High volume", "Multi-number", "Custom"],
    },
}

# Auto-quote tiers for Enterprise, by monthly conversation volume.
# NOTE: defaults — adjust the numbers to your real enterprise pricing.
ENTERPRISE_TIERS = [
    {"max_conversations": 5000, "usd": 590, "ars": 490000},
    {"max_conversations": 10000, "usd": 990, "ars": 890000},
    {"max_conversations": 25000, "usd": 1990, "ars": 1790000},
    # above the last tier → custom ("hablemos")
]


def fmt_ars(n) -> str:
    """Argentine thousands separator: 49000 -> '49.000'."""
    if n is None:
        return ""
    return f"{n:,.0f}".replace(",", ".")


def money(plan_key: str, lang: str = "es") -> str:
    """Render a plan's price as 'AR$ 49.000 · USD 99' (or quote label)."""
    p = PLANS[plan_key]
    if p.get("quote"):
        return "solicitar cotización" if lang == "es" else "request a quote"
    return f"AR$ {fmt_ars(p['ars'])} · USD {p['usd']}"


def detect_volume(message: str):
    """Parse a monthly conversation volume from a message (8000 / 8 mil / 8k)."""
    m = _norm(message)
    km = re.search(r"(\d+(?:[.,]\d+)?)\s*k\b", m)
    if km:
        return int(float(km.group(1).replace(",", ".")) * 1000)
    mil = re.search(r"(\d+(?:[.,]\d+)?)\s*mil", m)
    if mil:
        return int(float(mil.group(1).replace(",", ".")) * 1000)
    num = re.search(r"(\d[\d.,]{2,})", m)
    if num:
        raw = num.group(1).replace(".", "").replace(",", "")
        try:
            return int(raw)
        except ValueError:
            return None
    return None


def detect_plan(message: str):
    m = _norm(message)
    if re.search(r"\benterprise\b", m):
        return "enterprise"
    if re.search(r"\bstarter\b", m):
        return "starter"
    if re.search(r"\bpro\b", m):  # word-boundary so "producto"/"proceso" don't match
        return "pro"
    return None


def auto_quote(conversations=None, plan=None, lang="es"):
    """Automatic quote from the table. Returns (data_dict, text)."""
    es = lang != "en"

    # Explicit plan beats volume (except enterprise, which uses volume tiers).
    if plan in ("starter", "pro"):
        p = PLANS[plan]
        txt = (
            f"El plan *{p['name']}* sale *AR$ {fmt_ars(p['ars'])} / mes* "
            f"(US$ {p['usd']}). ¿Lo activamos? 🟢"
            if es else
            f"The *{p['name']}* plan is *AR$ {fmt_ars(p['ars'])} / mo* "
            f"(US$ {p['usd']}). Shall we activate it? 🟢"
        )
        return ({"plan": plan, "ars": p["ars"], "usd": p["usd"]}, txt)

    # Volume-based routing.
    if conversations is not None:
        if conversations <= PLANS["starter"]["conversations"]:
            key = "starter"
        elif conversations <= PLANS["pro"]["conversations"]:
            key = "pro"
        else:
            # Enterprise tiers.
            tier = next((t for t in ENTERPRISE_TIERS if conversations <= t["max_conversations"]), None)
            if tier:
                txt = (
                    f"Para ~{fmt_ars(conversations)} conversaciones/mes entrás en "
                    f"*Enterprise*: *AR$ {fmt_ars(tier['ars'])} / mes* (US$ {tier['usd']}) "
                    f"— estimación, la cerramos según tus integraciones. ¿Avanzamos?"
                    if es else
                    f"For ~{fmt_ars(conversations)} conversations/mo you're in "
                    f"*Enterprise*: *AR$ {fmt_ars(tier['ars'])} / mo* (US$ {tier['usd']}) "
                    f"— estimate, finalized per your integrations. Shall we move on?"
                )
                return ({"plan": "enterprise", "tier": tier["max_conversations"],
                         "ars": tier["ars"], "usd": tier["usd"]}, txt)
            txt = (
                "Para ese volumen armamos un *Enterprise a medida*. Dejame tus datos "
                "y te paso la cotización exacta. 👇"
                if es else
                "For that volume we build a *custom Enterprise* plan. Leave your "
                "details and I'll send the exact quote. 👇"
            )
            return ({"plan": "enterprise", "tier": "custom"}, txt)

        p = PLANS[key]
        txt = (
            f"Para ~{fmt_ars(conversations)} conversaciones/mes tu plan es "
            f"*{p['name']}*: *AR$ {fmt_ars(p['ars'])} / mes* (US$ {p['usd']}). "
            f"¿Lo activamos? 🟢"
            if es else
            f"For ~{fmt_ars(conversations)} conversations/mo your plan is "
            f"*{p['name']}*: *AR$ {fmt_ars(p['ars'])} / mo* (US$ {p['usd']}). "
            f"Shall we activate it? 🟢"
        )
        return ({"plan": key, "ars": p["ars"], "usd": p["usd"]}, txt)

    # Enterprise with no volume → ask for it.
    if plan == "enterprise":
        txt = (
            "Enterprise es *a medida*. Decime cuántas conversaciones por mes "
            "manejás y te paso una estimación al instante. 📊"
            if es else
            "Enterprise is *custom*. Tell me how many conversations per month you "
            "handle and I'll give you an instant estimate. 📊"
        )
        return ({"plan": "enterprise", "tier": None}, txt)

    return (None, pricing_answer(lang))


def pricing_answer(lang: str = "es") -> str:
    """Full price list rendered from PLANS (ARS + USD)."""
    es = lang != "en"
    fk = "features_es" if es else "features_en"
    s, pr, ent = PLANS["starter"], PLANS["pro"], PLANS["enterprise"]
    if es:
        return (
            "*Planes* (setup sin cargo · sin permanencia):\n\n"
            f"💼 *Starter — AR$ {fmt_ars(s['ars'])}/mes* (US$ {s['usd']})\n"
            + "\n".join(f"• {f}" for f in s[fk]) + "\n\n"
            f"⭐ *Pro — AR$ {fmt_ars(pr['ars'])}/mes* (US$ {pr['usd']}) — el más elegido\n"
            + "\n".join(f"• {f}" for f in pr[fk]) + "\n\n"
            f"🏢 *Enterprise — solicitar cotización*\n"
            + "\n".join(f"• {f}" for f in ent[fk]) + "\n"
            "_(decime cuántas conversaciones/mes manejás y te paso una estimación al instante)_\n\n"
            "¿Te ayudo a elegir o querés *contratarlo*?"
        )
    return (
        "*Plans* (free setup · no lock-in):\n\n"
        f"💼 *Starter — AR$ {fmt_ars(s['ars'])}/mo* (US$ {s['usd']})\n"
        + "\n".join(f"• {f}" for f in s[fk]) + "\n\n"
        f"⭐ *Pro — AR$ {fmt_ars(pr['ars'])}/mo* (US$ {pr['usd']}) — most popular\n"
        + "\n".join(f"• {f}" for f in pr[fk]) + "\n\n"
        f"🏢 *Enterprise — request a quote*\n"
        + "\n".join(f"• {f}" for f in ent[fk]) + "\n"
        "_(tell me your monthly conversations and I'll give an instant estimate)_\n\n"
        "Want help choosing, or ready to *get started*?"
    )


def _norm(text: str) -> str:
    """Lowercase + strip accents for robust keyword matching."""
    text = text.strip().lower()
    return "".join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )


def detect_intent(message: str):
    """Return the best-matching Wapsell-sales intent, or None."""
    m = _norm(message)
    for intent, keywords in INTENT_KEYWORDS.items():
        for kw in keywords:
            if _norm(kw) in m:
                return intent
    return None


def wants_example(message: str) -> bool:
    return detect_intent(message) == "example"


# --- answers (es / en) ---
_ANSWERS = {
    "what_is": {
        "es": (
            "Wapsell es un *agente de ventas con IA* que atiende tu WhatsApp 24/7. "
            "Responde a tus clientes al instante, les muestra tu catálogo, detecta "
            "qué tipo de comprador son y los lleva hasta la venta — sin que tengas "
            "que estar vos. 🤖💬\n\n¿Querés ver *cómo funciona* o los *precios*?"
        ),
        "en": (
            "Wapsell is an *AI sales agent* that runs your WhatsApp 24/7. It replies "
            "to your customers instantly, shows your catalog, detects what kind of "
            "buyer they are and guides them to the sale — without you lifting a "
            "finger. 🤖💬\n\nWant to see *how it works* or the *pricing*?"
        ),
    },
    "how_it_works": {
        "es": (
            "Funciona en *3 pasos*:\n"
            "1️⃣ Conectás tu catálogo (productos, propiedades o servicios — un Excel "
            "o tu sistema).\n"
            "2️⃣ Conectamos tu número de WhatsApp.\n"
            "3️⃣ El agente responde y califica leads solo. Vos recibís los contactos "
            "listos para cerrar. ⚡\n\n"
            "De hecho, *este chat es un ejemplo* de cómo trabaja. ¿Querés ver los "
            "*precios* o un *ejemplo en vivo*?"
        ),
        "en": (
            "It works in *3 steps*:\n"
            "1️⃣ Connect your catalog (products, properties or services — a "
            "spreadsheet or your system).\n"
            "2️⃣ We connect your WhatsApp number.\n"
            "3️⃣ The agent replies and qualifies leads on its own. You get "
            "ready-to-close contacts. ⚡\n\n"
            "In fact, *this chat is an example* of how it works. Want to see "
            "*pricing* or a *live example*?"
        ),
    },
    "why": {
        "es": (
            "Porque *no perdés ni un cliente*:\n"
            "✅ Responde en segundos, 24/7 (incluso de madrugada)\n"
            "✅ Se adapta al tipo de comprador y le habla en su tono\n"
            "✅ Capta y califica cada lead automáticamente\n"
            "✅ Aprende qué mensajes convierten más\n\n"
            "Es como tener tu mejor vendedor, clonado y sin descanso. 🚀"
        ),
        "en": (
            "Because *you never lose a lead*:\n"
            "✅ Replies in seconds, 24/7 (even at 3am)\n"
            "✅ Adapts to each buyer and speaks in their tone\n"
            "✅ Captures and qualifies every lead automatically\n"
            "✅ Learns which messages convert best\n\n"
            "It's like your best salesperson, cloned and never sleeping. 🚀"
        ),
    },
    "how_to_contract": {
        "es": (
            "Sumarte es rápido 🟢:\n"
            "1️⃣ Me dejás tu *nombre, email y WhatsApp* acá mismo.\n"
            "2️⃣ Te contactamos y hacemos el onboarding (cargamos tu catálogo).\n"
            "3️⃣ Conectamos tu WhatsApp y salís en vivo en *24-48 hs*.\n\n"
            "Dejame tus datos y arrancamos hoy. 👇"
        ),
        "en": (
            "Getting started is quick 🟢:\n"
            "1️⃣ Leave your *name, email and WhatsApp* right here.\n"
            "2️⃣ We reach out and onboard you (load your catalog).\n"
            "3️⃣ We connect your WhatsApp and you go live in *24-48 hs*.\n\n"
            "Leave your details and we start today. 👇"
        ),
    },
    "integrations": {
        "es": (
            "Sí 🔌 En el plan *Pro* se integra con tu CRM (HubSpot, Pipedrive) y por "
            "*API* con tu sistema. Cada lead que capta el agente cae directo en tu "
            "flujo de ventas. ¿Querés ver los *precios*?"
        ),
        "en": (
            "Yes 🔌 On the *Pro* plan it integrates with your CRM (HubSpot, "
            "Pipedrive) and via *API* with your system. Every lead the agent "
            "captures lands straight in your sales flow. Want to see *pricing*?"
        ),
    },
    "support": {
        "es": (
            "Tenés soporte por *email* en Starter y soporte *prioritario por "
            "WhatsApp* en Pro y Enterprise. Nunca quedás solo. 🤝"
        ),
        "en": (
            "You get *email* support on Starter and *priority WhatsApp* support on "
            "Pro and Enterprise. You're never on your own. 🤝"
        ),
    },
}


def sales_reply(intent: str, lang: str = "es") -> str:
    lang = "en" if lang == "en" else "es"
    if intent == "pricing":
        return pricing_answer(lang)  # rendered from the live PLANS table
    answer = _ANSWERS.get(intent)
    if not answer:
        return default_menu(lang)
    return answer.get(lang, answer["es"])


def greeting(lang: str = "es") -> str:
    if lang == "en":
        return (
            "Hi! 👋 I'm the *Wapsell* sales assistant. I sell on WhatsApp 24/7 so "
            "you never lose a customer — and this chat is a live example of how I "
            "work. 😉\n\nWant to know *how I work*, see the *pricing*, or get a "
            "*live example*?"
        )
    return (
        "¡Hola! 👋 Soy el asistente de ventas de *Wapsell*. Vendo por WhatsApp 24/7 "
        "para que no pierdas ni un cliente — y este chat es un ejemplo en vivo de "
        "cómo trabajo. 😉\n\n¿Querés saber *cómo funciono*, ver los *precios* o que "
        "te muestre un *ejemplo en vivo*?"
    )


def default_menu(lang: str = "es") -> str:
    if lang == "en":
        return (
            "I'm the *Wapsell* sales assistant 🤖. I can tell you about:\n"
            "• *What it is* and *how it works*\n• *Why* it's worth it\n"
            "• *Pricing* and plans\n• *How to get started*\n\n"
            "Or I can show you a *live example* of how I'd reply to your customers. "
            "Where do we start?"
        )
    return (
        "Soy el asistente de ventas de *Wapsell* 🤖. Puedo contarte:\n"
        "• *Qué es* y *cómo funciona*\n• *Por qué* conviene\n"
        "• *Precios* y planes\n• *Cómo contratarlo*\n\n"
        "O si querés, te muestro un *ejemplo en vivo* de cómo le respondería a tus "
        "clientes. ¿Por dónde arrancamos?"
    )


def example_intro(lang: str = "es") -> str:
    """Frame line shown before the property showcase (hybrid mode)."""
    if lang == "en":
        return (
            "Sure! 👇 Imagine you're a real-estate client writing to a business that "
            "uses Wapsell. Watch how I'd reply — try \"a flat in Palermo\" or "
            "\"something cheap\":"
        )
    return (
        "¡Dale! 👇 Imaginá que sos un cliente inmobiliario escribiéndole a un "
        "negocio que usa Wapsell. Mirá cómo le respondería — probá \"un depto en "
        "Palermo\" o \"algo barato\":"
    )
