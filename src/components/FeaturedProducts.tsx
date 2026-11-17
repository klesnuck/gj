import React, { useState } from 'react'
import type { Product } from '../types/database.types'
import { isProductSoldOut } from '../lib/stock'
import { ProductCard } from './ProductCard'

interface FeaturedProductsProps {
  products: Product[]
  onOpenCollection?: (category: string) => void
  onAddToCart: (product: Product, selectedColor?: string) => void
  onSelectProduct: (product: Product) => void
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
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
    <section id="lo-mas-buscado" className="w-full bg-[#090909] py-16 sm:py-24 border-b border-[#1c1c1c] scroll-mt-20">
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
        </div>

        {/* Curated Product Grid: 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  currentColor={currentColor}
                  isJustAdded={isJustAdded}
                  onSelectProduct={onSelectProduct}
                  onQuickAdd={handleQuickAdd}
                  onColorClick={handleColorClick}
                />
              )
            })
          )}
        </div>

      </div>
    </section>
  )
}
