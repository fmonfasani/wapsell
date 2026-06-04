# Wapsell — Landing

Sitio público de Wapsell — agente de IA en WhatsApp para inmobiliarias premium.

**Live:** próximamente en `wapsell.com`
**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
**Diseño base:** Stitch design system editorial (cream + amber + deep green)

## Desarrollo

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Estructura

```
app/
  page.tsx              landing principal
  demo-tour/page.tsx    deep dive: demo + comparativa + precios + FAQ
  layout.tsx            html root + metadata
  globals.css           paleta + tipografía
components/             componentes presentacionales
lib/constants.ts        nombre + número WhatsApp + URLs
tailwind.config.ts      design tokens del sistema
```

## Configurar el CTA de WhatsApp

El número de WhatsApp al que linkea el CTA "Hablá con Wapsell" vive en
`lib/constants.ts` como `WA_NUMBER` (formato E.164 sin `+`). Cambialo cuando
tengas el número Twilio dedicado de Wapsell:

```ts
export const WA_NUMBER = "5493585614524"; // ← swap here
```

## Variantes del ChatMockup

El componente `ChatMockup` acepta `variant: "cream" | "forest"`. Hoy ambas
páginas usan `forest` (las burbujas del cliente quedan en verde profundo,
match con la decisión visual del Stitch design system). Para A/B comparar:

```tsx
<ChatMockup variant="cream" />   {/* original spec */}
<ChatMockup variant="forest" />  {/* default actual */}
```

## Deploy

Recomendado: Vercel (autodetecta Next 14, deploy preview por PR).

```bash
npx vercel
```
