"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "es";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof FormErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name || formData.name.length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.email || !formData.email.includes("@")) {
      errors.email = "Email válido requerido";
    }

    if (!formData.password || formData.password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "La contraseña debe contener una mayúscula";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "La contraseña debe contener un número";
    }

    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = "Las contraseñas no coinciden";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Error al registrarse");
      }

      router.push(`/${locale}/app/onboarding`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Crear Cuenta
            </h1>
            <p className="text-slate-600">
              Regístrate para acceder a Wapsell
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${
                  fieldErrors.name
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300"
                }`}
                placeholder="Tu nombre"
                disabled={loading}
              />
              {fieldErrors.name && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${
                  fieldErrors.email
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300"
                }`}
                placeholder="tu@email.com"
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${
                  fieldErrors.password
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300"
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Mínimo 8 caracteres, 1 mayúscula, 1 número
              </p>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${
                  fieldErrors.password_confirm
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300"
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              {fieldErrors.password_confirm && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.password_confirm}
                </p>
              )}
            </div>

            {/* Error general */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/auth/login"
              className="text-brand-600 hover:text-brand-700 font-semibold"
            >
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
