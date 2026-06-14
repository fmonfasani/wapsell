"""
Wapsell sales agent knowledge base.

The demo agent SELLS Wapsell (and showcases the capability by being it).
Deterministic, fast, on-brand answers with REAL pricing — no LLM hallucinated
numbers. Bilingual (es/en). Pricing mirrors the landing (messages/*.json):
Starter $99, Pro $299, Enterprise a medida; setup sin cargo, sin permanencia.
"""

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

PRICING = {
    "starter": {"price": "$99", "name": "Starter"},
    "pro": {"price": "$299", "name": "Pro"},
    "enterprise": {"price": "a medida", "name": "Enterprise"},
}


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
    "pricing": {
        "es": (
            "*Planes* (en USD · setup sin cargo · sin permanencia):\n\n"
            "💼 *Starter — $99/mes*\n"
            "• 500 conversaciones/mes\n• 1 número WhatsApp\n• Catálogo único\n"
            "• Soporte por email\n\n"
            "⭐ *Pro — $299/mes* (el más elegido)\n"
            "• 2.000 conversaciones/mes\n• Catálogo + RAG semántico\n"
            "• CRM (HubSpot, Pipedrive)\n• Soporte prioritario por WhatsApp\n\n"
            "🏢 *Enterprise — a medida*\n• Alto volumen, multi-número, lo que necesites\n\n"
            "¿Te ayudo a elegir el plan ideal o querés *contratarlo*?"
        ),
        "en": (
            "*Plans* (USD · free setup · no lock-in):\n\n"
            "💼 *Starter — $99/mo*\n"
            "• 500 conversations/mo\n• 1 WhatsApp number\n• Single catalog\n"
            "• Email support\n\n"
            "⭐ *Pro — $299/mo* (most popular)\n"
            "• 2,000 conversations/mo\n• Catalog + semantic RAG\n"
            "• CRM (HubSpot, Pipedrive)\n• Priority WhatsApp support\n\n"
            "🏢 *Enterprise — custom*\n• High volume, multi-number, whatever you need\n\n"
            "Want help picking a plan, or ready to *get started*?"
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
