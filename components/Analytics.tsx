"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Google Analytics 4
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
    if (GA_ID && typeof window !== "undefined" && !window.gtag) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", GA_ID, { send_page_view: false });
    }

    // Meta Pixel
    const PIXEL_ID = process.env.NEXT_PUBLIC_PIXEL_ID;
    if (PIXEL_ID && typeof window !== "undefined" && !window.fbq) {
      const img = new Image();
      img.src = `https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`;

      window.fbq = function () {
        window.fbq.queue.push(arguments);
      };
      window.fbq.queue = window.fbq.queue || [];
      window.fbq("init", PIXEL_ID);
      window.fbq("track", "PageView");
    }

    // GA page view
    if (GA_ID && window.gtag) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      window.gtag("event", "page_view", { page_path: url });
    }
  }, [pathname, searchParams]);

  return null;
}
