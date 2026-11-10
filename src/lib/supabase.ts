import { createClient } from '@supabase/supabase-js'
import type { Product, DropInfo } from '../types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id')
)

// Supabase client instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Initial Seed Products matching exactly the website screenshots
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    slug: 'gorra-gj-signature',
    title: 'Gorra GJ Signature',
    category: 'gorras',
    brand: 'GJ',
    price: 699,
    currency: 'MXN',
    tag: 'BEST SELLER',
    tag_type: 'white',
    specs: 'Negro / Bordado 3D / Ajustable',
    colors: ['#111111', '#d5c7b3', '#4A5243'],
    image_url: '/images/product-cap-black.jpg',
    description: 'Nuestra silueta insignia. Construida con gabardina de algodón de alto gramaje, corona estructurada y bordado 3D frontal "gj". Cierre ajustable metálico grabado.',
    stock: 14,
    is_featured: true
  },
  {
    id: 'prod-002',
    slug: 'playera-heavyweight',
    title: 'Playera Heavyweight',
    category: 'playeras',
    brand: 'GJ',
    price: 899,
    currency: 'MXN',
    tag: 'NUEVO',
    tag_type: 'lime',
    specs: 'Washed black / Oversized / 280 g',
    colors: ['#262626', '#ECEAE4'],
    image_url: '/images/product-tshirt.jpg',
    description: 'Playera oversized de corte boxy confeccionada en algodón peinado 280 GSM. Lavado mineral vintage único y bordado tonal minimalista en el pecho.',
    stock: 20,
    is_featured: true
  },
  {
    id: 'prod-003',
    slug: 'gorra-script-club',
    title: 'Gorra Script Club',
    category: 'gorras',
    brand: 'GJ',
    price: 749,
    currency: 'MXN',
    tag: 'EDICIÓN LIMITADA',
    tag_type: 'white',
    specs: 'Stone / Bordado / Ajustable',
    colors: ['#C4B69F', '#111111'],
    image_url: '/images/product-cap-stone.jpg',
    description: 'Edición limitada en tono Stone lavado. Logotipo cursivo bordado de alta densidad. Perfil medio con visera curva preformada.',
    stock: 6,
    is_featured: true
  },
  {
    id: 'prod-004',
    slug: 'hoodie-no-signal',
    title: 'Hoodie No Signal',
    category: 'hoodies',
    brand: 'GJ',
    price: 1499,
    currency: 'MXN',
    tag: 'NUEVO',
    tag_type: 'lime',
    specs: 'Negro / Relaxed fit / 450 g',
    colors: ['#171717', '#3E3E3E'],
    image_url: '/images/product-hoodie.jpg',
    description: 'Sudadera pesada de 450 GSM con felpa francesa. Capucha de doble panel sin cordones para un perfil brutalista limpio. Bolsillo canguro reforzado.',
    stock: 8,
    is_featured: true
  },
  {
    id: 'prod-005',
    slug: 'gorra-new-era-ny-yankees-59fifty',
    title: 'Gorra New Era 59FIFTY NY Yankees',
    category: 'gorras',
    brand: 'New Era',
    price: 1099,
    currency: 'MXN',
    tag: 'BEST SELLER',
    tag_type: 'white',
    specs: 'Navy / Corona alta estructurada / Fitted',
    colors: ['#0A1128', '#111111'],
    image_url: '/images/product-cap-black.jpg',
    description: 'Clásica silueta 59FIFTY de New Era. Corona de 6 paneles estructurada y bordado frontal en relieve de los New York Yankees.',
    stock: 12,
    is_featured: true
  },
  {
    id: 'prod-006',
    slug: 'gorra-mitchell-ness-chicago-bulls',
    title: 'Gorra Mitchell & Ness Chicago Bulls',
    category: 'gorras',
    brand: 'Mitchell & Ness',
    price: 999,
    currency: 'MXN',
    tag: 'HARDWOOD',
    tag_type: 'lime',
    specs: 'Negro & Rojo / Snapback clásico / Retro',
    colors: ['#111111', '#BA0C2F'],
    image_url: '/images/product-cap-stone.jpg',
    description: 'Línea Hardwood Classics de Mitchell & Ness. Confección en lana acrílica con bordado frontal del toro de Chicago y visera plana retro.',
    stock: 9,
    is_featured: true
  },
  {
    id: 'prod-007',
    slug: 'gorra-47-brand-la-dodgers-clean-up',
    title: 'Gorra 47 Brand Clean Up LA Dodgers',
    category: 'gorras',
    brand: '47 Brand',
    price: 849,
    currency: 'MXN',
    tag: 'ORIGINAL',
    tag_type: 'white',
    specs: 'Stone & Royal Blue / Corona suave / Ajustable',
    colors: ['#C4B69F', '#005A9C'],
    image_url: '/images/product-cap-stone.jpg',
    description: 'La silueta Clean Up icónica de 47 Brand: relajada, lavada en prenda y con correa de tela ajustable para un estilo streetwear sin esfuerzo.',
    stock: 15,
    is_featured: true
  },
  {
    id: 'prod-008',
    slug: 'calcetines-gj-crew-socks',
    title: 'Calcetines GJ Heavyweight Crew (Pack 2)',
    category: 'accesorios',
    brand: 'GJ',
    price: 349,
    currency: 'MXN',
    tag: 'DROP 004',
    tag_type: 'lime',
    specs: 'Pack 2 pares / Algodón peinado / Unitalla',
    colors: ['#FFFFFF', '#111111'],
    image_url: '/images/product-tshirt.jpg',
    description: 'Pack de calcetines crew con tejido de alta densidad, soporte en puente del pie y bordado GJ tejido al tobillo.',
    stock: 25,
    is_featured: true
  },
  {
    id: 'prod-009',
    slug: 'llavero-mosqueton-gj-tactical',
    title: 'Mosquetón Táctico GJ Tactical Keychain',
    category: 'accesorios',
    brand: 'GJ',
    price: 249,
    currency: 'MXN',
    tag: 'ESENCIAL',
    tag_type: 'white',
    specs: 'Negro mate / Cinta nylon / Grabado láser',
    colors: ['#171717'],
    image_url: '/images/product-cap-black.jpg',
    description: 'Mosquetón táctico utilitario en aleación de zinc negro mate con cinta de nylon militar y grabado "BUILT FOR THE STREETS".',
    stock: 30,
    is_featured: true
  }
]

