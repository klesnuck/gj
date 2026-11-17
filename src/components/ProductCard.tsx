import React, { useState, useEffect, useRef } from 'react'
import { Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '../types/database.types'
import { resolveColorHex } from '../lib/colors'
import { isProductSoldOut } from '../lib/stock'
import { getProductImages } from '../lib/brands'

interface ProductCardProps {
  product: Product
  currentColor?: string
  isJustAdded?: boolean
  onSelectProduct: (product: Product) => void
  onQuickAdd: (product: Product, e: React.MouseEvent) => void
  onColorClick?: (productId: string, color: string, e: React.MouseEvent) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currentColor,
  isJustAdded,
  onSelectProduct,
  onQuickAdd,
  onColorClick,
}) => {
  const isSoldOut = isProductSoldOut(product)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const touchStartXRef = useRef<number | null>(null)

  // Recolectar todas las fotos disponibles de la prenda sin duplicados
  const allImages = React.useMemo(() => {
    const list: string[] = []
    if (product.image_url) list.push(product.image_url)
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && typeof img === 'string') list.push(img)
      })
    }
    const stored = getProductImages(product.id)
    if (Array.isArray(stored)) {
      stored.forEach((img) => {
        if (img && typeof img === 'string') list.push(img)
      })
    }
    return Array.from(new Set(list.filter(Boolean)))
  }, [product])

  const hasMultipleImages = allImages.length > 1

  // Auto-carrusel suave al pasar el cursor en computadora
  useEffect(() => {
    if (!isHovered || !hasMultipleImages) return
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % allImages.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [isHovered, hasMultipleImages, allImages.length])

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImageIndex(index)
  }

  // Soporte de deslizamiento táctil (swipe) para celulares
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || !hasMultipleImages) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartXRef.current - touchEndX
    if (diff > 35) {
      // Deslizó hacia la izquierda -> foto siguiente
      e.stopPropagation()
      setActiveImageIndex((prev) => (prev + 1) % allImages.length)
    } else if (diff < -35) {
      // Deslizó hacia la derecha -> foto anterior
      e.stopPropagation()
      setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }
    touchStartXRef.current = null
  }

  const activeSrc = allImages[activeImageIndex] || product.image_url || '/images/product-cap-black.jpg'

  return (
    <div
      onClick={() => !isSoldOut && onSelectProduct(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex flex-col transition-all duration-300 ${
        isSoldOut ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
      }`}
      aria-disabled={isSoldOut}
    >
      {/* Product Image Box */}
      <div
        className="relative w-full aspect-square bg-[#141414] overflow-hidden border border-[#202020] group-hover:border-[#383838] transition-colors"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Badge: Agotado o Tag Destacado */}
        {isSoldOut ? (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-30">
            <span className="inline-block px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-mono font-black tracking-widest uppercase bg-red-600 text-white border border-red-500 shadow-md">
              AGOTADO
            </span>
          </div>
        ) : (
          product.tag && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20">
              <span
                className={`inline-block px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase ${
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
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20">
            <span className="inline-block px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-mono tracking-wider uppercase bg-black/85 text-gray-300 border border-white/10 backdrop-blur-sm">
              {product.brand}
            </span>
          </div>
        )}

        {/* Center Watermark if Sold Out */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-25 pointer-events-none">
            <span className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-black/95 text-red-400 border border-red-500/80 font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl">
              PIEZA AGOTADA
            </span>
          </div>
        )}

        {/* Main Product Image with uniform square cover */}
        <img
          key={activeSrc}
          src={activeSrc}
          alt={product.title}
          className={`w-full h-full object-cover object-center transition-all duration-300 ${
            isSoldOut ? 'grayscale opacity-50' : 'group-hover:scale-105'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/product-cap-black.jpg'
          }}
        />

        {/* Interactive Carousel Controls (when product has multiple images) */}
        {hasMultipleImages && (
          <>
            {/* Left Chevron */}
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Foto anterior"
              className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/75 hover:bg-[#D4FF00] text-white hover:text-black border border-white/20 flex items-center justify-center z-25 transition-all opacity-85 sm:opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>

            {/* Right Chevron */}
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Foto siguiente"
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/75 hover:bg-[#D4FF00] text-white hover:text-black border border-white/20 flex items-center justify-center z-25 transition-all opacity-85 sm:opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>

            {/* Bottom Dots Indicator */}
            <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20 bg-black/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-xs">
              {allImages.slice(0, 8).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDotClick(idx, e)}
                  aria-label={`Ver foto ${idx + 1}`}
                  className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeImageIndex
                      ? 'w-3 sm:w-4 bg-[#D4FF00]'
                      : 'w-1 sm:w-1.5 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>

            {/* Photo count indicator (e.g. 1/6) */}
            <div className="absolute bottom-2 left-2 z-20 pointer-events-none hidden sm:block">
              <span className="px-1.5 py-0.5 bg-black/80 text-[8px] font-mono text-gray-300 border border-white/10">
                {activeImageIndex + 1}/{allImages.length}
              </span>
            </div>
          </>
        )}

        {/* Quick Add Button (only if in stock) */}
        {!isSoldOut && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20">
            <button
              onClick={(e) => onQuickAdd(product, e)}
              aria-label={`Agregar ${product.title} a la bolsa`}
              className={`w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg ${
                isJustAdded
                  ? 'bg-[#D4FF00] text-black scale-110'
                  : 'bg-black/90 hover:bg-[#D4FF00] text-white hover:text-black border border-white/20 hover:border-transparent'
              }`}
            >
              {isJustAdded ? (
                <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
              ) : (
                <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
              )}
            </button>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Product Meta */}
      <div className="mt-2.5 sm:mt-4 flex flex-col space-y-1 sm:space-y-1.5 flex-1 justify-between">
        <div>
          <div className="flex justify-between items-start gap-1 sm:gap-2">
            <h3
              className={`font-sans font-bold text-xs sm:text-base transition-colors leading-snug line-clamp-2 ${
                isSoldOut ? 'text-gray-400' : 'text-white group-hover:text-[#D4FF00]'
              }`}
            >
              {product.title}
            </h3>
            <div className="text-right shrink-0">
              <span
                className={`font-mono text-xs sm:text-sm font-semibold block ${
                  isSoldOut ? 'text-gray-500 line-through' : 'text-white'
                }`}
              >
                ${product.price.toLocaleString('es-MX')}
              </span>
              {isSoldOut && (
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider block">
                  AGOTADO
                </span>
              )}
            </div>
          </div>

          {product.specs && (
            <p className="text-[10px] sm:text-xs text-gray-500 font-mono mt-0.5 line-clamp-1">
              {product.specs}
            </p>
          )}
        </div>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-1.5 pt-1 sm:pt-2">
            {product.colors.map((color) => {
              const displayHex = resolveColorHex(color, product.specs)
              return (
                <button
                  key={color}
                  onClick={(e) => onColorClick?.(product.id, color, e)}
                  className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border transition-all cursor-pointer ${
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
}

