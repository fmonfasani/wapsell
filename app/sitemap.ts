import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { BRAND } from "@/lib/constants";

// Per Google guidelines for bilingual sites: each URL is its own entry, with
// `alternates.languages` pointing at the sibling locale. Search engines pick
// the right one based on the user's `Accept-Language`.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${BRAND.domain}`;
  const routes = ["", "/demo-tour", "/privacy", "/terms"];

  return routes.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path === "/demo-tour" ? 0.8 : 0.3,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${base}/${l}${path}`]),
        ),
      },
    })),
  );
}
