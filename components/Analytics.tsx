"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const w = typeof window !== "undefined" ? (window as any) : null;
    if (!w) return;

    // Google Analytics 4
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
    if (GA_ID && !w.gtag) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);

      w.dataLayer = w.dataLayer || [];
      w.gtag = function (...args: any[]) {
        w.dataLayer.push(args);
      };
      w.gtag("js", new Date());
      w.gtag("config", GA_ID, { send_page_view: false });
    }

    // Meta Pixel
    const PIXEL_ID = process.env.NEXT_PUBLIC_PIXEL_ID;
    if (PIXEL_ID && !w.fbq) {
      const img = new Image();
      img.src = `https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`;

      w.fbq = function (...args: any[]) {
        w.fbq.queue.push(args);
      };
      w.fbq.queue = w.fbq.queue || [];
      w.fbq("init", PIXEL_ID);
      w.fbq("track", "PageView");
    }

    // GA page view
    if (GA_ID && w.gtag) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      w.gtag("event", "page_view", { page_path: url });
    }
  }, [pathname, searchParams]);

  return null;
}
