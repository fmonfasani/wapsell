"use client";

import { useState } from "react";

interface DashboardHeaderProps {
  selectedBusiness: string;
  onBusinessChange: (business: string) => void;
}

const businesses = [
  { id: "todos", name: "Todos los negocios", count: 3 },
  { id: "ormart", name: "Otra Ronda Más", count: 150 },
  { id: "coffee", name: "Coffee House", count: 89 },
  { id: "retail", name: "Retail Store", count: 45 },
];

export function DashboardHeader({
  selectedBusiness,
  onBusinessChange,
}: DashboardHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentBusiness = businesses.find((b) => b.id === selectedBusiness);

  return (
    <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="px-6 md:px-8 py-6 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 text-sm">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Business selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-neutral-200 hover:border-brand-300 hover:bg-brand-50 transition-colors bg-white text-neutral-900 font-medium text-sm"
            >
              <span>{currentBusiness?.name || "Seleccionar"}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
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

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden z-20">
                <div className="max-h-80 overflow-y-auto">
                  {businesses.map((business) => (
                    <button
                      key={business.id}
                      onClick={() => {
                        onBusinessChange(business.id);
                        setDropdownOpen(false);
                      }}
                      className={`
                        w-full text-left px-4 py-3 flex items-center justify-between
                        transition-colors border-b border-neutral-100 last:border-b-0
                        ${
                          selectedBusiness === business.id
                            ? "bg-brand-50"
                            : "hover:bg-neutral-50"
                        }
                      `}
                    >
                      <div>
                        <div className="font-medium text-neutral-900">
                          {business.name}
                        </div>
                        <div className="text-xs text-neutral-600">
                          {business.count} transacciones
                        </div>
                      </div>
                      {selectedBusiness === business.id && (
                        <span className="text-brand-600 font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User avatar button */}
          <button className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center hover:bg-brand-700 transition-colors">
            FM
          </button>
        </div>
      </div>
    </div>
  );
}
