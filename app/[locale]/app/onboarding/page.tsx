"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "es";

  const [formData, setFormData] = useState({
    tokko_url: "",
    whatsapp: "",
    property_count: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.wapsell.com";

      const token = localStorage.getItem("wapsell_token");
      const res = await fetch(`${apiUrl}/onboarding/property-source`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          tokko_url: formData.tokko_url,
          whatsapp: formData.whatsapp || undefined,
          property_count: formData.property_count
            ? parseInt(formData.property_count)
            : undefined,
          location: formData.location || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to start extraction");
      }

      const data = await res.json();

      // Redirect to ready page
      router.push(`/${locale}/dashboard/ready?account_id=${data.account_id}`);
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : locale === "en"
            ? "Failed to start extraction"
            : "No pudimos iniciar la extracción"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#efeae2] to-white p-6">
      <div className="max-w-md mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {locale === "en" ? "Setup your catalog" : "Configura tu catálogo"}
          </h1>
          <p className="text-slate-600">
            {locale === "en"
              ? "Connect your Tokko site to create your demo"
              : "Conecta tu sitio Tokko para crear tu demo"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tokko URL */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                {locale === "en" ? "Your Tokko URL" : "URL de tu sitio Tokko"}
              </label>
              <input
                type="url"
                name="tokko_url"
                placeholder={
                  locale === "en"
                    ? "https://example.tokko.com"
                    : "https://ejemplo.tokko.com"
                }
                value={formData.tokko_url}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
              <p className="text-xs text-slate-500 mt-1">
                {locale === "en"
                  ? "We'll extract your properties from here"
                  : "Extraeremos tus propiedades de aquí"}
              </p>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                {locale === "en" ? "Your WhatsApp" : "Tu WhatsApp"}
              </label>
              <input
                type="tel"
                name="whatsapp"
                placeholder={locale === "en" ? "+1 (555) 000-0000" : "+54 9 11 2520-2499"}
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
              <p className="text-xs text-slate-500 mt-1">
                {locale === "en"
                  ? "We'll contact you here when you have leads"
                  : "Te contactaremos aquí cuando tengas leads"}
              </p>
            </div>

            {/* Property Count */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                {locale === "en"
                  ? "How many properties do you manage?"
                  : "¿Cuántas propiedades administras?"}
              </label>
              <input
                type="number"
                name="property_count"
                placeholder={locale === "en" ? "e.g., 250" : "ej. 250"}
                value={formData.property_count}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                {locale === "en" ? "Location / City" : "Ubicación / Ciudad"}
              </label>
              <input
                type="text"
                name="location"
                placeholder={locale === "en" ? "e.g., Buenos Aires" : "ej. Buenos Aires"}
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.tokko_url}
              className="w-full bg-[#075E54] text-white py-3 rounded-lg font-semibold hover:bg-[#064a42] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading
                ? locale === "en"
                  ? "Starting extraction..."
                  : "Iniciando extracción..."
                : locale === "en"
                  ? "Extract and create demo"
                  : "Extraer y crear demo"}
            </button>
          </form>

          {/* Already have a demo? */}
          <div className="text-center mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              {locale === "en" ? "Already extracted?" : "¿Ya extrajiste?"}
            </p>
            <Link
              href={`/${locale}/demo/chat`}
              className="text-[#075E54] font-semibold hover:underline"
            >
              {locale === "en" ? "Go to demo" : "Ir al demo"}
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500 mt-8">
          {locale === "en"
            ? "Your data is encrypted and stored securely"
            : "Tus datos están encriptados y almacenados de forma segura"}
        </p>
      </div>
    </div>
  );
}