export const MOCK_DROP: DropInfo = {
  id: 'drop-004',
  code: 'DROP 004',
  name: 'UNDERGROUND ESSENTIALS',
  tagline: 'BUILT FOR THE STREETS.',
  volume: 'GJ* / VOL. 004',
  description: 'Presentamos Underground Essentials. Texturas pesadas, tonos crudos y siluetas que no piden permiso. El nuevo uniforme de los que hacen las cosas a su manera.',
  is_active: true
}

/**
 * Fetch products with category filter
 */
export async function fetchProducts(category?: string): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false })
      if (category && category !== 'todos' && category !== 'ropa' && !category.includes(':')) {
        query = query.eq('category', category)
      }
      const { data, error } = await query
      if (error) throw error
      if (data && data.length > 0) return data as Product[]
    } catch (err) {
      console.warn('Supabase query error, falling back to local dataset:', err)
    }
  }

  // Fallback to local catalog (including locally added products)
  const customProducts: Product[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('gj_custom_products') || '[]')
    } catch {
      return []
    }
  })()

  const deletedIds: string[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('gj_deleted_product_ids') || '[]')
    } catch {
      return []
    }
  })()

  const allProducts = [...customProducts, ...MOCK_PRODUCTS].filter(p => !deletedIds.includes(p.id))

  if (!category || category === 'todos') {
    return allProducts
  }

  const catLower = category.toLowerCase()

  // Case 1: "ropa" -> Shows all clothes (playeras, hoodies, ropa, etc.)
  if (catLower === 'ropa') {
    return allProducts.filter(p =>
      p.category === 'playeras' ||
      p.category === 'hoodies' ||
      (p.category as string) === 'ropa'
    )
  }

  // Case 2: Gorras with brand filter (e.g. "gorras:new-era", "gorras:mitchell", "gorras:47", "gorras:gj")
  if (catLower.startsWith('gorras:')) {
    const brandTerm = catLower.replace('gorras:', '').trim()
    return allProducts.filter(p => {
      if (p.category !== 'gorras') return false
      const brandStr = (p.brand || '').toLowerCase()
      const titleStr = p.title.toLowerCase()
      return brandStr.includes(brandTerm) || titleStr.includes(brandTerm)
    })
  }

  // Case 3: "gorras" -> All gorras
  if (catLower === 'gorras') {
    return allProducts.filter(p => p.category === 'gorras')
  }

  // Case 4: "accesorios" -> General accessories
  if (catLower === 'accesorios') {
    return allProducts.filter(p => p.category === 'accesorios')
  }

  return allProducts.filter(p => p.category.toLowerCase() === catLower)
}

