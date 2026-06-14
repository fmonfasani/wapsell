"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/lib/useAuth";
import { BRAND } from "@/lib/constants";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const demoCta = locale === "en" ? "Try the demo" : "Probar demo";

  // Hide the marketing navbar on the immersive chat and the internal console.
  if (pathname?.includes("/demo/chat") || pathname?.includes("/ventas")) return null;

  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur border-b border-cream-300">
      <nav className="section flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-baseline gap-1.5 font-display font-semibold text-xl text-ink"
        >
          <span>{BRAND.name}</span>
          <span aria-hidden className="text-amber text-sm tracking-tighter">
            {BRAND.symbol}
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-5 md:gap-7">
          <Link
            href="/demo-tour"
            className="hidden sm:inline text-sm font-medium text-ink hover:text-amber transition-colors"
          >
            {t("nav.product")}
          </Link>
          <Link
            href="/demo-tour#precios"
            className="hidden sm:inline text-sm font-medium text-ink hover:text-amber transition-colors"
          >
            {t("nav.pricing")}
          </Link>
          <LanguageSwitcher />

          {loading ? (
            <div className="w-10 h-10 rounded-full bg-cream-200 animate-pulse" />
          ) : user ? (
            <>
              {/* Demo link for authenticated users */}
              <Link
                href="/demo"
                className="text-sm font-medium text-ink hover:text-amber transition-colors"
              >
                {t("nav.demo")}
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cream transition"
                >
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user.email[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-ink hidden sm:inline max-w-[150px] truncate">
                    {user.email}
                  </span>
                  <svg
                    className={`w-4 h-4 text-ink transition ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-cream rounded-lg shadow-lg border border-cream-300 z-50">
                    <div className="p-3 border-b border-cream-300">
                      <p className="text-xs text-ink/60">Conectado como</p>
                      <p className="text-sm font-semibold text-ink truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-amber hover:bg-cream-200 transition"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Login-free demo: the primary nav CTA drives to the live chat. */
            <Link
              href="/demo/chat"
              className="btn-primary !h-10 !px-5 text-sm font-semibold"
            >
              {demoCta}
            </Link>
          )}
        </div>
      </nav>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
