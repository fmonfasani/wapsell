"use client";

import { useState } from "react";
import { setRequestLocale } from "next-intl/server";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardTables } from "@/components/dashboard/DashboardTables";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [selectedBusiness, setSelectedBusiness] = useState<string>("todos");

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <DashboardHeader
          selectedBusiness={selectedBusiness}
          onBusinessChange={setSelectedBusiness}
        />

        <main className="p-6 md:p-8 space-y-8">
          {/* Key Metrics */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
              Resumen General
            </h2>
            <DashboardStats />
          </section>

          {/* Charts & Analytics */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
              Análisis
            </h2>
            <DashboardCharts />
          </section>

          {/* Data Tables */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
              Datos Detallados
            </h2>
            <DashboardTables />
          </section>

          {/* Recent Activity */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
              Actividad Reciente
            </h2>
            <RecentActivity />
          </section>
        </main>
      </div>
    </DashboardLayout>
  );
}
