import type { Product } from '../types/database.types'

/**
 * Parses size stocks from product.specs (e.g. "Gris / Tallas: S (3), M (2)" or legacy "Gris / Tallas: S, M")
 */
export function parseSizeStocks(specs?: string | null, totalStock: number = 0): Record<string, number> {
  const map: Record<string, number> = {}
  if (!specs || !specs.includes('Tallas:')) {
    return map
  }

  const tallasPart = specs.split('Tallas:')[1]?.trim() || ''
  const parts = tallasPart.split(',').map((p) => p.trim())

  let hasExplicitQuantities = false
  for (const part of parts) {
    const match = part.match(/^([A-Z0-9]+)\s*\((\d+)\)/i)
    if (match) {
      hasExplicitQuantities = true
      const sizeName = match[1].toUpperCase()
      const qty = parseInt(match[2], 10)
      map[sizeName] = Math.max(0, qty)
    }
  }

  if (!hasExplicitQuantities) {
    // Legacy format e.g. "S, M" without parentheses
    for (const part of parts) {
      const clean = part.replace(/\(.*?\)/g, '').trim().toUpperCase()
      if (clean && clean !== 'AGOTADO') {
        map[clean] = Math.max(0, totalStock)
      }
    }
  }

  return map
}

/**
 * Decrements size stock for a purchased size and generates the updated specs string and new total stock.
 */
export function decrementProductStock(
  product: Product,
  purchasedSize: string,
  quantityPurchased: number
): { newStock: number; newSpecs: string } {
  const currentTotalStock = Math.max(0, product.stock ?? 0)
  const newTotalStock = Math.max(0, currentTotalStock - quantityPurchased)

  if (product.category === 'gorras') {
    return {
      newStock: newTotalStock,
      newSpecs: product.specs || '',
    }
  }

  const prefix = product.specs?.includes('Tallas:')
    ? product.specs.split('Tallas:')[0] + 'Tallas: '
    : (product.specs ? product.specs + ' / Tallas: ' : 'Tallas: ')

  const sizeStocks = parseSizeStocks(product.specs, currentTotalStock)

  // Standard sizes to maintain order
  const standardOrder = ['S', 'M', 'L', 'XL', 'XXL']
  const allKnownSizes = Array.from(new Set([...standardOrder, ...Object.keys(sizeStocks)]))

  const cleanPurchasedSize = purchasedSize.toUpperCase().trim()

  const updatedSizeEntries: string[] = []

  for (const size of allKnownSizes) {
    if (size in sizeStocks) {
      let stock = sizeStocks[size]
      if (size === cleanPurchasedSize) {
        stock = Math.max(0, stock - quantityPurchased)
      }
      updatedSizeEntries.push(`${size} (${stock})`)
    }
  }

  // If the size was not in sizeStocks yet, add it as 0
  if (!updatedSizeEntries.some(e => e.startsWith(cleanPurchasedSize))) {
    updatedSizeEntries.push(`${cleanPurchasedSize} (0)`)
  }

  const newSpecs = prefix + updatedSizeEntries.join(', ')

  return {
    newStock: newTotalStock,
    newSpecs,
  }
}

/**
 * Returns true if product has 0 total stock or all its sizes are depleted.
 */
export function isProductSoldOut(product: Product): boolean {
  const totalStock = product.stock ?? 0
  if (totalStock <= 0) return true

  // For clothing, check if sizes are parsed and all have 0 stock
  if (product.category !== 'gorras' && product.specs && product.specs.includes('Tallas:')) {
    const sizeStocks = parseSizeStocks(product.specs, totalStock)
    const sizes = Object.values(sizeStocks)
    if (sizes.length > 0) {
      const sum = sizes.reduce((acc, qty) => acc + qty, 0)
      if (sum <= 0) return true
    }
  }

  return false
}

