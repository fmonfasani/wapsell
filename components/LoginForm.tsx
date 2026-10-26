"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { Input } from "./Input";
import { colors } from "@/lib/design-tokens";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("auth.login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
        throw new Error(data.detail || t("error_login"));
      }

      router.push("/demo");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("error_generic")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        error={error && formData.email === "" ? t("email_required") : ""}
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
        error={error && formData.password === "" ? t("password_required") : ""}
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

      {/* Links */}
      <div className="flex items-center justify-between text-sm">
        <Link
          href="/auth/recover"
          style={{ color: colors.primary.orange }}
          className="hover:underline font-medium"
        >
          {t("forgot_password")}
        </Link>
        <span style={{ color: colors.neutral.text_secondary }}>
          {t("no_account")}{" "}
          <Link
            href="/auth/register"
            style={{ color: colors.primary.orange }}
            className="hover:underline font-semibold"
          >
            {t("register_link")}
          </Link>
        </span>
      </div>
    </form>
  );
}
