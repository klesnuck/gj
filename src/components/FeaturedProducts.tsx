import React, { useState } from 'react'
import { ArrowUpRight, Plus, Check } from 'lucide-react'
import type { Product } from '../types/database.types'
import { resolveColorHex } from '../lib/colors'
import { isProductSoldOut } from '../lib/stock'

interface FeaturedProductsProps {
  products: Product[]
  onOpenCollection: (category: string) => void
  onAddToCart: (product: Product, selectedColor?: string) => void
  onSelectProduct: (product: Product) => void
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onOpenCollection,
  onAddToCart,
  onSelectProduct,
}) => {
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})
  const [addedAnimation, setAddedAnimation] = useState<string | null>(null)

  // Filter to show ONLY featured products selected in Admin or top sellers
  const featuredProducts = products.filter(
    (p) => p.is_featured === true || p.tag === 'BEST SELLER'
  )
  const displayProducts =
    featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)

  const handleColorClick = (productId: string, color: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedColors((prev) => ({ ...prev, [productId]: color }))
  }

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isProductSoldOut(product)) return
    // Si la prenda tiene tallas (ropa, playeras, sudaderas), abre el selector para elegir talla
    if (product.category !== 'gorras') {
      onSelectProduct(product)
      return
    }
    const color = selectedColors[product.id] || (product.colors && product.colors[0])
    onAddToCart(product, color)

    setAddedAnimation(product.id)
    setTimeout(() => {
      setAddedAnimation(null)
    }, 1200)
  }

  return (
    <section id="lo-mas-buscado" className="w-full bg-[#090909] py-16 sm:py-24 border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#181818]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse" />
              <span className="text-xs font-mono tracking-widest text-[#D4FF00] font-bold uppercase">
                02 / SELECCIÓN GJ · LO MÁS VENDIDO
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white font-extrabold leading-none">
              LOS MÁS BUSCADOS
            </h2>
            <p className="text-xs sm:text-sm font-sans text-gray-400 max-w-lg pt-1">
              Las prendas y siluetas con mayor demanda de GJ.
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => onOpenCollection('todos')}
              className="group inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#141414] hover:bg-[#D4FF00] text-gray-300 hover:text-black border border-[#262626] hover:border-[#D4FF00] text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer"
            >
              <span>VER CATÁLOGO COMPLETO</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Curated Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-[#242424] bg-[#0c0c0c] p-8 space-y-3">
              <span className="font-display text-2xl uppercase tracking-wider text-gray-400">
                PRÓXIMAMENTE NUEVAS PRENDAS
              </span>
              <p className="text-xs font-mono text-gray-500 max-w-md mx-auto">
                No hay productos en portada en este momento. Las nuevas prendas y restocks se anunciarán aquí.
              </p>
            </div>
          ) : (
            displayProducts.map((product) => {
              const currentColor =
                selectedColors[product.id] || (product.colors && product.colors[0])
              const isJustAdded = addedAnimation === product.id
              const isSoldOut = isProductSoldOut(product)

              return (
                <div
                  key={product.id}
                  onClick={() => !isSoldOut && onSelectProduct(product)}
                  className={`group flex flex-col transition-all duration-300 ${
                    isSoldOut ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                  }`}
                  aria-disabled={isSoldOut}
                >
                  {/* Product Image Box */}
                  <div className="relative w-full aspect-square bg-[#141414] overflow-hidden border border-[#202020] group-hover:border-[#383838] transition-colors">

                    {/* Badge */}
                    {isSoldOut ? (
                      <div className="absolute top-3 left-3 z-30">
                        <span className="inline-block px-2.5 py-1 text-[10px] font-mono font-black tracking-widest uppercase bg-red-600 text-white border border-red-500 shadow-md">
                          AGOTADO
                        </span>
                      </div>
                    ) : (
                      product.tag && (
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
                      )
                    )}

                    {/* Brand Tag */}
                    {product.brand && (
                      <div className="absolute top-3 right-3 z-20">
                        <span className="inline-block px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase bg-black/80 text-gray-300 border border-white/10 backdrop-blur-sm">
                          {product.brand}
                        </span>
                      </div>
                    )}

                    {/* Center Watermark if Sold Out */}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-25 pointer-events-none">
                        <span className="px-3.5 py-1.5 bg-black/95 text-red-400 border border-red-500/80 font-mono font-black text-xs uppercase tracking-widest shadow-2xl">
                          PIEZA AGOTADA
                        </span>
                      </div>
                    )}

                    {/* Product Image */}
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className={`w-full h-full object-cover object-center transition-transform duration-500 ${
                        isSoldOut ? 'grayscale opacity-50' : 'group-hover:scale-105'
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/images/product-cap-black.jpg'
                      }}
                    />

                    {/* Quick Add Button (only if in stock) */}
                    {!isSoldOut && (
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
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>

                  {/* Product Meta */}
                  <div className="mt-4 flex flex-col space-y-1.5 flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3
                          className={`font-sans font-bold text-base transition-colors leading-snug ${
                            isSoldOut ? 'text-gray-400' : 'text-white group-hover:text-[#D4FF00]'
                          }`}
                        >
                          {product.title}
                        </h3>
                        <div className="text-right shrink-0">
                          <span
                            className={`font-mono text-sm font-semibold block ${
                              isSoldOut ? 'text-gray-500 line-through' : 'text-white'
                            }`}
                          >
                            ${product.price.toLocaleString('es-MX')}
                          </span>
                          {isSoldOut && (
                            <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider block">
                              AGOTADO
                            </span>
                          )}
                        </div>
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
                              className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${currentColor === color
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
            }))}
        </div>

      </div>
    </section>
  )
}
