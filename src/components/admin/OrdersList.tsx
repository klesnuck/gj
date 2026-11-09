import { useState } from 'react'
import { ShoppingBag, CheckCircle2, Clock, Truck, Search } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  customer: string
  email: string
  itemsCount: number
  total: number
  status: 'completado' | 'en_camino' | 'pendiente'
  paymentMethod: string
  date: string
}

export const OrdersList = () => {
  const [search, setSearch] = useState('')

  // 8 Orders reflecting the badge '08' in the user's admin screenshot
  const initialOrders: Order[] = [
    {
      id: 'ord-101',
      orderNumber: '#GJ-2026-008',
      customer: 'Mateo González',
      email: 'mateo@gmail.com',
      itemsCount: 2,
      total: 2198,
      status: 'en_camino',
      paymentMethod: 'Mercado Pago',
      date: 'Hoy, 18:42',
    },
    {
      id: 'ord-102',
      orderNumber: '#GJ-2026-007',
      customer: 'Valeria Solís',
      email: 'valeria.s@hotmail.com',
      itemsCount: 1,
      total: 1499,
      status: 'completado',
      paymentMethod: 'Tarjeta (Visa)',
      date: 'Hoy, 14:15',
    },
    {
      id: 'ord-103',
      orderNumber: '#GJ-2026-006',
      customer: 'Carlos Romero',
      email: 'carlos.r@gmail.com',
      itemsCount: 3,
      total: 2947,
      status: 'completado',
      paymentMethod: 'Mercado Pago',
      date: 'Ayer, 21:03',
    },
    {
      id: 'ord-104',
      orderNumber: '#GJ-2026-005',
      customer: 'Esteban Reyes',
      email: 'esteban@reyes.mx',
      itemsCount: 1,
      total: 699,
      status: 'completado',
      paymentMethod: 'Tarjeta (Mastercard)',
      date: 'Ayer, 16:30',
    },
    {
      id: 'ord-105',
      orderNumber: '#GJ-2026-004',
      customer: 'Andrea Morales',
      email: 'andrea.m@outlook.com',
      itemsCount: 2,
      total: 2398,
      status: 'en_camino',
      paymentMethod: 'Mercado Pago',
      date: '07 Nov, 12:10',
    },
    {
      id: 'ord-106',
      orderNumber: '#GJ-2026-003',
      customer: 'Diego Fernández',
      email: 'diego.fdz@gmail.com',
      itemsCount: 1,
      total: 899,
      status: 'completado',
      paymentMethod: 'Mercado Pago',
      date: '06 Nov, 19:45',
    },
    {
      id: 'ord-107',
      orderNumber: '#GJ-2026-002',
      customer: 'Sofía Navarro',
      email: 'sofia.n@gmail.com',
      itemsCount: 1,
      total: 749,
      status: 'completado',
      paymentMethod: 'Tarjeta (Visa)',
      date: '05 Nov, 11:20',
    },
    {
      id: 'ord-108',
      orderNumber: '#GJ-2026-001',
      customer: 'Rodrigo Peña',
      email: 'rodrigo.p@gmail.com',
      itemsCount: 2,
      total: 2248,
      status: 'pendiente',
      paymentMethod: 'OXXO / SPEI',
      date: '04 Nov, 09:12',
    },
  ]

  const filtered = initialOrders.filter(
    (o) =>
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#D4FF00]/15 text-[#D4FF00] font-mono text-[10px] font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" />
            Completado
          </span>
        )
      case 'en_camino':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-blue-500/15 text-blue-400 font-mono text-[10px] font-bold uppercase">
            <Truck className="w-3 h-3" />
            En camino
          </span>
        )
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-yellow-500/15 text-yellow-400 font-mono text-[10px] font-bold uppercase">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase block mb-1">
            GESTIÓN DE VENTAS
          </span>
          <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white font-extrabold leading-none">
            PEDIDOS (08)
          </h2>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, pedido..."
            className="w-full bg-[#131313] border border-[#242424] focus:border-[#D4FF00] pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#101010] border border-[#202020] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#222222] bg-[#141414] text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">PEDIDO</th>
                <th className="py-3 px-4">CLIENTE</th>
                <th className="py-3 px-4">FECHA</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-4">MÉTODO</th>
                <th className="py-3 px-4 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1b1b]">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-[#141414] transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                    <span>{order.orderNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white font-sans font-semibold">{order.customer}</div>
                    <div className="text-[10px] text-gray-500">{order.email}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{order.date}</td>
                  <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                  <td className="py-3 px-4 text-gray-300">{order.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#D4FF00]">
                    ${order.total.toLocaleString('es-MX')} MXN
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
