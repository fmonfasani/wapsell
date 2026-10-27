"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Error al iniciar sesión");
      }

      const data = await response.json();

      // Store JWT token and user data from successful login
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("wapsell_token", data.accessToken);
      }

      if (data.cliente) {
        localStorage.setItem("user", JSON.stringify(data.cliente));
        localStorage.setItem("empresaId", data.cliente.empresaId || "");
      }

      router.push("/demo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Wapsell</h1>
          <p className="text-neutral-600">Gestiona tus ventas en WhatsApp</p>
        </div>

        {/* Login Card */}
        <Card shadow="md">
          <CardHeader
            title="Inicia Sesión"
            description="Accede a tu cuenta para continuar"
          />

          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="alert alert-error">
                  ⚠️ {error}
                </div>
              )}

              {/* Email Input */}
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                helper="Ingresa el email de tu cuenta"
              />

              {/* Password Input */}
              <Input
                type="password"
                name="password"
                label="Contraseña"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
              >
                Inicia Sesión
              </Button>
            </form>
          </CardBody>

          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-neutral-600">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/register" className="text-brand-600 hover:text-brand-700 font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-600 mt-8">
          ¿Preguntas? Contacta con{" "}
          <a href="mailto:support@wapsell.com" className="text-brand-600 hover:text-brand-700 font-medium">
            support@wapsell.com
          </a>
        </p>
      </div>
    </div>
  );
}
