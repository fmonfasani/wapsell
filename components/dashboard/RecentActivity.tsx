"use client";

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "order",
      actor: "Almacén Don Pedro",
      action: "realizó un pedido",
      details: "Pack de 6 Bebidas - $125.50",
      timestamp: "Hace 2 horas",
      icon: "🛒",
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: 2,
      type: "payment",
      actor: "Martín González",
      action: "realizó un pago",
      details: "$500.00 recibidos",
      timestamp: "Hace 4 horas",
      icon: "💳",
      color: "bg-green-100 text-green-700",
    },
    {
      id: 3,
      type: "customer",
      actor: "Lucía Fernández",
      action: "se registró como cliente",
      details: "Nuevo cliente agregado",
      timestamp: "Ayer",
      icon: "👤",
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: 4,
      type: "inventory",
      actor: "Sistema",
      action: "notifica stock bajo",
      details: "Bebida de Mango - 15 unidades",
      timestamp: "Ayer",
      icon: "⚠️",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      id: 5,
      type: "delivery",
      actor: "Sistema",
      action: "marcó entrega completada",
      details: "ORD-001 entregado",
      timestamp: "Hace 3 días",
      icon: "✓",
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">
          Actividad Reciente
        </h3>
      </div>

      <div className="divide-y divide-neutral-200">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-6 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex gap-4">
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${activity.color}`}
              >
                {activity.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-semibold text-neutral-900">
                    {activity.actor}
                  </p>
                  <p className="text-sm text-neutral-600">{activity.action}</p>
                </div>
                <p className="text-sm text-neutral-600 mt-1">
                  {activity.details}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  {activity.timestamp}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 flex items-center">
                <svg
                  className="w-5 h-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View all link */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
        <a
          href="/dashboard/activity"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Ver toda la actividad →
        </a>
      </div>
    </div>
  );
}
