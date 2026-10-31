"use client";

export function DashboardCharts() {
  // Sample chart data
  const salesData = [
    { day: "Lun", sales: 4000, orders: 240 },
    { day: "Mar", sales: 3000, orders: 221 },
    { day: "Mié", sales: 2000, orders: 229 },
    { day: "Jue", sales: 2780, orders: 200 },
    { day: "Vie", sales: 1890, orders: 229 },
    { day: "Sáb", sales: 2390, orders: 200 },
    { day: "Dom", sales: 3490, orders: 210 },
  ];

  const maxSales = Math.max(...salesData.map((d) => d.sales));
  const maxOrders = Math.max(...salesData.map((d) => d.orders));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales Chart */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">
          Ventas por Día
        </h3>
        <div className="h-64 flex items-flex-end justify-around gap-2 pb-4">
          {salesData.map((data, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative h-full w-full flex items-flex-end justify-center">
                {/* Bar background */}
                <div className="absolute inset-0 bg-neutral-100 rounded-t opacity-30"></div>
                {/* Bar */}
                <div
                  className="bg-gradient-to-t from-brand-600 to-brand-400 rounded-t w-full"
                  style={{
                    height: `${(data.sales / maxSales) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-neutral-600">
                {data.day}
              </span>
              <span className="text-xs text-neutral-500">${data.sales / 1000}k</span>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">
          Pedidos por Día
        </h3>
        <div className="space-y-4">
          {salesData.map((data, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutral-600 w-12">
                {data.day}
              </span>
              <div className="flex-1 bg-neutral-100 rounded-full h-8 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                  style={{
                    width: `${(data.orders / maxOrders) * 100}%`,
                  }}
                >
                  {(data.orders / maxOrders) * 100 > 20 && (
                    <span className="text-xs font-semibold text-white">
                      {data.orders}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-neutral-900 w-12 text-right">
                {data.orders}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">
          Top Categorías
        </h3>
        <div className="space-y-4">
          {[
            { name: "Bebidas", value: 35, color: "bg-brand-600" },
            { name: "Snacks", value: 28, color: "bg-blue-500" },
            { name: "Postres", value: 22, color: "bg-green-500" },
            { name: "Comida Rápida", value: 15, color: "bg-yellow-500" },
          ].map((cat, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-900">
                  {cat.name}
                </span>
                <span className="text-sm font-semibold text-neutral-600">
                  {cat.value}%
                </span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`${cat.color} h-full rounded-full`}
                  style={{ width: `${cat.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">
          Desempeño Reciente
        </h3>
        <div className="space-y-4">
          {[
            { metric: "Ingresos Totales", value: "$45,231", change: "+14.2%" },
            {
              metric: "Ticket Promedio",
              value: "$89.50",
              change: "+2.1%",
            },
            {
              metric: "Clientes Nuevos",
              value: "28",
              change: "+8.5%",
            },
            {
              metric: "Devoluciones",
              value: "3",
              change: "-1.2%",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <span className="text-sm font-medium text-neutral-900">
                {item.metric}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-neutral-900">
                  {item.value}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    item.change.startsWith("+")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
