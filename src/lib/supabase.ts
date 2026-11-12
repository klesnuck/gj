import { createClient } from '@supabase/supabase-js'
import type { Product, DropInfo, Order, Customer, Coupon, OrderItem } from '../types/database.types'
import {
  saveCustomBrand,
  saveProductBrand,
  getProductBrand,
  saveProductImages,
  getProductImages,
} from './brands'

const DEFAULT_SUPABASE_URL = 'https://cvuafxqixfjjjbwdjvuq.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Z9WaZfwZSbMT9mJk-TVrJA_VES1IG1v'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id')
)

// Supabase client instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const MOCK_DROP: DropInfo = {
  id: 'drop-004',
  code: 'DROP 004',
  name: 'UNDERGROUND ESSENTIALS',
  tagline: 'BUILT FOR THE STREETS.',
  volume: 'GJ* / VOL. 004',
  description: 'Presentamos Underground Essentials. Texturas pesadas, tonos crudos y siluetas que no piden permiso. El nuevo uniforme de los que hacen las cosas a su manera.',
  is_active: true
}

// ============================================================
// PRODUCTOS
// ============================================================

export async function fetchProducts(category?: string): Promise<Product[]> {
  let productsList: Product[] = []

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false })
      const { data, error } = await query
      if (error) throw error
      if (data && data.length > 0) {
        productsList = data.map((row: any) => ({
          id: row.id,
          slug: row.slug,
          title: row.title,
          category: row.category,
          brand: row.brand || getProductBrand(row.id) || (row.category === 'gorras' ? 'GJ' : 'GJ'),
          price: Number(row.price),
          currency: row.currency || 'MXN',
          tag: row.tag || null,
          tag_type: row.tag_type || 'white',
          description: row.description || '',
          specs: row.specs || '',
          colors: Array.isArray(row.colors) ? row.colors : [],
          image_url: row.image_url,
          images: Array.isArray(row.images) && row.images.length > 0
            ? row.images
            : (getProductImages(row.id) || (row.image_url ? [row.image_url] : [])),
          stock: row.stock ?? 10,
          is_featured: row.is_featured ?? true,
          created_at: row.created_at,
        }))
      }
    } catch (err) {
      console.warn('Supabase fetchProducts error:', err)
    }
  }

  // Filtrado de categoría
  if (!category || category === 'todos') {
    return productsList
  }

  const catLower = category.toLowerCase()

  // Caso 1: Ropa (muestra playeras, hoodies y todo lo de ropa)
  if (catLower === 'ropa') {
    return productsList.filter(
      (p) =>
        p.category === 'playeras' ||
        p.category === 'hoodies' ||
        (p.category as string) === 'ropa'
    )
  }

  // Caso 2: Gorras con filtro de marca
  if (catLower.startsWith('gorras:')) {
    const brandTerm = catLower.replace('gorras:', '').trim()
    return productsList.filter((p) => {
      if (p.category !== 'gorras') return false
      const brandStr = (p.brand || '').toLowerCase()
      const titleStr = p.title.toLowerCase()
      return brandStr.includes(brandTerm) || titleStr.includes(brandTerm)
    })
  }

  // Caso 3: Todas las gorras
  if (catLower === 'gorras') {
    return productsList.filter((p) => p.category === 'gorras')
  }

  // Caso 4: Accesorios
  if (catLower === 'accesorios') {
    return productsList.filter((p) => p.category === 'accesorios')
  }

  return productsList.filter((p) => p.category.toLowerCase() === catLower)
}

