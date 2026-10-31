"use client";

import { useState } from "react";

export function DashboardTables() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const orders = [
    {
      id: "ORD-001",
      customer: "Martín González",
      product: "Pack de 6 Bebidas",
      date: "2026-10-27",
      amount: "$125.50",
      status: "Entregado",
      statusColor: "bg-green-100 text-green-700",
    },
    {
      id: "ORD-002",
      customer: "Almacén Don Pedro",
      product: "Caja de Snacks (24u)",
      date: "2026-10-26",
      amount: "$89.00",
      status: "En Proceso",
      statusColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "ORD-003",
      customer: "Lucía Fernández",
      product: "Bebida Personalizada",
      date: "2026-10-26",
      amount: "$45.75",
      status: "Pendiente",
      statusColor: "bg-yellow-100 text-yellow-700",
    },
    {
      id: "ORD-004",
      customer: "Café La Esquina",
      product: "Lote de Café Premium",
      date: "2026-10-25",
      amount: "$234.99",
      status: "Entregado",
      statusColor: "bg-green-100 text-green-700",
    },
    {
      id: "ORD-005",
      customer: "Bar Central",
      product: "Surtido de Bebidas",
      date: "2026-10-25",
      amount: "$156.25",
      status: "Cancelado",
      statusColor: "bg-red-100 text-red-700",
    },
    {
      id: "ORD-006",
      customer: "Panadería Sol",
      product: "Productos Horneados",
      date: "2026-10-24",
      amount: "$98.50",
      status: "Entregado",
      statusColor: "bg-green-100 text-green-700",
    },
  ];

  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Orders */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Pedidos Recientes
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-brand-600">
                      {order.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {order.customer}
                      </p>
                      <p className="text-xs text-neutral-500">{order.product}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-neutral-900">
                      {order.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${order.statusColor}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-sm text-neutral-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Top Clientes
          </h3>
        </div>

        <div className="divide-y divide-neutral-200">
          {[
            {
              name: "Almacén Don Pedro",
              purchases: 24,
              total: "$2,450.00",
              avatar: "DP",
              color: "bg-yellow-100 text-yellow-700",
            },
            {
              name: "Café La Esquina",
              purchases: 18,
              total: "$1,890.50",
              avatar: "CE",
              color: "bg-blue-100 text-blue-700",
            },
            {
              name: "Bar Central",
              purchases: 15,
              total: "$1,567.75",
              avatar: "BC",
              color: "bg-purple-100 text-purple-700",
            },
            {
              name: "Martín González",
              purchases: 12,
              total: "$945.25",
              avatar: "MG",
              color: "bg-green-100 text-green-700",
            },
            {
              name: "Panadería Sol",
              purchases: 10,
              total: "$785.00",
              avatar: "PS",
              color: "bg-orange-100 text-orange-700",
            },
          ].map((customer, idx) => (
            <div key={idx} className="p-4 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${customer.color}`}
                  >
                    {customer.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {customer.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {customer.purchases} compras
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-neutral-900">
                  {customer.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
