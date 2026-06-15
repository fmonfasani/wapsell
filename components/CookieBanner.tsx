"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function CookieBanner() {
  const t = useTranslations();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("wapsell_cookie_consent");
    if (!accepted) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("wapsell_cookie_consent", "true");
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "cookies_accepted");
    }
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem("wapsell_cookie_consent", "rejected");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-ink text-cream p-4 md:p-6 border-t border-ink/20">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-sm">
          <p className="mb-2">
            {t("cookies.message")}
            {" "}
            <Link href="/legal/cookies" className="underline hover:opacity-75">
              {t("cookies.link")}
            </Link>
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-ink/20 hover:bg-ink/30 transition"
          >
            {t("cookies.reject")}
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-amber hover:bg-amber/90 text-ink font-semibold transition"
          >
            {t("cookies.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
