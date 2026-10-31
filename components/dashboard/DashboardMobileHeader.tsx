"use client";

interface DashboardMobileHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function DashboardMobileHeader({
  sidebarOpen,
  onToggleSidebar,
}: DashboardMobileHeaderProps) {
  return (
    <div className="h-16 px-4 flex items-center justify-between">
      {/* Menu button */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <svg
          className="w-6 h-6 text-neutral-900"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          W
        </div>
        <span className="font-semibold text-neutral-900">Wapsell</span>
      </div>

      {/* Notifications placeholder */}
      <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors relative">
        <svg
          className="w-6 h-6 text-neutral-900"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
      </button>
    </div>
  );
}
