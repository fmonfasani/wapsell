import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

// Bilingual deploy: Spanish (Argentina) is the primary market, English is the
// expansion target. We use URL prefixes for both ('always') so each locale
// has its own canonical URL — better SEO than auto-redirects from `/`.
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

// Locale-aware wrappers around Next.js navigation primitives. Always import
// `Link`, `redirect`, `usePathname`, `useRouter` from here (not from "next/...")
// so the active locale stays in the URL across client navigation.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
