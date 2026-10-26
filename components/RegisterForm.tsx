"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { Input } from "./Input";
import { colors } from "@/lib/design-tokens";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "es";
  const t = useTranslations("auth.register");

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
    if (fieldErrors[name as keyof FormErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setError(null);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name || formData.name.length < 2) {
      errors.name = t("name_error");
    }

    if (!formData.email || !formData.email.includes("@")) {
      errors.email = t("email_error");
    }

    if (!formData.password || formData.password.length < 8) {
      errors.password = t("password_min_error");
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = t("password_uppercase_error");
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = t("password_number_error");
    }

    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = t("password_confirm_error");
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
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t("error_register"));
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("wapsell_token", data.token);
      }

      router.push(`/${locale}/app/onboarding`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <Input
        id="name"
        type="text"
        name="name"
        label={t("name_label")}
        placeholder={t("name_placeholder")}
        value={formData.name}
        onChange={handleChange}
        disabled={loading}
        required
        error={fieldErrors.name}
      />

      {/* Email */}
      <Input
        id="email"
        type="email"
        name="email"
        label={t("email_label")}
        placeholder={t("email_placeholder")}
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
        required
        error={fieldErrors.email}
      />

      {/* Password */}
      <Input
        id="password"
        type="password"
        name="password"
        label={t("password_label")}
        placeholder={t("password_placeholder")}
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
        required
        error={fieldErrors.password}
        helperText={t("password_helper")}
      />

      {/* Confirm Password */}
      <Input
        id="password_confirm"
        type="password"
        name="password_confirm"
        label={t("password_confirm_label")}
        placeholder={t("password_confirm_placeholder")}
        value={formData.password_confirm}
        onChange={handleChange}
        disabled={loading}
        required
        error={fieldErrors.password_confirm}
      />

      {/* Error Message */}
      {error && (
        <div
          className="p-4 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: "#FEE2E2",
            color: colors.semantic.error,
            borderLeft: `4px solid ${colors.semantic.error}`,
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        variant="primary"
        isLoading={loading}
        className="w-full"
      >
        {t("submit_button")}
      </Button>

      {/* Login Link */}
      <div className="text-center text-sm">
        <span style={{ color: colors.neutral.text_secondary }}>
          {t("has_account")}{" "}
        </span>
        <Link
          href="/auth/login"
          style={{ color: colors.primary.orange }}
          className="hover:underline font-semibold"
        >
          {t("login_link")}
        </Link>
      </div>
    </form>
  );
}
