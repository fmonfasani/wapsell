"use client";

import { ReactNode, useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardMobileHeader } from "./DashboardMobileHeader";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar — hidden on mobile, visible on desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:bg-neutral-900 md:text-white">
        <DashboardSidebar />
      </div>

      {/* Mobile header with menu toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
        <DashboardMobileHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-neutral-900 text-white z-25">
            <DashboardSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="md:ml-64 flex-1 flex flex-col">
        {/* Add padding for mobile header */}
        <div className="md:hidden h-16" />

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
