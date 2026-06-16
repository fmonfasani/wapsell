"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Navbar } from "@/components/Navbar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.wapsell.com";

export default function ProspectsPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [prospects, setProspects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>("all");
  const [token, setToken] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("wapsell_admin_token");
    if (!stored) {
      setToken("");
      return;
    }
    setToken(stored);
  }, []);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const [statsRes, prospectsRes] = await Promise.all([
          fetch(`${API_BASE}/prospects/stats`, {
            headers: { "X-Admin-Token": token },
          }),
          fetch(`${API_BASE}/prospects?tier=${tier === "all" ? "" : tier}&limit=200`, {
            headers: { "X-Admin-Token": token },
          }),
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        if (prospectsRes.ok) {
          setProspects(await prospectsRes.json());
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [token, tier]);

  if (!token) {
    return (
      <>
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center bg-cream">
          <div className="text-center">
            <p className="text-sm text-ink/60 mb-4">Token requerido</p>
            <input
              type="password"
              placeholder="Admin token"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  localStorage.setItem("wapsell_admin_token", e.currentTarget.value);
                  setToken(e.currentTarget.value);
                }
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-ink mb-2">Prospects 📋</h1>
            <p className="text-sm text-ink/60">Immobiliarias para contactar (Dataset A)</p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg border border-cream-300">
                <p className="text-xs text-ink/60">Total</p>
                <p className="text-2xl font-semibold text-ink">{stats.total}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-cream-300">
                <p className="text-xs text-ink/60">Tier A</p>
                <p className="text-2xl font-semibold text-amber">{stats.by_tier.A || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-cream-300">
                <p className="text-xs text-ink/60">Tier B</p>
                <p className="text-2xl font-semibold text-amber">{stats.by_tier.B || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-cream-300">
                <p className="text-xs text-ink/60">Total Props</p>
                <p className="text-2xl font-semibold text-ink">{stats.total_properties?.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Tier filter */}
          <div className="flex gap-2 mb-6">
            {["all", "A", "B", "C", "sin_dato"].map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tier === t
                    ? "bg-ink text-cream"
                    : "bg-white text-ink border border-cream-300 hover:bg-cream"
                }`}
              >
                {t === "all" ? "Todos" : `Tier ${t}`}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-cream-300 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-ink/60">Cargando...</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-cream border-b border-cream-300">
                  <tr>
                    <th className="text-left p-4 font-semibold text-ink">Nombre</th>
                    <th className="text-left p-4 font-semibold text-ink">WhatsApp</th>
                    <th className="text-center p-4 font-semibold text-ink">Props</th>
                    <th className="text-left p-4 font-semibold text-ink">Tier</th>
                    <th className="text-left p-4 font-semibold text-ink">Plataforma</th>
                  </tr>
                </thead>
                <tbody>
                  {prospects.prospects?.map((p: any, i: number) => (
                    <tr key={i} className="border-b border-cream-100 hover:bg-cream/50 transition">
                      <td className="p-4">
                        <a href={p.website} target="_blank" rel="noopener" className="text-amber hover:underline">
                          {p.nombre}
                        </a>
                      </td>
                      <td className="p-4 font-mono text-xs">{p.whatsapp}</td>
                      <td className="p-4 text-center font-semibold">{p.cant_propiedades}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            p.tier === "A"
                              ? "bg-amber text-ink"
                              : p.tier === "B"
                              ? "bg-amber/20 text-amber"
                              : "bg-cream-200 text-ink/60"
                          }`}
                        >
                          {p.tier}
                        </span>
                      </td>
                      <td className="p-4 text-ink/60">{p.plataforma}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {prospects.count === 0 && !loading && (
            <div className="text-center p-8 text-ink/60">Sin resultados</div>
          )}
        </div>
      </div>
    </>
  );
}
