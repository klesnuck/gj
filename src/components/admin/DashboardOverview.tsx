import {
  Package,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Boxes,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react'
import type { Product, Order } from '../../types/database.types'

interface DashboardOverviewProps {
  products: Product[]
  orders?: Order[]
  onNavigateToTab: (tab: string) => void
  onAddNewProduct: () => void
}

export const DashboardOverview = ({
  products,
  orders = [],
  onNavigateToTab,
  onAddNewProduct,
}: DashboardOverviewProps) => {
  // Metrics derived from products & orders
  const totalProducts = products.length
  const totalStock = products.reduce((acc, p) => acc + (p.stock ?? 0), 0)
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0)
  const totalOrders = orders.length

  // Low stock alert items (<= 5 units)
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

  return (
    <div className="space-y-8 text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase block mb-1">
            PANEL DE CONTROL · GJ STORE
          </span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white font-extrabold leading-none">
            INVENTARIO & CATÁLOGO
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onAddNewProduct}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#D4FF00]/15 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>NUEVO PRODUCTO</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Starts clean from 0) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="p-5 bg-[#101010] border border-[#202020] space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase">
            <span>Productos en Catálogo</span>
            <Package className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="font-display text-3xl sm:text-4xl text-white font-black tracking-tight">
            {totalProducts}{' '}
            <span className="text-xs font-mono font-normal text-gray-400">prendas</span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            {totalProducts === 0 ? 'Catálogo en 0 prendas' : `${totalProducts} prendas registradas`}
          </div>
        </div>

        {/* Orders Count */}
        <div className="p-5 bg-[#101010] border border-[#202020] space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase">
            <span>Pedidos Recibidos</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-display text-3xl sm:text-4xl text-white font-black tracking-tight">
            {totalOrders}
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            {totalOrders === 0 ? 'Esperando primer pedido' : `${totalOrders} pedidos en historial`}
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 bg-[#101010] border border-[#202020] space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase">
            <span>Ingresos Registrados</span>
            <TrendingUp className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="font-display text-3xl sm:text-4xl text-white font-black tracking-tight">
            ${totalRevenue.toLocaleString('es-MX')}{' '}
            <span className="text-xs font-mono font-normal text-gray-400">MXN</span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            {totalOrders === 0 ? '$0 MXN facturado' : `Total acumulado`}
          </div>
        </div>

        {/* Total Stock */}
        <div className="p-5 bg-[#101010] border border-[#202020] space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase">
            <span>Stock Global</span>
            <Boxes className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-display text-3xl sm:text-4xl text-white font-black tracking-tight">
            {totalStock}{' '}
            <span className="text-xs font-mono font-normal text-gray-400">unidades</span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            {lowStockItems.length > 0 ? (
              <span className="text-yellow-400 font-semibold">
                {lowStockItems.length} con stock bajo
              </span>
            ) : (
              'Inventario al 100%'
            )}
          </div>
        </div>
      </div>

      {/* 2-Columns Grid: Catálogo y Alerta de Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Catálogo de Productos (7 Cols) */}
        <div className="lg:col-span-7 bg-[#101010] border border-[#202020] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-sm bg-[#1c2409] text-[#D4FF00] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white">
                  PRENDAS EN CATÁLOGO
                </h3>
                <span className="text-[10px] font-mono text-gray-500">
                  {totalProducts} productos registrados en base de datos
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('productos')}
              className="text-xs font-mono text-[#D4FF00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Gestionar catálogo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="p-8 text-center bg-[#121212] border border-dashed border-[#222222] space-y-3">
                <Package className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="font-sans text-sm text-gray-300 font-bold uppercase">
                  No hay productos registrados
                </p>
                <p className="text-xs font-mono text-gray-500 max-w-sm mx-auto">
                  Tu base de datos está completamente limpia. Comienza agregando tus prendas reales.
                </p>
                <button
                  onClick={onAddNewProduct}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#D4FF00] text-black font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>AGREGAR PRIMER PRODUCTO</span>
                </button>
              </div>
            ) : (
              products.slice(0, 5).map((p, idx) => (
                <div
                  key={p.id}
                  className="p-3 bg-[#141414] border border-[#222222] hover:border-[#333] transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="font-display text-2xl text-gray-500 w-6 text-center">
                      0{idx + 1}
                    </span>
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-12 h-12 object-cover bg-black border border-[#262626] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white font-sans truncate">
                        {p.title}
                      </div>
                      <div className="text-[11px] font-mono text-gray-400">
                        {p.category.toUpperCase()} · ${p.price.toLocaleString('es-MX')} MXN · {p.stock ?? 0} disponibles
                      </div>
                    </div>
                  </div>

                  {p.is_featured && (
                    <span className="px-2 py-0.5 bg-[#D4FF00]/10 border border-[#D4FF00]/40 text-[#D4FF00] font-mono text-[9px] uppercase font-bold shrink-0">
                      EN PORTADA
                    </span>
                  )}
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
                <span className="text-[10px] font-mono text-gray-500">Próximo a agotarse (≤ 5 pzas)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-gray-500 bg-[#121212] border border-[#1f1f1f]">
                No hay productos en nivel crítico de inventario.
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
              className="text-xs font-mono text-[#D4FF00] hover:underline cursor-pointer"
            >
              Administrar inventario completo →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
