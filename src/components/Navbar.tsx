import { useState } from 'react'
import { Search, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react'

interface NavbarProps {
  cartCount: number
  onOpenCart: () => void
  onSelectCategory?: (category: string) => void
}

export const Navbar = ({ cartCount, onOpenCart, onSelectCategory }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [capsDropdownOpen, setCapsDropdownOpen] = useState(false)
  const [mobileCapsOpen, setMobileCapsOpen] = useState(false)

  const handleNavClick = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category)
    }
    setMobileMenuOpen(false)
    setCapsDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090909]/95 backdrop-blur-md border-b border-[#1c1c1c] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('todos')}
            className="flex items-center group cursor-pointer text-left"
          >
            <span className="font-display text-4xl sm:text-5xl tracking-tighter font-extrabold text-white group-hover:text-[#D4FF00] transition-colors leading-none">
              gj.
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <button
              onClick={() => handleNavClick('todos')}
              className="text-[#D4FF00] hover:text-white transition-colors cursor-pointer font-medium"
            >
              Novedades
            </button>
            <button
              onClick={() => handleNavClick('ropa')}
              className="text-gray-300 hover:text-[#D4FF00] transition-colors cursor-pointer"
            >
              Ropa
            </button>

            {/* Gorras with Brand Submenu Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCapsDropdownOpen(true)}
              onMouseLeave={() => setCapsDropdownOpen(false)}
            >
              <button
                onClick={() => setCapsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-gray-300 hover:text-[#D4FF00] transition-colors cursor-pointer py-2"
              >
                <span>Gorras</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    capsDropdownOpen ? 'rotate-180 text-[#D4FF00]' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {capsDropdownOpen && (
                <div className="absolute top-full left-0 w-60 pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-[#121212] border border-[#262626] shadow-2xl py-2 px-1 backdrop-blur-md rounded-none">
                    <button
                      onClick={() => handleNavClick('gorras')}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:text-black hover:bg-[#D4FF00] transition-colors flex items-center justify-between"
                    >
                      <span>TODAS LAS GORRAS</span>
                      <span className="text-[10px] opacity-80 font-normal">VER TODO</span>
                    </button>

                    <div className="my-1.5 border-t border-[#222222] px-3.5 pt-2 pb-1">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-semibold block">
                        POR MARCA
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {[
                        { id: 'gorras:gj', name: 'GJ Signature' },
                        { id: 'gorras:new era', name: 'New Era' },
                        { id: 'gorras:mitchell', name: 'Mitchell & Ness' },
                        { id: 'gorras:47', name: '47 Brand' },
                      ].map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => handleNavClick(brand.id)}
                          className="w-full text-left px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-[#D4FF00] hover:bg-[#1a1a1a] transition-colors flex items-center justify-between group"
                        >
                          <span>{brand.name}</span>
                          <span className="text-[10px] text-gray-400 group-hover:text-[#D4FF00] transition-colors">
                            →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('accesorios')}
              className="text-gray-300 hover:text-[#D4FF00] transition-colors cursor-pointer"
            >
              Accesorios
            </button>
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
              onClick={() => handleNavClick('ropa')}
              className="text-left text-gray-300 hover:text-[#D4FF00] py-1"
            >
              Ropa (Toda la colección)
            </button>

            {/* Mobile Gorras Accordion */}
            <div>
              <button
                onClick={() => setMobileCapsOpen(!mobileCapsOpen)}
                className="w-full flex items-center justify-between text-left text-gray-300 hover:text-[#D4FF00] py-1"
              >
                <span>Gorras</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileCapsOpen ? 'rotate-180 text-[#D4FF00]' : ''
                  }`}
                />
              </button>

              {mobileCapsOpen && (
                <div className="pl-4 py-2 space-y-2.5 border-l border-[#262626] my-1 ml-1 text-xs">
                  <button
                    onClick={() => handleNavClick('gorras')}
                    className="block text-left text-white hover:text-[#D4FF00] font-bold"
                  >
                    • Ver todas las gorras
                  </button>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest pt-1 font-semibold">
                    Por marca:
                  </div>
                  {[
                    { id: 'gorras:gj', name: 'GJ Signature' },
                    { id: 'gorras:new era', name: 'New Era' },
                    { id: 'gorras:mitchell', name: 'Mitchell & Ness' },
                    { id: 'gorras:47', name: '47 Brand' },
                  ].map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleNavClick(brand.id)}
                      className="block text-left text-gray-400 hover:text-[#D4FF00] pl-2"
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('accesorios')}
              className="text-left text-gray-300 hover:text-[#D4FF00] py-1"
            >
              Accesorios
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

