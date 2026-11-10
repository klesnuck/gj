import { useState, useEffect } from 'react'
import {
  ShoppingBag,
  MapPin,
  Truck,
  Search,
  MessageCircle,
  Eye,
  X,
} from 'lucide-react'
import type { Order } from '../../types/database.types'

interface OrdersListProps {
  orders: Order[]
  onUpdateOrderStatus?: (orderId: string, newStatus: Order['status']) => void
}

export const OrdersList = ({ orders: initialOrders, onUpdateOrderStatus }: OrdersListProps) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [search, setSearch] = useState('')
  const [shippingFilter, setShippingFilter] = useState<'all' | 'saltillo_local' | 'paqueteria_nacional'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )
    onUpdateOrderStatus?.(orderId, status)
  }

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.shippingAddress.toLowerCase().includes(search.toLowerCase())
    const matchesShipping =
      shippingFilter === 'all' || o.shippingType === shippingFilter
    return matchesSearch && matchesShipping
  })

  const saltilloCount = orders.filter((o) => o.shippingType === 'saltillo_local').length
  const paqueteriaCount = orders.filter((o) => o.shippingType === 'paqueteria_nacional').length

  const getCleanPhone = (phone: string) => phone.replace(/[^0-9]/g, '')

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase block mb-1">
            LOGÍSTICA & DESPACHO
          </span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white font-extrabold leading-none">
            TODOS LOS PEDIDOS ({orders.length})
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, teléfono o dirección..."
            className="w-full bg-[#131313] border border-[#242424] focus:border-[#D4FF00] pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Shipping Type Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShippingFilter('all')}
          className={`px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${shippingFilter === 'all'
            ? 'bg-white text-black border-white font-bold'
            : 'bg-[#121212] text-gray-400 border-[#262626] hover:text-white hover:border-[#383838]'
            }`}
        >
          Todos los pedidos ({orders.length})
        </button>

        <button
          onClick={() => setShippingFilter('saltillo_local')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${shippingFilter === 'saltillo_local'
            ? 'bg-[#182109] text-[#D4FF00] border-[#D4FF00] font-bold shadow-md shadow-[#D4FF00]/10'
            : 'bg-[#121212] text-gray-300 border-[#262626] hover:border-[#D4FF00]/50'
            }`}
        >
          <MapPin className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span>📍 Entrega Local Saltillo ({saltilloCount})</span>
        </button>

        <button
          onClick={() => setShippingFilter('paqueteria_nacional')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${shippingFilter === 'paqueteria_nacional'
            ? 'bg-blue-950/60 text-blue-400 border-blue-400 font-bold'
            : 'bg-[#121212] text-gray-300 border-[#262626] hover:border-blue-400/50'
            }`}
        >
          <Truck className="w-3.5 h-3.5 text-blue-400" />
          <span>📦 Paquetería Nacional ({paqueteriaCount})</span>
        </button>
      </div>

      {/* Shipping Type Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShippingFilter('all')}
          className={`px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
            shippingFilter === 'all'
              ? 'bg-white text-black border-white font-bold'
              : 'bg-[#121212] text-gray-400 border-[#262626] hover:text-white hover:border-[#383838]'
          }`}
        >
          Todos los pedidos ({orders.length})
        </button>

        <button
          onClick={() => setShippingFilter('saltillo_local')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
            shippingFilter === 'saltillo_local'
              ? 'bg-[#182109] text-[#D4FF00] border-[#D4FF00] font-bold shadow-md shadow-[#D4FF00]/10'
              : 'bg-[#121212] text-gray-300 border-[#262626] hover:border-[#D4FF00]/50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span>📍 Entrega Local Saltillo ({saltilloCount})</span>
        </button>

        <button
          onClick={() => setShippingFilter('paqueteria_nacional')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
            shippingFilter === 'paqueteria_nacional'
              ? 'bg-blue-950/60 text-blue-400 border-blue-400 font-bold'
              : 'bg-[#121212] text-gray-300 border-[#262626] hover:border-blue-400/50'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-blue-400" />
          <span>📦 Paquetería Nacional ({paqueteriaCount})</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-[#101010] border border-[#202020] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#222222] bg-[#141414] text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">PEDIDO</th>
                <th className="py-3 px-4">CLIENTE / TELÉFONO</th>
                <th className="py-3 px-4">TIPO DE ENVÍO Y DESTINO</th>
                <th className="py-3 px-4">ARTÍCULOS</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-4 text-right">TOTAL</th>
                <th className="py-3 px-4 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1b1b]">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-[#141414] transition-colors">
                  {/* Order Number & Date */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#D4FF00]" />
                      <span>{order.orderNumber}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{order.createdAt}</div>
                    <div className="text-[10px] text-gray-400 font-sans mt-0.5">
                      {order.paymentMethod}
                    </div>
                  </td>

                  {/* Customer & Phone with direct WhatsApp */}
                  <td className="py-3 px-4">
                    <div className="font-sans font-bold text-white text-sm">
                      {order.customerName}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-300 font-mono text-[11px]">{order.customerPhone}</span>
                      <a
                        href={`https://wa.me/${getCleanPhone(order.customerPhone)}?text=Hola%20${encodeURIComponent(order.customerName)},%20te%20escribimos%20de%20gj.%20referente%20a%20tu%20pedido%20${order.orderNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Enviar WhatsApp al cliente"
                        className="inline-flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded hover:bg-emerald-900 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WA</span>
                      </a>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{order.customerEmail}</div>
                  </td>

                  {/* Shipping Type: Saltillo Local vs Paqueteria */}
                  <td className="py-3 px-4 max-w-xs">
                    {order.shippingType === 'saltillo_local' ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#182109] text-[#D4FF00] border border-[#2b3b12] text-[10px] font-bold uppercase">
                          <MapPin className="w-3 h-3 text-[#D4FF00]" />
                          📍 DENTRO DE SALTILLO
                        </span>
                        <p className="text-[11px] text-gray-300 font-sans leading-tight">
                          {order.shippingAddress}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-950/60 text-blue-400 border border-blue-800/60 text-[10px] font-bold uppercase">
                          <Truck className="w-3 h-3 text-blue-400" />
                          📦 ENVÍO POR PAQUETERÍA
                        </span>
                        <p className="text-[11px] text-gray-300 font-sans leading-tight">
                          {order.shippingAddress}
                        </p>
                      </div>
                    )}
                  </td>

                  {/* Items */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="text-[11px] text-gray-300 font-sans">
                          <span className="font-bold text-white">{it.quantity}x</span> {it.title}
                          {it.size && <span className="text-gray-500"> ({it.size})</span>}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Status dropdown */}
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                      className={`text-xs font-mono uppercase font-bold px-2.5 py-1.5 border focus:outline-none cursor-pointer ${order.status === 'entregado'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                        : order.status === 'en_camino'
                          ? 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                          : 'bg-yellow-950/40 text-yellow-400 border-yellow-800/40'
                        }`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_camino">En camino</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-[#D4FF00] text-sm font-mono block">
                      ${order.total.toLocaleString('es-MX')}
                    </span>
                    <span className="text-[10px] text-gray-500">MXN</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      title="Ver detalle del pedido"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1f1f1f] rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>

                  {/* Items */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="text-[11px] text-gray-300 font-sans">
                          <span className="font-bold text-white">{it.quantity}x</span> {it.title}
                          {it.size && <span className="text-gray-500"> ({it.size})</span>}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Status dropdown */}
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                      className={`text-xs font-mono uppercase font-bold px-2.5 py-1.5 border focus:outline-none cursor-pointer ${
                        order.status === 'entregado'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                          : order.status === 'en_camino'
                          ? 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                          : 'bg-yellow-950/40 text-yellow-400 border-yellow-800/40'
                      }`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_camino">En camino</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-[#D4FF00] text-sm font-mono block">
                      ${order.total.toLocaleString('es-MX')}
                    </span>
                    <span className="text-[10px] text-gray-500">MXN</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      title="Ver detalle del pedido"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1f1f1f] rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          <div className="relative bg-[#101010] border border-[#2b2b2b] max-w-lg w-full text-white p-6 sm:p-8 space-y-6 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#D4FF00]" />
                <h3 className="font-display text-2xl uppercase tracking-wider font-bold">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-gray-500 uppercase">Cliente</span>
                <div className="text-sm font-bold text-white font-sans">
                  {selectedOrder.customerName}
                </div>
                <div className="text-gray-300">{selectedOrder.customerPhone}</div>
                <div className="text-gray-400">{selectedOrder.customerEmail}</div>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#1f1f1f]">
                <span className="text-gray-500 uppercase">Tipo de Entrega</span>
                <div>
                  {selectedOrder.shippingType === 'saltillo_local' ? (
                    <span className="inline-block px-2 py-0.5 bg-[#182109] text-[#D4FF00] font-bold text-[10px] uppercase">
                      📍 Entrega Local (Saltillo, Coahuila)
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 bg-blue-950 text-blue-400 font-bold text-[10px] uppercase">
                      📦 Paquetería Nacional
                    </span>
                  )}
                </div>
                <p className="text-gray-300 font-sans text-xs mt-1">
                  {selectedOrder.shippingAddress}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#1f1f1f]">
                <span className="text-gray-500 uppercase">Prendas del Pedido</span>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-gray-200">
                      <span>
                        {it.quantity}x {it.title} {it.size && `(${it.size})`}
                      </span>
                      <span className="text-[#D4FF00] font-bold">
                        ${(it.price * it.quantity).toLocaleString('es-MX')} MXN
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#262626] text-sm">
                <span className="font-bold">TOTAL PAGADO</span>
                <span className="font-bold text-[#D4FF00] text-base">
                  ${selectedOrder.total.toLocaleString('es-MX')} MXN
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={`https://wa.me/${getCleanPhone(selectedOrder.customerPhone)}?text=Hola%20${encodeURIComponent(selectedOrder.customerName)},%20te%20escribimos%20de%20gj.%20para%20confirmar%20tu%20entrega.`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contactar por WhatsApp</span>
              </a>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-3 bg-[#181818] hover:bg-[#222] text-gray-300 font-mono text-xs uppercase transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
