import React, { useState } from 'react'
import { X, Check, ShoppingBag, ArrowUpRight } from 'lucide-react'
import type { Product } from '../types/database.types'

interface QuickViewModalProps {
  product: Product | null
  onClose: () => void
  onAddToCart: (product: Product, color?: string, size?: string) => void
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null

  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors[0] ? product.colors[0] : '#111111'
  )
  const isClothing = product.category === 'playeras' || product.category === 'hoodies'
  const sizes = isClothing ? ['S', 'M', 'L', 'XL'] : ['UNITALLA / AJUSTABLE']
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0])
  const [added, setAdded] = useState(false)

  // Multi-image gallery in QuickView
  const productImages =
    product.images && product.images.length > 0 ? product.images : [product.image_url]
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const currentImage = productImages[activeImageIndex] || product.image_url

  const handleAdd = () => {
    onAddToCart(product, selectedColor, selectedSize)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      onClose()
    }, 900)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
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
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-[#D4FF00] hover:text-black border border-white/20 flex items-center justify-center text-gray-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left: Product Image & Multi-Image Strip */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-[#222222] bg-[#141414]">
            <div className="relative aspect-square overflow-hidden flex items-center justify-center">
              {product.tag && (
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`inline-block px-3 py-1 text-[11px] font-mono font-bold tracking-widest uppercase ${
                      product.tag_type === 'lime'
                        ? 'bg-[#D4FF00] text-black'
                        : 'bg-white text-black'
                    }`}
                  >
                    {product.tag}
                  </span>
                </div>
              )}
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
            </div>

            {/* Thumbnail Navigation Strip if product has multiple images */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-2 p-3 bg-[#0c0c0c] border-t border-[#1c1c1c] overflow-x-auto scrollbar-none">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-12 h-12 rounded-sm overflow-hidden border transition-all cursor-pointer shrink-0 ${
                      i === activeImageIndex
                        ? 'border-[#D4FF00] scale-105 shadow-md shadow-[#D4FF00]/20'
                        : 'border-[#262626] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              <span className="text-xs font-mono tracking-widest text-[#D4FF00] uppercase block">
                {product.category} · DROP 004
              </span>

              <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-white font-extrabold leading-none">
                {product.title}
              </h3>

              <div className="font-mono text-2xl text-white font-bold">
                ${product.price.toLocaleString('es-MX')}{' '}
                <span className="text-xs font-normal text-gray-400">MXN</span>
              </div>

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
                        onClick={() => setSelectedColor(c)}
                        className={`w-6 h-6 rounded-full border border-white/20 transition-all ${
                          selectedColor === c ? 'ring-2 ring-[#D4FF00] scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="pt-3 space-y-2">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Talla:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all ${
                        selectedSize === s
                          ? 'border-[#D4FF00] bg-[#D4FF00]/10 text-[#D4FF00] font-bold'
                          : 'border-[#2a2a2a] bg-[#141414] text-gray-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={handleAdd}
                className={`w-full py-4 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                  added
                    ? 'bg-[#D4FF00] text-black'
                    : 'bg-[#D4FF00] hover:bg-[#bfe600] text-black shadow-lg shadow-[#D4FF00]/20'
                }`}
              >
                {added ? (
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

