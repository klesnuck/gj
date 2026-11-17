import { useState, useEffect } from 'react'
import {
  Clock,
  Plus,
  Check,
  Copy,
  Trash2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Search,
  Tag,
} from 'lucide-react'
import type { Coupon, Product } from '../../types/database.types'

interface DiscountsViewProps {
  coupons: Coupon[]
  products?: Product[]
  onAddCoupon?: (coupon: Coupon) => void
  onToggleCoupon?: (couponId: string) => void
  onDeleteCoupon?: (couponId: string) => void
}

export const DiscountsView = ({
  coupons: initialCoupons,
  products = [],
  onAddCoupon,
  onToggleCoupon,
  onDeleteCoupon,
}: DiscountsViewProps) => {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [createdSuccess, setCreatedSuccess] = useState(false)

  useEffect(() => {
    setCoupons(initialCoupons)
  }, [initialCoupons])

  // Form states
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState<number>(15)
  const [minPurchase, setMinPurchase] = useState<number>(0)
  const [selectedDurationHours, setSelectedDurationHours] = useState<number>(72) // 72 hours default
  const [customMinutes, setCustomMinutes] = useState<string>('')

  // Scope states (Toda la tienda vs Prendas seleccionadas)
  const [appliesTo, setAppliesTo] = useState<'all' | 'specific'>('all')
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [productSearch, setProductSearch] = useState('')

  // Duration preset buttons
  const durationPresets = [
    { label: '24 Horas (1 día)', hours: 24 },
    { label: '48 Horas (2 días)', hours: 48 },
    { label: '3 Días (72 hrs)', hours: 72 },
    { label: '7 Días (1 semana)', hours: 168 },
    { label: '30 Días (1 mes)', hours: 720 },
  ]

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || discountValue <= 0) return

    if (appliesTo === 'specific' && selectedProductIds.length === 0) {
      alert('Por favor selecciona al menos una prenda para aplicar el descuento específico.')
      return
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '_')
    const parsedMinutes = parseInt(customMinutes, 10)
    let expiresDate: Date
    let durationLabel: string

    if (!isNaN(parsedMinutes) && parsedMinutes > 0) {
      expiresDate = new Date(Date.now() + parsedMinutes * 60 * 1000)
      if (parsedMinutes === 60) {
        durationLabel = '1 Hora'
      } else if (parsedMinutes > 60 && parsedMinutes % 60 === 0) {
        durationLabel = `${parsedMinutes / 60} Horas`
      } else {
        durationLabel = `${parsedMinutes} Minutos`
      }
    } else {
      expiresDate = new Date(Date.now() + selectedDurationHours * 3600 * 1000)
      const preset = durationPresets.find((p) => p.hours === selectedDurationHours)
      durationLabel = preset
        ? preset.label.split(' ')[0] + ' ' + preset.label.split(' ')[1]
        : `${selectedDurationHours} Horas`
    }

    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: cleanCode,
      discountType,
      discountValue,
      durationLabel,
      expiresAt: expiresDate.toISOString(),
      isActive: true,
      minPurchase,
      usesCount: 0,
      createdAt: 'Hoy',
      appliesTo,
      productIds: appliesTo === 'specific' ? selectedProductIds : [],
    }

    const updated = [newCoupon, ...coupons]
    setCoupons(updated)
    onAddCoupon?.(newCoupon)

    // Reset form
    setCode('')
    setCustomMinutes('')
    setSelectedProductIds([])
    setCreatedSuccess(true)
    setTimeout(() => setCreatedSuccess(false), 3000)
  }

  const handleToggle = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    )
    onToggleCoupon?.(id)
  }

  const handleDelete = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id))
    onDeleteCoupon?.(id)
  }

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode)
    setCopiedCode(couponCode)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Calculate remaining time for display
  const getRemainingTime = (expiresAt: string, isActive: boolean) => {
    if (!isActive) return { text: 'PAUSADO', expired: true }
    const now = Date.now()
    const expiry = new Date(expiresAt).getTime()
    const diff = expiry - now

    if (diff <= 0) {
      return { text: 'EXPIRADO', expired: true }
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days >= 1) {
      return { text: `${days}d ${hours % 24}h restantes`, expired: false }
    }
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours === 0) {
      return { text: `${minutes}m restantes`, expired: false }
    }
    return { text: `${hours}h ${minutes}m restantes`, expired: false }
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase block mb-1">
            MARKETING · PROMOCIONES TEMPORALES
          </span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white font-extrabold leading-none">
            CUPONES Y DESCUENTOS
          </h1>
          <p className="text-xs sm:text-sm font-sans text-gray-400 mt-1">
            Crea códigos de descuento y actívalos por el tiempo exacto que necesites.
          </p>
        </div>
      </div>

      {/* 2 Columns: Create Form (Left) & Active Coupons (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form to Activate New Coupon (5 Cols) */}
        <div className="lg:col-span-5 bg-[#101010] border border-[#202020] p-6 space-y-5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#1c1c1c]">
            <div className="w-7 h-7 rounded-sm bg-[#182109] text-[#D4FF00] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white">
              ACTIVAR NUEVO CUPÓN
            </h3>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-mono">
            {/* Coupon Code */}
            <div className="space-y-1.5">
              <label className="text-gray-400 uppercase tracking-wider block">
                Código del Cupón *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej. SALTILLO15 o DROP004"
                className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-3.5 py-2.5 text-sm font-bold tracking-widest text-[#D4FF00] focus:outline-none"
              />
            </div>

            {/* Discount Type & Value Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase tracking-wider block">
                  Tipo
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo ($ MXN)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase tracking-wider block">
                  Valor {discountType === 'percentage' ? '(%)' : '($ MXN)'} *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-3 py-2.5 text-xs font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Minimum Purchase */}
            <div className="space-y-1.5">
              <label className="text-gray-400 uppercase tracking-wider block">
                Compra Mínima ($ MXN)
              </label>
              <input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(Number(e.target.value))}
                placeholder="0 = Sin mínimo"
                className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-3.5 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Scope Selection: Toda la tienda vs Prendas seleccionadas */}
            <div className="space-y-2 pt-2 border-t border-[#1c1c1c]">
              <label className="text-gray-300 font-bold uppercase tracking-wider block flex items-center justify-between">
                <span>Aplicar Descuento a: *</span>
                {appliesTo === 'specific' && (
                  <span className="text-[10px] font-mono text-[#D4FF00] font-bold">
                    {selectedProductIds.length} seleccionada{selectedProductIds.length === 1 ? '' : 's'}
                  </span>
                )}
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAppliesTo('all')}
                  className={`py-2 px-3 text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                    appliesTo === 'all'
                      ? 'border-[#D4FF00] bg-[#182109] text-[#D4FF00] shadow-sm'
                      : 'border-[#242424] bg-[#141414] text-gray-400 hover:text-white hover:border-[#383838]'
                  }`}
                >
                  🌐 Toda la Tienda
                </button>
                <button
                  type="button"
                  onClick={() => setAppliesTo('specific')}
                  className={`py-2 px-3 text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                    appliesTo === 'specific'
                      ? 'border-[#D4FF00] bg-[#182109] text-[#D4FF00] shadow-sm'
                      : 'border-[#242424] bg-[#141414] text-gray-400 hover:text-white hover:border-[#383838]'
                  }`}
                >
                  🎯 Prendas Específicas
                </button>
              </div>

              {/* Product Picker if appliesTo === 'specific' */}
              {appliesTo === 'specific' && (
                <div className="mt-2.5 p-3 bg-[#0d0d0d] border border-[#222222] space-y-2.5 rounded-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o marca..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-[#141414] border border-[#262626] focus:border-[#D4FF00] pl-8 pr-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                    {products
                      .filter((p) =>
                        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                        (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase()))
                      )
                      .map((p) => {
                        const isSelected = selectedProductIds.includes(p.id)
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleToggleProduct(p.id)}
                            className={`flex items-center justify-between p-2 border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#182109] border-[#D4FF00]'
                                : 'bg-[#121212] border-[#202020] hover:border-[#333]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={p.image_url || '/images/product-cap-black.jpg'}
                                alt={p.title}
                                className="w-8 h-8 object-cover bg-black border border-[#262626] shrink-0"
                              />
                              <div className="min-w-0">
                                <span className={`text-xs font-sans font-bold truncate block ${
                                  isSelected ? 'text-[#D4FF00]' : 'text-white'
                                }`}>
                                  {p.title}
                                </span>
                                <span className="text-[10px] font-mono text-gray-400">
                                  {p.brand ? `${p.brand} · ` : ''}${p.category} · ${p.price.toLocaleString('es-MX')} MXN
                                </span>
                              </div>
                            </div>

                            <div className={`w-4 h-4 border flex items-center justify-center shrink-0 ml-2 transition-colors ${
                              isSelected
                                ? 'bg-[#D4FF00] border-[#D4FF00] text-black'
                                : 'border-gray-600 bg-[#161616]'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  {selectedProductIds.length === 0 ? (
                    <p className="text-[10px] font-mono text-amber-400">
                      ⚠ Haz clic sobre las prendas que tendrán este descuento.
                    </p>
                  ) : (
                    <p className="text-[10px] font-mono text-gray-400">
                      {selectedProductIds.length} prenda{selectedProductIds.length === 1 ? '' : 's'} tendrán el precio anterior tachado y el descuento resaltado en la tienda.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Core Feature: DURATION PICKER */}
            <div className="space-y-2 pt-2 border-t border-[#1c1c1c]">
              <div className="flex items-center justify-between">
                <label className="text-gray-300 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D4FF00]" />
                  <span>Tiempo de Activación *</span>
                </label>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-2 gap-2">
                {durationPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.hours}
                    onClick={() => {
                      setSelectedDurationHours(preset.hours)
                      setCustomMinutes('')
                    }}
                    className={`py-2 px-2.5 text-left text-[11px] font-mono border transition-all cursor-pointer ${
                      selectedDurationHours === preset.hours && !customMinutes
                        ? 'border-[#D4FF00] bg-[#182109] text-[#D4FF00] font-bold shadow-sm'
                        : 'border-[#242424] bg-[#141414] text-gray-400 hover:text-white hover:border-[#383838]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Duration in Minutes */}
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    O define duración en minutos:
                  </span>
                  {customMinutes && parseInt(customMinutes, 10) > 0 && (
                    <span className="text-[10px] font-mono text-[#D4FF00] font-bold">
                      {parseInt(customMinutes, 10)} min ({Math.round((parseInt(customMinutes, 10) / 60) * 10) / 10} hrs)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej. 30 (para 30 minutos) o 15, 45, 90..."
                    value={customMinutes}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setCustomMinutes(val)
                      if (val) {
                        setSelectedDurationHours(0)
                      }
                    }}
                    className={`w-full bg-[#141414] border focus:border-[#D4FF00] pl-3.5 pr-20 py-2.5 text-xs font-mono text-white focus:outline-none transition-colors ${
                      customMinutes ? 'border-[#D4FF00] bg-[#182109]/40' : 'border-[#282828]'
                    }`}
                  />
                  <span className="absolute right-3.5 top-2.5 text-[11px] font-mono font-bold text-gray-400">
                    MINUTOS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-500 block">
                  Escribe la cantidad de minutos deseada (ej. pon 30 y vencerá en exactamente 30 minutos).
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-[#D4FF00]/15"
              >
                {createdSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>¡CUPÓN ACTIVADO CON ÉXITO!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>ACTIVAR CUPÓN AHORA</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: List of Coupons (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white">
              CUPONES EN SISTEMA ({coupons.length})
            </h3>
            <span className="text-xs font-mono text-gray-500">
              {coupons.filter((c) => c.isActive).length} activos actualmente
            </span>
          </div>

          <div className="space-y-3">
            {coupons.map((coupon) => {
              const remaining = getRemainingTime(coupon.expiresAt, coupon.isActive)
              const isCopied = copiedCode === coupon.code

              return (
                <div
                  key={coupon.id}
                  className={`p-4 border transition-colors ${
                    coupon.isActive && !remaining.expired
                      ? 'bg-[#121212] border-[#262626] hover:border-[#383838]'
                      : 'bg-[#0d0d0d] border-[#1c1c1c] opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Code & Discount info */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-base font-black tracking-widest text-white bg-[#1a1a1a] px-2.5 py-0.5 border border-[#333]">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          title="Copiar código"
                          className="p-1 text-gray-400 hover:text-[#D4FF00] transition-colors"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-[#D4FF00]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="text-xs font-mono text-gray-300">
                        Descuento:{' '}
                        <span className="text-[#D4FF00] font-bold">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `$${coupon.discountValue} MXN OFF`}
                        </span>
                        {coupon.minPurchase > 0 && (
                          <span className="text-gray-500">
                            {' '}
                            · Min. ${coupon.minPurchase.toLocaleString('es-MX')}
                          </span>
                        )}
                      </div>

                      {/* Scope Badge */}
                      <div className="pt-1">
                        {coupon.appliesTo === 'specific' && Array.isArray(coupon.productIds) && coupon.productIds.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#182109] text-[#D4FF00] border border-[#D4FF00]/40 text-[10px] font-mono font-bold uppercase">
                            <Tag className="w-3 h-3" />
                            <span>{coupon.productIds.length} prenda{coupon.productIds.length === 1 ? '' : 's'} en oferta</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#181818] text-gray-400 border border-[#282828] text-[10px] font-mono uppercase">
                            <span>🌐 Toda la tienda</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timer and Status */}
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div
                          className={`inline-flex items-center gap-1 font-mono text-xs font-bold uppercase ${
                            coupon.isActive && !remaining.expired
                              ? 'text-[#D4FF00]'
                              : 'text-gray-500'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{remaining.text}</span>
                        </div>
                        <div className="text-[10px] font-mono text-gray-500">
                          {coupon.usesCount} canjes realizados
                        </div>
                      </div>

                      {/* Toggle On/Off Switch */}
                      <button
                        onClick={() => handleToggle(coupon.id)}
                        title={coupon.isActive ? 'Desactivar cupón' : 'Activar cupón'}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {coupon.isActive ? (
                          <ToggleRight className="w-7 h-7 text-[#D4FF00]" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-gray-600" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        title="Eliminar cupón"
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
