"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { Input } from "./Input";
import { colors } from "@/lib/design-tokens";

export function RecoverForm() {
  const t = useTranslations("auth.recover");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [resetData, setResetData] = useState({
    code: "",
    password: "",
    password_confirm: "",
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiBase}/auth/recover-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t("error_email"));
      }

      setSuccess(t("success_email_sent"));
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (resetData.password !== resetData.password_confirm) {
      setError(t("error_password_mismatch"));
      return;
    }

    if (resetData.password.length < 8) {
      setError(t("error_password_min"));
      return;
    }

    setLoading(true);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiBase}/auth/recover-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: resetData.code,
          password: resetData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t("error_reset"));
      }

      setSuccess(t("success_password_reset"));
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div className="space-y-2">
            <h2
              className="text-xl font-semibold"
              style={{ color: colors.neutral.text_primary }}
            >
              {t("email_step_title")}
            </h2>
            <p
              style={{ color: colors.neutral.text_secondary }}
              className="text-sm"
            >
              {t("email_step_subtitle")}
            </p>
          </div>

          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            label={t("email_label")}
            placeholder={t("email_placeholder")}
            disabled={loading}
            required
            error={error && email === "" ? t("email_required") : ""}
          />

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

          {success && (
            <div
              className="p-4 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: "#DCFCE7",
                color: colors.accent.green,
                borderLeft: `4px solid ${colors.accent.green}`,
              }}
              role="alert"
            >
              {success}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={loading}
            className="w-full"
          >
            {t("email_submit")}
          </Button>

          <div className="text-center text-sm">
            <span style={{ color: colors.neutral.text_secondary }}>
              {t("remember_password")}{" "}
            </span>
            <Link
              href="/auth/login"
              style={{ color: colors.primary.orange }}
              className="hover:underline font-semibold"
            >
              {t("back_to_login")}
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} className="space-y-6">
          <div className="space-y-2">
            <h2
              className="text-xl font-semibold"
              style={{ color: colors.neutral.text_primary }}
            >
              {t("reset_step_title")}
            </h2>
            <p
              style={{ color: colors.neutral.text_secondary }}
              className="text-sm"
            >
              {t("reset_step_subtitle")}
            </p>
          </div>

          <Input
            id="code"
            type="text"
            value={resetData.code}
            onChange={(e) => {
              setResetData((prev) => ({ ...prev, code: e.target.value }));
              setError(null);
            }}
            label={t("code_label")}
            placeholder={t("code_placeholder")}
            disabled={loading}
            required
          />

          <Input
            id="password"
            type="password"
            value={resetData.password}
            onChange={(e) => {
              setResetData((prev) => ({ ...prev, password: e.target.value }));
              setError(null);
            }}
            label={t("password_label")}
            placeholder={t("password_placeholder")}
            disabled={loading}
            required
          />

          <Input
            id="password_confirm"
            type="password"
            value={resetData.password_confirm}
            onChange={(e) => {
              setResetData((prev) => ({ ...prev, password_confirm: e.target.value }));
              setError(null);
            }}
            label={t("password_confirm_label")}
            placeholder={t("password_confirm_placeholder")}
            disabled={loading}
            required
          />

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

          {success && (
            <div
              className="p-4 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: "#DCFCE7",
                color: colors.accent.green,
                borderLeft: `4px solid ${colors.accent.green}`,
              }}
              role="alert"
            >
              {success}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={loading}
            className="w-full"
          >
            {t("reset_submit")}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
                setSuccess(null);
              }}
              style={{ color: colors.primary.orange }}
              className="hover:underline font-semibold"
            >
              {t("back_to_email")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
