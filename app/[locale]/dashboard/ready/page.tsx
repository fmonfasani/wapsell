"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

interface Status {
  account_id: string;
  status: string;
  properties_loaded: number;
  properties_total: string | number;
}

function DashboardReadyContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "es";

  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accountId = searchParams?.get("account_id");

  useEffect(() => {
    if (!accountId) {
      setError("No account ID provided");
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.wapsell.com";
        const res = await fetch(`${apiUrl}/onboarding/status/${accountId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching status:", err);
        setError("No pudimos obtener el estado de tu agente");
      } finally {
        setLoading(false);
      }
    };

    // Fetch initially and then poll every 2 seconds until ready
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);

    return () => clearInterval(interval);
  }, [accountId]);

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#efeae2] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-[#075E54] border-t-transparent rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-slate-600">
            {locale === "en"
              ? "We're extracting your properties..."
              : "Estamos extrayendo tus propiedades..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#efeae2] to-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {locale === "en" ? "Error" : "Error"}
          </h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link
            href={`/${locale}`}
            className="inline-block px-6 py-3 bg-[#075E54] text-white rounded-lg hover:bg-[#064a42] transition"
          >
            {locale === "en" ? "Go Home" : "Volver al inicio"}
          </Link>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const isReady = status.status === "ready";
  const demoUrl = `/${locale}/demo/chat?prospect=${status.account_id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#efeae2] to-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            {isReady ? (
              <>
                <div className="text-5xl mb-4">✅</div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {locale === "en" ? "Your agent is ready!" : "¡Tu agente está listo!"}
                </h1>
                <p className="text-slate-600">
                  {locale === "en"
                    ? "Let's see what it can do with your properties"
                    : "Veamos qué puede hacer con tus propiedades"}
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">⏳</div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {locale === "en" ? "Almost there..." : "Casi listo..."}
                </h1>
                <p className="text-slate-600">
                  {locale === "en"
                    ? "We're extracting your properties"
                    : "Estamos extrayendo tus propiedades"}
                </p>
              </>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[#e8f5e9] to-[#f1f8e9] rounded-xl p-4">
              <div className="text-3xl font-bold text-[#075E54] mb-1">
                {status.properties_loaded}
              </div>
              <p className="text-sm text-slate-600">
                {locale === "en" ? "Properties loaded" : "Propiedades cargadas"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#e3f2fd] to-[#f3e5f5] rounded-xl p-4">
              <div className="text-3xl font-bold text-[#1976d2] mb-1">1.2s</div>
              <p className="text-sm text-slate-600">
                {locale === "en" ? "Response time" : "Tiempo de respuesta"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#fff3e0] to-[#ffe0b2] rounded-xl p-4">
              <div className="text-3xl font-bold text-[#f57c00] mb-1">ES</div>
              <p className="text-sm text-slate-600">
                {locale === "en" ? "Language" : "Idioma"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#fce4ec] to-[#f8bbd0] rounded-xl p-4">
              <div className="text-3xl font-bold text-[#c2185b] mb-1">0</div>
              <p className="text-sm text-slate-600">
                {locale === "en" ? "Leads captured" : "Leads capturados"}
              </p>
            </div>
          </div>

          {/* Main CTA */}
          {isReady && (
            <Link
              href={demoUrl}
              className="block w-full bg-[#075E54] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#064a42] transition mb-4 text-center"
            >
              {locale === "en" ? "Try my agent" : "Probar mi agente"}
            </Link>
          )}

          {/* Secondary CTAs */}
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-slate-100 text-slate-900 py-3 rounded-xl font-semibold hover:bg-slate-200 transition">
              {locale === "en" ? "Load all properties" : "Cargar todas"}
            </button>
            <button className="bg-slate-100 text-slate-900 py-3 rounded-xl font-semibold hover:bg-slate-200 transition">
              {locale === "en" ? "Schedule a call" : "Agendar reunión"}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h2 className="font-bold text-slate-900 mb-3">
            {locale === "en" ? "How it works" : "¿Cómo funciona?"}
          </h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              ✅{" "}
              {locale === "en"
                ? "Your properties are loaded and ready"
                : "Tus propiedades están cargadas y listas"}
            </li>
            <li>
              ✅{" "}
              {locale === "en"
                ? "The agent is learning from your catalog"
                : "El agente está aprendiendo de tu catálogo"}
            </li>
            <li>
              ✅{" "}
              {locale === "en"
                ? "Every conversation improves your results"
                : "Cada conversación mejora tus resultados"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function DashboardReadyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#efeae2] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-[#075E54] border-t-transparent rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    }>
      <DashboardReadyContent />
    </Suspense>
  );
}
