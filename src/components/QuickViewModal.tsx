import React, { useState, useEffect, useRef } from 'react'
import { X, Check, ShoppingBag, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product, Coupon } from '../types/database.types'
import { resolveColorHex } from '../lib/colors'
import { parseSizeStocks } from '../lib/stock'
import { getProductDiscount } from '../lib/discounts'

interface QuickViewModalProps {
  product: Product | null
  coupons?: Coupon[]
  onClose: () => void
  onAddToCart: (product: Product, color?: string, size?: string) => void
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  coupons,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null

  const discountInfo = getProductDiscount(product, coupons)

  const isClothing =
    product.category === 'playeras' ||
    product.category === 'hoodies' ||
    (product.category as string) === 'ropa'
  const sizeStocks = parseSizeStocks(product.specs, product.stock ?? 0)
  const baseSizes = ['XS', 'S', 'M', 'L', 'XL']
  const extraSizes = Object.keys(sizeStocks).filter(
    (s) => !baseSizes.includes(s.toUpperCase())
  )
  const allSizes = isClothing ? [...baseSizes, ...extraSizes] : ['UNITALLA / AJUSTABLE']

  const getStockForSize = (s: string): number => {
    if (!isClothing) return product.stock ?? 0
    return sizeStocks[s.toUpperCase()] ?? 0
  }

  const isSizeAvailable = (s: string): boolean => {
    return getStockForSize(s) > 0
  }

