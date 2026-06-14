"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// The demo is now an open, login-free WhatsApp-style chat. This entry point
// just forwards to it (keeping the locale prefix).
export default function DemoPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "es";

  useEffect(() => {
    router.replace(`/${locale}/demo/chat`);
  }, [router, locale]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#efeae2]">
      <p className="text-slate-600">Abriendo el chat…</p>
    </div>
  );
}
