import type { Product, Coupon } from '../types/database.types'

export interface ProductDiscountInfo {
  hasDiscount: boolean
  originalPrice: number
  discountedPrice: number
  discountPercent: number
  discountAmount: number
  badgeLabel: string
  couponCode: string
  appliesTo: 'all' | 'specific'
}

/**
 * Calcula si un producto tiene un cupón o descuento activo aplicable.
 * Respeta la fecha de expiración y el alcance (toda la tienda o prendas seleccionadas).
 */
export function getProductDiscount(
  product: Product | null | undefined,
  coupons: Coupon[] | null | undefined
): ProductDiscountInfo | null {
  if (!product || !coupons || !Array.isArray(coupons) || coupons.length === 0) {
    return null
  }

  const now = Date.now()

  // Buscar el primer cupón activo y vigente que aplique a esta prenda
  for (const c of coupons) {
    if (!c.isActive) continue

    // Verificar si expiró
    if (c.expiresAt) {
      const expTime = new Date(c.expiresAt).getTime()
      if (!isNaN(expTime) && expTime <= now) continue
    }

    const appliesTo = c.appliesTo || 'all'

    // Si aplica a prendas seleccionadas, verificar si el id del producto está incluido
    if (appliesTo === 'specific') {
      const list = Array.isArray(c.productIds) ? c.productIds : []
      if (!list.includes(product.id)) {
        continue
      }
    }

    // Calcular descuento
    let discountAmount = 0
    let discountPercent = 0

    if (c.discountType === 'percentage') {
      discountPercent = c.discountValue
      discountAmount = Math.round((product.price * c.discountValue) / 100)
    } else {
      discountAmount = Math.min(product.price, c.discountValue)
      discountPercent = Math.round((discountAmount / product.price) * 100)
    }

    const discountedPrice = Math.max(0, product.price - discountAmount)
    const badgeLabel =
      c.discountType === 'percentage'
        ? `-${c.discountValue}%`
        : `-$${c.discountValue.toLocaleString('es-MX')}`

    return {
      hasDiscount: true,
      originalPrice: product.price,
      discountedPrice,
      discountPercent,
      discountAmount,
      badgeLabel,
      couponCode: c.code,
      appliesTo,
    }
  }

  return null
}

/**
 * Devuelve el producto con su precio efectivo descontado (si aplica)
 * y almacena el precio original en original_price.
 */
export function getEffectiveProduct(
  product: Product,
  coupons: Coupon[] = []
): Product {
  const discount = getProductDiscount(product, coupons)
  if (!discount) return product

  return {
    ...product,
    price: discount.discountedPrice,
    original_price: discount.originalPrice,
  }
}
