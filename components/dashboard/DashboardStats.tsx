"use client";

const stats = [
  {
    label: "Ventas Hoy",
    value: "$12,450",
    change: "+12.5%",
    trend: "up",
    icon: "📊",
    bgColor: "bg-brand-50",
  },
  {
    label: "Pedidos Pendientes",
    value: "24",
    change: "+3",
    trend: "down",
    icon: "🛒",
    bgColor: "bg-blue-50",
  },
  {
    label: "Clientes Activos",
    value: "156",
    change: "+8.2%",
    trend: "up",
    icon: "👥",
    bgColor: "bg-green-50",
  },
  {
    label: "Tasa de Conversión",
    value: "3.24%",
    change: "+0.5%",
    trend: "up",
    icon: "📈",
    bgColor: "bg-yellow-50",
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
            <div
              className={`text-sm font-semibold px-2 py-1 rounded ${
                stat.trend === "up"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {stat.change}
            </div>
          </div>
          <p className="text-neutral-600 text-sm font-medium">{stat.label}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
