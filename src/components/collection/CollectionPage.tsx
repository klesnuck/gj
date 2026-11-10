import React, { useState } from 'react'
import { ArrowLeft, Plus, Check, Filter } from 'lucide-react'
import { AnnouncementBar } from '../AnnouncementBar'
import { Navbar } from '../Navbar'
import { Footer } from '../Footer'
import type { Product } from '../../types/database.types'
import { resolveColorHex } from '../../lib/colors'

interface CollectionPageProps {
  products: Product[]
  activeCategory: string
  onSelectCategory: (category: string) => void
  onAddToCart: (product: Product, selectedColor?: string, selectedSize?: string) => void
  onSelectProduct: (product: Product) => void
  onBackToHome: () => void
  cartCount: number
  onOpenCart: () => void
  onOpenAdmin?: () => void
}

export const CollectionPage: React.FC<CollectionPageProps> = ({
  products,
  activeCategory,
  onSelectCategory,
  onAddToCart,
  onSelectProduct,
  onBackToHome,
  cartCount,
  onOpenCart,
  onOpenAdmin,
}) => {
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})
  const [addedAnimation, setAddedAnimation] = useState<string | null>(null)

  const isRopa = activeCategory.toLowerCase() === 'ropa'
  const isGorra = activeCategory.toLowerCase().startsWith('gorras')
  const isAccesorios = activeCategory.toLowerCase() === 'accesorios'

  // Determine Title & Subtitle
  let collectionTitle = 'CATÁLOGO'
  let collectionTag = 'COLECCIÓN / DROP 004'
  let collectionDesc = 'Explora la selección completa de streetwear.'

  if (isRopa) {
    collectionTitle = 'ROPA'
    collectionTag = 'COLECCIÓN COMPLETA / APPAREL'
    collectionDesc = 'Playeras heavyweight, sudaderas pesadas de 450 g y siluetas con corte boxy/relaxed.'
  } else if (isGorra) {
    collectionTitle = 'GORRAS'
    collectionTag = 'HEADWEAR / DROP 004'
    collectionDesc = 'Siluetas insignia GJ, snapbacks, modelos 59FIFTY y coronas desestructuradas por marca.'
  } else if (isAccesorios) {
    collectionTitle = 'ACCESORIOS'
    collectionTag = 'COMPLEMENTOS / DROP 004'
    collectionDesc = 'Calcetines pesados crew, mosquetones tácticos y accesorios utilitarios para tu fit.'
  }

  const handleColorClick = (productId: string, color: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedColors((prev) => ({ ...prev, [productId]: color }))
  }

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    const color = selectedColors[product.id] || (product.colors && product.colors[0])
    onAddToCart(product, color)

    setAddedAnimation(product.id)
    setTimeout(() => {
      setAddedAnimation(null)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col font-sans selection:bg-[#D4FF00] selection:text-black animate-in fade-in duration-200">
      
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Persistent Navbar */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        onSelectCategory={onSelectCategory}
      />

      {/* Main Collection Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-[#181818]">
          <div className="text-xs font-mono text-gray-400 flex items-center space-x-2">
            <button
              onClick={onBackToHome}
              className="hover:text-white underline cursor-pointer"
            >
              Inicio
            </button>
            <span className="text-gray-600">/</span>
            <span className="text-gray-400">Colección</span>
            <span className="text-gray-600">/</span>
            <span className="text-[#D4FF00] font-bold uppercase">{collectionTitle}</span>
          </div>

          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-[#D4FF00] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la portada</span>
          </button>
        </div>

        {/* Collection Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1a1a1a]">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-[#D4FF00] uppercase block">
              {collectionTag}
            </span>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white font-black leading-none">
              {collectionTitle}.{' '}
              <span className="text-gray-500 font-mono text-3xl sm:text-4xl font-normal">
                ({products.length.toString().padStart(2, '0')})
              </span>
            </h1>
            <p className="text-sm font-sans text-gray-400 max-w-xl pt-1">
              {collectionDesc}
            </p>
          </div>

          {/* Pricing Currency Badge */}
          <div className="text-right text-xs font-mono text-gray-400 uppercase tracking-widest shrink-0">
            <span>PRECIOS EN MXN</span>
            <span className="block text-[10px] text-gray-600 mt-0.5">ENVÍOS A TODO MÉXICO</span>
          </div>
        </div>

        {/* Sub-Filters: Gorras by Brand */}
        {isGorra && (
          <div className="bg-[#101010] border border-[#202020] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 uppercase tracking-wider shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#D4FF00]" />
              <span className="font-bold text-white">FILTRAR POR MARCA:</span>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              {[
                { id: 'gorras', label: 'Todas las gorras' },
                { id: 'gorras:gj', label: 'GJ Signature' },
                { id: 'gorras:new era', label: 'New Era' },
                { id: 'gorras:mitchell', label: 'Mitchell & Ness' },
                { id: 'gorras:47', label: '47 Brand' },
              ].map((brand) => {
                const isActive = activeCategory.toLowerCase() === brand.id.toLowerCase()
                return (
                  <button
                    key={brand.id}
                    onClick={() => onSelectCategory(brand.id)}
                    className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#D4FF00] text-black font-bold shadow-md shadow-[#D4FF00]/15'
                        : 'bg-[#181818] text-gray-300 hover:text-white border border-[#282828] hover:border-[#383838]'
                    }`}
                  >
                    {brand.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Sub-Filters: Ropa by Type */}
        {isRopa && (
          <div className="bg-[#101010] border border-[#202020] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 uppercase tracking-wider shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#D4FF00]" />
              <span className="font-bold text-white">TIPO DE PRENDA:</span>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              {[
                { id: 'ropa', label: 'Toda la ropa' },
                { id: 'playeras', label: 'Playeras' },
                { id: 'hoodies', label: 'Hoodies' },
              ].map((sub) => {
                const isActive = activeCategory.toLowerCase() === sub.id.toLowerCase()
                return (
                  <button
                    key={sub.id}
                    onClick={() => onSelectCategory(sub.id)}
                    className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#D4FF00] text-black font-bold shadow-md shadow-[#D4FF00]/15'
                        : 'bg-[#181818] text-gray-300 hover:text-white border border-[#282828] hover:border-[#383838]'
                    }`}
                  >
                    {sub.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] p-16 text-center space-y-4">
            <p className="font-display text-3xl uppercase tracking-wider text-white">
              NO HAY PIEZAS EN ESTA SELECCIÓN
            </p>
            <p className="text-xs font-mono text-gray-400">
              Pronto agregaremos nuevas existencias de esta categoría en el siguiente Drop.
            </p>
            <button
              onClick={() => onSelectCategory(isGorra ? 'gorras' : 'todos')}
              className="mt-4 px-6 py-2.5 bg-[#D4FF00] text-black font-mono font-bold text-xs uppercase tracking-wider"
            >
              VER TODAS LAS PIEZAS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const currentColor =
                selectedColors[product.id] || (product.colors && product.colors[0])
              const isJustAdded = addedAnimation === product.id

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group flex flex-col cursor-pointer transition-transform duration-300"
                >
                  {/* Product Image Box */}
                  <div className="relative w-full aspect-square bg-[#141414] overflow-hidden border border-[#202020] group-hover:border-[#383838] transition-colors">
                    
                    {/* Badge */}
                    {product.tag && (
                      <div className="absolute top-3 left-3 z-20">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest uppercase ${
                            product.tag_type === 'lime'
                              ? 'bg-[#D4FF00] text-black'
                              : 'bg-white text-black'
                          }`}
                        >
                          {product.tag}
                        </span>
                      </div>
                    )}

                    {/* Brand Pill */}
                    {product.brand && (
                      <div className="absolute top-3 right-3 z-20">
                        <span className="inline-block px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase bg-black/80 text-gray-300 border border-white/10 backdrop-blur-sm">
                          {product.brand}
                        </span>
                      </div>
                    )}

                    {/* Product Image */}
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/images/product-cap-black.jpg'
                      }}
                    />

                    {/* Quick Add Button */}
                    <div className="absolute bottom-3 right-3 z-20">
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        aria-label={`Agregar ${product.title} a la bolsa`}
                        className={`w-10 h-10 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                          isJustAdded
                            ? 'bg-[#D4FF00] text-black scale-110'
                            : 'bg-black/90 hover:bg-[#D4FF00] text-white hover:text-black border border-white/20 hover:border-transparent'
                        }`}
                      >
                        {isJustAdded ? (
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <Plus className="w-5 h-5 stroke-[2.5]" />
                        )}
                      </button>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>

                  {/* Product Meta */}
                  <div className="mt-4 flex flex-col space-y-1.5 flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-sans font-bold text-base text-white group-hover:text-[#D4FF00] transition-colors leading-snug">
                          {product.title}
                        </h3>
                        <span className="font-mono text-sm font-semibold text-white shrink-0">
                          ${product.price.toLocaleString('es-MX')}
                        </span>
                      </div>

                      {product.specs && (
                        <p className="text-xs text-gray-500 font-mono mt-0.5 line-clamp-1">
                          {product.specs}
                        </p>
                      )}
                    </div>

                    {/* Color Swatches */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex items-center space-x-1.5 pt-2">
                        {product.colors.map((color) => {
                          const displayHex = resolveColorHex(color, product.specs)
                          return (
                            <button
                              key={color}
                              onClick={(e) => handleColorClick(product.id, color, e)}
                              className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                                currentColor === color
                                  ? 'border-[#D4FF00] scale-125'
                                  : 'border-[#333333] hover:border-white'
                              }`}
                              style={{ backgroundColor: displayHex }}
                              aria-label={`Color ${color}`}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={onSelectCategory}
        onOpenAdmin={onOpenAdmin}
      />

    </div>
  )
}
