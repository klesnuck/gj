import React, { useState } from 'react'
import {
  ArrowLeft,
  Lock,
  Check,
  Truck,
  CreditCard,
  ExternalLink,
  MapPin,
  MessageCircle,
  AlertCircle,
} from 'lucide-react'
import type { CartItem, Coupon, Order } from '../../types/database.types'

interface CheckoutPageProps {
  items: CartItem[]
  appliedCoupon: Coupon | null
  onApplyCoupon: (code: string) => { success: boolean; message: string }
  onRemoveCoupon: () => void
  onBackToCart: () => void
  onPlaceOrder: (orderPayload: {
    customerName: string
    customerEmail: string
    customerPhone: string
    shippingType: 'saltillo_local' | 'paqueteria_nacional'
    shippingAddress: string
    paymentMethod: string
    total: number
  }) => Promise<Order>
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onBackToCart,
  onPlaceOrder,
}) => {
  // Form State initialized completely empty
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [street, setStreet] = useState('')
  const [interior, setInterior] = useState('')
  const [colonia, setColonia] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('Coahuila')
  const [country] = useState('México')

  const [shippingMethod, setShippingMethod] = useState<'paqueteria_nacional' | 'saltillo_local'>('saltillo_local')
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'mercadopago'>('tarjeta')

  // Card details
  const [cardHolder, setCardHolder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [useShippingForBilling, setUseShippingForBilling] = useState(true)

  // Coupon code state
  const [couponCode, setCouponCode] = useState('')
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const totalItemCount = items.reduce((acc, it) => acc + it.quantity, 0)
  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0)

  // Calculate discount
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
    const res = onApplyCoupon(couponCode.trim())
    if (res.success) {
      setCouponFeedback({ type: 'success', text: res.message })
      setCouponCode('')
    } else {
      setCouponFeedback({ type: 'error', text: res.message })
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !phone || !firstName || !lastName || !street || !colonia || !zipCode || !city) {
      setErrorMessage('Por favor llena todos los campos obligatorios (*).')
      return
    }

    setIsProcessing(true)

    try {
      const fullAddress = `${street} ${interior ? `Int. ${interior}, ` : ''}${colonia}, C.P. ${zipCode}, ${city}, ${state}, ${country}`
      const fullName = `${firstName} ${lastName}`.trim()

      await onPlaceOrder({
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingType: shippingMethod,
        shippingAddress: fullAddress,
        paymentMethod: paymentMethod === 'tarjeta' ? 'Tarjeta de crédito / débito' : 'Mercado Pago',
        total: finalTotal,
      })
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al procesar el pedido. Intenta nuevamente.')
      setIsProcessing(false)
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

      {/* Checkout Minimal Header */}
      <header className="w-full bg-[#090909]/95 backdrop-blur-md border-b border-[#1c1c1c] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={onBackToCart}
            className="flex items-center space-x-3 group cursor-pointer text-left"
          >
            <span className="font-display text-3xl sm:text-4xl tracking-tighter font-extrabold text-white leading-none">
              gj.
            </span>
            <div className="flex flex-col text-[9px] sm:text-[10px] font-mono uppercase tracking-widest font-bold text-gray-400 group-hover:text-white transition-colors leading-tight">
              <span>CLOTHING</span>
              <span>AND CAPS</span>
            </div>
          </button>

          {/* Secure Badge */}
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
            <Lock className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span className="text-[11px] tracking-wider uppercase text-gray-300 font-bold">
              CHECKOUT SEGURO / MXN
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
        
        {/* Back link & Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#181818]">
          <button
            onClick={onBackToCart}
            className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al carrito</span>
          </button>

          {/* Steps */}
          <div className="flex items-center space-x-6 sm:space-x-8 text-xs font-mono">
            <button
              onClick={onBackToCart}
              className="flex items-center space-x-1.5 text-gray-400 hover:text-white cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#D4FF00] stroke-[2.5]" />
              <span className="uppercase tracking-wider">Carrito</span>
            </button>
            <div className="flex items-center space-x-1.5 text-[#D4FF00] font-bold border-b-2 border-[#D4FF00] pb-1">
              <span>02</span>
              <span className="uppercase tracking-wider">Pago</span>
            </div>
            <div className="flex items-center space-x-1.5 text-gray-600 pb-1">
              <span>03</span>
              <span className="uppercase tracking-wider">Confirmación</span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold tracking-widest text-[#D4FF00] uppercase block">
              UN PASO MÁS. EL FIT ES TUYO.
            </span>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white font-black leading-none">
              HAZLO TUYO.
            </h1>
            <p className="text-sm font-sans text-gray-400 pt-1">
              Completa tus datos y prepárate para recibir tu siguiente fit.
            </p>
          </div>

          <span className="text-xs font-mono tracking-widest text-gray-500 uppercase pb-1">
            MÉXICO / PRECIOS EN MXN
          </span>
        </div>

        {/* Checkout Grid: Form (Left 8 Cols) & Order Summary (Right 4 Cols) */}
        {items.length === 0 ? (
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-5">
            <div className="relative flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[#D4FF00]/10 blur-2xl rounded-full scale-90 pointer-events-none" />
              <div className="relative w-28 sm:w-32 h-44 sm:h-52 flex items-end justify-center animate-smooth-float transform-gpu">
                <img
                  src="/images/gj-mascot.png"
                  alt="gj. Rick Streetwear Mascot"
                  className="h-full w-auto object-contain object-bottom filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
                />
              </div>
              <div className="w-24 h-2.5 bg-black/80 rounded-full blur-[2px] -mt-1 pointer-events-none" />
            </div>

            <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-white font-extrabold leading-none pt-2">
              TU BOLSA ESTÁ VACÍA
            </h3>

            <p className="text-xs sm:text-sm font-mono text-gray-400 max-w-sm mx-auto leading-relaxed">
              ¿Todavía sin prendas? Explora nuestro catálogo antes de que se agote.
            </p>

            <button
              type="button"
              onClick={onBackToCart}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#D4FF00]/15 cursor-pointer mt-2"
            >
              <span>IR AL CATÁLOGO</span>
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left 8 Cols: Form Sections */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Section 01: Datos de contacto */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c1c1c]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#D4FF00]">01</span>
                  <h3 className="font-sans text-base font-bold text-white uppercase tracking-wide">
                    Datos de contacto
                  </h3>
                </div>
                <button
                  type="button"
                  className="text-xs font-mono text-gray-400 hover:text-[#D4FF00] transition-colors"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-[#121212] border border-[#252525] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="844 123 4567"
                    className="w-full bg-[#121212] border border-[#252525] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <p className="text-[11px] font-mono text-gray-500">
                Aquí recibirás la confirmación y el seguimiento de tu pedido.
              </p>
            </div>

            {/* Section 02: Dirección de entrega */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c1c1c]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#D4FF00]">02</span>
                  <h3 className="font-sans text-base font-bold text-white uppercase tracking-wide">
                    Dirección de entrega
                  </h3>
                </div>
                <span className="text-xs font-mono text-gray-500">* Campos obligatorios</span>
              </div>

              <div className="space-y-4">
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full bg-[#121212] border border-[#252525] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Tus apellidos"
                      className="w-full bg-[#121212] border border-[#252525] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Street and Interior */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 space-y-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      Calle y número *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Calle y número exterior"
                      className="w-full bg-[#121212] border border-[#252525] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      Interior (opcional)
                    </label>
                    <input
                      type="text"
                      value={interior}
                      onChange={(e) => setInterior(e.target.value)}
                      placeholder="Depto / Interior"
                      className="w-full bg-[#121212] border border-[#252525] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Colonia and Zip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      Colonia *
                    </label>
                    <input
                      type="text"
                      required
                      value={colonia}
                      onChange={(e) => setColonia(e.target.value)}
                      placeholder="Colonia / Fraccionamiento"
                      className="w-full bg-[#121212] border border-[#252525] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      Código postal *
                    </label>
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="C.P. (5 dígitos)"
                      className="w-full bg-[#121212] border border-[#252525] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* City, State and Country */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      Alcaldía o municipio *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ciudad / Municipio"
                      className="w-full bg-[#121212] border border-[#252525] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      Estado *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-[#121212] border border-[#252525] focus:border-[#D4FF00] px-3 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Ciudad de México">Ciudad de México</option>
                      <option value="Coahuila">Coahuila (Saltillo / Torreón)</option>
                      <option value="Nuevo León">Nuevo León (Monterrey)</option>
                      <option value="Jalisco">Jalisco (Guadalajara)</option>
                      <option value="Querétaro">Querétaro</option>
                      <option value="Puebla">Puebla</option>
                      <option value="Estado de México">Estado de México</option>
                      <option value="Guanajuato">Guanajuato</option>
                      <option value="Yucatán">Yucatán</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      País *
                    </label>
                    <select
                      disabled
                      value={country}
                      className="w-full bg-[#121212] border border-[#252525] px-3 py-2.5 text-xs sm:text-sm font-mono text-gray-300 focus:outline-none cursor-not-allowed opacity-80"
                    >
                      <option value="México">México</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Section 03: Método de envío */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c1c1c]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#D4FF00]">03</span>
                  <h3 className="font-sans text-base font-bold text-white uppercase tracking-wide">
                    Método de envío
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                
                {/* Option 1: Envío estándar nacional */}
                <label
                  onClick={() => setShippingMethod('paqueteria_nacional')}
                  className={`flex items-start justify-between p-4 border transition-all cursor-pointer ${
                    shippingMethod === 'paqueteria_nacional'
                      ? 'border-[#D4FF00] bg-[#14170e]/80 shadow-[0_0_15px_rgba(212,255,0,0.1)]'
                      : 'border-[#222222] bg-[#121212] hover:border-[#333]'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={shippingMethod === 'paqueteria_nacional'}
                      onChange={() => setShippingMethod('paqueteria_nacional')}
                      className="mt-1 accent-[#D4FF00] cursor-pointer"
                    />
                    <div className="flex items-start space-x-2.5">
                      <Truck className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-sans text-sm font-bold text-white">
                          Envío estándar nacional
                        </div>
                        <div className="text-xs font-mono text-gray-400 mt-0.5">
                          Entrega en 3-5 días hábiles a partir del despacho (DHL / Estafeta / FedEx).
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#D4FF00] tracking-wider uppercase shrink-0 ml-3">
                    GRATIS
                  </span>
                </label>

                {/* Option 2: Entrega Local en Saltillo */}
                <label
                  onClick={() => setShippingMethod('saltillo_local')}
                  className={`flex items-start justify-between p-4 border transition-all cursor-pointer ${
                    shippingMethod === 'saltillo_local'
                      ? 'border-[#D4FF00] bg-[#14170e]/80 shadow-[0_0_15px_rgba(212,255,0,0.1)]'
                      : 'border-[#222222] bg-[#121212] hover:border-[#333]'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={shippingMethod === 'saltillo_local'}
                      onChange={() => setShippingMethod('saltillo_local')}
                      className="mt-1 accent-[#D4FF00] cursor-pointer"
                    />
                    <div className="flex items-start space-x-2.5">
                      <MapPin className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-sans text-sm font-bold text-white flex items-center gap-2">
                          <span>📍 Entrega Local en Saltillo</span>
                          <span className="px-1.5 py-0.5 bg-[#D4FF00] text-black text-[9px] font-mono font-black uppercase">
                            SALTILLO LOCAL
                          </span>
                        </div>
                        <div className="text-xs font-mono text-gray-400 mt-0.5">
                          Entrega personal o punto medio en Saltillo, Coah. (Mismo día / 24 hrs por WhatsApp).
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#D4FF00] tracking-wider uppercase shrink-0 ml-3">
                    GRATIS
                  </span>
                </label>

              </div>
            </div>

            {/* Section 04: Método de pago */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c1c1c]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#D4FF00]">04</span>
                  <h3 className="font-sans text-base font-bold text-white uppercase tracking-wide">
                    Método de pago
                  </h3>
                </div>
                <span className="text-xs font-mono text-gray-500">
                  Todas las transacciones están cifradas
                </span>
              </div>

              <div className="space-y-3">
                
                {/* Option 1: Tarjeta de crédito o débito */}
                <div
                  className={`border transition-all ${
                    paymentMethod === 'tarjeta'
                      ? 'border-[#D4FF00] bg-[#111111] shadow-[0_0_15px_rgba(212,255,0,0.1)]'
                      : 'border-[#222222] bg-[#121212]'
                  }`}
                >
                  <label
                    onClick={() => setPaymentMethod('tarjeta')}
                    className="flex items-center justify-between p-4 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'tarjeta'}
                        onChange={() => setPaymentMethod('tarjeta')}
                        className="accent-[#D4FF00] cursor-pointer"
                      />
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-[#D4FF00]" />
                        <span className="font-sans text-sm font-bold text-white">
                          Tarjeta de crédito o débito
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">
                      VISA / Mastercard
                    </span>
                  </label>

                  {/* Expanded Card Inputs */}
                  {paymentMethod === 'tarjeta' && (
                    <div className="p-4 pt-0 space-y-4 border-t border-[#1c1c1c] mt-1">
                      
                      <div className="space-y-1.5 pt-3">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                          Nombre del titular *
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === 'tarjeta'}
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Nombre como aparece en la tarjeta"
                          className="w-full bg-[#161616] border border-[#2b2b2b] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                          Número de tarjeta *
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === 'tarjeta'}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-[#161616] border border-[#2b2b2b] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                            Vencimiento *
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'tarjeta'}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM / AA"
                            className="w-full bg-[#161616] border border-[#2b2b2b] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                            CVV *
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            required={paymentMethod === 'tarjeta'}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="CVV (3 o 4 dígitos)"
                            className="w-full bg-[#161616] border border-[#2b2b2b] focus:border-[#D4FF00] px-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <label className="flex items-center space-x-2.5 text-xs font-mono text-gray-400 pt-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={useShippingForBilling}
                          onChange={(e) => setUseShippingForBilling(e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#D4FF00] cursor-pointer"
                        />
                        <span>Usar la dirección de entrega para la facturación</span>
                      </label>

                    </div>
                  )}
                </div>

                {/* Option 2: Mercado Pago */}
                <label
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`flex items-center justify-between p-4 border transition-all cursor-pointer ${
                    paymentMethod === 'mercadopago'
                      ? 'border-[#D4FF00] bg-[#111111]'
                      : 'border-[#222222] bg-[#121212] hover:border-[#333]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'mercadopago'}
                      onChange={() => setPaymentMethod('mercadopago')}
                      className="accent-[#D4FF00] cursor-pointer"
                    />
                    <span className="font-sans text-sm font-bold text-white">
                      Mercado Pago (Tarjeta, OXXO, SPEI)
                    </span>
                  </div>

                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </label>

              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-4 bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

          </div>

          {/* Right 4 Cols: Order Summary Sidebar (TU PEDIDO) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-[#0e0e0e] border border-[#202020] p-6 sm:p-7 space-y-6 shadow-2xl">
              
              <div className="flex items-center justify-between pb-1 border-b border-[#1c1c1c]">
                <h3 className="font-display text-2xl uppercase tracking-wider text-white font-extrabold leading-none">
                  TU PEDIDO
                </h3>
                <span className="text-xs font-mono text-gray-400 font-bold">
                  {totalItemCount} ARTÍCULOS
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {items.map((item, index) => {
                  const isCap = item.product.category === 'gorras'
                  const lineTotal = item.product.price * item.quantity

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="relative w-14 h-14 bg-black border border-[#252525] shrink-0">
                          <img
                            src={item.product.image_url}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-sans font-bold text-white text-xs truncate">
                            {item.product.title}
                          </div>
                          <div className="text-[11px] text-gray-400 font-sans truncate">
                            {item.selectedColor || 'Negro'} /{' '}
                            {isCap ? 'Ajustable' : `Talla ${item.selectedSize || 'Standard'}`}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            ${item.product.price.toLocaleString('es-MX')} / unidad
                          </div>
                        </div>
                      </div>

                      <div className="font-bold text-white text-xs whitespace-nowrap">
                        ${lineTotal.toLocaleString('es-MX')}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Coupon Code Input */}
              <div className="pt-3 border-t border-[#1c1c1c] space-y-2">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  Código de descuento
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Escribe tu código"
                    className="flex-1 bg-[#141414] border border-[#2b2b2b] focus:border-[#D4FF00] px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCouponSubmit}
                    className="px-3.5 py-2 bg-[#202020] hover:bg-[#D4FF00] hover:text-black text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    APLICAR
                  </button>
                </div>

                {couponFeedback && (
                  <div
                    className={`text-[11px] font-mono flex items-center gap-1.5 ${
                      couponFeedback.type === 'success' ? 'text-[#D4FF00]' : 'text-red-400'
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
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-[#1c1c1c] text-xs font-mono">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Subtotal · {totalItemCount} artículos</span>
                  <span className="text-white font-bold">
                    ${subtotal.toLocaleString('es-MX')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <span>Envío {shippingMethod === 'saltillo_local' ? '(Saltillo)' : 'estándar'}</span>
                  <span className="text-[#D4FF00] font-bold">GRATIS</span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-[#D4FF00]">
                    <div className="flex items-center gap-1">
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
              <div className="pt-3 border-t border-[#1c1c1c] space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-sans font-bold text-base text-white">Total</span>
                  <div className="text-right">
                    <span className="text-xs font-mono text-gray-400 mr-1.5">MXN</span>
                    <span className="font-mono text-3xl font-black text-white">
                      ${finalTotal.toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-gray-400">
                  IVA incluido. Sin cargos adicionales.
                </div>
                <div className="text-[11px] font-mono text-[#D4FF00] flex items-center gap-1.5 pt-0.5 font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Envío gratis aplicado a tu pedido.</span>
                </div>
              </div>

              {/* Big CTA Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-[#D4FF00] hover:bg-[#bfe600] disabled:bg-gray-600 text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-xl shadow-[#D4FF00]/20 cursor-pointer"
              >
                {isProcessing ? (
                  <span>PROCESANDO PAGO...</span>
                ) : (
                  <>
                    <span>PAGAR ${finalTotal.toLocaleString('es-MX')} MXN</span>
                    <Lock className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <p className="text-[10px] font-mono text-gray-500 leading-relaxed text-center">
                Al realizar tu compra, aceptas los Términos y condiciones y el Aviso de privacidad de GJ Clothing and Caps.
              </p>

              {/* Help Box */}
              <div className="p-3 bg-[#141414] border border-[#222222] flex items-center gap-2.5 text-[11px] font-mono text-gray-400">
                <MessageCircle className="w-4 h-4 text-gray-500 shrink-0" />
                <span>¿Necesitas ayuda con tu pedido? <a href="mailto:hola@gjclothing.mx" className="text-white underline">hola@gjclothing.mx</a></span>
              </div>

              {/* Streetwear Branding Banner */}
              <div className="pt-2 border-t border-[#1a1a1a]">
                <div className="font-display text-xl sm:text-2xl font-black uppercase text-white leading-tight">
                  DE NUESTRA CALLE. A LA TUYA.
                </div>
                <div className="text-[10px] font-mono text-[#D4FF00] tracking-widest uppercase font-bold">
                  GJ* / BUILT FOR THE STREETS.
                </div>
              </div>

            </div>
          </div>

        </form>
        )}

      </main>

      {/* Minimal Footer */}
      <footer className="w-full bg-[#050505] border-t border-[#161616] py-6 px-4 sm:px-8 text-xs font-mono text-gray-400 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            © 2026 GJ CLOTHING AND CAPS.
          </div>
          <div className="flex items-center space-x-6 text-[11px]">
            <a href="#ayuda" className="hover:text-white transition-colors">
              Ayuda
            </a>
            <a href="#privacidad" className="hover:text-white transition-colors">
              Privacidad
            </a>
            <a href="#terminos" className="hover:text-white transition-colors">
              Términos y condiciones
            </a>
          </div>
          <div className="text-[10px] tracking-widest text-gray-400">
            VISA / MASTERCARD / MERCADO PAGO
          </div>
        </div>
      </footer>

    </div>
  )
}