export async function createProduct(
  productData: Partial<Product>
): Promise<{ success: boolean; data?: Product; message?: string }> {
  const id = productData.id || `prod-${Date.now()}`
  const newProduct: Product = {
    id,
    slug: productData.slug || `prod-${Date.now()}`,
    title: productData.title || 'Nueva Prenda',
    category: productData.category || 'playeras',
    brand: productData.brand || 'GJ',
    price: productData.price || 0,
    currency: productData.currency || 'MXN',
    tag: productData.tag || null,
    tag_type: productData.tag_type || 'white',
    description: productData.description || null,
    specs: productData.specs || null,
    colors: productData.colors || [],
    image_url: productData.image_url || '/images/product-tshirt.jpg',
    images: productData.images || [],
    stock: productData.stock ?? 15,
    is_featured: productData.is_featured ?? true,
    created_at: productData.created_at || new Date().toISOString(),
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = {
        slug: newProduct.slug,
        title: newProduct.title,
        category: newProduct.category,
        brand: newProduct.brand,
        price: newProduct.price,
        currency: newProduct.currency,
        tag: newProduct.tag,
        tag_type: newProduct.tag_type,
        description: newProduct.description,
        specs: newProduct.specs,
        colors: newProduct.colors,
        image_url: newProduct.image_url,
        images: newProduct.images,
        stock: newProduct.stock,
        is_featured: newProduct.is_featured,
      }

      if (newProduct.brand) {
        saveCustomBrand(newProduct.brand)
        saveProductBrand(newProduct.id, newProduct.brand)
      }
      if (newProduct.images && newProduct.images.length > 0) {
        saveProductImages(newProduct.id, newProduct.images)
      }

      const isExisting = Boolean(productData.id && (productData.id.includes('-') || productData.id.length > 15))

      if (isExisting && productData.id) {
        // UPDATE de producto existente con auto-recuperación de columnas no presentes en el esquema
        let updateRes = await supabase.from('products').update(payload).eq('id', productData.id).select()
        let error = updateRes.error
        let attempts = 0
        while (error && error.message?.includes('in the schema cache') && attempts < 8) {
          attempts++
          const match = error.message.match(/Could not find the '([^']+)' column/)
          if (match && match[1]) {
            delete payload[match[1]]
            updateRes = await supabase.from('products').update(payload).eq('id', productData.id).select()
            error = updateRes.error
          } else {
            break
          }
        }

        // Si no se encontró por ID o hubo error de sintaxis UUID, intentar por slug
        if ((error && error.message?.includes('invalid input syntax for type uuid')) || (!error && updateRes.data?.length === 0)) {
          let slugRes = await supabase.from('products').update(payload).eq('slug', newProduct.slug).select()
          if (!slugRes.error && slugRes.data && slugRes.data.length > 0) {
            error = null
            newProduct.id = slugRes.data[0].id
          } else if (slugRes.error) {
            error = slugRes.error
          }
        }

        if (error) throw error
      } else {
        // INSERT nuevo producto con auto-recuperación de columnas no presentes en el esquema
        let insertRes = await supabase.from('products').insert([payload]).select()
        let error = insertRes.error
        let attempts = 0
        while (error && error.message?.includes('in the schema cache') && attempts < 8) {
          attempts++
          const match = error.message.match(/Could not find the '([^']+)' column/)
          if (match && match[1]) {
            delete payload[match[1]]
            insertRes = await supabase.from('products').insert([payload]).select()
            error = insertRes.error
          } else {
            break
          }
        }
        if (error) throw error
        if (insertRes.data && insertRes.data[0]?.id) {
          newProduct.id = insertRes.data[0].id
          if (newProduct.brand) saveProductBrand(newProduct.id, newProduct.brand)
          if (newProduct.images) saveProductImages(newProduct.id, newProduct.images)
        }
      }
      return { success: true, data: newProduct }
    } catch (err: any) {
      console.error('Error al guardar producto en Supabase:', err)
      return {
        success: false,
        message: err.message || 'Error de permisos (RLS) en Supabase',
      }
    }
  }

  return { success: false, message: 'Supabase no está configurado.' }
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; message?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').delete().eq('id', productId)
    } catch (err: any) {
      console.warn('Error al eliminar producto en Supabase:', err)
    }
  }

  try {
    const custom: Product[] = JSON.parse(localStorage.getItem('gj_custom_products') || '[]')
    const filtered = custom.filter((p) => p.id !== productId)
    localStorage.setItem('gj_custom_products', JSON.stringify(filtered))
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function toggleProductFeatured(productId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('products').select('is_featured').eq('id', productId).single()
      if (data) {
        const nextVal = !data.is_featured
        await supabase.from('products').update({ is_featured: nextVal }).eq('id', productId)
        return true
      }
    } catch (err) {
      console.warn('Error toggle featured en Supabase:', err)
    }
  }
  return false
}

export async function updateProductStock(productId: string, newStock: number, newSpecs: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock, specs: newSpecs })
        .eq('id', productId)
      if (!error) return true
    } catch (err) {
      console.warn('Error actualizando stock de producto en Supabase:', err)
    }
  }
  return false
}

// ============================================================
// PEDIDOS (ORDERS)
// ============================================================

