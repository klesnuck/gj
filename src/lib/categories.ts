export interface CategoryOption {
  id: string
  name: string
  hasSizes: boolean
}

// 3 Categorías principales solicitadas: Ropa, Gorras y Accesorios
export const BASE_CATEGORIES: CategoryOption[] = [
  { id: 'ropa', name: 'Ropa', hasSizes: true },
  { id: 'gorras', name: 'Gorras', hasSizes: false },
  { id: 'accesorios', name: 'Accesorios', hasSizes: false },
]

// Subcategorías sugeridas por defecto para cada categoría principal
export const DEFAULT_SUBCATEGORIES: Record<string, string[]> = {
  ropa: [
    'Playera',
    'Short',
    'Hoodie / Sudadera',
    'Pantalón / Pants',
    'Chamarra / Jacket',
    'Jersey',
    'Conjunto',
  ],
  gorras: [
    'Snapback',
    'Fitted (Cerrada)',
    'Trucker',
    'Curva / Dad Hat',
    'Gorro / Beanie',
    'Vintage',
  ],
  accesorios: [
    'Calcetas / Socks',
    'Llavero',
    'Pin / Badge',
    'Cadena / Joyería',
    'Bolso / Shoulder Bag',
    'Mochila',
    'Sticker',
  ],
}

/**
 * Obtiene todas las categorías principales (Ropa, Gorras, Accesorios + posibles personalizadas).
 */
export function getKnownCategories(): CategoryOption[] {
  const catMap = new Map<string, CategoryOption>()

  for (const c of BASE_CATEGORIES) {
    catMap.set(c.id.toLowerCase(), c)
  }

  try {
    const stored = JSON.parse(localStorage.getItem('gj_custom_categories') || '[]')
    if (Array.isArray(stored)) {
      for (const item of stored) {
        if (item && item.name && typeof item.name === 'string') {
          const id = item.id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          // No duplicar si ya es una de las principales
          if (!catMap.has(id)) {
            catMap.set(id, {
              id,
              name: item.name.trim(),
              hasSizes: Boolean(item.hasSizes),
            })
          }
        }
      }
    }
  } catch (e) {
    console.warn(e)
  }

  return Array.from(catMap.values())
}

/**
 * Obtiene la lista de subcategorías conocidas para una categoría dada (sugerencias + personalizadas guardadas).
 */
export function getSubcategoriesForCategory(category: string): string[] {
  const cleanCat = (category || 'ropa').toLowerCase().trim()
  const normalizedCat = cleanCat === 'playeras' || cleanCat === 'hoodies' ? 'ropa' : cleanCat

  const defaults = DEFAULT_SUBCATEGORIES[normalizedCat] || []
  const list = new Set<string>(defaults)

  try {
    const stored = JSON.parse(localStorage.getItem(`gj_custom_subcategories_${normalizedCat}`) || '[]')
    if (Array.isArray(stored)) {
      for (const item of stored) {
        if (typeof item === 'string' && item.trim()) {
          list.add(item.trim())
        }
      }
    }
  } catch (e) {
    console.warn(e)
  }

  return Array.from(list)
}

/**
 * Guarda una nueva subcategoría personalizada para que esté disponible en futuros productos.
 */
export function saveCustomSubcategory(category: string, subcategory: string): void {
  const cleanCat = (category || 'ropa').toLowerCase().trim()
  const normalizedCat = cleanCat === 'playeras' || cleanCat === 'hoodies' ? 'ropa' : cleanCat
  const cleanSub = subcategory.trim()
  if (!cleanSub || cleanSub.length < 2) return

  try {
    const key = `gj_custom_subcategories_${normalizedCat}`
    const stored: string[] = JSON.parse(localStorage.getItem(key) || '[]')
    const list = new Set(Array.isArray(stored) ? stored : [])
    list.add(cleanSub)
    localStorage.setItem(key, JSON.stringify(Array.from(list)))
  } catch (e) {
    console.warn(e)
  }
}

/**
 * Respaldo local de subcategoría para un producto.
 */
export function saveProductSubcategory(productId: string, subcategory: string): void {
  try {
    if (!productId || !subcategory) return
    const stored = JSON.parse(localStorage.getItem('gj_product_subcategories') || '{}')
    stored[productId] = subcategory.trim()
    localStorage.setItem('gj_product_subcategories', JSON.stringify(stored))
  } catch (e) {
    console.warn(e)
  }
}

/**
 * Obtiene la subcategoría respaldada localmente para un producto.
 */
export function getProductSubcategory(productId: string): string | null {
  try {
    const stored = JSON.parse(localStorage.getItem('gj_product_subcategories') || '{}')
    return stored[productId] || null
  } catch {
    return null
  }
}

/**
 * Normaliza categorías legacy ('playeras', 'hoodies') a la nueva estructura:
 * categoria: 'ropa' y subcategoria: 'Playera' | 'Hoodie'.
 */
export function normalizeProductCategory(category: string, existingSubcategory?: string | null): {
  category: string
  subcategory?: string | null
} {
  const catLower = (category || '').toLowerCase().trim()
  const cleanSub = existingSubcategory ? existingSubcategory.trim() : null

  // Si ya tiene una subcategoría explícita (ej. 'Short'), respetarla SIEMPRE
  if (cleanSub) {
    if (catLower === 'playeras' || catLower === 'hoodies' || catLower === 'ropa') {
      return { category: 'ropa', subcategory: cleanSub }
    }
    return { category: catLower || 'ropa', subcategory: cleanSub }
  }

  // Si no tiene subcategoría aún, inferir según categoría legacy de Supabase
  if (catLower === 'playeras') {
    return { category: 'ropa', subcategory: 'Playera' }
  }
  if (catLower === 'hoodies') {
    return { category: 'ropa', subcategory: 'Hoodie / Sudadera' }
  }
  if (catLower.includes('short')) {
    return { category: 'ropa', subcategory: 'Short' }
  }
  return { category: catLower || 'ropa', subcategory: null }
}

/**
 * Guarda una nueva categoría personalizada.
 */
export function saveCustomCategory(name: string, hasSizes: boolean): CategoryOption {
  const cleanName = name.trim()
  const id = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const newCat: CategoryOption = {
    id,
    name: cleanName,
    hasSizes,
  }

  try {
    const stored = JSON.parse(localStorage.getItem('gj_custom_categories') || '[]')
    const list: CategoryOption[] = Array.isArray(stored) ? stored.filter((c: any) => c.id !== id) : []
    list.push(newCat)
    localStorage.setItem('gj_custom_categories', JSON.stringify(list))
  } catch (e) {
    console.warn(e)
  }

  return newCat
}

/**
 * Indica si una categoría requiere tallas de ropa (S, M, L, XL) o si es unitalla.
 */
export function categoryHasSizes(categoryId: string): boolean {
  const catLower = (categoryId || '').toLowerCase().trim()
  if (catLower === 'gorras' || catLower === 'accesorios') return false
  if (catLower === 'ropa' || catLower === 'playeras' || catLower === 'hoodies') return true

  const known = getKnownCategories()
  const found = known.find((c) => c.id === catLower)
  return found ? found.hasSizes : false
}
