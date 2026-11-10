-- ============================================================
-- GJ CLOTHING AND CAPS — Esquema Completo de Base de Datos
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- 1. Habilitar extensión pgcrypto para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabla de Drops
CREATE TABLE IF NOT EXISTS public.drops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- e.g. 'DROP 004'
    name TEXT NOT NULL, -- e.g. 'UNDERGROUND ESSENTIALS'
    tagline TEXT, -- e.g. 'BUILT FOR THE STREETS.'
    volume TEXT DEFAULT 'GJ* / VOL. 004',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Productos (con soporte para marca e imágenes)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'gorras', 'playeras', 'hoodies', 'accesorios'
    brand TEXT DEFAULT 'GJ', -- 'GJ', 'New Era', 'Mitchell & Ness', '47 Brand'
    price NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    tag TEXT, -- 'BEST SELLER', 'NUEVO', 'EDICIÓN LIMITADA'
    tag_type TEXT DEFAULT 'white', -- 'white' o 'lime'
    description TEXT,
    specs TEXT, -- e.g. 'Negro / Bordado 3D / Ajustable'
    colors JSONB DEFAULT '[]'::jsonb,
    image_url TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    stock INTEGER DEFAULT 25,
    is_featured BOOLEAN DEFAULT true,
    drop_id UUID REFERENCES public.drops(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Si la tabla products ya existía, asegurar que tenga las columnas brand e images:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'GJ';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true;

-- 4. Tabla de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT NOT NULL,
    shipping_type TEXT DEFAULT 'saltillo_local', -- 'saltillo_local' o 'paqueteria_nacional'
    shipping_address JSONB,
    total_amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    status TEXT DEFAULT 'pendiente', -- 'pendiente', 'en_camino', 'entregado', 'cancelado'
    payment_method TEXT, -- 'Tarjeta de crédito / débito', 'Mercado Pago'
    items JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar columnas en orders:
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_type TEXT DEFAULT 'saltillo_local';

-- 5. Tabla de Clientes (Customers)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    city TEXT DEFAULT 'Saltillo, Coah.',
    orders_count INTEGER DEFAULT 1,
    total_spent NUMERIC(10, 2) DEFAULT 0,
    registered_at TIMESTAMPTZ DEFAULT now(),
    last_order_date TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de Cupones de Descuento (Coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' o 'fixed'
    discount_value NUMERIC(10, 2) NOT NULL,
    duration_label TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    min_purchase NUMERIC(10, 2) DEFAULT 0,
    uses_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabla de Suscriptores al Newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'landing_circle',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- POLÍTICAS DE ACCESO (ROW LEVEL SECURITY - RLS)
-- ============================================================

ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas anteriores si existen
DROP POLICY IF EXISTS "Allow public read access to drops" ON public.drops;
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public manage products" ON public.products;
DROP POLICY IF EXISTS "Allow anonymous subscription to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow anonymous order creation" ON public.orders;
DROP POLICY IF EXISTS "Allow full orders access" ON public.orders;
DROP POLICY IF EXISTS "Allow full customers access" ON public.customers;
DROP POLICY IF EXISTS "Allow full coupons access" ON public.coupons;

-- Políticas para Drops
CREATE POLICY "Allow public read access to drops"
ON public.drops FOR SELECT TO anon, authenticated USING (true);

-- Políticas para Products (lectura pública y gestión admin)
CREATE POLICY "Allow public read access to products"
ON public.products FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public manage products"
ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para Orders (creación desde checkout, lectura y actualización desde admin)
CREATE POLICY "Allow full orders access"
ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para Customers (gestión de clientes)
CREATE POLICY "Allow full customers access"
ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para Coupons (validación en carrito y gestión admin)
CREATE POLICY "Allow full coupons access"
ON public.coupons FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para Newsletter
CREATE POLICY "Allow anonymous subscription to newsletter"
ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
WITH CHECK (email IS NOT NULL AND position('@' in email) > 1);

CREATE POLICY "Allow read newsletter subscribers"
ON public.newsletter_subscribers FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- DATOS INICIALES DEL DROP 004 (Solo si no existen)
-- ============================================================

INSERT INTO public.drops (code, name, tagline, volume, description)
VALUES (
    'DROP 004',
    'UNDERGROUND ESSENTIALS',
    'BUILT FOR THE STREETS.',
    'GJ* / VOL. 004',
    'Presentamos Underground Essentials. Texturas pesadas, tonos crudos y siluetas que no piden permiso.'
)
ON CONFLICT (code) DO NOTHING;