/**
 * Create/publish or update product in Supabase (with localStorage fallback)
 */
export async function createProduct(productData: Partial<Product>): Promise<{ success: boolean; data?: Product; message?: string }> {
  const isUpdate = Boolean(productData.id)
  const id = productData.id || `prod-${Date.now()}`
  
  const newProduct: Product = {
    id,
    slug: productData.slug || `producto-${Date.now()}`,
    title: productData.title || 'Nuevo Producto',
    category: productData.category || 'hoodies',
    price: productData.price || 999,
    currency: productData.currency || 'MXN',
    tag: productData.tag || null,
    tag_type: productData.tag_type || 'lime',
    specs: productData.specs || '',
    description: productData.description || '',
    colors: productData.colors || ['#111111'],
    image_url: productData.image_url || (productData.images && productData.images[0]) || '/images/product-hoodie.jpg',
    images: productData.images && productData.images.length > 0 ? productData.images : [productData.image_url || '/images/product-hoodie.jpg'],
    stock: productData.stock || 10,
    is_featured: productData.is_featured ?? true,
    created_at: productData.created_at || new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    try {
      if (isUpdate) {
        const { data, error } = await supabase
          .from('products')
          .update(newProduct)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return { success: true, data: data as Product }
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([newProduct])
          .select()
          .single()
        if (error) throw error
        return { success: true, data: data as Product }
      }
    } catch (err: any) {
      console.warn('Error inserting/updating in Supabase, saving to local store:', err)
    }
  }

  // Persist to local storage
  try {
    const existing: Product[] = JSON.parse(localStorage.getItem('gj_custom_products') || '[]')
    const index = existing.findIndex(p => p.id === id)
    if (index > -1) {
      existing[index] = newProduct
    } else {
      existing.unshift(newProduct)
    }
    localStorage.setItem('gj_custom_products', JSON.stringify(existing))
    return { success: true, data: newProduct }
  } catch (err) {
    return { success: false, message: 'No se pudo guardar el producto localmente.' }
  }
}

/**
 * Delete product from Supabase & local storage
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; message?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) throw error
    } catch (err: any) {
      console.warn('Error deleting product from Supabase:', err)
    }
  }

  try {
    // Remove from custom products
    const custom: Product[] = JSON.parse(localStorage.getItem('gj_custom_products') || '[]')
    const filtered = custom.filter(p => p.id !== productId)
    localStorage.setItem('gj_custom_products', JSON.stringify(filtered))

    // Track deleted IDs so mock products don't reappear on reload
    const deletedIds: string[] = JSON.parse(localStorage.getItem('gj_deleted_product_ids') || '[]')
    if (!deletedIds.includes(productId)) {
      deletedIds.push(productId)
      localStorage.setItem('gj_deleted_product_ids', JSON.stringify(deletedIds))
    }

    return { success: true }
  } catch (err) {
    return { success: false, message: 'No se pudo eliminar el producto localmente.' }
  }
}

/**
 * Save email subscriber
 */
export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Por favor ingresa un correo electrónico válido.' }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email, source: 'landing_circle' }])

      if (error) {
        if (error.code === '23505') {
          return { success: true, message: '¡Ya estás en el círculo! Revisa tu bandeja para el próximo drop.' }
        }
        throw error
      }
      return { success: true, message: '¡Bienvenido al círculo! Te notificaremos antes de cada drop.' }
    } catch (err: any) {
      console.error('Newsletter insert error:', err)
      return { success: false, message: 'No pudimos registrarte en este momento. Inténtalo más tarde.' }
    }
  }

  // Simulated local storage fallback
  try {
    const existing = JSON.parse(localStorage.getItem('gj_newsletter_subscribers') || '[]')
    if (!existing.includes(email)) {
      existing.push(email)
      localStorage.setItem('gj_newsletter_subscribers', JSON.stringify(existing))
    }
    return { success: true, message: '¡Bienvenido al círculo! Acceso exclusivo concedido.' }
  } catch {
    return { success: true, message: '¡Suscrito con éxito!' }
  }
}

