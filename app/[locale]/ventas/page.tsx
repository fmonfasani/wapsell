"use client";

import { useState, useEffect, useCallback, Fragment } from "react";

// Internal sales console.
//  - Capa 1: pre-deals (leads del demo) con su transcript.
//  - Capa 2: deals validados (pipeline). Read/stage-update via admin token.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.wapsell.com";
const LS_TOKEN = "wapsell_admin_token";
const STAGES = ["new", "qualified", "negotiation", "won", "lost"] as const;
const STAGE_ES: Record<string, string> = {
  new: "Nuevo", qualified: "Calificado", negotiation: "Negociación",
  won: "Ganado", lost: "Perdido",
};

interface Lead {
  id: string; name?: string; email?: string; phone?: string; status: string;
  detected_persona?: string; message_count?: number; last_active?: string;
}
interface Deal {
  id: string; lead_id?: string; name?: string; email?: string; phone?: string;
  company?: string; stage: string; persona?: string; created_at?: string;
}
interface Overview {
  capa1_demo: { leads: number; messages: number; personas_tracked: number };
  capa2_app: { deals: number; users: number; accounts: number; subscriptions: number; messages: number };
  bridge: { conversions: number };
}
interface Msg { id: string; role: string; content: string; created_at: string }

function fmtDate(s?: string) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  } catch { return s; }
}

export default function VentasPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [byPersona, setByPersona] = useState<Record<string, number>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Msg[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(LS_TOKEN);
    if (saved) { setToken(saved); void load(saved); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async (tk: string) => {
    setLoading(true); setError(null);
    try {
      const h = { "X-Admin-Token": tk };
      const [ovRes, leadsRes, dealsRes] = await Promise.all([
        fetch(`${API_BASE}/app/overview`, { headers: h }),
        fetch(`${API_BASE}/demo/leads`, { headers: h }),
        fetch(`${API_BASE}/app/deals`, { headers: h }),
      ]);
      if ([ovRes, leadsRes, dealsRes].some((r) => r.status === 401)) throw new Error("Token inválido");
      const ov = await ovRes.json();
      const ld = await leadsRes.json();
      const dl = await dealsRes.json();
      setOverview(ov); setLeads(ld.leads || []); setByPersona(ld.by_persona || {});
      setDeals(dl.deals || []);
      setAuthed(true); localStorage.setItem(LS_TOKEN, tk);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error"); setAuthed(false);
    } finally { setLoading(false); }
  }, []);

  const openTranscript = async (id: string) => {
    if (openId === id) { setOpenId(null); setTranscript([]); return; }
    setOpenId(id); setTranscript([]);
    try {
      const res = await fetch(`${API_BASE}/demo/leads/${id}/transcript`, {
        headers: { "X-Admin-Token": token },
      });
      const data = await res.json();
      setTranscript(data.messages || []);
    } catch { setTranscript([]); }
  };

  const updateStage = async (dealId: string, stage: string) => {
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage } : d)));
    try {
      await fetch(`${API_BASE}/app/deals/${dealId}?stage=${stage}`, {
        method: "PATCH", headers: { "X-Admin-Token": token },
      });
    } catch { /* optimistic; reload to resync if needed */ }
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <form onSubmit={(e) => { e.preventDefault(); void load(token); }}
          className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-slate-900">Wapsell · Ventas</h1>
          <p className="mt-1 text-sm text-slate-500">Ingresá el admin token.</p>
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)}
            placeholder="Admin token"
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading || !token}
            className="mt-4 w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white disabled:opacity-50">
            {loading ? "Verificando…" : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Ventas · Wapsell</h1>
          <button onClick={() => void load(token)}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            ↻ Actualizar
          </button>
        </div>

        {overview && (
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            <Stat label="Pre-deals (leads)" value={overview.capa1_demo.leads} accent="slate" />
            <Stat label="Capturados" value={leads.filter((l) => l.status === "captured").length} accent="emerald" />
            <Stat label="Deals (Capa 2)" value={overview.capa2_app.deals} accent="emerald" />
            <Stat label="Ganados" value={deals.filter((d) => d.stage === "won").length} accent="amber" />
            <Stat label="Conversiones" value={overview.bridge.conversions} accent="amber" />
          </div>
        )}

        {/* DEALS (Capa 2) */}
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Deals · Capa 2 (validados)</h2>
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Persona</th>
                <th className="px-4 py-3">Etapa</th>
                <th className="px-4 py-3">Validado</th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Sin deals todavía (se crean al verificar el email de un lead).</td></tr>
              )}
              {deals.map((d) => (
                <tr key={d.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{d.name || "—"}</div>
                    <div className="text-xs text-slate-500">{d.email} · {d.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{d.persona || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={d.stage} onChange={(e) => void updateStage(d.id, e.target.value)}
                      className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                        d.stage === "won" ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : d.stage === "lost" ? "border-red-200 bg-red-50 text-red-600"
                        : "border-slate-300 bg-white text-slate-700"}`}>
                      {STAGES.map((s) => <option key={s} value={s}>{STAGE_ES[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(d.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PRE-DEALS (Capa 1) */}
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Pre-deals · Capa 1 (demo)</h2>
        {Object.keys(byPersona).length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {Object.entries(byPersona).map(([p, n]) => (
              <span key={p} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">{p}: <b>{n}</b></span>
            ))}
          </div>
        )}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Persona</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Msgs</th>
                <th className="px-4 py-3">Última actividad</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Sin leads todavía.</td></tr>
              )}
              {leads.map((l) => (
                <Fragment key={l.id}>
                  <tr onClick={() => void openTranscript(l.id)}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {l.status === "captured" ? (
                        <div>
                          <div className="font-medium text-slate-900">{l.name || "—"}</div>
                          <div className="text-xs text-slate-500">{l.email} · {l.phone}</div>
                        </div>
                      ) : <span className="text-slate-400">anónimo</span>}
                    </td>
                    <td className="px-4 py-3"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{l.detected_persona || "—"}</span></td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        l.status === "captured" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {l.status === "captured" ? "capturado" : "anónimo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{l.message_count ?? 0}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(l.last_active)}</td>
                  </tr>
                  {openId === l.id && (
                    <tr className="bg-slate-50">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="mx-auto max-w-2xl space-y-2">
                          {transcript.length === 0 && <p className="text-center text-sm text-slate-400">Cargando conversación…</p>}
                          {transcript.map((m) => (
                            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[80%] whitespace-pre-line rounded-lg px-3 py-2 text-sm ${
                                m.role === "user" ? "bg-emerald-100 text-slate-900" : "bg-white text-slate-800 shadow-sm"}`}>
                                {m.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Capa 1 (demo) y Capa 2 (app) no comparten tablas; se relacionan solo via el puente `conversions`.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: "emerald" | "amber" | "slate" }) {
  const color = accent === "emerald" ? "text-emerald-600" : accent === "amber" ? "text-amber-600" : "text-slate-900";
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
