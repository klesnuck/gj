import React from 'react'
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import type { CartItem } from '../types/database.types'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  if (!isOpen) return null

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const freeShippingThreshold = 1999
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0e0e0e] border-l border-[#202020] text-white flex flex-col shadow-2xl">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#1f1f1f] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#D4FF00]" />
              <h3 className="font-display text-2xl uppercase tracking-wider font-bold">
                TU BOLSA ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="p-4 bg-[#141414] border-b border-[#202020]">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-gray-300">
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-[#D4FF00] font-bold">¡TIENES ENVÍO GRATIS!</span>
                ) : (
                  <>
                    FALTAN <span className="text-[#D4FF00] font-bold">${remainingForFreeShipping.toLocaleString('es-MX')} MXN</span> PARA ENVÍO GRATIS
                  </>
                )}
              </span>
              <span className="text-gray-500">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#252525] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4FF00] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="w-28 h-44 flex items-center justify-center">
                  <img
                    src="/images/gj-mascot.png"
                    alt="gj mascot"
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  />
                </div>
                <p className="font-display text-2xl uppercase tracking-wider text-white">
                  TU BOLSA ESTÁ VACÍA
                </p>
                <p className="text-xs font-mono text-gray-400 max-w-xs">
                  ¿Todavía sin prendas? Explora el Drop 004 antes de que se agote.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-3 bg-[#D4FF00] hover:bg-[#bfe600] text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                >
                  EXPLORAR PRODUCTOS
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3 bg-[#131313] border border-[#222222] rounded-none"
                >
                  {/* Item Image */}
                  <img
                    src={item.product.image_url}
                    alt={item.product.title}
                    className="w-20 h-20 object-cover bg-black shrink-0"
                  />

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-semibold text-white font-sans truncate max-w-[170px]">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-gray-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedColor && (
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block border border-white/20"
                            style={{ backgroundColor: item.selectedColor }}
                          />
                          <span className="text-[11px] font-mono text-gray-400">Color seleccionado</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-[#2b2b2b] bg-[#1a1a1a]">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-gray-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-gray-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="font-mono text-sm text-[#D4FF00] font-semibold">
                        ${(item.product.price * item.quantity).toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#1f1f1f] bg-[#121212] space-y-4">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">${subtotal.toLocaleString('es-MX')} MXN</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Envío</span>
                  <span className="text-white">
                    {subtotal >= freeShippingThreshold ? 'GRATIS' : 'Calculado en checkout'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#262626]">
                  <span>TOTAL ESTIMADO</span>
                  <span className="text-[#D4FF00]">${subtotal.toLocaleString('es-MX')} MXN</span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert('¡Redirigiendo a pasarela de pagos segura (Mercado Pago / Tarjeta)!')
                }}
                className="w-full py-4 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>PROCEDER AL PAGO</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] font-mono text-center text-gray-500 uppercase">
                PAGOS 100% SEGUROS Y CIFRADOS · ENVÍO CON SEGUIMIENTO
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

