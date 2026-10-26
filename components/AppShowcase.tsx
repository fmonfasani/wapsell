"use client";

import { useTranslations } from "next-intl";
import { colors } from "@/lib/design-tokens";

export function AppShowcase() {
  const t = useTranslations("showcase");

  return (
    <section
      className="w-full py-20 px-4 relative overflow-hidden"
      style={{ backgroundColor: colors.neutral.light }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2
            className="font-bold text-4xl"
            style={{ color: colors.neutral.text_primary }}
          >
            {t("title")}
          </h2>
          <p
            className="text-xl max-w-2xl mx-auto"
            style={{ color: colors.neutral.text_secondary }}
          >
            {t("subtitle")}
          </p>
        </div>

        {/* Phone Mockups */}
        <div className="relative h-96 flex items-center justify-center">
          {/* Phone 1 - Messaging (Left) */}
          <div
            className="absolute left-0 md:left-8 z-30 w-64 rounded-3xl shadow-xl overflow-hidden transform -rotate-6"
            style={{
              backgroundColor: colors.primary.orange,
              maxHeight: "500px",
            }}
          >
            <div
              className="p-4 rounded-2xl m-3"
              style={{ backgroundColor: "#000", color: "#fff", height: "100%" }}
            >
              <div className="space-y-4">
                <div className="text-sm font-bold opacity-80">
                  {t("chat_label")}
                </div>
                <div className="space-y-2 text-xs">
                  <div
                    className="p-2 rounded-lg w-4/5 text-white"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    Hola, ¿cómo estás?
                  </div>
                  <div
                    className="p-2 rounded-lg w-3/5 ml-auto"
                    style={{ backgroundColor: colors.secondary.blue }}
                  >
                    ¡Muy bien! 😊
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phone 2 - Payments (Center-Right) */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 z-20 w-64 rounded-3xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: colors.secondary.blue,
              maxHeight: "500px",
            }}
          >
            <div
              className="p-4 rounded-2xl m-3"
              style={{ backgroundColor: "#fff", color: colors.neutral.text_primary }}
            >
              <div className="space-y-4">
                <div className="text-sm font-bold">
                  {t("payment_label")}
                </div>
                <div className="space-y-3 text-sm">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: colors.accent.green,
                      color: "#fff",
                    }}
                  >
                    ✓ Pago procesado
                  </div>
                  <div className="text-xs opacity-60">
                    Monto: $1,500
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phone 3 - Analytics (Right) */}
          <div
            className="absolute right-0 md:right-8 z-10 w-64 rounded-3xl shadow-lg overflow-hidden transform rotate-6"
            style={{
              backgroundColor: colors.accent.green,
              maxHeight: "500px",
            }}
          >
            <div
              className="p-4 rounded-2xl m-3"
              style={{ backgroundColor: "#fff", color: colors.neutral.text_primary }}
            >
              <div className="space-y-4">
                <div className="text-sm font-bold">
                  {t("analytics_label")}
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span>Conversiones:</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: colors.primary.orange,
                        width: "45%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Points */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: colors.primary.orange }}
            >
              24/7
            </div>
            <p style={{ color: colors.neutral.text_secondary }}>
              {t("feature_24_7")}
            </p>
          </div>
          <div className="text-center">
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: colors.secondary.blue }}
            >
              100+
            </div>
            <p style={{ color: colors.neutral.text_secondary }}>
              {t("feature_integrations")}
            </p>
          </div>
          <div className="text-center">
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: colors.accent.green }}
            >
              500ms
            </div>
            <p style={{ color: colors.neutral.text_secondary }}>
              {t("feature_response")}
            </p>
          </div>
          <div className="text-center">
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: colors.primary.orange }}
            >
              99.9%
            </div>
            <p style={{ color: colors.neutral.text_secondary }}>
              {t("feature_uptime")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
