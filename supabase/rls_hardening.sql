-- ============================================================
-- GJ CLOTHING AND CAPS — HARDENING DE SEGURIDAD RLS (OWASP TOP 10)
-- Ejecuta este script en el SQL Editor de tu panel de Supabase
-- para blindar todas las tablas contra accesos no autorizados.
-- ============================================================

-- 1. Asegurar tabla admin_users con columna de token de sesión seguro
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    auth_token TEXT DEFAULT 'gj_adm_sec_9941829471',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar columna auth_token si la tabla ya existía
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS auth_token TEXT DEFAULT 'gj_adm_sec_9941829471';

-- Insertar o actualizar usuario administrador (goncen / gjcrenace)
INSERT INTO public.admin_users (username, password_hash, role, auth_token)
VALUES ('goncen', 'gjcrenace', 'superadmin', 'gj_adm_sec_9941829471')
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    auth_token = EXCLUDED.auth_token;

-- 2. Función segura de verificación de credenciales (SECURITY DEFINER)
-- Evita que cualquiera consulte directamente la tabla de contraseñas.
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

-- 3. Función auxiliar para detectar si la petición proviene del Administrador
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

    -- Validar si el token coincide con un administrador registrado
    IF token IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.admin_users WHERE auth_token = token
    ) THEN
        RETURN TRUE;
    END IF;

    -- También permitir si es un usuario autenticado por Supabase Auth
    IF auth.role() = 'authenticated' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- 4. Función segura para descontar stock al realizar compras (sin abrir la tabla de productos a edición libre)
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
-- 5. APLICACIÓN DE POLÍTICAS RLS BLINDADAS
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas antiguas
DROP POLICY IF EXISTS "Allow full admin_users access" ON public.admin_users;
DROP POLICY IF EXISTS "Allow full products access" ON public.products;
DROP POLICY IF EXISTS "Allow full categories access" ON public.categories;
DROP POLICY IF EXISTS "Allow full brands access" ON public.brands;
DROP POLICY IF EXISTS "Allow full drops access" ON public.drops;
DROP POLICY IF EXISTS "Allow full orders access" ON public.orders;
DROP POLICY IF EXISTS "Allow full customers access" ON public.customers;
DROP POLICY IF EXISTS "Allow full coupons access" ON public.coupons;
DROP POLICY IF EXISTS "Allow full newsletter access" ON public.newsletter_subscribers;

-- POLÍTICAS: ADMIN_USERS (Blindaje total: solo accesible por función segura o admin)
CREATE POLICY "admin_users_admin_only"
ON public.admin_users FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- POLÍTICAS: PRODUCTOS (Público solo lectura, Admin edición completa)
CREATE POLICY "products_public_read"
ON public.products FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "products_admin_write"
ON public.products FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- POLÍTICAS: CATEGORÍAS Y MARCAS (Público solo lectura, Admin edición)
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

-- POLÍTICAS: PEDIDOS (Público solo puede CREAR su pedido al comprar, Admin puede verlos todos)
CREATE POLICY "orders_public_create"
ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "orders_admin_manage"
ON public.orders FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- POLÍTICAS: CLIENTES (Público solo puede CREAR registro, Admin puede ver lista)
CREATE POLICY "customers_public_create"
ON public.customers FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "customers_admin_manage"
ON public.customers FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- POLÍTICAS: CUPONES (Público solo puede ver cupones activos, Admin puede crearlos/editarlos)
CREATE POLICY "coupons_public_read_active"
ON public.coupons FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "coupons_admin_manage"
ON public.coupons FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());

-- POLÍTICAS: NEWSLETTER (Público solo puede suscribirse, Admin puede ver lista)
CREATE POLICY "newsletter_public_subscribe"
ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "newsletter_admin_manage"
ON public.newsletter_subscribers FOR ALL TO anon, authenticated
USING (public.is_admin_request())
WITH CHECK (public.is_admin_request());
