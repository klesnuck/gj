-- ============================================================
-- GJ CLOTHING AND CAPS — Database Schema (Supabase / PostgreSQL)
-- ============================================================

-- 1. Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Drops table
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

-- 3. Create Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'gorras', 'playeras', 'hoodies', 'accesorios'
    price NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    tag TEXT, -- 'BEST SELLER', 'NUEVO', 'EDICIÓN LIMITADA'
    tag_type TEXT DEFAULT 'white', -- 'white' or 'lime'
    description TEXT,
    specs TEXT, -- 'Negro / Bordado 3D / Ajustable'
    colors JSONB DEFAULT '[]'::jsonb, -- ['#111111', '#d5c7b3']
    image_url TEXT NOT NULL,
    stock INTEGER DEFAULT 25,
    is_featured BOOLEAN DEFAULT true,
    drop_id UUID REFERENCES public.drops(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Newsletter Subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'landing_circle',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Cart Orders table (ready for Mercado Pago / Stripe)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    total_amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'shipped', 'cancelled'
    payment_method TEXT, -- 'mercadopago', 'card', 'spei'
    items JSONB NOT NULL,
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drops: Public read
CREATE POLICY "Allow public read access to drops"
ON public.drops
FOR SELECT
TO anon, authenticated
USING (true);

-- Products: Public read
CREATE POLICY "Allow public read access to products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

-- Newsletter: Public can subscribe (INSERT only)
CREATE POLICY "Allow anonymous subscription to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (email IS NOT NULL AND position('@' in email) > 1);

-- Orders: Public can create pending orders
CREATE POLICY "Allow anonymous order creation"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (total_amount > 0 AND customer_email IS NOT NULL);

-- ============================================================
-- SEED INITIAL DATA
-- ============================================================

-- Insert DROP 004
INSERT INTO public.drops (code, name, tagline, volume, description)
VALUES (
    'DROP 004',
    'UNDERGROUND ESSENTIALS',
    'BUILT FOR THE STREETS.',
    'GJ* / VOL. 004',
    'Presentamos Underground Essentials. Texturas pesadas, tonos crudos y siluetas que no piden permiso.'
)
ON CONFLICT (code) DO NOTHING;

-- Insert Products from official Drop 004
INSERT INTO public.products (slug, title, category, price, currency, tag, tag_type, specs, colors, image_url, is_featured)
VALUES
(
    'gorra-gj-signature',
    'Gorra GJ Signature',
    'gorras',
    699.00,
    'MXN',
    'BEST SELLER',
    'white',
    'Negro / Bordado 3D / Ajustable',
    '["#111111", "#d5c7b3", "#4A5243"]'::jsonb,
    '/images/product-cap-black.jpg',
    true
),
(
    'playera-heavyweight',
    'Playera Heavyweight',
    'playeras',
    899.00,
    'MXN',
    'NUEVO',
    'lime',
    'Washed black / Oversized / 280 g',
    '["#262626", "#ECEAE4"]'::jsonb,
    '/images/product-tshirt.jpg',
    true
),
(
    'gorra-script-club',
    'Gorra Script Club',
    'gorras',
    749.00,
    'MXN',
    'EDICIÓN LIMITADA',
    'white',
    'Stone / Bordado / Ajustable',
    '["#C4B69F", "#111111"]'::jsonb,
    '/images/product-cap-stone.jpg',
    true
),
(
    'hoodie-no-signal',
    'Hoodie No Signal',
    'hoodies',
    1499.00,
    'MXN',
    'NUEVO',
    'lime',
    'Negro / Relaxed fit / 450 g',
    '["#171717", "#3E3E3E"]'::jsonb,
    '/images/product-hoodie.jpg',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    tag = EXCLUDED.tag,
    tag_type = EXCLUDED.tag_type,
    specs = EXCLUDED.specs,
    colors = EXCLUDED.colors,
    image_url = EXCLUDED.image_url;

