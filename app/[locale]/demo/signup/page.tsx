"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// Lead capture now happens inside the chat (after the visitor is engaged),
// so the old signup form is retired — forward to the chat.
export default function DemoSignupRedirect() {
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
