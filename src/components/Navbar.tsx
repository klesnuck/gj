import { useState } from 'react'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'

interface NavbarProps {
  cartCount: number
  onOpenCart: () => void
  onSelectCategory?: (category: string) => void
  onOpenAdmin?: () => void
}

export const Navbar = ({ cartCount, onOpenCart, onSelectCategory, onOpenAdmin }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleNavClick = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category)
    }
    setMobileMenuOpen(false)
    const element = document.getElementById('catalogo')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090909]/95 backdrop-blur-md border-b border-[#1c1c1c] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Brand Logo with Mascot */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-full bg-[#141414] border border-[#2b2b2b] group-hover:border-[#D4FF00] flex items-center justify-center overflow-hidden transition-all duration-300 shadow-inner shrink-0">
              <img
                src="/images/gj-mascot-avatar.png"
                alt="gj. mascot"
                className="w-full h-full object-cover object-top scale-125 translate-y-1 group-hover:scale-135 transition-transform duration-300"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#D4FF00] rounded-full border border-black"></span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl sm:text-5xl tracking-tighter font-extrabold text-white group-hover:text-[#D4FF00] transition-colors leading-none">
                gj.
              </span>

            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <button
              onClick={() => handleNavClick('todos')}
              className="text-[#D4FF00] hover:text-white transition-colors cursor-pointer font-medium"
            >
              Novedades
            </button>
            <button
              onClick={() => handleNavClick('playeras')}
              className="text-gray-300 hover:text-[#D4FF00] transition-colors cursor-pointer"
            >
              Ropa
            </button>
            <button
              onClick={() => handleNavClick('gorras')}
              className="text-gray-300 hover:text-[#D4FF00] transition-colors cursor-pointer"
            >
              Gorras
            </button>
            <button
              onClick={() => handleNavClick('accesorios')}
              className="text-gray-300 hover:text-[#D4FF00] transition-colors cursor-pointer"
            >
              Accesorios
            </button>
            <a
              href="#manifiesto"
              className="text-gray-300 hover:text-[#D4FF00] transition-colors"
            >
              Universo GJ
            </a>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-5 text-gray-200">
            {/* Search Toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-[#151515] border border-[#2a2a2a] rounded-sm px-2 py-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar producto..."
                    className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-32 sm:w-48 font-mono"
                    autoFocus
                  />
                  <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-white ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Buscar"
                  className="p-1 hover:text-[#D4FF00] transition-colors"
                >
                  <Search className="w-5 h-5 stroke-[1.75]" />
                </button>
              )}
            </div>

            {/* Account / Admin Button */}
            <button
              onClick={onOpenAdmin}
              aria-label="Panel de Administración"
              title="Panel de Administración"
              className="p-1 hover:text-[#D4FF00] transition-colors hidden sm:flex items-center gap-1.5 group cursor-pointer"
            >
              <User className="w-5 h-5 stroke-[1.75]" />
              <span className="hidden lg:inline text-[10px] font-mono tracking-wider text-gray-400 group-hover:text-[#D4FF00] uppercase font-bold">
                ADMIN
              </span>
            </button>

            {/* Cart Icon with Counter */}
            <button
              onClick={onOpenCart}
              aria-label="Carrito de compras"
              className="p-1 flex items-center space-x-1.5 hover:text-[#D4FF00] transition-colors relative group"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              <span className="font-mono text-xs font-semibold">({cartCount})</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 hover:text-[#D4FF00] transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e0e0e] border-b border-[#222222] px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 font-mono text-sm uppercase tracking-wider">
            <button
              onClick={() => handleNavClick('todos')}
              className="text-left text-[#D4FF00] font-bold py-1"
            >
              • Novedades
            </button>
            <button
              onClick={() => handleNavClick('playeras')}
              className="text-left text-gray-300 hover:text-[#D4FF00] py-1"
            >
              Ropa
            </button>
            <button
              onClick={() => handleNavClick('gorras')}
              className="text-left text-gray-300 hover:text-[#D4FF00] py-1"
            >
              Gorras
            </button>
            <button
              onClick={() => handleNavClick('accesorios')}
              className="text-left text-gray-300 hover:text-[#D4FF00] py-1"
            >
              Accesorios
            </button>
            <a
              href="#manifiesto"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left text-gray-300 hover:text-[#D4FF00] py-1"
            >
              Universo GJ
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenAdmin?.()
              }}
              className="text-left text-[#D4FF00] font-bold py-1 border-t border-[#222] pt-2"
            >
              ⚙ Panel de Administración
            </button>
          </div>
          <div className="pt-4 border-t border-[#222] flex items-center justify-between text-xs font-mono text-gray-400">
            <span>DROP 004 DISPONIBLE</span>
            <span>MÉXICO / MXN $</span>
          </div>
        </div>
      )}
    </header>
  )
}

