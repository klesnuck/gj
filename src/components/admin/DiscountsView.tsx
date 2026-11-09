import { useState } from 'react'
import {
  Clock,
  Plus,
  Check,
  Copy,
  Trash2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import type { Coupon } from '../../types/database.types'

interface DiscountsViewProps {
  coupons: Coupon[]
  onAddCoupon?: (coupon: Coupon) => void
  onToggleCoupon?: (couponId: string) => void
  onDeleteCoupon?: (couponId: string) => void
}

export const DiscountsView = ({
  coupons: initialCoupons,
  onAddCoupon,
  onToggleCoupon,
  onDeleteCoupon,
}: DiscountsViewProps) => {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [createdSuccess, setCreatedSuccess] = useState(false)

  // Form states
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState<number>(15)
  const [minPurchase, setMinPurchase] = useState<number>(999)
  const [selectedDurationHours, setSelectedDurationHours] = useState<number>(72) // 72 hours default
  const [customDateTime, setCustomDateTime] = useState<string>('')

  // Duration preset buttons
  const durationPresets = [
    { label: '24 Horas (1 día)', hours: 24 },
    { label: '48 Horas (2 días)', hours: 48 },
    { label: '3 Días (72 hrs)', hours: 72 },
    { label: '7 Días (1 semana)', hours: 168 },
    { label: '30 Días (1 mes)', hours: 720 },
  ]

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || discountValue <= 0) return

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '_')
    let expiresDate: Date

    if (customDateTime) {
      expiresDate = new Date(customDateTime)
    } else {
      expiresDate = new Date(Date.now() + selectedDurationHours * 3600 * 1000)
    }

    const preset = durationPresets.find((p) => p.hours === selectedDurationHours)
    const durationLabel = customDateTime
      ? `Hasta ${new Date(customDateTime).toLocaleDateString('es-MX')}`
      : preset
      ? preset.label.split(' ')[0] + ' ' + preset.label.split(' ')[1]
      : `${selectedDurationHours} Horas`

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
    }

    const updated = [newCoupon, ...coupons]
    setCoupons(updated)
    onAddCoupon?.(newCoupon)

    // Reset form
    setCode('')
    setCustomDateTime('')
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
                      setCustomDateTime('')
                    }}
                    className={`py-2 px-2.5 text-left text-[11px] font-mono border transition-all cursor-pointer ${
                      selectedDurationHours === preset.hours && !customDateTime
                        ? 'border-[#D4FF00] bg-[#182109] text-[#D4FF00] font-bold shadow-sm'
                        : 'border-[#242424] bg-[#141414] text-gray-400 hover:text-white hover:border-[#383838]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Date/Time Picker */}
              <div className="pt-2">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">
                  O elige fecha y hora exacta de vencimiento:
                </span>
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => {
                    setCustomDateTime(e.target.value)
                    setSelectedDurationHours(0)
                  }}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-3 py-2 text-xs text-white focus:outline-none"
                />
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
