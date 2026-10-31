"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardSidebarProps {
  onClose?: () => void;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "📊",
    badge: null,
  },
  {
    name: "Ventas",
    href: "/dashboard/sales",
    icon: "💰",
    badge: "3",
  },
  {
    name: "Inventario",
    href: "/dashboard/inventory",
    icon: "📦",
    badge: null,
  },
  {
    name: "Clientes",
    href: "/dashboard/customers",
    icon: "👥",
    badge: null,
  },
  {
    name: "Pedidos",
    href: "/dashboard/orders",
    icon: "🛒",
    badge: "5",
  },
  {
    name: "Reportes",
    href: "/dashboard/reports",
    icon: "📈",
    badge: null,
  },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    icon: "⚙️",
    badge: null,
  },
];

export function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              W
            </div>
            <span className="text-white font-semibold text-lg">Wapsell</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                transition-colors duration-150
                ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-neutral-700 px-4 py-4 space-y-3">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">
          <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            FM
          </div>
          <div className="text-left flex-1">
            <div className="text-sm font-medium text-white">Federico M.</div>
            <div className="text-xs text-neutral-400">Admin</div>
          </div>
        </button>

        <Link
          href="/dashboard/settings"
          className="w-full text-center px-4 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors text-sm font-medium"
        >
          Cerrar sesión
        </Link>
      </div>
    </div>
  );
}
