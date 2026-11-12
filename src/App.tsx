import { useState, useEffect, useMemo } from 'react'
import { AnnouncementBar } from './components/AnnouncementBar'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { MarqueeTicker } from './components/MarqueeTicker'
import { FeaturedProducts } from './components/FeaturedProducts'
import { CategoriesBanner } from './components/CategoriesBanner'
import { Newsletter } from './components/Newsletter'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { QuickViewModal } from './components/QuickViewModal'

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout'
import { DashboardOverview } from './components/admin/DashboardOverview'
import { ProductList } from './components/admin/ProductList'
import { ProductForm } from './components/admin/ProductForm'
import { OrdersList } from './components/admin/OrdersList'
import { CustomersList } from './components/admin/CustomersList'
import { DiscountsView } from './components/admin/DiscountsView'

// Cart, Checkout & Collection Pages
import { CartPage } from './components/cart/CartPage'
import { CheckoutPage } from './components/checkout/CheckoutPage'
import { OrderConfirmationView } from './components/checkout/OrderConfirmationView'
import { CollectionPage } from './components/collection/CollectionPage'

import {
  fetchProducts,
  createProduct,
  deleteProduct,
  toggleProductFeatured,
  updateProductStock,
  fetchOrders,
  createOrder,
  updateOrderStatus,
  fetchCustomers,
  saveCustomer,
  fetchCoupons,
  saveCoupon,
  toggleCoupon,
  deleteCoupon,
} from './lib/supabase'
import { decrementProductStock, parseSizeStocks, isProductSoldOut } from './lib/stock'
import { filterProductsByCategory } from './lib/brands'
import type { Product, CartItem, Order, Customer, Coupon, OrderItem } from './types/database.types'