export async function fetchOrders(): Promise<Order[]> {
  let supabaseOrders: Order[] = []

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        supabaseOrders = data.map((row: any) => ({
          id: row.id,
          orderNumber: row.order_number,
          customerName: row.customer_name || (row.shipping_address?.customer_name || 'Cliente GJ'),
          customerPhone: row.customer_phone || (row.shipping_address?.phone || ''),
          customerEmail: row.customer_email,
          shippingType: row.shipping_type || (row.shipping_address?.address?.toLowerCase().includes('saltillo') ? 'saltillo_local' : 'paqueteria_nacional'),
          shippingAddress: typeof row.shipping_address === 'string' ? row.shipping_address : (row.shipping_address?.address || ''),
          items: Array.isArray(row.items) ? row.items : [],
          total: Number(row.total_amount),
          status: row.status === 'en_camino' ? 'en_camino' : (row.status === 'entregado' ? 'entregado' : 'pendiente'),
          paymentMethod: row.payment_method || 'Tarjeta',
          createdAt: new Date(row.created_at).toLocaleDateString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }))
      }
    } catch (err) {
      console.warn('Error al consultar orders de Supabase:', err)
    }
  }

  // Leer orders de localStorage para que nunca se pierdan si Supabase RLS bloquea SELECT
  let localOrders: Order[] = []
  try {
    localOrders = JSON.parse(localStorage.getItem('gj_admin_orders') || '[]')
  } catch (e) {
    console.warn(e)
  }

  // Combinar por orderNumber (dando prioridad a Supabase, pero agregando los locales)
  const combinedMap = new Map<string, Order>()
  for (const o of localOrders) {
    combinedMap.set(o.orderNumber, o)
  }
  for (const o of supabaseOrders) {
    combinedMap.set(o.orderNumber, o)
  }

  return Array.from(combinedMap.values())
}

export async function createOrder(orderPayload: {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  shippingType: 'saltillo_local' | 'paqueteria_nacional'
  shippingAddress: string
  paymentMethod: string
  items: OrderItem[]
  total: number
}): Promise<{ success: boolean; data?: Order }> {
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: orderPayload.orderNumber,
    customerName: orderPayload.customerName,
    customerPhone: orderPayload.customerPhone,
    customerEmail: orderPayload.customerEmail,
    shippingType: orderPayload.shippingType,
    shippingAddress: orderPayload.shippingAddress,
    items: orderPayload.items,
    total: orderPayload.total,
    status: 'pendiente',
    paymentMethod: orderPayload.paymentMethod,
    createdAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  }

  // Guardar SIEMPRE en localStorage para que esté disponible inmediatamente en el panel del admin
  try {
    const existing = JSON.parse(localStorage.getItem('gj_admin_orders') || '[]')
    const filtered = existing.filter((o: Order) => o.orderNumber !== newOrder.orderNumber)
    localStorage.setItem('gj_admin_orders', JSON.stringify([newOrder, ...filtered]))
  } catch (e) {
    console.warn(e)
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = {
        order_number: orderPayload.orderNumber,
        customer_name: orderPayload.customerName,
        customer_phone: orderPayload.customerPhone,
        customer_email: orderPayload.customerEmail,
        shipping_type: orderPayload.shippingType,
        shipping_address: { address: orderPayload.shippingAddress, phone: orderPayload.customerPhone, customer_name: orderPayload.customerName },
        total_amount: orderPayload.total,
        currency: 'MXN',
        status: 'pendiente',
        payment_method: orderPayload.paymentMethod,
        items: orderPayload.items,
      }

      let { error } = await supabase.from('orders').insert([payload])
      let attempts = 0
      while (error && error.message?.includes('in the schema cache') && attempts < 5) {
        attempts++
        const match = error.message.match(/Could not find the '([^']+)' column/)
        if (match && match[1]) {
          delete payload[match[1]]
          const retryRes = await supabase.from('orders').insert([payload])
          error = retryRes.error
        } else {
          break
        }
      }

      if (error) {
        console.error('Error insertando orden en Supabase:', error)
      } else {
        return { success: true, data: newOrder }
      }
    } catch (err) {
      console.warn('Error al insertar orden en Supabase:', err)
    }
  }

  return { success: true, data: newOrder }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  // Actualizar en localStorage
  try {
    const existing: Order[] = JSON.parse(localStorage.getItem('gj_admin_orders') || '[]')
    const updated = existing.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status } : o))
    localStorage.setItem('gj_admin_orders', JSON.stringify(updated))
  } catch (e) {
    console.warn(e)
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId)
    } catch (err) {
      console.warn('Error al actualizar status de order:', err)
    }
  }
  return true
}

