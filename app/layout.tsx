import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description:
    "Agente comercial de IA en WhatsApp para inmobiliarias premium. Califica leads, agenda visitas y nunca duerme. Probalo ahora.",
  metadataBase: new URL(`https://${BRAND.domain}`),
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description:
      "Agente comercial de IA en WhatsApp para inmobiliarias premium. 24/7, sin contratar más vendedores.",
    type: "website",
    locale: "es_AR",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