  const availableSizes = allSizes.filter(isSizeAvailable)
  const firstAvailable = availableSizes[0] || allSizes[0]
  const [selectedSize, setSelectedSize] = useState<string>(firstAvailable)
  const isOutOfStock = availableSizes.length === 0 || (product.stock ?? 0) === 0

  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors[0] ? product.colors[0] : '#111111'
  )
  const [added, setAdded] = useState(false)

  // Reset variant selection whenever opened product changes or stock is updated
  useEffect(() => {
    setSelectedSize(firstAvailable)
    setSelectedColor(product.colors && product.colors[0] ? product.colors[0] : '#111111')
    setActiveImageIndex(0)
  }, [product.id, product.stock, product.specs, firstAvailable])

  // Multi-image gallery in QuickView
  const productImages =
    product.images && product.images.length > 0 ? product.images : [product.image_url]
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const currentImage = productImages[activeImageIndex] || product.image_url
  const touchStartXRef = useRef<number | null>(null)

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImageIndex((prev) => (prev + 1) % productImages.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || productImages.length <= 1) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartXRef.current - touchEndX
    if (diff > 35) {
      setActiveImageIndex((prev) => (prev + 1) % productImages.length)
    } else if (diff < -35) {
      setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
    }
    touchStartXRef.current = null
  }

  const handleAdd = () => {
    if (isOutOfStock || !isSizeAvailable(selectedSize)) return
    onAddToCart(product, selectedColor, selectedSize)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      onClose()
    }, 900)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#0f0f0f] border border-[#262626] max-w-3xl w-full text-white shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-[#D4FF00] hover:text-black border border-white/20 flex items-center justify-center text-gray-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* Left: Product Image & Multi-Image Strip */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-[#222222] bg-[#111111]">
            <div
              className="relative w-full h-[250px] xs:h-[280px] sm:h-[330px] md:h-auto md:aspect-square overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#161616] via-[#121212] to-[#0d0d0d] p-6 sm:p-8"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {discountInfo ? (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <span className="inline-block px-2.5 py-1 text-[10px] sm:text-[11px] font-mono font-black tracking-widest uppercase bg-[#D4FF00] text-black border border-black shadow-lg">
                    EN DESCUENTO · {discountInfo.badgeLabel}
                  </span>
                </div>
              ) : product.tag ? (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <span
                    className={`inline-block px-2.5 py-1 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase ${product.tag_type === 'lime'
                        ? 'bg-[#D4FF00] text-black'
                        : 'bg-white text-black'
                      }`}
                  >
                    {product.tag}
                  </span>
                </div>
              ) : null}

              {/* Main Product Image centered with breathing room so it never touches borders */}
              <img
                key={currentImage}
                src={currentImage}
                alt={product.title}
                className="max-h-full max-w-full w-auto h-auto object-contain object-center transition-all duration-300 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
              />

              {/* Chevrons for multi-image navigation on preview */}
              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Foto anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/75 hover:bg-[#D4FF00] text-white hover:text-black border border-white/20 flex items-center justify-center z-20 transition-all cursor-pointer shadow-md"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Foto siguiente"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/75 hover:bg-[#D4FF00] text-white hover:text-black border border-white/20 flex items-center justify-center z-20 transition-all cursor-pointer shadow-md"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* Indicator count (e.g. 1/3) */}
                  <div className="absolute bottom-2.5 right-2.5 z-10">
                    <span className="px-2 py-0.5 bg-black/80 text-[9px] font-mono text-gray-300 border border-white/10 backdrop-blur-xs">
                      {activeImageIndex + 1} / {productImages.length}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Navigation Strip if product has multiple images */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-[#0a0a0a] border-t border-[#1c1c1c] overflow-x-auto scrollbar-none justify-center">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-sm overflow-hidden border p-1 bg-[#141414] flex items-center justify-center transition-all cursor-pointer shrink-0 ${i === activeImageIndex
                        ? 'border-[#D4FF00] scale-105 shadow-md shadow-[#D4FF00]/25'
                        : 'border-[#262626] opacity-60 hover:opacity-100 hover:border-[#444]'
                      }`}
                  >
                    <img src={img} alt="" className="max-w-full max-h-full w-auto h-auto object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">

            <div className="space-y-3">
              <span className="text-xs font-mono tracking-widest text-[#D4FF00] uppercase block">
                {product.brand ? `${product.brand} · ` : ''}{product.category}
                {product.subcategory ? ` / ${product.subcategory}` : ''}
              </span>

              <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-white font-extrabold leading-none">
                {product.title}
              </h3>

              {discountInfo ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-500 line-through">
                      ${discountInfo.originalPrice.toLocaleString('es-MX')} MXN
                    </span>
                    <span className="px-2 py-0.5 bg-[#182109] text-[#D4FF00] border border-[#D4FF00]/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                      {discountInfo.badgeLabel} DE DESCUENTO
                    </span>
                  </div>
                  <div className="font-mono text-3xl font-black text-[#D4FF00]">
                    ${discountInfo.discountedPrice.toLocaleString('es-MX')}{' '}
                    <span className="text-xs font-normal text-gray-400">MXN</span>
                  </div>
                </div>
              ) : (
                <div className="font-mono text-2xl text-white font-bold">
                  ${product.price.toLocaleString('es-MX')}{' '}
                  <span className="text-xs font-normal text-gray-400">MXN</span>
                </div>
              )}

              {product.specs && (
                <div className="text-xs font-mono text-gray-400">
                  {product.specs}
                </div>
              )}

              {product.description && (
                <p className="text-xs sm:text-sm font-sans text-gray-300 leading-relaxed pt-2">
                  {product.description}
                </p>
              )}

              {/* Color Swatches */}
              {product.colors && product.colors.length > 0 && (
                <div className="pt-3 space-y-2">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                    Color:
                  </span>
                  <div className="flex items-center space-x-2.5">
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`w-6 h-6 rounded-full border border-white/20 transition-all ${selectedColor === c ? 'ring-2 ring-[#D4FF00] scale-110' : 'opacity-70 hover:opacity-100'
                          }`}
                        style={{ backgroundColor: resolveColorHex(c, product.specs) }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                    Talla:
                  </span>
                  {selectedSize && (
                    <span className="text-xs font-mono text-gray-400">
                      Seleccionada: <strong className="text-[#D4FF00]">{selectedSize}</strong>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((s) => {
                    const stock = getStockForSize(s)
                    const isAvailable = stock > 0
                    const isSelected = selectedSize === s && isAvailable
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(s)}
                        title={isAvailable ? `Talla ${s} (${stock} piezas disponibles)` : `Talla ${s} agotada`}
                        className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all ${!isAvailable
                            ? 'opacity-30 border-[#222222] bg-[#0e0e0e] text-gray-600 line-through cursor-not-allowed'
                            : isSelected
                              ? 'border-[#D4FF00] bg-[#D4FF00]/10 text-[#D4FF00] font-bold shadow-sm shadow-[#D4FF00]/20'
                              : 'border-[#2a2a2a] bg-[#141414] text-gray-300 hover:border-gray-500 hover:text-white cursor-pointer'
                          }`}
                      >
                        <span>{s}</span>
                        <span className={`text-[10px] ml-1.5 ${!isAvailable ? 'text-gray-600 no-underline' : 'text-gray-400 font-normal'}`}>
                          ({stock})
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAdd}
                className={`w-full py-4 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${isOutOfStock
                    ? 'bg-[#181818] border border-[#262626] text-gray-500 cursor-not-allowed'
                    : added
                      ? 'bg-[#D4FF00] text-black'
                      : 'bg-[#D4FF00] hover:bg-[#bfe600] text-black shadow-lg shadow-[#D4FF00]/20 cursor-pointer'
                  }`}
              >
                {isOutOfStock ? (
                  <span>PIEZA AGOTADA / SIN STOCK</span>
                ) : added ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>¡AGREGADO A TU BOLSA!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>AGREGAR A LA BOLSA · ${product.price.toLocaleString('es-MX')} MXN</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

