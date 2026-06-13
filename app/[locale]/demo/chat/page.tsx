"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "@/lib/useAuth";

interface Message {
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

export default function DemoChatPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    if (user?.id) {
      loadChatHistory();
    }
  }, [user?.id]);

  const loadChatHistory = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiBase}/messages?user_id=${user?.id}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const loadedMessages: Message[] = data.messages.map((msg: any) => ({
          role: msg.role,
          text: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [".csv", ".xlsx", ".xls", ".pdf"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExt)) {
      setError(`Solo se permiten: ${allowedTypes.join(", ")}`);
      return;
    }

    setUploadFile(file);
    setUploading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${apiBase}/properties/upload?user_id=${user?.id}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Error uploading file");
      }

      const result = await response.json();
      const successMsg: Message = {
        role: "agent",
        text: `✅ Cargados ${result.count} inmuebles de tu archivo. Ahora puedo buscar en tu base de datos.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMsg]);
      setUploadFile(null);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error uploading file";
      setError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (authLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiBase}/chat/message?user_id=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: userMsg.text,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const agentMsg: Message = {
        role: "agent",
        text: data.reply,
        timestamp: new Date(),
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, agentMsg]);
        setLoading(false);
      }, 600);
    } catch (err) {
      const errorMsg: Message = {
        role: "agent",
        text: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Demo Chat</h1>
              <p className="text-slate-600 text-sm mt-1">
                Prueba nuestro agente conversacional con RAG
              </p>
            </div>
            <Link href="/" className="text-slate-600 hover:text-slate-900">
              ← Volver
            </Link>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-lg flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-slate-500">
                  <p className="text-lg font-semibold mb-2">Bienvenido a la demo</p>
                  <p className="text-sm mb-4">
                    Hola {user.email}, prueba haciendo preguntas sobre departamentos en Buenos Aires
                  </p>
                  <p className="text-xs text-slate-400">
                    Ejemplos: "Busco algo en Palermo" • "¿Hay departamentos bajo $200k?" • "4 dormitorios"
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-brand-600 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg rounded-bl-none">
                  <p className="text-sm">Agent escribiendo...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-lg space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-2 rounded">
                {error}
              </div>
            )}

            {/* File Upload */}
            <div className="flex gap-2 items-center text-xs text-slate-600">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <div className="px-3 py-2 border border-dashed border-slate-300 rounded-lg hover:bg-slate-100 transition text-center">
                  {uploadFile ? uploadFile.name : uploading ? "Subiendo..." : "📎 CSV/Excel/PDF"}
                </div>
              </label>
            </div>

            {/* Chat Input */}
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                disabled={loading}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-brand-700 transition font-semibold"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">Esta es una demo</p>
            <p className="text-xs text-blue-800">
              Está usando datos de ejemplo. Cuando compres, cargamos TUS datos.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-900 mb-2">¿Te gustó?</p>
            <p className="text-xs text-green-800">
              Cuando compres, el agente responde directamente vía WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
