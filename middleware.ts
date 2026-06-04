import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Detects the user's preferred locale from the Accept-Language header (and
// the NEXT_LOCALE cookie if set) and rewrites `/` -> `/es` (or /en). After
// the rewrite, the [locale] segment in app/ takes over.
export default createMiddleware(routing);

export const config = {
  // Match every path EXCEPT static files, /api, and Next internals. The
  // catch-all regex is what next-intl docs recommend.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
