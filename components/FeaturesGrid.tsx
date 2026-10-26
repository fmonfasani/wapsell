"use client";

import { useTranslations } from "next-intl";
import { colors } from "@/lib/design-tokens";

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

export function FeaturesGrid() {
  const t = useTranslations("features");

  const features: FeatureCard[] = [
    {
      icon: "💬",
      title: t("feature1_title"),
      description: t("feature1_desc"),
    },
    {
      icon: "💰",
      title: t("feature2_title"),
      description: t("feature2_desc"),
    },
    {
      icon: "📊",
      title: t("feature3_title"),
      description: t("feature3_desc"),
    },
  ];

  return (
    <section
      className="w-full py-20 px-4"
      style={{ backgroundColor: colors.neutral.light }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2
            className="font-bold text-4xl"
            style={{ color: colors.neutral.text_primary }}
          >
            {t("section_title")}
          </h2>
          <p
            className="text-xl max-w-2xl mx-auto"
            style={{ color: colors.neutral.text_secondary }}
          >
            {t("section_subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-xl transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: "white",
                border: `1px solid ${colors.neutral.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(217, 119, 87, 0.1)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div
                className="text-5xl mb-4"
                style={{ color: colors.primary.orange }}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: colors.neutral.text_primary }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className="leading-relaxed"
                style={{
                  color: colors.neutral.text_secondary,
                  fontSize: "0.95rem",
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
