export interface CategoryOption {
  id: string
  name: string
  hasSizes: boolean
}

// Categorías base limpias (sin textos de "(Con tallas...)" ni "(Unitalla...)")
export const BASE_CATEGORIES: CategoryOption[] = [
  { id: 'hoodies', name: 'Hoodies', hasSizes: true },
  { id: 'playeras', name: 'Playeras', hasSizes: true },
  { id: 'gorras', name: 'Gorras', hasSizes: false },
  { id: 'accesorios', name: 'Accesorios', hasSizes: false },
]

/**
 * Obtiene todas las categorías (base + personalizadas agregadas por el admin).
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
          catMap.set(id, {
            id,
            name: item.name.trim(),
            hasSizes: Boolean(item.hasSizes),
          })
        }
      }
    }
  } catch (e) {
    console.warn(e)
  }

  return Array.from(catMap.values())
}

/**
 * Guarda una nueva categoría personalizada para que esté disponible de inmediato en todo el catálogo.
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
  if (catLower === 'playeras' || catLower === 'hoodies' || catLower === 'ropa') return true

  const known = getKnownCategories()
  const found = known.find((c) => c.id === catLower)
  return found ? found.hasSizes : false
}

