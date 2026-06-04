"use client";

import { useState } from "react";

// Curated FAQ: 5 of Stitch's vertical-aware ones + 3 from the original spec
// (the critical objections: equipo, privacidad, tarjeta). Accordion behavior.

const FAQS = [
  {
    q: "¿Wapsell reemplaza a mi equipo de ventas?",
    a:
      "No. Wapsell filtra y agenda. El cierre humano lo hacen tus vendedores con leads ya calificados y contexto completo de la conversación.",
  },
  {
    q: "¿Funciona con portales como Zonaprop o Argenprop?",
    a:
      "Sí. Conectamos el WhatsApp asociado a tus avisos en Zonaprop, Argenprop, MercadoLibre o el portal que uses. El lead llega al chat y Wapsell lo califica antes de pasarlo a tu equipo.",
  },
  {
    q: "¿Puede agendar visitas directamente en mi calendario?",
    a:
      "Sí, vía Google Calendar o el calendario de tu CRM. Wapsell ve la disponibilidad real del asesor y reserva el slot en la conversación.",
  },
  {
    q: "¿Funciona con HubSpot, Salesforce o Pipedrive?",
    a:
      "Sí, integramos por API. Disponible en plan Pro y superior. Cada lead califica + se crea como contacto + se logean las conversaciones automáticamente.",
  },
  {
    q: "¿Quién es dueño de las conversaciones?",
    a:
      "Vos. Los datos están en tu base, no en la nuestra. Podés exportarlos en cualquier momento o pedir que los borremos.",
  },
  {
    q: "¿Cómo se conecta con mi WhatsApp actual?",
    a:
      "En 5 minutos vía Meta Embedded Signup. Te ayudamos a registrar tu número de WhatsApp Business o portar el que ya usás.",
  },
  {
    q: "¿Qué pasa si el cliente pregunta algo muy complejo?",
    a:
      "Wapsell deriva al vendedor humano con todo el contexto de la conversación. El cliente nunca queda esperando ni recibe respuestas erróneas.",
  },
  {
    q: "¿Aceptan tarjeta de crédito?",
    a:
      "Sí, vía Mercado Pago. Suscripción mensual o anual con 15% off. También aceptamos transferencia para anual.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white py-24 md:py-32">
      <div className="section max-w-3xl">
        <div className="text-center mb-12">
          <p className="eyebrow mb-4">FAQ</p>
          <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight">
            Preguntas frecuentes
          </h2>
        </div>

        <ul className="divide-y divide-cream-300 border-t border-b border-cream-300">
          {FAQS.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full text-left flex justify-between items-start gap-6 py-5 group"
                >
                  <span className="font-medium text-ink text-base md:text-lg group-hover:text-amber-hover transition-colors">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className={`text-amber text-xl leading-none mt-1 transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen ? (
                  <p className="pb-6 pr-10 text-ink-muted leading-relaxed">
                    {item.a}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
