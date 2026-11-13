import { useState, useRef, useEffect } from 'react'
import { Search, ShoppingBag, Menu, X, ChevronDown, ArrowUpRight } from 'lucide-react'
import { getCapBrands } from '../lib/brands'
import { isProductSoldOut } from '../lib/stock'
import { categoryHasSizes } from '../lib/categories'
import type { Product } from '../types/database.types'

interface NavbarProps {
  cartCount: number
  onOpenCart: () => void
  onSelectCategory?: (category: string) => void
  onSelectProduct?: (product: Product) => void
  products?: Product[]
  activeCategory?: string
}

export const Navbar = ({
  cartCount,
  onOpenCart,
  onSelectCategory,
  onSelectProduct,
  products = [],
  activeCategory = 'todos',
}: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [capsDropdownOpen, setCapsDropdownOpen] = useState(false)
  const [mobileCapsOpen, setMobileCapsOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const capBrands = getCapBrands(products)

  // Estados de navegación activa
  const currentCatLower = (activeCategory || 'todos').toLowerCase().trim()
  const isNovedadesActive = currentCatLower === 'todos' || !currentCatLower
  const isRopaActive =
    currentCatLower === 'ropa' ||
    currentCatLower === 'playeras' ||
    currentCatLower === 'hoodies' ||
    categoryHasSizes(currentCatLower)
  const isGorrasActive = currentCatLower.startsWith('gorras')
  const isAccesoriosActive = currentCatLower === 'accesorios'

  // Cerrar búsqueda al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        if (!searchQuery) {
          setSearchOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchQuery])

  // Filtrado de búsqueda universal
  const cleanQuery = searchQuery.trim().toLowerCase()
  const searchResults = cleanQuery
    ? products.filter((p) => {
        const title = (p.title || '').toLowerCase()
        const brand = (p.brand || '').toLowerCase()
        const category = (p.category || '').toLowerCase()
        const specs = (p.specs || '').toLowerCase()
        const tag = (p.tag || '').toLowerCase()
        const desc = (p.description || '').toLowerCase()
        return (
          title.includes(cleanQuery) ||
          brand.includes(cleanQuery) ||
          category.includes(cleanQuery) ||
          specs.includes(cleanQuery) ||
          tag.includes(cleanQuery) ||
          desc.includes(cleanQuery)
        )
      })
    : []

  const handleSelectSearchResult = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product)
    }
    setSearchOpen(false)
    setSearchQuery('')
    setMobileMenuOpen(false)
  }

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
          <nav className="hidden md:flex items-center space-x-8 text-sm tracking-wide">
            <button
              onClick={() => handleNavClick('todos')}
              className={`transition-colors cursor-pointer ${
                isNovedadesActive
                  ? 'text-[#D4FF00] font-bold'
                  : 'text-gray-300 hover:text-[#D4FF00] font-medium'
              }`}
            >
              Novedades
            </button>
            <button
              onClick={() => handleNavClick('ropa')}
              className={`transition-colors cursor-pointer ${
                isRopaActive
                  ? 'text-[#D4FF00] font-bold'
                  : 'text-gray-300 hover:text-[#D4FF00] font-medium'
              }`}
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
                className={`flex items-center gap-1.5 transition-colors cursor-pointer py-2 ${
                  isGorrasActive
                    ? 'text-[#D4FF00] font-bold'
                    : 'text-gray-300 hover:text-[#D4FF00] font-medium'
                }`}
              >
                <span>Gorras</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    capsDropdownOpen || isGorrasActive ? 'text-[#D4FF00]' : ''
                  } ${capsDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {capsDropdownOpen && (
                <div className="absolute top-full left-0 w-60 pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-[#121212] border border-[#262626] shadow-2xl py-2 px-1 backdrop-blur-md rounded-none">
                    <button
                      onClick={() => handleNavClick('gorras')}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                        activeCategory === 'gorras'
                          ? 'bg-[#D4FF00] text-black font-bold'
                          : 'text-white hover:text-black hover:bg-[#D4FF00]'
                      }`}
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
                      {capBrands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => handleNavClick(brand.id)}
                          className={`w-full text-left px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-between group ${
                            activeCategory === brand.id
                              ? 'text-[#D4FF00] font-bold bg-[#1a1a1a]'
                              : 'text-gray-300 hover:text-[#D4FF00] hover:bg-[#1a1a1a]'
                          }`}
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
              className={`transition-colors cursor-pointer ${
                isAccesoriosActive
                  ? 'text-[#D4FF00] font-bold'
                  : 'text-gray-300 hover:text-[#D4FF00] font-medium'
              }`}
            >
              Accesorios
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-5 text-gray-200">
            {/* Search Toggle & Live Results Dropdown */}
            <div className="relative" ref={searchContainerRef}>
              {searchOpen ? (
                <div className="flex items-center bg-[#151515] border border-[#2a2a2a] focus-within:border-[#D4FF00] rounded-sm px-2.5 py-1.5 transition-colors">
                  <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setSearchOpen(false)
                        setSearchQuery('')
                      }
                      if (e.key === 'Enter' && searchResults.length > 0) {
                        handleSelectSearchResult(searchResults[0])
                      }
                    }}
                    placeholder="Buscar producto o marca..."
                    className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-40 sm:w-64 font-mono"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="text-gray-400 hover:text-white ml-1 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Buscar producto"
                  className="p-1 hover:text-[#D4FF00] transition-colors cursor-pointer"
                >
                  <Search className="w-5 h-5 stroke-[1.75]" />
                </button>
              )}

              {/* Floating Live Search Dropdown */}
              {searchOpen && cleanQuery && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#111111] border border-[#2b2b2b] shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#222222] bg-[#0c0c0c] text-[10px] font-mono uppercase tracking-wider text-gray-400">
                    <span>RESULTADOS ({searchResults.length})</span>
                    {searchResults.length > 0 && (
                      <span className="text-[#D4FF00]">Clic para abrir prenda</span>
                    )}
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="p-5 text-center space-y-1">
                      <p className="text-xs font-mono text-gray-300">
                        No se encontraron prendas para "{searchQuery}"
                      </p>
                      <p className="text-[11px] font-mono text-gray-500">
                        Prueba con Hoodie, Playera, Gorra o el nombre de una marca.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#1c1c1c] scrollbar-thin">
                      {searchResults.slice(0, 6).map((product) => {
                        const isSoldOut = isProductSoldOut(product)
                        return (
                          <div
                            key={product.id}
                            onClick={() => handleSelectSearchResult(product)}
                            className="flex items-center gap-3 p-2.5 hover:bg-[#181818] cursor-pointer transition-colors group"
                          >
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="w-12 h-12 object-cover bg-black border border-[#222] shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/product-cap-black.jpg'
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-bold text-white group-hover:text-[#D4FF00] truncate">
                                  {product.title}
                                </h4>
                                <span className="text-xs font-mono font-bold text-white shrink-0">
                                  ${product.price.toLocaleString('es-MX')}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono text-gray-400">
                                {product.brand && (
                                  <span className="text-[#D4FF00] font-semibold">{product.brand}</span>
                                )}
                                {product.brand && <span>·</span>}
                                <span className="uppercase">{product.category}</span>
                                {isSoldOut ? (
                                  <span className="text-red-400 font-bold ml-auto">AGOTADO</span>
                                ) : (
                                  <span className="text-gray-500 ml-auto flex items-center gap-0.5 group-hover:text-[#D4FF00]">
                                    Ver <ArrowUpRight className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Icon with Counter */}
            <button
              onClick={onOpenCart}
              aria-label="Carrito de compras"
              className="p-1 flex items-center space-x-1.5 hover:text-[#D4FF00] transition-colors relative group cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              <span className="font-mono text-xs font-semibold">({cartCount})</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 hover:text-[#D4FF00] transition-colors cursor-pointer"
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
          {/* Mobile Universal Search */}
          <div className="relative">
            <div className="flex items-center bg-[#151515] border border-[#2a2a2a] px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar prendas, marcas..."
                className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-white ml-1 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Results */}
            {cleanQuery && (
              <div className="mt-2 bg-[#141414] border border-[#2b2b2b] divide-y divide-[#202020] max-h-60 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-center text-xs font-mono text-gray-400">
                    No encontramos prendas para "{searchQuery}"
                  </div>
                ) : (
                  searchResults.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectSearchResult(p)}
                      className="p-2.5 flex items-center gap-2.5 hover:bg-[#1a1a1a] cursor-pointer"
                    >
                      <img src={p.image_url} alt={p.title} className="w-10 h-10 object-cover bg-black shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{p.title}</p>
                        <p className="text-[10px] font-mono text-gray-400">
                          {p.brand ? `${p.brand} · ` : ''}${p.price} MXN
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-3 font-mono text-sm uppercase tracking-wider">
            <button
              onClick={() => handleNavClick('todos')}
              className={`text-left py-1 transition-colors ${
                isNovedadesActive
                  ? 'text-[#D4FF00] font-bold'
                  : 'text-gray-300 hover:text-[#D4FF00]'
              }`}
            >
              {isNovedadesActive ? '• ' : ''}Novedades
            </button>
            <button
              onClick={() => handleNavClick('ropa')}
              className={`text-left py-1 transition-colors ${
                isRopaActive
                  ? 'text-[#D4FF00] font-bold'
                  : 'text-gray-300 hover:text-[#D4FF00]'
              }`}
            >
              {isRopaActive ? '• ' : ''}Ropa (Toda la colección)
            </button>

            {/* Mobile Gorras Accordion */}
            <div>
              <button
                onClick={() => setMobileCapsOpen(!mobileCapsOpen)}
                className={`w-full flex items-center justify-between text-left py-1 transition-colors ${
                  isGorrasActive
                    ? 'text-[#D4FF00] font-bold'
                    : 'text-gray-300 hover:text-[#D4FF00]'
                }`}
              >
                <span>{isGorrasActive ? '• ' : ''}Gorras</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileCapsOpen || isGorrasActive ? 'rotate-180 text-[#D4FF00]' : ''
                  }`}
                />
              </button>

              {mobileCapsOpen && (
                <div className="pl-4 py-2 space-y-2.5 border-l border-[#262626] my-1 ml-1 text-xs">
                  <button
                    onClick={() => handleNavClick('gorras')}
                    className={`block text-left font-bold ${
                      activeCategory === 'gorras' ? 'text-[#D4FF00]' : 'text-white hover:text-[#D4FF00]'
                    }`}
                  >
                    • Ver todas las gorras
                  </button>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest pt-1 font-semibold">
                    Por marca:
                  </div>
                  {capBrands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleNavClick(brand.id)}
                      className={`block text-left pl-2 cursor-pointer ${
                        activeCategory === brand.id
                          ? 'text-[#D4FF00] font-bold'
                          : 'text-gray-400 hover:text-[#D4FF00]'
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('accesorios')}
              className={`text-left py-1 transition-colors ${
                isAccesoriosActive
                  ? 'text-[#D4FF00] font-bold'
                  : 'text-gray-300 hover:text-[#D4FF00]'
              }`}
            >
              {isAccesoriosActive ? '• ' : ''}Accesorios
            </button>
          </div>
          <div className="pt-4 border-t border-[#222] flex items-center justify-between text-xs font-mono text-gray-400">
            <span>NUEVA COLECCIÓN DISPONIBLE</span>
            <span>MÉXICO / MXN $</span>
          </div>
        </div>
      )}
    </header>
  )
}

