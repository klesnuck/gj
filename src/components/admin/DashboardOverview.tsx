import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  MapPin,
  Truck,
  ArrowUpRight,
  PackageCheck,
  Flame,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { Product, Order } from '../../types/database.types'

interface DashboardOverviewProps {
  products: Product[]
  orders: Order[]
  onNavigateToTab: (tab: string) => void
  onAddNewProduct: () => void
}

export const DashboardOverview = ({
  products,
  orders,
  onNavigateToTab,
  onAddNewProduct,
}: DashboardOverviewProps) => {
  // Calculate dynamic sales by product from real orders
  const salesByProductKey: Record<string, { unitsSold: number; revenue: number }> = {}
  orders.forEach((o) => {
    o.items?.forEach((it) => {
      const key = (it.title || '').trim().toLowerCase()
      if (!salesByProductKey[key]) {
        salesByProductKey[key] = { unitsSold: 0, revenue: 0 }
      }
      salesByProductKey[key].unitsSold += it.quantity || 1
      salesByProductKey[key].revenue += (it.price || 0) * (it.quantity || 1)
    })
  })

  // Dynamic top sellers ranking based on real orders or featured products
  const topSellers = products
    .map((p) => {
      const key = (p.title || '').trim().toLowerCase()
      const sales = salesByProductKey[key] || { unitsSold: 0, revenue: 0 }
      return {
        product: p,
        unitsSold: sales.unitsSold,
        revenue: sales.revenue,
      }
    })
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 4)
    .map((item, _, arr) => {
      const maxUnits = arr[0]?.unitsSold || 1
      return {
        ...item,
        percentage: item.unitsSold > 0 ? Math.round((item.unitsSold / maxUnits) * 100) : 0,
      }
    })

  // Low stock items: real items from database with stock <= 5
  const lowStockItems = products
    .filter((p) => (p.stock ?? 0) <= 5)
    .map((p) => {
      const stockVal = p.stock ?? 0
      return {
        id: p.id,
        title: p.title,
        variant: `${p.category.toUpperCase()} · ${p.brand || 'GJ'}`,
        remaining: stockVal,
        max: Math.max(stockVal * 3, 20),
        image: p.image_url,
        category: p.category,
      }
    })

  const recentOrders = orders.slice(0, 5)
  const saltilloOrdersCount = orders.filter((o) => o.shippingType === 'saltillo_local').length
  const paqueteriaOrdersCount = orders.filter((o) => o.shippingType === 'paqueteria_nacional').length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalUnitsSold = orders.reduce(
    (sum, o) => sum + (o.items ? o.items.reduce((acc, it) => acc + (it.quantity || 1), 0) : 0),
    0
  )
  const avgUnitsPerCart = orders.length > 0 ? (totalUnitsSold / orders.length).toFixed(1) : '0'

  return (
    <div className="space-y-8 text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase block mb-1">
            PANEL DE CONTROL · GJ STORE
          </span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white font-extrabold leading-none">
            RESUMEN GENERAL
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onAddNewProduct}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#D4FF00]/15 cursor-pointer"
          >
            <span>+ NUEVO PRODUCTO</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 bg-[#101010] border border-[#202020] space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase">
            <span>Ingresos Totales</span>
            <TrendingUp className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="font-display text-3xl sm:text-4xl text-white font-black tracking-tight">
            ${totalRevenue.toLocaleString('es-MX')}{' '}
            <span className="text-xs font-mono font-normal text-gray-400">MXN</span>
          </div>
          <div className="text-[11px] font-mono text-[#D4FF00]">
            {orders.length > 0 ? `${orders.length} pedidos registrados` : 'En espera del primer pedido'}
          </div>
        </div>

        {/* Orders Count */}
        <div className="p-5 bg-[#101010] border border-[#202020] space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase">
            <span>Pedidos Recientes</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-display text-3xl sm:text-4xl text-white font-black tracking-tight">
            {orders.length}
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            <span className="text-[#D4FF00] font-bold">{saltilloOrdersCount}</span> Saltillo ·{' '}
            <span className="text-blue-400 font-bold">{paqueteriaOrdersCount}</span> Paquetería
          </div>
        </div>

        {/* Units Sold */}
        <div className="p-5 bg-[#101010] border border-[#202020] space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase">
            <span>Prendas Vendidas</span>
            <PackageCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-display text-3xl sm:text-4xl text-white font-black tracking-tight">
            {totalUnitsSold} <span className="text-xs font-mono font-normal text-gray-400">piezas</span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            Promedio de {avgUnitsPerCart} piezas por carrito
          </div>
        </div>

        {/* Low Stock Warning Counter */}
        <div className="p-5 bg-[#151108] border border-yellow-700/40 space-y-2">
          <div className="flex items-center justify-between text-yellow-400 text-xs font-mono uppercase">
            <span>Alerta de Stock</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
          <div className="font-display text-3xl sm:text-4xl text-yellow-300 font-black tracking-tight">
            {lowStockItems.length}{' '}
            <span className="text-xs font-mono font-normal text-yellow-400">artículos críticos</span>
          </div>
          <div className="text-[11px] font-mono text-yellow-400/80">
            {lowStockItems.length > 0 ? 'Stock menor o igual a 5 unidades' : 'Inventario con stock suficiente'}
          </div>
        </div>
      </div>

      {/* 2-Columns Grid: Top Sellers & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: LO QUE MÁS SE VENDE (7 Cols) */}
        <div className="lg:col-span-7 bg-[#101010] border border-[#202020] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-sm bg-[#1c2409] text-[#D4FF00] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white">
                  LO QUE MÁS SE VENDE
                </h3>
                <span className="text-[10px] font-mono text-gray-500">Ranking por unidades vendidas</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('productos')}
              className="text-xs font-mono text-[#D4FF00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver catálogo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List of Top Selling Items */}
          <div className="space-y-4">
            {topSellers.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-gray-500 bg-[#121212] border border-[#1f1f1f]">
                No hay productos en el catálogo todavía.
              </div>
            ) : (
              topSellers.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#141414] border border-[#222222] hover:border-[#333] transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="font-display text-2xl text-gray-500 w-6 text-center">
                      0{idx + 1}
                    </span>
                    <img
                      src={item.product?.image_url || '/images/product-hoodie.jpg'}
                      alt={item.product?.title}
                      className="w-12 h-12 object-cover bg-black border border-[#262626] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white font-sans truncate">
                        {item.product?.title}
                      </div>
                      <div className="text-[11px] font-mono text-gray-400">
                        {item.unitsSold} vendidas ·{' '}
                        <span className="text-[#D4FF00] font-semibold">
                          ${item.revenue.toLocaleString('es-MX')} MXN
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-28 shrink-0 space-y-1 text-right">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">Demanda</span>
                    <div className="w-full h-1.5 bg-[#252525] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D4FF00]"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: POCO STOCK (5 Cols) */}
        <div className="lg:col-span-5 bg-[#101010] border border-[#202020] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-sm bg-yellow-950/60 text-yellow-400 border border-yellow-800/40 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white">
                  POCO STOCK RESTANTE
                </h3>
                <span className="text-[10px] font-mono text-gray-500">Próximo a agotarse</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-gray-500 bg-[#121212] border border-[#1f1f1f]">
                Todo el inventario cuenta con stock suficiente.
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#15120a] border border-yellow-800/30 rounded-none space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 object-cover bg-black border border-[#282828]"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white font-sans">{item.title}</h4>
                        <p className="text-[10px] text-gray-400 font-mono">{item.variant}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-yellow-400 text-black font-mono font-black text-[10px] uppercase">
                      {item.remaining} PIEZAS
                    </span>
                  </div>

                  <div className="w-full h-1 bg-[#282212] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${(item.remaining / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigateToTab('productos')}
              className="text-xs font-mono text-[#D4FF00] hover:underline"
            >
              Administrar inventario completo →
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section: PEDIDOS MÁS RECIENTES (Full Width Feed) */}
      <div className="bg-[#101010] border border-[#202020] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#161616] text-[#D4FF00] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white">
                PEDIDOS MÁS RECIENTES
              </h3>
              <span className="text-[10px] font-mono text-gray-500">Últimas transacciones registradas</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('pedidos')}
            className="text-xs font-mono text-[#D4FF00] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver los {orders.length} pedidos</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#222222] text-gray-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">PEDIDO</th>
                <th className="py-2.5 px-3">CLIENTE</th>
                <th className="py-2.5 px-3">TIPO DE ENVÍO</th>
                <th className="py-2.5 px-3">FECHA</th>
                <th className="py-2.5 px-3">ESTADO</th>
                <th className="py-2.5 px-3 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1b1b]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 font-mono text-xs">
                    No hay pedidos registrados en la base de datos todavía.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#141414] transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{order.orderNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-sans text-white font-semibold block">
                      {order.customerName}
                    </span>
                    <span className="text-[10px] text-gray-500">{order.customerPhone}</span>
                  </td>
                  <td className="py-3 px-3">
                    {order.shippingType === 'saltillo_local' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#182109] text-[#D4FF00] border border-[#2b3b12] text-[10px] font-bold uppercase">
                        <MapPin className="w-3 h-3 text-[#D4FF00]" />
                        Saltillo Local
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-950/40 text-blue-400 border border-blue-900/40 text-[10px] font-bold uppercase">
                        <Truck className="w-3 h-3" />
                        Paquetería Nacional
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-gray-400">{order.createdAt}</td>
                  <td className="py-3 px-3">
                    {order.status === 'entregado' && (
                      <span className="text-gray-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        Entregado
                      </span>
                    )}
                    {order.status === 'en_camino' && (
                      <span className="text-blue-400 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        En camino
                      </span>
                    )}
                    {order.status === 'pendiente' && (
                      <span className="text-yellow-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#D4FF00]">
                    ${order.total.toLocaleString('es-MX')} MXN
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
