import React, { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  Check,
  Truck,
  ShieldCheck,
  RefreshCw,
  Lock,
  Plus,
  Minus,
  AlertCircle,
  HelpCircle,
  Search,
  ShoppingBag,
} from 'lucide-react'
import type { CartItem, Coupon } from '../../types/database.types'

interface CartPageProps {
  items: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void
  onRemoveItem: (productId: string, size?: string, color?: string) => void
  onContinueShopping: () => void
  onProceedToCheckout: () => void
  appliedCoupon: Coupon | null
  onApplyCoupon: (code: string) => { success: boolean; message: string }
  onRemoveCoupon: () => void
  onOpenAdmin?: () => void
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onContinueShopping,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onOpenAdmin,
}) => {
  const [couponInput, setCouponInput] = useState('')
  const [couponOpen, setCouponOpen] = useState(false)
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const totalItemCount = items.reduce((acc, it) => acc + it.quantity, 0)
  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0)
  const freeShippingThreshold = 1999
  const isFreeShipping = subtotal >= freeShippingThreshold
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  // Calculate coupon discount
  let discountAmount = 0
  if (appliedCoupon && appliedCoupon.isActive) {
    if (subtotal >= appliedCoupon.minPurchase) {
      if (appliedCoupon.discountType === 'percentage') {
        discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100)
      } else {
        discountAmount = Math.min(subtotal, appliedCoupon.discountValue)
      }
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount)

  const handleApplyCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCouponFeedback(null)
    const res = onApplyCoupon(couponInput.trim())
    if (res.success) {
      setCouponFeedback({ type: 'success', text: res.message })
      setCouponInput('')
    } else {
      setCouponFeedback({ type: 'error', text: res.message })
    }
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col font-sans selection:bg-[#D4FF00] selection:text-black">

      {/* Top Electric Lime Announcement Bar */}
      <aside className="w-full bg-[#D4FF00] text-black py-1.5 px-4 text-[11px] font-mono font-bold tracking-wider uppercase select-none z-40 border-b border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-center">
          <span>ENVÍO GRATIS EN COMPRAS DESDE $1,999 MXN</span>
          <span className="inline-block w-2.5 h-2.5 bg-black text-[#D4FF00] text-[9px] font-black rounded-xs leading-none flex items-center justify-center">
            ✦
          </span>
          <span>NUEVA COLECCIÓN - YA DISPONIBLE</span>
        </div>
      </aside>

      {/* Main Header / Navbar */}
      <header className="w-full bg-[#090909]/95 backdrop-blur-md border-b border-[#1c1c1c] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

          {/* Brand Logo */}
          <button
            onClick={onContinueShopping}
            className="flex items-center space-x-3 group cursor-pointer text-left"
          >
            <span className="font-display text-3xl sm:text-4xl tracking-tighter font-extrabold text-white leading-none">
              gj.
            </span>
            <div className="hidden sm:flex flex-col text-[9px] sm:text-[10px] font-mono uppercase tracking-widest font-bold text-gray-400 group-hover:text-white transition-colors leading-tight">
              <span>CLOTHING</span>
              <span>AND CAPS</span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-mono uppercase tracking-wider">
            <button
              onClick={onContinueShopping}
              className="text-[#D4FF00] hover:underline cursor-pointer"
            >
              Novedades
            </button>
            <button
              onClick={onContinueShopping}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Ropa
            </button>
            <button
              onClick={onContinueShopping}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Gorras
            </button>
            <button
              onClick={onContinueShopping}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Accesorios
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-5 text-gray-300">
            <button
              onClick={onContinueShopping}
              title="Buscar"
              className="hover:text-[#D4FF00] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-1.5 text-[#D4FF00] font-mono text-xs font-bold">
              <ShoppingBag className="w-4 h-4" />
              <span>({totalItemCount.toString().padStart(2, '0')})</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">

        {/* Breadcrumb & Steps Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#181818]">
          <div className="text-xs font-mono text-gray-400">
            <button
              onClick={onContinueShopping}
              className="hover:text-white underline cursor-pointer"
            >
              Inicio
            </button>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-white font-semibold">Carrito</span>
          </div>

          {/* Stepper (01 Carrito, 02 Pago, 03 Confirmación) */}
          <div className="flex items-center space-x-4 sm:space-x-8 text-xs font-mono">
            <div className="flex items-center space-x-2 text-[#D4FF00] font-bold border-b-2 border-[#D4FF00] pb-1">
              <span>01</span>
              <span className="uppercase tracking-wider">Carrito</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 pb-1">
              <span>02</span>
              <span className="uppercase tracking-wider">Pago</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 pb-1">
              <span>03</span>
              <span className="uppercase tracking-wider">Confirmación</span>
            </div>
          </div>
        </div>

        {/* Section Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold tracking-widest text-[#D4FF00] uppercase block">
              TU SELECCIÓN / STREETWEAR
            </span>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white font-black leading-none">
              TU BOLSA.{' '}
              <span className="text-gray-400 font-mono text-3xl sm:text-4xl md:text-5xl font-normal">
                ({totalItemCount.toString().padStart(2, '0')})
              </span>
            </h1>
            <p className="text-sm font-sans text-gray-400 pt-1">
              Buenas piezas. Mejores decisiones.
            </p>
          </div>

          <button
            onClick={onContinueShopping}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-[#D4FF00] transition-colors cursor-pointer shrink-0 pb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>SEGUIR COMPRANDO</span>
          </button>
        </div>

        {/* Main Grid: Products Table (Left 8 Cols) & Summary Card (Right 4 Cols) */}
        {items.length === 0 ? (
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-5">

            {/* Friendly Rick Mascot with smooth floating animation */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[#D4FF00]/10 blur-2xl rounded-full scale-90 pointer-events-none" />

              <div className="relative w-28 sm:w-32 h-44 sm:h-52 flex items-end justify-center animate-smooth-float transform-gpu">
                <img
                  src="/images/gj-mascot.png"
                  alt="gj. Rick Streetwear Mascot"
                  className="h-full w-auto object-contain object-bottom filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
                />
              </div>

              {/* Ground shadow */}
              <div className="w-24 h-2.5 bg-black/80 rounded-full blur-[2px] -mt-1 pointer-events-none" />
            </div>

            <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-white font-extrabold leading-none pt-2">
              TU BOLSA ESTÁ VACÍA
            </h3>

            <p className="text-xs sm:text-sm font-mono text-gray-400 max-w-sm mx-auto leading-relaxed">
              ¿Todavía sin prendas? Explora la tienda antes de que todo se agote.
            </p>

            <button
              onClick={onContinueShopping}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#D4FF00]/15 cursor-pointer mt-2"
            >
              <span>EXPLORAR PRODUCTOS</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* Left 8 Cols: Products Table */}
            <div className="lg:col-span-8 space-y-8">

              {/* Table Container */}
              <div className="border-t border-[#1f1f1f]">

                {/* Table Header Row */}
                <div className="hidden sm:grid sm:grid-cols-12 py-3 border-b border-[#1f1f1f] text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                  <div className="sm:col-span-7">PRODUCTO</div>
                  <div className="sm:col-span-3 text-center">CANTIDAD</div>
                  <div className="sm:col-span-2 text-right">TOTAL</div>
                </div>

                {/* Product Items List */}
                <div className="divide-y divide-[#181818]">
                  {items.map((item) => {
                    const isCap = item.product.category === 'gorras'
                    const lineTotal = item.product.price * item.quantity

                    return (
                      <div
                        key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                        className="py-6 sm:py-7 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center"
                      >
                        {/* Col 1: Product Info (7 cols) */}
                        <div className="sm:col-span-7 flex items-start space-x-4">
                          <img
                            src={item.product.image_url}
                            alt={item.product.title}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover bg-black border border-[#242424] shrink-0"
                          />
                          <div className="space-y-1 min-w-0">
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                              GJ / UNDERGROUND ESSENTIALS
                            </span>
                            <h3 className="font-sans text-base sm:text-lg font-bold text-white leading-snug">
                              {item.product.title}
                            </h3>
                            <div className="text-xs text-gray-400 font-sans">
                              {item.selectedColor || 'Negro'} /{' '}
                              {isCap ? 'Ajustable' : `Talla ${item.selectedSize || 'Standard'}`}
                            </div>
                            <div className="text-xs font-mono text-gray-400 pt-0.5">
                              ${item.product.price.toLocaleString('es-MX')} MXN / unidad
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D4FF00] font-semibold pt-0.5">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Disponible</span>
                            </div>
                          </div>
                        </div>

                        {/* Col 2: Quantity Controls (3 cols) */}
                        <div className="sm:col-span-3 flex flex-col items-start sm:items-center justify-center space-y-2">
                          <div className="inline-flex items-center border border-[#2b2b2b] bg-[#111111] text-xs font-mono">
                            <button
                              onClick={() =>
                                onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.selectedSize, item.selectedColor)
                              }
                              className="px-2.5 py-1.5 hover:bg-[#202020] hover:text-[#D4FF00] transition-colors cursor-pointer text-gray-400"
                              title="Restar una unidad"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-4 py-1.5 text-white font-bold text-center min-w-[32px]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)
                              }
                              className="px-2.5 py-1.5 hover:bg-[#202020] hover:text-[#D4FF00] transition-colors cursor-pointer text-gray-400"
                              title="Sumar una unidad"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-red-400 transition-colors cursor-pointer pt-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar</span>
                          </button>
                        </div>

                        {/* Col 3: Line Total (2 cols) */}
                        <div className="sm:col-span-2 text-left sm:text-right font-mono font-bold text-lg sm:text-xl text-white">
                          ${lineTotal.toLocaleString('es-MX')}
                        </div>

                      </div>
                    )
                  })}
                </div>

                {/* Bottom reservation note */}
                <div className="py-4 border-t border-[#181818] flex items-center gap-2 text-xs font-mono text-gray-400">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span>Las piezas de tu bolsa se reservan al completar el pago.</span>
                </div>

              </div>

              {/* Streetwear Typography Badge */}
              <div className="pt-4 flex items-center gap-3">
                <span className="font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider text-white font-black leading-none">
                  PIEZAS LIMITADAS. ACTITUD ILIMITADA.
                </span>
                <span className="w-7 h-7 sm:w-8 sm:h-8 bg-[#D4FF00] text-black font-black flex items-center justify-center text-base sm:text-lg select-none shadow-md">
                  ✱
                </span>
              </div>

            </div>

            {/* Right 4 Cols: Purchase Summary Card */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-[#0e0e0e] border border-[#202020] p-6 sm:p-7 space-y-6 shadow-2xl">

                <h3 className="font-display text-2xl uppercase tracking-wider text-white font-extrabold leading-none pb-1">
                  RESUMEN DE COMPRA
                </h3>

                {/* Free Shipping Highlight Banner & Progress Bar */}
                <div className="bg-[#13160e] border border-[#283212] p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#D4FF00] font-bold">
                    <Truck className="w-4 h-4 stroke-[2]" />
                    <span>
                      {isFreeShipping
                        ? 'Tu envío va por nuestra cuenta.'
                        : `Te faltan $${remainingForFreeShipping.toLocaleString('es-MX')} MXN para envío gratis.`}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-[#202020] overflow-hidden rounded-full">
                    <div
                      className="h-full bg-[#D4FF00] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="text-[10px] font-mono text-gray-400">
                    {isFreeShipping
                      ? 'Superaste los $1,999 MXN. Envío estándar gratis.'
                      : 'Compras a partir de $1,999 MXN reciben envío estándar gratis a todo México.'}
                  </p>
                </div>

                {/* Subtotals Breakdown */}
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Subtotal · {totalItemCount} artículos</span>
                    <span className="font-bold text-white">
                      ${subtotal.toLocaleString('es-MX')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-300">
                    <span>Envío estándar</span>
                    <span className="font-bold text-[#D4FF00]">
                      {isFreeShipping ? 'GRATIS' : '$149 MXN'}
                    </span>
                  </div>

                  {/* Applied Coupon Display */}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-[#D4FF00] pt-1">
                      <div className="flex items-center gap-1.5">
                        <span>Cupón ({appliedCoupon.code})</span>
                        <button
                          type="button"
                          onClick={onRemoveCoupon}
                          className="text-gray-400 hover:text-red-400 text-[10px] underline ml-1"
                          title="Quitar cupón"
                        >
                          (Quitar)
                        </button>
                      </div>
                      <span className="font-bold">
                        -${discountAmount.toLocaleString('es-MX')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="pt-4 border-t border-[#1f1f1f] space-y-1">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-sans font-bold text-base text-white block">
                        Total
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 block">
                        IVA incluido. Sin cargos adicionales.
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-gray-400 mr-1.5">MXN</span>
                      <span className="font-mono text-3xl font-black text-white">
                        ${finalTotal.toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Action Button: CONTINUAR AL PAGO */}
                <button
                  onClick={onProceedToCheckout}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-xl shadow-[#D4FF00]/20 cursor-pointer"
                >
                  <span>CONTINUAR AL PAGO</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>

                {/* Security Footnote */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-gray-400">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Pago seguro y cifrado</span>
                </div>

                {/* Coupon Code Accordion */}
                <div className="pt-3 border-t border-[#1a1a1a]">
                  <button
                    type="button"
                    onClick={() => setCouponOpen(!couponOpen)}
                    className="w-full flex items-center justify-between text-xs font-mono text-gray-300 hover:text-white cursor-pointer py-1"
                  >
                    <span>¿Tienes un código de descuento?</span>
                    <span className="text-sm">{couponOpen ? '−' : '+'}</span>
                  </button>

                  {couponOpen && (
                    <form
                      onSubmit={handleApplyCouponSubmit}
                      className="pt-3 space-y-2 animate-in fade-in duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Ej. SALTILLO_LOCAL o DROP004"
                          className="flex-1 bg-[#141414] border border-[#2b2b2b] focus:border-[#D4FF00] px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none uppercase"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#202020] hover:bg-[#D4FF00] hover:text-black text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          APLICAR
                        </button>
                      </div>

                      {couponFeedback && (
                        <div
                          className={`text-[11px] font-mono flex items-center gap-1.5 ${couponFeedback.type === 'success'
                            ? 'text-[#D4FF00]'
                            : 'text-red-400'
                            }`}
                        >
                          {couponFeedback.type === 'success' ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5" />
                          )}
                          <span>{couponFeedback.text}</span>
                        </div>
                      )}
                    </form>
                  )}
                </div>

                {/* Payment Logos Footer */}
                <div className="pt-3 border-t border-[#1a1a1a] text-center">
                  <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">
                    VISA · MASTERCARD · MERCADO PAGO · SPEI
                  </span>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Bottom 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 sm:pt-14 border-t border-[#181818]">

          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-sm bg-[#121212] border border-[#262626] flex items-center justify-center text-[#D4FF00] shrink-0 mt-0.5">
              <Truck className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                DE NUESTRA CALLE A LA TUYA
              </h4>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Envíos a todo México. Gratis desde $1,999.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-sm bg-[#121212] border border-[#262626] flex items-center justify-center text-[#D4FF00] shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                COMPRA CON CONFIANZA
              </h4>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Pagos seguros con tarjeta y Mercado Pago.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-sm bg-[#121212] border border-[#262626] flex items-center justify-center text-[#D4FF00] shrink-0 mt-0.5">
              <RefreshCw className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                EL FIT TIENE QUE SER TUYO
              </h4>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Cambios fáciles dentro de los primeros 15 días.
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* Minimal Footer */}
      <footer className="w-full bg-[#050505] border-t border-[#161616] py-6 px-4 sm:px-8 text-xs font-mono text-gray-400 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            © 2026 GJ CLOTHING AND CAPS.
          </div>
          <div className="flex flex-wrap items-center space-x-6 text-[11px]">
            <a href="#ayuda" className="hover:text-white transition-colors">
              Ayuda
            </a>
            <a href="#privacidad" className="hover:text-white transition-colors">
              Privacidad
            </a>
            <a href="#terminos" className="hover:text-white transition-colors">
              Términos y condiciones
            </a>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-gray-500 hover:text-[#D4FF00] transition-colors cursor-pointer font-bold tracking-wider uppercase text-[10px]"
                title="Acceso Administración"
              >
                [Panel Admin]
              </button>
            )}
          </div>
          <div className="text-[10px] tracking-widest text-gray-400">
            VISA / MASTERCARD / MERCADO PAGO
          </div>
        </div>
      </footer>

    </div>
  )
}

