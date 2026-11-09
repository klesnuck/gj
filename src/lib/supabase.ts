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
      if (category && category !== 'todos') {
        query = query.eq('category', category)
      }
      const { data, error } = await query
      if (error) throw error
      if (data && data.length > 0) return data as Product[]
    } catch (err) {
      console.warn('Supabase query error, falling back to local dataset:', err)
    }
  }

  // Fallback to local catalog
  if (!category || category === 'todos') {
    return MOCK_PRODUCTS
  }
  return MOCK_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase())
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

