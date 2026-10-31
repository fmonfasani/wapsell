"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
  acceptTerms?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "es";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

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
    if (fieldErrors[name as keyof FormErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Por favor ingresa un email válido";
    }

    // Password validation
    if (!formData.password || formData.password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "La contraseña debe contener una mayúscula";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "La contraseña debe contener un número";
    }

    // Password confirmation
    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = "Las contraseñas no coinciden";
    }

    // Terms acceptance
    if (!acceptTerms) {
      errors.acceptTerms = "Debes aceptar los términos y condiciones";
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
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Error al registrarse");
      }

      const data = await response.json();

      // Store JWT token and user data from successful registration
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("wapsell_token", data.accessToken);
      }

      if (data.cliente) {
        localStorage.setItem("user", JSON.stringify(data.cliente));
        localStorage.setItem("empresaId", data.cliente.empresaId || "");
      }

      // Show success message and redirect
      setSuccessMessage("¡Registro exitoso! Redirigiendo...");
      setTimeout(() => {
        router.push("/demo");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
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
          <p className="text-neutral-600">Crea tu cuenta en segundos</p>
        </div>

        {/* Registration Card */}
        <Card shadow="md">
          <CardHeader
            title="Crear Cuenta"
            description="Regístrate para acceder a Wapsell"
          />

          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Alert */}
              {successMessage && (
                <div className="alert alert-success">
                  ✓ {successMessage}
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="alert alert-error">
                  ⚠️ {error}
                </div>
              )}

              {/* Name Input */}
              <Input
                type="text"
                name="name"
                label="Nombre completo"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                error={fieldErrors.name}
              />

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
                error={fieldErrors.email}
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
                error={fieldErrors.password}
                helper="Mínimo 8 caracteres, 1 mayúscula, 1 número"
              />

              {/* Confirm Password Input */}
              <Input
                type="password"
                name="password_confirm"
                label="Confirmar Contraseña"
                placeholder="••••••••"
                value={formData.password_confirm}
                onChange={handleChange}
                required
                disabled={loading}
                error={fieldErrors.password_confirm}
              />

              {/* Privacy Agreement */}
              <label className="flex items-start gap-3 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4"
                />
                <span>
                  Acepto los{" "}
                  <Link href="/terms" className="text-brand-600 hover:text-brand-700 font-medium">
                    términos de servicio
                  </Link>{" "}
                  y la{" "}
                  <Link href="/privacy" className="text-brand-600 hover:text-brand-700 font-medium">
                    política de privacidad
                  </Link>
                </span>
              </label>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
              >
                Crear Cuenta
              </Button>
            </form>
          </CardBody>

          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-neutral-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-semibold">
                Inicia sesión aquí
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
