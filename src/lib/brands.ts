import type { Product } from '../types/database.types'

export interface BrandOption {
  id: string
  name: string
}

// Marcas predeterminadas: Vacío por solicitud del usuario (sin marcas fijas hardcoded)
export const DEFAULT_CAP_BRANDS: BrandOption[] = []

const EXCLUDED_BRANDS = ['new era', 'mitchell & ness', '47 brand', 'mitchell', 'starhas']

/**
 * Retorna las marcas de gorras dinámicamente basadas ÚNICAMENTE en productos activos
 * cuya categoría sea 'gorras' (así nunca aparecen marcas fantasma o errores de dedo sin productos).
 */
export function getCapBrands(products: Product[]): BrandOption[] {
  const brandMap = new Map<string, string>()

  // Marcas ÚNICAMENTE de productos existentes cuya categoría sea 'gorras'
  for (const p of products) {
    if (p.category === 'gorras' && p.brand && p.brand.trim()) {
      const clean = p.brand.trim()
      if (!EXCLUDED_BRANDS.includes(clean.toLowerCase())) {
        brandMap.set(clean.toLowerCase(), clean)
      }
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
          const clean = name.trim()
          if (!EXCLUDED_BRANDS.includes(clean.toLowerCase())) {
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
      const clean = p.brand.trim()
      if (!EXCLUDED_BRANDS.includes(clean.toLowerCase())) {
        brandSet.add(clean)
      }
    }
  }

  return Array.from(brandSet)
}

/**
 * Guarda una nueva marca personalizada. Si la categoría es 'gorras', la asocia
 * exclusivamente a gorras para que no contamine ni sea listada por error en ropa.
 */
export function saveCustomBrand(brandName: string, category?: string): void {
  try {
    const clean = brandName.trim()
    if (!clean || clean.length < 2) return

    // Guardar en el catálogo global de marcas para el selector del admin
    const stored = JSON.parse(localStorage.getItem('gj_custom_brands') || '[]')
    const set = new Set<string>(Array.isArray(stored) ? stored : [])
    set.add(clean)
    localStorage.setItem('gj_custom_brands', JSON.stringify(Array.from(set)))

    // Si es una gorra, registrarla también en la lista específica de marcas de gorras
    if (category === 'gorras') {
      const capStored = JSON.parse(localStorage.getItem('gj_custom_cap_brands') || '[]')
      const capSet = new Set<string>(Array.isArray(capStored) ? capStored : [])
      capSet.add(clean)
      localStorage.setItem('gj_custom_cap_brands', JSON.stringify(Array.from(capSet)))
    }
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

  let decodedCategory = category
  try {
    decodedCategory = decodeURIComponent(category)
  } catch {
    decodedCategory = category
  }

  const catLower = decodedCategory.toLowerCase().trim()

  // 1. Ropa general: playeras, hoodies o cualquier categoría de ropa
  if (catLower === 'ropa') {
    return products.filter(
      (p) =>
        p.category === 'playeras' ||
        p.category === 'hoodies' ||
        (p.category as string) === 'ropa'
    )
  }

  // Subcategorías de ropa específicas (Playeras, Hoodies, Shorts, Pantalones...)
  if (catLower === 'playeras' || catLower === 'playera') {
    return products.filter(
      (p) =>
        p.category === 'playeras' ||
        (p.subcategory && p.subcategory.toLowerCase().includes('playera'))
    )
  }
  if (catLower === 'hoodies' || catLower === 'hoodie') {
    return products.filter(
      (p) =>
        p.category === 'hoodies' ||
        (p.subcategory && (p.subcategory.toLowerCase().includes('hoodie') || p.subcategory.toLowerCase().includes('sudadera')))
    )
  }
  if (catLower === 'shorts' || catLower === 'short') {
    return products.filter(
      (p) =>
        p.category.toLowerCase().includes('short') ||
        (p.subcategory && p.subcategory.toLowerCase().includes('short'))
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

  // 3. Subcategoría directa o Categorías específicas
  return products.filter(
    (p) =>
      p.category.toLowerCase() === catLower ||
      (p.subcategory && p.subcategory.toLowerCase() === catLower)
  )
}
