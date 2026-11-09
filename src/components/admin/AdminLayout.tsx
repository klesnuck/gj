import { useState, type ReactNode } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  ArrowUpRight,
  Sliders,
  Menu,
  X,
} from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
  onBackToStore: () => void
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export const AdminLayout = ({
  children,
  onBackToStore,
  activeTab = 'productos',
  onTabChange,
}: AdminLayoutProps) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const navItems = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
    { id: 'productos', label: 'Productos', icon: Package, active: true },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, badge: '08' },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'descuentos', label: 'Descuentos', icon: Tag },
  ]

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col md:flex-row antialiased selection:bg-[#D4FF00] selection:text-black">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0d0d0d] border-b border-[#1c1c1c]">
        <div className="flex items-center space-x-2">
          <span className="font-display text-2xl font-black text-white">gj.</span>
          <span className="text-[10px] font-mono uppercase text-gray-400">ADMIN</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1 text-gray-400 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-[#0a0a0a] border-r border-[#1a1a1a] p-5 flex flex-col justify-between transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 pb-3 border-b border-[#181818]">
            <span className="font-display text-4xl tracking-tighter font-extrabold text-white leading-none">
              gj.
            </span>
            <div className="flex flex-col text-[10px] font-mono uppercase tracking-widest font-bold text-gray-400 leading-tight">
              <span>CLOTHING</span>
              <span>AND CAPS</span>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase block px-2">
              GESTIÓN DE TIENDA
            </span>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id || item.active
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange?.(item.id)
                      setMobileSidebarOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-all duration-150 ${
                      isActive
                        ? 'bg-[#182109] text-[#D4FF00] border-l-2 border-[#D4FF00] font-bold'
                        : 'text-gray-400 hover:text-white hover:bg-[#121212]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 stroke-[1.8]" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-[#1a1a1a] text-gray-400 border border-[#2b2b2b] rounded-sm font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Secondary Actions */}
          <div className="pt-4 border-t border-[#181818] space-y-1">
            <button
              onClick={onBackToStore}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-gray-400 hover:text-[#D4FF00] uppercase tracking-wider transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ArrowUpRight className="w-4 h-4" />
                <span>Ver tienda</span>
              </div>
            </button>

            <button
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-gray-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Sliders className="w-4 h-4" />
                <span>Configuración</span>
              </div>
            </button>
          </div>

        </div>

        {/* Promo / Drop Widget Bottom Box */}
        <div className="p-4 bg-[#0f0f0f] border border-[#202020] rounded-none space-y-2">
          <div className="text-[10px] font-mono text-[#D4FF00] font-bold uppercase tracking-widest">
            GJ / VOL. 004
          </div>
          <div className="font-display text-lg uppercase text-white font-extrabold leading-tight">
            EL SIGUIENTE DROP EMPIEZA AQUÍ.
          </div>
          <p className="text-[10px] font-mono text-gray-500 uppercase">
            Tu catálogo. Tus reglas.
          </p>
        </div>

      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Top Bar */}
        <header className="h-16 bg-[#0a0a0a] border-b border-[#181818] px-6 flex items-center justify-between">
          <div className="text-xs font-mono text-gray-400">
            Productos <span className="text-gray-600">/</span> <span className="text-white">Nuevo producto</span>
          </div>

          {/* Admin Avatar Badge */}
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest hidden sm:inline">
              ADMINISTRACIÓN
            </span>
            <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#2b2b2b] flex items-center justify-center text-xs font-mono font-black text-[#D4FF00]">
              GJ
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>

      </div>

    </div>
  )
}

