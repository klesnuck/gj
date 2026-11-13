import type { Product } from '../types/database.types'

export interface BrandOption {
  id: string
  name: string
}

// Marcas predeterminadas: Vacío por solicitud del usuario (sin marcas fijas hardcoded)
export const DEFAULT_CAP_BRANDS: BrandOption[] = []

/**
 * Retorna las marcas de gorras dinámicamente basadas en los productos del catálogo y marcas creadas.
 */
export function getCapBrands(products: Product[]): BrandOption[] {
  const brandMap = new Map<string, string>()

  // 1. Marcas personalizadas guardadas por el admin
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

  // 2. Marcas de los productos registrados en el catálogo
  for (const p of products) {
    if (p.brand && p.brand.trim()) {
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
 * Retorna todas las marcas conocidas para el selector del formulario admin (empieza vacío sin fijas).
 */
export function getAllKnownBrands(products: Product[]): string[] {
  const brandSet = new Set<string>()

  try {
    const stored = JSON.parse(localStorage.getItem('gj_custom_brands') || '[]')
    if (Array.isArray(stored)) {
      for (const name of stored) {
        if (typeof name === 'string' && name.trim()) {
          // Filtrar las marcas fijas que el usuario pidió eliminar si quedaron en localStorage
          const clean = name.trim()
          if (!['new era', 'mitchell & ness', '47 brand', 'mitchell'].includes(clean.toLowerCase())) {
            brandSet.add(clean)
          }
        }
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
 * Guarda una nueva marca personalizada para recordarla en futuros productos y filtros.
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
 * Respaldo local de marca de un producto.
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
 * Respaldo local de imágenes de un producto.
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
 * Filtrado en memoria por categoría o marca sin latencia.
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

  // 2. Gorras filtradas por marca (ej. gorras:supreme, gorras:gj, etc.)
  if (catLower.startsWith('gorras:')) {
    const brandTerm = catLower.replace('gorras:', '').trim()
    return products.filter((p) => {
      if (p.category !== 'gorras') return false
      const brandStr = (p.brand || '').toLowerCase()
      const titleStr = p.title.toLowerCase()
      return brandStr.includes(brandTerm) || titleStr.includes(brandTerm)
    })
  }

  // 3. Categorías específicas
  return products.filter((p) => p.category.toLowerCase() === catLower)
}
