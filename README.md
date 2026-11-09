# gj. CLOTHING AND CAPS — Tienda 

Proyecto e-commerce streetwear desarrollado con **React**, **Vite**, **TypeScript**, **Tailwind CSS** y base de datos en **Supabase**.

---

## ⚡ Características

- **Diseño Fiel a la Identidad Visual**:
  - Navbar con logo brutalista `gj. CLOTHING AND CAPS`, navegación por categorías, buscador y bolsa interactiva.
  - Sección Hero con tipografía condensada de alto impacto , tag de nueva colección y badges.
  - Ticker infinito animado (`SIN PERMISO ✱ SIN COPIAS ✱ SOLO IDENTIDAD ✱ GJ CLOTHING AND CAPS`).
  - Catálogo interactivo (`01 / LOS MÁS BUSCADOS`) con filtrado en tiempo real, selector de color, botón quick-add `+` y modal detallado de producto.
  - Bloques editoriales de categorías (`02 / ELIGE TU CÓDIGO - CLOTHING & CAPS`).
  - Sección editorial (`03 / NO ES MODA. ES TU FORMA DE ESTAR.`), manifiesto de marca y los 3 pilares de servicio (envíos, pagos seguros, cambios).
  - Suscripción al círculo (`ENTRA AL CÍRCULO`) conectada a Supabase.
  - Footer completo con watermark tipográfico gigante y enlaces de soporte y legales.
  - Bolsa de compras desplegable (Cart Drawer) con barra de progreso interactiva hacia el envío gratis.

---

## 📦 Instalación y Ejecución

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configuración de Supabase**:
   Copia el archivo `.env.example` a `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

   > **Nota**: Si aún no has configurado tus credenciales de Supabase, la aplicación cargará automáticamente el catálogo local optimizado con los productos del Drop 004 sin romperse.

3. **Cargar la Base de Datos en Supabase**:
   Ejecuta el script SQL ubicado en `supabase/schema.sql` directamente en el **SQL Editor** del dashboard de tu proyecto Supabase.
   Este script creará:
   - Tabla `drops` (información del Drop 004)
   - Tabla `products` (con los 4 productos de lanzamiento, precios, especificaciones y colores)
   - Tabla `newsletter_subscribers` (para captación de correos)
   - Tabla `orders` (para gestión de pedidos)
   - Políticas de seguridad **Row Level Security (RLS)** y acceso público anónimo configurado según las mejores prácticas.

4. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```

5. **Compilar para producción**:
   ```bash
   npm run build
   ```
