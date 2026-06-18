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
        const token = localStorage.getItem("wapsell_token");
        const res = await fetch(`${apiUrl}/onboarding/status/${accountId}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
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
    <div className="min-h-screen bg-white p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              {isReady ? (
                <div className="w-14 h-14 rounded-full bg-[#075E54]/10 flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#075E54] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-2">
                {isReady
                  ? locale === "en"
                    ? "Agent ready"
                    : "Agente listo"
                  : locale === "en"
                    ? "Setting up..."
                    : "Preparando..."}
              </h1>
              <p className="text-lg text-slate-500">
                {isReady
                  ? locale === "en"
                    ? "Your AI agent is ready to answer property inquiries"
                    : "Tu agente IA está listo para responder consultas"
                  : locale === "en"
                    ? "We're preparing your properties for intelligent conversations"
                    : "Estamos preparando tus propiedades"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Properties Metric */}
          <div className="md:col-span-1 border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition">
            <p className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">
              {locale === "en" ? "Properties" : "Propiedades"}
            </p>
            <div className="text-4xl font-light text-[#075E54] mb-1">
              {status.properties_loaded}
            </div>
            <p className="text-xs text-slate-400">
              {locale === "en" ? "loaded" : "cargadas"}
            </p>
          </div>

          {/* Status Metric */}
          <div className="md:col-span-1 border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition">
            <p className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">
              {locale === "en" ? "Status" : "Estado"}
            </p>
            <div className="text-4xl font-light text-[#075E54] mb-1">
              {isReady ? "100%" : "∞"}
            </div>
            <p className="text-xs text-slate-400">
              {isReady
                ? locale === "en"
                  ? "ready"
                  : "listo"
                : locale === "en"
                  ? "processing"
                  : "procesando"}
            </p>
          </div>

          {/* Response Time */}
          <div className="md:col-span-1 border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition">
            <p className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">
              {locale === "en" ? "Response Time" : "Tiempo"}
            </p>
            <div className="text-4xl font-light text-[#075E54] mb-1">
              &lt;2s
            </div>
            <p className="text-xs text-slate-400">
              {locale === "en" ? "average" : "promedio"}
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mb-12">
          {isReady && (
            <div className="flex justify-center">
              <Link
                href={demoUrl}
                className="inline-flex items-center gap-2 bg-[#E4A33B] text-black py-3 px-8 rounded-lg font-medium hover:bg-[#D99030] hover:shadow-lg hover:scale-105 transition duration-300 group"
              >
                <span>{locale === "en" ? "Start conversation" : "Iniciar conversación"}</span>
                <span className="text-lg group-hover:translate-x-1 transition duration-300">→</span>
              </Link>
            </div>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4 mb-12 md:mb-16">
          <button className="text-slate-600 hover:text-slate-900 text-sm font-medium py-2 px-4 border border-slate-300 rounded-lg hover:border-slate-400 transition">
            {locale === "en" ? "Load all" : "Cargar todas"}
          </button>
          <button className="text-slate-600 hover:text-slate-900 text-sm font-medium py-2 px-4 border border-slate-300 rounded-lg hover:border-slate-400 transition">
            {locale === "en" ? "Schedule call" : "Agendar"}
          </button>
        </div>

        {/* Info Section */}
        <div className="border-t border-slate-200 pt-8 md:pt-12">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-6">
            {locale === "en" ? "How it works" : "Cómo funciona"}
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {locale === "en"
                  ? "Your properties are indexed and ready for intelligent conversations"
                  : "Tus propiedades están indexadas y listas para conversaciones inteligentes"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {locale === "en"
                  ? "The agent learns from each inquiry to improve responses"
                  : "El agente aprende de cada consulta para mejorar respuestas"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {locale === "en"
                  ? "Every conversation is tracked for insights and optimization"
                  : "Cada conversación se registra para análisis y optimización"}
              </p>
            </div>
          </div>
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
