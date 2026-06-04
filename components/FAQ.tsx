"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BRAND } from "@/lib/constants";

export function FAQ() {
  const t = useTranslations("faq");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const items = [
    { q: t("q1", { brand: BRAND.name }), a: t("a1", { brand: BRAND.name }) },
    { q: t("q2"), a: t("a2", { brand: BRAND.name }) },
    { q: t("q3"), a: t("a3", { brand: BRAND.name }) },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
    { q: t("q7"), a: t("a7", { brand: BRAND.name }) },
    { q: t("q8"), a: t("a8") },
  ];

  return (
    <section id="faq" className="bg-white py-24 md:py-32">
      <div className="section max-w-3xl">
        <div className="text-center mb-12">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight">
            {t("title")}
          </h2>
        </div>

        <ul className="divide-y divide-cream-300 border-t border-b border-cream-300">
          {items.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full text-left flex justify-between items-start gap-6 py-5 group"
                >
                  <span className="font-medium text-ink text-base md:text-lg group-hover:text-amber-hover transition-colors">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className={`text-amber text-xl leading-none mt-1 transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen ? (
                  <p className="pb-6 pr-10 text-ink-muted leading-relaxed">
                    {item.a}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
