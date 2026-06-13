"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/useAuth";

export default function DemoPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/demo/chat");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <p className="text-slate-600">Cargando...</p>
    </div>
  );
}
