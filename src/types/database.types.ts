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

