"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
  acceptTerms?: string;
}

interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  children?: ReactNode;
}

export function RegisterForm({
  onSuccess,
  onError,
  children,
}: RegisterFormProps) {
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
    // Clear field error when user starts typing
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

    // Email validation with RFC 5322 simplified pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Por favor ingresa un email válido";
    }

    // Password validation: min 8 chars, 1 uppercase, 1 number
    if (!formData.password || formData.password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "La contraseña debe contener una mayúscula";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "La contraseña debe contener un número";
    }

    // Password confirmation validation
    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = "Las contraseñas no coinciden";
    }

    // Terms acceptance validation
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

      // Store JWT token and user data
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("wapsell_token", data.accessToken);
      }

      if (data.cliente) {
        localStorage.setItem("user", JSON.stringify(data.cliente));
        localStorage.setItem("empresaId", data.cliente.empresaId || "");
      }

      // Show success message
      setSuccessMessage("¡Registro exitoso! Redirigiendo...");
      setFormData({
        name: "",
        email: "",
        password: "",
        password_confirm: "",
      });
      setAcceptTerms(false);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al registrarse";
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Alert */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm font-medium animate-pulse">
          <span className="inline-block mr-2">✓</span>
          {successMessage}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm font-medium">
          <span className="inline-block mr-2">⚠️</span>
          {error}
        </div>
      )}

      {/* Children content (custom content can be inserted) */}
      {children}

      {/* Name Input */}
      <Input
        type="text"
        name="name"
        label="Nombre completo"
        placeholder="Juan Pérez"
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
        helper="Usaremos este email para tu cuenta"
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
        label="Confirmar contraseña"
        placeholder="••••••••"
        value={formData.password_confirm}
        onChange={handleChange}
        required
        disabled={loading}
        error={fieldErrors.password_confirm}
      />

      {/* Terms and Privacy Checkbox */}
      <div className="flex items-start gap-3 py-2">
        <input
          type="checkbox"
          id="accept-terms"
          checked={acceptTerms}
          onChange={(e) => {
            setAcceptTerms(e.target.checked);
            if (fieldErrors.acceptTerms) {
              setFieldErrors((prev) => ({
                ...prev,
                acceptTerms: undefined,
              }));
            }
          }}
          disabled={loading}
          className="mt-1 w-4 h-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <label
          htmlFor="accept-terms"
          className="text-sm text-neutral-600 leading-relaxed cursor-pointer flex-1"
        >
          Acepto los{" "}
          <Link
            href="/terms"
            className="text-brand-600 hover:text-brand-700 font-medium underline"
            target="_blank"
          >
            Términos y Condiciones
          </Link>
          {" "}y la{" "}
          <Link
            href="/privacy"
            className="text-brand-600 hover:text-brand-700 font-medium underline"
            target="_blank"
          >
            Política de Privacidad
          </Link>
        </label>
      </div>

      {/* Terms Error */}
      {fieldErrors.acceptTerms && (
        <p className="text-sm text-red-600 font-medium">
          {fieldErrors.acceptTerms}
        </p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        loading={loading}
        disabled={loading || !acceptTerms}
      >
        {loading ? "Creando cuenta..." : "Registrarse"}
      </Button>
    </form>
  );
}
