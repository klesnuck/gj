import type { Product } from '../types/database.types'

export interface BrandOption {
  id: string
  name: string
}

export const DEFAULT_CAP_BRANDS: BrandOption[] = [
  { id: 'gorras:gj', name: 'GJ Signature' },
  { id: 'gorras:new era', name: 'New Era' },
  { id: 'gorras:mitchell', name: 'Mitchell & Ness' },
  { id: 'gorras:47', name: '47 Brand' },
]

/**
 * Returns all cap brands dynamically based on catalog products and saved custom brands.
 */
export function getCapBrands(products: Product[]): BrandOption[] {
  const brandMap = new Map<string, string>()

  // 1. Marcas predeterminadas
  for (const b of DEFAULT_CAP_BRANDS) {
    const key = b.id.replace('gorras:', '').toLowerCase().trim()
    brandMap.set(key, b.name)
  }

  // 2. Marcas personalizadas guardadas
  try {
    const stored = JSON.parse(localStorage.getItem('gj_custom_brands') || '[]')
    if (Array.isArray(stored)) {
      for (const name of stored) {
        if (typeof name === 'string' && name.trim()) {
          const clean = name.trim()
          brandMap.set(clean.toLowerCase(), clean)
        }
      }
    }
  } catch (e) {
    console.warn(e)
  }

  // 3. Marcas de los productos registrados en el catálogo
  for (const p of products) {
    if (p.category === 'gorras' && p.brand && p.brand.trim()) {
      const clean = p.brand.trim()
      brandMap.set(clean.toLowerCase(), clean)
    }
  }

  return Array.from(brandMap.entries()).map(([key, name]) => ({
    id: `gorras:${key}`,
    name,
  }))
}

/**
 * Returns all distinct brands for the Admin Product Form selector.
 */
export function getAllKnownBrands(products: Product[]): string[] {
  const brandSet = new Set<string>(['GJ', 'New Era', 'Mitchell & Ness', '47 Brand'])

  try {
    const stored = JSON.parse(localStorage.getItem('gj_custom_brands') || '[]')
    if (Array.isArray(stored)) {
      for (const name of stored) {
        if (typeof name === 'string' && name.trim()) brandSet.add(name.trim())
      }
    }
  } catch (e) {
    console.warn(e)
  }

  for (const p of products) {
    if (p.brand && p.brand.trim()) {
      brandSet.add(p.brand.trim())
    }
  }

  return Array.from(brandSet)
}

/**
 * Persists a newly entered brand so it is immediately remembered for all future products and filters.
 */
export function saveCustomBrand(brandName: string): void {
  try {
    const clean = brandName.trim()
    if (!clean || clean.length < 2) return

    const stored = JSON.parse(localStorage.getItem('gj_custom_brands') || '[]')
    const set = new Set<string>(Array.isArray(stored) ? stored : [])
    set.add(clean)
    localStorage.setItem('gj_custom_brands', JSON.stringify(Array.from(set)))
  } catch (e) {
    console.warn(e)
  }
}

/**
 * Persists a product's brand locally as backup if the Supabase table lacks the 'brand' column.
 */
export function saveProductBrand(productId: string, brandName: string): void {
  try {
    const clean = brandName?.trim()
    if (!clean || !productId) return
    const stored = JSON.parse(localStorage.getItem('gj_product_brands') || '{}')
    stored[productId] = clean
    localStorage.setItem('gj_product_brands', JSON.stringify(stored))
  } catch (e) {
    console.warn(e)
  }
}

export function getProductBrand(productId: string): string | null {
  try {
    const stored = JSON.parse(localStorage.getItem('gj_product_brands') || '{}')
    return stored[productId] || null
  } catch {
    return null
  }
}

/**
 * Persists a product's gallery images locally as backup if the Supabase table lacks the 'images' column.
 */
export function saveProductImages(productId: string, images: string[]): void {
  try {
    if (!productId || !images || images.length === 0) return
    const stored = JSON.parse(localStorage.getItem('gj_product_images') || '{}')
    stored[productId] = images
    localStorage.setItem('gj_product_images', JSON.stringify(stored))
  } catch (e) {
    console.warn(e)
  }
}

export function getProductImages(productId: string): string[] | null {
  try {
    const stored = JSON.parse(localStorage.getItem('gj_product_images') || '{}')
    return stored[productId] || null
  } catch {
    return null
  }
}

/**
 * Filters a product array in-memory with 0ms latency by category or brand filter.
 */
export function filterProductsByCategory(products: Product[], category?: string): Product[] {
  if (!category || category === 'todos') {
    return products
  }

  const catLower = category.toLowerCase().trim()

  // 1. Ropa general: playeras, hoodies o cualquier categoría de ropa
  if (catLower === 'ropa') {
    return products.filter(
      (p) =>
        p.category === 'playeras' ||
        p.category === 'hoodies' ||
        (p.category as string) === 'ropa'
    )
  }

  // 2. Gorras filtradas por marca (ej. gorras:new era, gorras:supreme, gorras:gj)
  if (catLower.startsWith('gorras:')) {
    const brandTerm = catLower.replace('gorras:', '').trim()
    return products.filter((p) => {
      if (p.category !== 'gorras') return false
      const brandStr = (p.brand || '').toLowerCase()
      const titleStr = p.title.toLowerCase()
      return brandStr.includes(brandTerm) || titleStr.includes(brandTerm)
    })
  }

  // 3. Todas las gorras
  if (catLower === 'gorras') {
    return products.filter((p) => p.category === 'gorras')
  }

  // 4. Playeras específicas
  if (catLower === 'playeras') {
    return products.filter((p) => p.category === 'playeras')
  }

  // 5. Hoodies específicos
  if (catLower === 'hoodies') {
    return products.filter((p) => p.category === 'hoodies')
  }

  // 6. Accesorios
  if (catLower === 'accesorios') {
    return products.filter((p) => p.category === 'accesorios')
  }

  return products.filter((p) => p.category.toLowerCase() === catLower)
}
