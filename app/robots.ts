import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `https://${BRAND.domain}/sitemap.xml`,
  };
}