// ============================================================
// CLIENTES (CUSTOMERS)
// ============================================================

export async function fetchCustomers(ordersList?: Order[]): Promise<Customer[]> {
  let customersFromDb: Customer[] = []

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('customers').select('*').order('last_order_date', { ascending: false })
      if (!error && data && data.length > 0) {
        customersFromDb = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          phone: row.phone || '',
          email: row.email,
          city: row.city || 'Saltillo, Coah.',
          ordersCount: row.orders_count || 1,
          totalSpent: Number(row.total_spent) || 0,
          registeredAt: row.registered_at ? new Date(row.registered_at).toISOString().split('T')[0] : '',
          lastOrderDate: row.last_order_date ? new Date(row.last_order_date).toISOString().split('T')[0] : '',
        }))
      }
    } catch (err) {
      console.warn('Error al consultar customers en Supabase:', err)
    }
  }

  if (customersFromDb.length > 0) {
    return customersFromDb
  }

  // Si la tabla customers no existe en Supabase o está vacía, derivar automáticamente los clientes a partir de los pedidos realizados
  const orders = ordersList || await fetchOrders()
  const customerMap = new Map<string, Customer>()

  for (const o of orders) {
    if (!o.customerEmail) continue
    const key = o.customerEmail.toLowerCase().trim()
    const existing = customerMap.get(key)
    if (existing) {
      existing.ordersCount += 1
      existing.totalSpent += o.total
    } else {
      customerMap.set(key, {
        id: `cust-${o.orderNumber}`,
        name: o.customerName || 'Cliente GJ',
        phone: o.customerPhone || '',
        email: o.customerEmail,
        city: o.shippingType === 'saltillo_local' ? 'Saltillo, Coah.' : 'Nacional',
        ordersCount: 1,
        totalSpent: o.total,
        registeredAt: o.createdAt || new Date().toISOString().split('T')[0],
        lastOrderDate: o.createdAt || new Date().toISOString().split('T')[0],
      })
    }
  }

  return Array.from(customerMap.values())
}

export async function saveCustomer(customer: Customer): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('customers').upsert([
        {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          city: customer.city,
          orders_count: customer.ordersCount,
          total_spent: customer.totalSpent,
        },
      ], { onConflict: 'email' })
    } catch (err) {
      console.warn('Error al upsert customer en Supabase:', err)
    }
  }
  return true
}

// ============================================================
// CUPONES (COUPONS)
// ============================================================

export async function fetchCoupons(): Promise<Coupon[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          code: row.code,
          discountType: row.discount_type,
          discountValue: Number(row.discount_value),
          durationLabel: row.duration_label || 'Activo',
          expiresAt: row.expires_at,
          isActive: row.is_active ?? true,
          minPurchase: Number(row.min_purchase) || 0,
          usesCount: row.uses_count || 0,
          createdAt: row.created_at,
        }))
      }
    } catch (err) {
      console.warn('Error al consultar coupons en Supabase:', err)
    }
  }

  try {
    return JSON.parse(localStorage.getItem('gj_admin_coupons') || '[]')
  } catch {
    return []
  }
}

export async function saveCoupon(coupon: Coupon): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('coupons').insert([
        {
          code: coupon.code,
          discount_type: coupon.discountType,
          discount_value: coupon.discountValue,
          duration_label: coupon.durationLabel,
          expires_at: coupon.expiresAt,
          is_active: coupon.isActive,
          min_purchase: coupon.minPurchase,
          uses_count: coupon.usesCount,
        },
      ])
    } catch (err) {
      console.warn('Error al guardar coupon en Supabase:', err)
    }
  }
  return true
}

export async function toggleCoupon(couponId: string, isActive: boolean): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('coupons').update({ is_active: isActive }).eq('id', couponId)
    } catch (err) {
      console.warn('Error al toggle coupon en Supabase:', err)
    }
  }
  return true
}

export async function deleteCoupon(couponId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('coupons').delete().eq('id', couponId)
    } catch (err) {
      console.warn('Error al eliminar coupon en Supabase:', err)
    }
  }
  return true
}

// ============================================================
// NEWSLETTER
// ============================================================

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
