-- ============================================================
-- GJ CLOTHING AND CAPS — Esquema Optimizado de Base de Datos
-- Ejecuta este script completo en el SQL Editor de tu panel de Supabase
-- ============================================================

-- 1. Habilitar extensión pgcrypto para UUIDs seguros
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabla de Categorías (soporte dinámico para nuevas categorías)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    has_sizes BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar categorías base limpias
INSERT INTO public.categories (slug, name, has_sizes)
VALUES
    ('hoodies', 'Hoodies', true),
    ('playeras', 'Playeras', true),
    ('gorras', 'Gorras', false),
    ('accesorios', 'Accesorios', false)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    has_sizes = EXCLUDED.has_sizes;

-- 3. Tabla de Marcas
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Drops
CREATE TABLE IF NOT EXISTS public.drops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    volume TEXT DEFAULT 'GJ* / VOL. 004',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Productos (Estructura óptima para imágenes, precios y variantes)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT DEFAULT '',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    currency TEXT DEFAULT 'MXN',
    tag TEXT,
    tag_type TEXT DEFAULT 'lime',
    description TEXT,
    specs TEXT,
    colors JSONB DEFAULT '[]'::jsonb,
    image_url TEXT NOT NULL DEFAULT '',
    images JSONB DEFAULT '[]'::jsonb,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_featured BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    drop_id UUID REFERENCES public.drops(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar que columnas clave existan si la tabla ya había sido creada antes:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 6. Tabla de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT NOT NULL,
    shipping_type TEXT DEFAULT 'saltillo_local',
    shipping_address JSONB,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    currency TEXT DEFAULT 'MXN',
    status TEXT DEFAULT 'pendiente',
    payment_method TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_type TEXT DEFAULT 'saltillo_local';

-- 7. Tabla de Clientes (Customers)
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

-- 8. Tabla de Cupones de Descuento (Coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    duration_label TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    min_purchase NUMERIC(10, 2) DEFAULT 0,
    uses_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Tabla de Suscriptores al Newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'landing_circle',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ÍNDICES DE RENDIMIENTO (Búsquedas instantáneas en tienda y admin)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- ============================================================
-- STORAGE BUCKET PARA IMÁGENES DE PRODUCTOS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage
DROP POLICY IF EXISTS "Allow public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete product images" ON storage.objects;

CREATE POLICY "Allow public read product images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Allow public upload product images"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public update product images"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Allow public delete product images"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id = 'product-images');

-- ============================================================
-- POLÍTICAS DE ACCESO (ROW LEVEL SECURITY - RLS)
-- ============================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas antiguas
DROP POLICY IF EXISTS "Allow full categories access" ON public.categories;
DROP POLICY IF EXISTS "Allow full brands access" ON public.brands;
DROP POLICY IF EXISTS "Allow full drops access" ON public.drops;
DROP POLICY IF EXISTS "Allow full products access" ON public.products;
DROP POLICY IF EXISTS "Allow full orders access" ON public.orders;
DROP POLICY IF EXISTS "Allow full customers access" ON public.customers;
DROP POLICY IF EXISTS "Allow full coupons access" ON public.coupons;
DROP POLICY IF EXISTS "Allow full newsletter access" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public read access to drops" ON public.drops;
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public manage products" ON public.products;
DROP POLICY IF EXISTS "Allow anonymous subscription to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow full admin_users access" ON public.admin_users;

-- ============================================================
-- 10. Tabla de Administradores (Admin Users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    auth_token TEXT DEFAULT 'gj_adm_sec_9941829471',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS auth_token TEXT DEFAULT 'gj_adm_sec_9941829471';
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_users (username, password_hash, role, auth_token)
VALUES ('goncen', 'gjcrenace', 'superadmin', 'gj_adm_sec_9941829471')
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    auth_token = EXCLUDED.auth_token;

-- Función segura de verificación de credenciales
CREATE OR REPLACE FUNCTION public.verify_admin_login(p_username TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    found_user RECORD;
BEGIN
    SELECT * INTO found_user
    FROM public.admin_users
    WHERE lower(trim(username)) = lower(trim(p_username))
      AND password_hash = trim(p_password);

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'role', found_user.role,
            'token', found_user.auth_token
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Credenciales inválidas'
        );
    END IF;
END;
$$;

-- Función para verificar si la petición es administrativa
CREATE OR REPLACE FUNCTION public.is_admin_request()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    headers JSONB;
    token TEXT;
BEGIN
    BEGIN
        headers := current_setting('request.headers', true)::jsonb;
        token := headers->>'x-admin-token';
    EXCEPTION WHEN OTHERS THEN
        token := NULL;
    END;

    IF token IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.admin_users WHERE auth_token = token
    ) THEN
        RETURN TRUE;
    END IF;

    IF auth.role() = 'authenticated' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- Función segura para descontar stock en checkout
CREATE OR REPLACE FUNCTION public.decrement_product_stock_secure(
    p_product_id UUID,
    p_quantity INT,
    p_new_specs TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.products
    SET stock = GREATEST(0, stock - p_quantity),
        specs = COALESCE(p_new_specs, specs),
        updated_at = now()
    WHERE id = p_product_id;

    RETURN FOUND;
END;
$$;

-- ============================================================
-- POLÍTICAS RLS BLINDADAS (OWASP COMPLIANT)
-- ============================================================

-- admin_users: blindaje total
CREATE POLICY "admin_users_admin_only"
ON public.admin_users FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- products: público solo lectura, admin gestión completa
CREATE POLICY "products_public_read"
ON public.products FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "products_admin_write"
ON public.products FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- categories & brands: público solo lectura, admin gestión
CREATE POLICY "categories_public_read"
ON public.categories FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "categories_admin_write"
ON public.categories FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

CREATE POLICY "brands_public_read"
ON public.brands FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "brands_admin_write"
ON public.brands FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

CREATE POLICY "drops_public_read"
ON public.drops FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "drops_admin_write"
ON public.drops FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- orders: público solo INSERT (compras), admin lectura y gestión
CREATE POLICY "orders_public_create"
ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "orders_admin_manage"
ON public.orders FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- customers: público solo INSERT, admin gestión
CREATE POLICY "customers_public_create"
ON public.customers FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "customers_admin_manage"
ON public.customers FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- coupons: público solo lectura de cupones activos
CREATE POLICY "coupons_public_read_active"
ON public.coupons FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "coupons_admin_manage"
ON public.coupons FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- newsletter: público solo suscripción
CREATE POLICY "newsletter_public_subscribe"
ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "newsletter_admin_manage"
ON public.newsletter_subscribers FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- ============================================================
-- DATOS INICIALES
-- ============================================================
INSERT INTO public.drops (code, name, tagline, volume, description)
VALUES (
    'COLECCION_ORIGINAL',
    'UNDERGROUND ESSENTIALS',
    'BUILT FOR THE STREETS.',
    'GJ* / VOL. 01',
    'Presentamos Underground Essentials. Texturas pesadas, tonos crudos y siluetas que no piden permiso.'
)
ON CONFLICT (code) DO NOTHING;
