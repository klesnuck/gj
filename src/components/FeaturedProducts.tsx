import React, { useState } from 'react'
import { ArrowUpRight, Plus, Check } from 'lucide-react'
import type { Product } from '../types/database.types'

interface FeaturedProductsProps {
  products: Product[]
  activeCategory: string
  onCategoryChange: (category: string) => void
  onAddToCart: (product: Product, selectedColor?: string) => void
  onSelectProduct: (product: Product) => void
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  activeCategory,
  onCategoryChange,
  onAddToCart,
  onSelectProduct,
}) => {
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})
  const [addedAnimation, setAddedAnimation] = useState<string | null>(null)

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'gorras', label: 'Gorras' },
    { id: 'playeras', label: 'Playeras' },
    { id: 'hoodies', label: 'Hoodies' },
  ]

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
    <section id="catalogo" className="w-full bg-[#090909] py-16 sm:py-24 border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4">
          <div>
            <span className="text-xs font-mono tracking-widest text-gray-500 uppercase block mb-1">
              01 / LA SELECCIÓN GJ
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white font-extrabold leading-none">
              LOS MÁS BUSCADOS
            </h2>
          </div>

          <a
            href="#todos-los-productos"
            onClick={(e) => {
              e.preventDefault()
              onCategoryChange('todos')
            }}
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono tracking-wider text-gray-400 hover:text-[#D4FF00] uppercase mt-4 md:mt-0 transition-colors"
          >
            <span>VER TODOS LOS PRODUCTOS</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Filter Tabs and Currency Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-[#1a1a1a]">
          {/* Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase()
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`px-5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'bg-[#141414] text-gray-400 hover:text-white border border-[#242424] hover:border-[#383838]'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Pricing Currency Note */}
          <div className="text-[11px] font-mono tracking-widest text-gray-500 uppercase">
            PRECIOS EN MXN / IVA INCLUIDO
          </div>
        </div>

        {/* Product Grid */}
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
                  
                  {/* Badge (BEST SELLER / NUEVO / EDICIÓN LIMITADA) */}
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

                  {/* Main Product Image */}
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80'
                    }}
                  />

                  {/* Bottom Right Quick Add Button "+" */}
                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    aria-label={`Agregar ${product.title} al carrito`}
                    className={`absolute bottom-3 right-3 z-20 w-8 h-8 flex items-center justify-center transition-all duration-200 ${
                      isJustAdded
                        ? 'bg-[#D4FF00] text-black scale-110'
                        : 'bg-white text-black hover:bg-[#D4FF00] hover:text-black shadow-md'
                    }`}
                  >
                    {isJustAdded ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Plus className="w-4 h-4 stroke-[2.8]" />
                    )}
                  </button>
                </div>

                {/* Product Information */}
                <div className="pt-3.5 space-y-1">
                  
                  {/* Title & Price Row */}
                  <div className="flex items-center justify-between text-sm sm:text-base font-semibold tracking-tight text-white">
                    <span className="group-hover:text-[#D4FF00] transition-colors font-sans truncate mr-2">
                      {product.title}
                    </span>
                    <span className="font-mono text-sm text-gray-200 whitespace-nowrap">
                      ${product.price.toLocaleString('es-MX')}
                    </span>
                  </div>

                  {/* Specs Subtext */}
                  {product.specs && (
                    <div className="text-xs text-gray-400 font-sans tracking-normal">
                      {product.specs}
                    </div>
                  )}

                  {/* Color Swatches */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center space-x-2 pt-1.5">
                      {product.colors.map((color, cIdx) => {
                        const isSelected = currentColor === color
                        return (
                          <button
                            key={cIdx}
                            onClick={(e) => handleColorClick(product.id, color, e)}
                            aria-label={`Seleccionar color ${color}`}
                            className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                              isSelected
                                ? 'ring-1 ring-offset-2 ring-offset-black ring-white scale-110'
                                : 'opacity-70 hover:opacity-100 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
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

      </div>
    </section>
  )
}

