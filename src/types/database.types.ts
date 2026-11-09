export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Product {
  id: string
  slug: string
  title: string
  category: 'gorras' | 'playeras' | 'hoodies' | 'accesorios'
  price: number
  currency: string
  tag?: string | null
  tag_type?: 'white' | 'lime' | null
  description?: string | null
  specs?: string | null
  colors?: string[]
  image_url: string
  stock?: number
  is_featured?: boolean
  created_at?: string
}

export interface DropInfo {
  id: string
  code: string
  name: string
  tagline: string
  volume: string
  description?: string
  is_active: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

export interface NewsletterSubscriber {
  id?: string
  email: string
  source?: string
  created_at?: string
}

export interface OrderItem {
  title: string
  size?: string
  color?: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  shippingType: 'saltillo_local' | 'paqueteria_nacional'
  shippingAddress: string
  items: OrderItem[]
  total: number
  status: 'pendiente' | 'en_camino' | 'entregado'
  paymentMethod: string
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  city: string
  ordersCount: number
  totalSpent: number
  registeredAt: string
  lastOrderDate: string
}

export interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  durationLabel: string
  expiresAt: string
  isActive: boolean
  minPurchase: number
  usesCount: number
  createdAt: string
}