export function App() {
  const [currentView, setCurrentView] = useState<'store' | 'collection' | 'cart' | 'checkout' | 'admin' | 'order-success'>(() => {
    const hash = window.location.hash
    if (hash.startsWith('#admin')) return 'admin'
    if (hash.startsWith('#checkout')) return 'checkout'
    if (hash.startsWith('#cart')) return 'cart'
    if (hash.startsWith('#coleccion')) return 'collection'
    return 'store'
  })
  const [adminTab, setAdminTab] = useState<string>('resumen')
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Order Placement & Checkout State
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)

  // Store data from Supabase
  const [products, setProducts] = useState<Product[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('todos')
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gj_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Live Datasets (Starting from 0, populated live from Supabase)
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  // Limpieza de datos mock antiguos almacenados en el localStorage del teléfono o navegador
  useEffect(() => {
    try {
      localStorage.removeItem('gj_admin_orders')
      localStorage.removeItem('gj_admin_customers')
      localStorage.removeItem('gj_custom_products')
    } catch {
      // Ignorar si el navegador tiene bloqueado localStorage
    }
  }, [])

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('gj_admin_coupons')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Hash management & View Synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith('#admin')) {
        setCurrentView('admin')
      } else if (hash.startsWith('#checkout')) {
        setCurrentView('checkout')
      } else if (hash.startsWith('#cart')) {
        setCurrentView('cart')
      } else if (hash.startsWith('#coleccion')) {
        const cat = hash.replace('#coleccion/', '') || 'todos'
        setActiveCategory(cat)
        setCurrentView('collection')
      } else if (currentView !== 'order-success') {
        setCurrentView('store')
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [currentView])

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [currentView])

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gj_cart', JSON.stringify(cartItems))
    } catch (e) {
      console.warn('Could not save cart', e)
    }
  }, [cartItems])

  // Save admin coupons
  useEffect(() => {
    try {
      localStorage.setItem('gj_admin_coupons', JSON.stringify(coupons))
    } catch (e) {
      console.warn('Could not save coupons', e)
    }
  }, [coupons])

  // Load live data from Supabase
  const reloadProducts = async () => {
    const data = await fetchProducts('todos')
    setProducts(data)
  }

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      try {
        const oData = await fetchOrders()
        const [pData, cData, coupData] = await Promise.all([
          fetchProducts('todos'),
          fetchCustomers(oData),
          fetchCoupons(),
        ])
        if (isMounted) {
          setProducts(pData)
          setOrders(oData || [])
          setCustomers(cData || [])
          if (coupData && coupData.length > 0) setCoupons(coupData)
        }
      } catch (err) {
        console.warn('Error cargando datos desde Supabase:', err)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  // In-memory instant filtering: 0ms lag when switching categories or brands
  const filteredProducts = useMemo(
    () => filterProductsByCategory(products, activeCategory),
    [products, activeCategory]
  )

  // Keep selectedProduct in sync with live stock
  const activeSelectedProduct = selectedProduct
    ? products.find((p) => p.id === selectedProduct.id) || selectedProduct
    : null

  // Admin Handlers
  const handleSaveProduct = async (productData: Partial<Product>): Promise<boolean> => {
    const res = await createProduct(productData)
    if (res.success) {
      await reloadProducts()
      setIsCreatingProduct(false)
      setEditingProduct(null)
      return true
    } else {
      alert(`⚠️ Supabase no permitió guardar la prenda:\n\n"${res.message}"\n\nDebes ejecutar el script SQL en el SQL Editor de Supabase para activar los permisos de subida.`)
      return false
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    const res = await deleteProduct(productId)
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      setCartItems((prev) => prev.filter((item) => item.product.id !== productId))
      if (editingProduct?.id === productId) {
        setEditingProduct(null)
        setIsCreatingProduct(false)
      }
    }
  }

  const handleToggleFeatured = async (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_featured: !p.is_featured } : p))
    )
    await toggleProductFeatured(productId)
  }

  const handleOpenCategory = (cat: string) => {
    if (cat === 'todos') {
      setActiveCategory('todos')
      window.location.hash = ''
      setCurrentView('store')
      return
    }
    setActiveCategory(cat)
    window.location.hash = `coleccion/${cat}`
    setCurrentView('collection')
  }

  const handleAddCoupon = async (newCoupon: Coupon) => {
    setCoupons((prev) => [newCoupon, ...prev])
    await saveCoupon(newCoupon)
  }

  const handleToggleCoupon = async (couponId: string) => {
    const target = coupons.find((c) => c.id === couponId)
    const nextState = target ? !target.isActive : false
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
    )
    await toggleCoupon(couponId, nextState)
  }

  const handleDeleteCoupon = async (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId))
    await deleteCoupon(couponId)
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
    await updateOrderStatus(orderId, newStatus)
  }

  const handleAddCustomer = async (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev])
    await saveCustomer(newCustomer)
  }

  // Coupon handling for Cart & Checkout
  const handleApplyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase()
    if (!clean) return { success: false, message: 'Ingresa un código de cupón.' }

    const found = coupons.find((c) => c.code === clean)
    if (!found) return { success: false, message: 'Cupón no encontrado.' }
    if (!found.isActive) return { success: false, message: 'Este cupón está inactivo actualmente.' }
    if (new Date(found.expiresAt).getTime() < Date.now()) {
      return { success: false, message: 'Este cupón ha expirado.' }
    }

    setAppliedCoupon(found)
    return {
      success: true,
      message: `¡Cupón ${found.code} aplicado! (${found.discountType === 'percentage' ? `${found.discountValue}% OFF` : `$${found.discountValue} MXN`
        })`,
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
  }

  // Checkout Placement Handler (Generates real Order & connects to Admin & Customers list)
  const handlePlaceOrder = async (orderPayload: {
    customerName: string
    customerEmail: string
    customerPhone: string
    shippingType: 'saltillo_local' | 'paqueteria_nacional'
    shippingAddress: string
    paymentMethod: string
    total: number
  }): Promise<Order> => {
    const newOrderNumber = Math.floor(1000 + Math.random() * 9000).toString()
    const orderItems: OrderItem[] = cartItems.map((it) => ({
      title: it.product.title,
      color: it.selectedColor,
      size: it.selectedSize,
      quantity: it.quantity,
      price: it.product.price,
    }))

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      customerName: orderPayload.customerName,
      customerEmail: orderPayload.customerEmail,
      customerPhone: orderPayload.customerPhone,
      shippingType: orderPayload.shippingType,
      shippingAddress: orderPayload.shippingAddress,
      paymentMethod: orderPayload.paymentMethod,
      items: orderItems,
      total: orderPayload.total,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    }

    // Add to Orders State
    setOrders((prev) => [newOrder, ...prev])

    // Update Customers State immediately
    setCustomers((prev) => {
      const existingIdx = prev.findIndex((c) => c.email.toLowerCase() === orderPayload.customerEmail.toLowerCase())
      if (existingIdx > -1) {
        const next = [...prev]
        next[existingIdx].ordersCount += 1
        next[existingIdx].totalSpent += orderPayload.total
        next[existingIdx].lastOrderDate = new Date().toISOString().split('T')[0]
        return next
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: orderPayload.customerName,
          phone: orderPayload.customerPhone,
          email: orderPayload.customerEmail,
          city: orderPayload.shippingType === 'saltillo_local' ? 'Saltillo, Coah.' : 'Nacional',
          ordersCount: 1,
          totalSpent: orderPayload.total,
          registeredAt: new Date().toISOString().split('T')[0],
          lastOrderDate: new Date().toISOString().split('T')[0],
        }
        return [newCust, ...prev]
      }
    })

    // Persist to Supabase
    createOrder({
      orderNumber: newOrderNumber,
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      customerEmail: orderPayload.customerEmail,
      shippingType: orderPayload.shippingType,
      shippingAddress: orderPayload.shippingAddress,
      paymentMethod: orderPayload.paymentMethod,
      items: orderItems,
      total: orderPayload.total,
    }).catch(console.warn)

    // Also persist customer to Supabase
    saveCustomer({
      id: `cust-${Date.now()}`,
      name: orderPayload.customerName,
      phone: orderPayload.customerPhone,
      email: orderPayload.customerEmail,
      city: orderPayload.shippingType === 'saltillo_local' ? 'Saltillo, Coah.' : 'Nacional',
      ordersCount: 1,
      totalSpent: orderPayload.total,
      registeredAt: new Date().toISOString().split('T')[0],
      lastOrderDate: new Date().toISOString().split('T')[0],
    }).catch(console.warn)

    // Descontar inventario real por talla comprada
    for (const item of cartItems) {
      const prod = products.find((p) => p.id === item.product.id)
      if (prod) {
        const { newStock, newSpecs } = decrementProductStock(
          prod,
          item.selectedSize || 'S',
          item.quantity
        )

        // Actualizar el estado local de productos de inmediato
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, stock: newStock, specs: newSpecs } : p))
        )

        // Actualizar en Supabase
        updateProductStock(prod.id, newStock, newSpecs).catch(console.warn)
      }
    }

    // Reset Cart and display Step 03 Confirmation
    setCartItems([])
    setCompletedOrder(newOrder)
    setCurrentView('order-success')
    window.location.hash = ''

    return newOrder
  }

  // Cart operations
  const handleAddToCart = (product: Product, selectedColor?: string, selectedSize?: string) => {
    if (isProductSoldOut(product)) {
      alert(`El producto "${product.title}" está agotado.`)
      return
    }

    const isCap = product.category === 'gorras'
    const size = (selectedSize || (isCap ? 'Unitalla' : 'S')).trim()
    const color = (selectedColor || product.colors?.[0] || 'default').trim()
    const sizeStocks = parseSizeStocks(product.specs, product.stock ?? 0)
    const maxAvailable = isCap
      ? (product.stock ?? 0)
      : (sizeStocks[size.toUpperCase()] ?? (product.stock ?? 0))

    if (maxAvailable <= 0) {
      alert(`La talla ${size} de "${product.title}" está agotada.`)
      return
    }

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          (item.selectedSize || (isCap ? 'Unitalla' : 'S')).trim().toUpperCase() === size.toUpperCase() &&
          (item.selectedColor || product.colors?.[0] || 'default').trim().toLowerCase() === color.toLowerCase()
      )

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity
        if (currentQty >= maxAvailable) {
          alert(`Ya alcanzaste el máximo disponible (${maxAvailable} piezas) para la talla ${size}.`)
          return prev
        }
        const next = [...prev]
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: currentQty + 1,
        }
        return next
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            selectedColor: color,
            selectedSize: size,
          },
        ]
      }
    })
    setIsCartOpen(true)
  }

  const handleUpdateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      handleRemoveItem(productId, size, color)
      return
    }
    setCartItems((prev) =>
      prev.map((item) => {
        const matchesProduct = item.product.id === productId
        const matchesSize = !size || (item.selectedSize || '').trim().toUpperCase() === size.trim().toUpperCase()
        const matchesColor = !color || (item.selectedColor || '').trim().toLowerCase() === color.trim().toLowerCase()

        if (matchesProduct && matchesSize && matchesColor) {
          const itemSize = item.selectedSize || (item.product.category === 'gorras' ? 'Unitalla' : 'S')
          const sizeStocks = parseSizeStocks(item.product.specs, item.product.stock ?? 0)
          const maxAvailable = item.product.category === 'gorras'
            ? (item.product.stock ?? 0)
            : (sizeStocks[itemSize.toUpperCase()] ?? (item.product.stock ?? 0))

          if (quantity > maxAvailable) {
            alert(`Solo hay ${maxAvailable} piezas disponibles para la talla ${itemSize}.`)
            return { ...item, quantity: maxAvailable }
          }
          return { ...item, quantity }
        }
        return item
      })
    )
  }

  const handleRemoveItem = (productId: string, size?: string, color?: string) => {
    setCartItems((prev) =>
      prev.filter((item) => {
        const matchesProduct = item.product.id === productId
        const matchesSize = !size || (item.selectedSize || '').trim().toUpperCase() === size.trim().toUpperCase()
        const matchesColor = !color || (item.selectedColor || '').trim().toLowerCase() === color.trim().toLowerCase()
        return !(matchesProduct && matchesSize && matchesColor)
      })
    )
  }

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const handleShopDrop = () => {
    handleOpenCategory('ropa')
  }

  const handleExploreCaps = () => {
    handleOpenCategory('gorras')
  }

  // RENDER ADMIN VIEW
  if (currentView === 'admin') {
    return (
      <AdminLayout
        activeTab={adminTab}
        onTabChange={(tab) => {
          setAdminTab(tab)
          setIsCreatingProduct(false)
          setEditingProduct(null)
        }}
        onBackToStore={() => {
          window.location.hash = ''
          setCurrentView('store')
        }}
      >
        {/* 1. Resumen Tab */}
        {adminTab === 'resumen' && (
          <DashboardOverview
            products={products}
            orders={orders}
            onNavigateToTab={(tab) => {
              setAdminTab(tab)
              setIsCreatingProduct(false)
              setEditingProduct(null)
            }}
            onAddNewProduct={() => {
              setAdminTab('productos')
              setEditingProduct(null)
              setIsCreatingProduct(true)
            }}
          />
        )}

        {/* 2. Productos Tab */}
        {adminTab === 'productos' && (
          <>
            {isCreatingProduct ? (
              <ProductForm
                key={editingProduct?.id || 'new-product'}
                initialProduct={editingProduct}
                onSaveProduct={handleSaveProduct}
                onCancel={() => {
                  setIsCreatingProduct(false)
                  setEditingProduct(null)
                }}
                onDeleteProduct={handleDeleteProduct}
                products={products}
              />
            ) : (
              <ProductList
                products={products}
                onAddNew={() => {
                  setEditingProduct(null)
                  setIsCreatingProduct(true)
                }}
                onEditProduct={(prod) => {
                  setEditingProduct(prod)
                  setIsCreatingProduct(true)
                }}
                onDeleteProduct={handleDeleteProduct}
                onToggleFeatured={handleToggleFeatured}
                onViewProductInStore={(prod) => {
                  window.location.hash = ''
                  setCurrentView('store')
                  setSelectedProduct(prod)
                }}
              />
            )}
          </>
        )}

        {/* 3. Pedidos Tab (Saltillo Local vs Paquetería) */}
        {adminTab === 'pedidos' && (
          <OrdersList
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {/* 4. Clientes Tab (Clientes registrados con teléfonos) */}
        {adminTab === 'clientes' && (
          <CustomersList
            customers={customers}
            onAddCustomer={handleAddCustomer}
          />
        )}

        {/* 5. Descuentos Tab (Cupones por tiempo seleccionado) */}
        {adminTab === 'descuentos' && (
          <DiscountsView
            coupons={coupons}
            onAddCoupon={handleAddCoupon}
            onToggleCoupon={handleToggleCoupon}
            onDeleteCoupon={handleDeleteCoupon}
          />
        )}
      </AdminLayout>
    )
  }

  // RENDER CART VIEW (Image 1: TU BOLSA.)
  if (currentView === 'cart') {
    return (
      <CartPage
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onContinueShopping={() => {
          window.location.hash = ''
          setCurrentView('store')
        }}
        onProceedToCheckout={() => {
          window.location.hash = 'checkout'
          setCurrentView('checkout')
        }}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onOpenAdmin={() => {
          window.location.hash = 'admin'
          setCurrentView('admin')
        }}
      />
    )
  }

  // RENDER CHECKOUT VIEW (Image 2: HAZLO TUYO.)
  if (currentView === 'checkout') {
    return (
      <CheckoutPage
        items={cartItems}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onBackToCart={() => {
          window.location.hash = 'cart'
          setCurrentView('cart')
        }}
        onPlaceOrder={handlePlaceOrder}
      />
    )
  }

  // RENDER ORDER CONFIRMATION VIEW (Step 03: Confirmación)
  if (currentView === 'order-success' && completedOrder) {
    return (
      <OrderConfirmationView
        order={completedOrder}
        onReturnToStore={() => {
          setCompletedOrder(null)
          window.location.hash = ''
          setCurrentView('store')
        }}
      />
    )
  }

  // RENDER DEDICATED COLLECTION VIEW (Ropa, Gorras por marca, Accesorios)
  if (currentView === 'collection') {
    return (
      <CollectionPage
        products={filteredProducts}
        allProducts={products}
        activeCategory={activeCategory}
        onSelectCategory={handleOpenCategory}
        onAddToCart={(product, color, size) => handleAddToCart(product, color, size)}
        onSelectProduct={(product) => setSelectedProduct(product)}
        onBackToHome={() => {
          window.location.hash = ''
          setCurrentView('store')
        }}
        cartCount={totalCartCount}
        onOpenCart={() => {
          window.location.hash = 'cart'
          setCurrentView('cart')
        }}
        onOpenAdmin={() => {
          window.location.hash = 'admin'
          setCurrentView('admin')
        }}
        selectedProduct={activeSelectedProduct}
        onCloseProduct={() => setSelectedProduct(null)}
        isCartOpen={isCartOpen}
        onCloseCart={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        coupons={coupons}
      />
    )
  }

  // RENDER PUBLIC STOREFRONT VIEW
  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col selection:bg-[#D4FF00] selection:text-black">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Navigation Bar & Direct Cart Page */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => {
          window.location.hash = 'cart'
          setCurrentView('cart')
        }}
        onSelectCategory={handleOpenCategory}
        products={products}
      />

      <main className="flex-1">
        {/* 3. Hero Section (Drop 004 / Underground Essentials + Mascot) */}
        <Hero
          onShopDrop={handleShopDrop}
          onExploreCaps={handleExploreCaps}
        />

        {/* 4. Marquee Endless Ticker */}
        <MarqueeTicker />

        {/* 5. 01 / LA SELECCIÓN GJ - LOS MÁS BUSCADOS (Solo destacados o elegidos desde el admin) */}
        <FeaturedProducts
          products={products}
          onOpenCollection={handleOpenCategory}
          onAddToCart={(product, color) => handleAddToCart(product, color)}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        {/* 6. 02 / ENCUENTRA TU ESENCIA - ELIGE TU CÓDIGO (Clothing, Caps & Accesorios) */}
        <CategoriesBanner
          onSelectCategory={handleOpenCategory}
        />

        {/* 7. Newsletter (ENTRA AL CÍRCULO) */}
        <Newsletter />
      </main>

      {/* 9. Comprehensive Streetwear Footer */}
      <Footer
        onSelectCategory={handleOpenCategory}
        onOpenAdmin={() => {
          window.location.hash = 'admin'
          setCurrentView('admin')
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        coupons={coupons}
        onOpenFullCart={() => {
          setIsCartOpen(false)
          window.location.hash = 'cart'
          setCurrentView('cart')
        }}
        onProceedToCheckout={() => {
          setIsCartOpen(false)
          window.location.hash = 'checkout'
          setCurrentView('checkout')
        }}
      />

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={activeSelectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}

export default App
