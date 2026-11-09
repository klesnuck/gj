import { useState, useEffect } from 'react'
import { AnnouncementBar } from './components/AnnouncementBar'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { MarqueeTicker } from './components/MarqueeTicker'
import { FeaturedProducts } from './components/FeaturedProducts'
import { CategoriesBanner } from './components/CategoriesBanner'
import { EditorialSection } from './components/EditorialSection'
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

import { fetchProducts, createProduct, deleteProduct } from './lib/supabase'
import { INITIAL_ORDERS, INITIAL_CUSTOMERS, INITIAL_COUPONS } from './lib/mockData'
import type { Product, CartItem, Order, Customer, Coupon } from './types/database.types'

export function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    return window.location.hash.startsWith('#admin') ? 'admin' : 'store'
  })
  const [adminTab, setAdminTab] = useState<string>('resumen')
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Store data
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

  // Admin Data with localStorage persistence
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('gj_admin_orders')
      return saved ? JSON.parse(saved) : INITIAL_ORDERS
    } catch {
      return INITIAL_ORDERS
    }
  })

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('gj_admin_customers')
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS
    } catch {
      return INITIAL_CUSTOMERS
    }
  })

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('gj_admin_coupons')
      return saved ? JSON.parse(saved) : INITIAL_COUPONS
    } catch {
      return INITIAL_COUPONS
    }
  })

  // Hash management
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#admin')) {
        setCurrentView('admin')
      } else if (currentView === 'admin') {
        setCurrentView('store')
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [currentView])

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gj_cart', JSON.stringify(cartItems))
    } catch (e) {
      console.warn('Could not save cart', e)
    }
  }, [cartItems])

  // Save admin orders, customers & coupons
  useEffect(() => {
    try {
      localStorage.setItem('gj_admin_orders', JSON.stringify(orders))
      localStorage.setItem('gj_admin_customers', JSON.stringify(customers))
      localStorage.setItem('gj_admin_coupons', JSON.stringify(coupons))
    } catch (e) {
      console.warn('Could not save admin datasets', e)
    }
  }, [orders, customers, coupons])

  // Load products
  const reloadProducts = async () => {
    const data = await fetchProducts(activeCategory)
    setProducts(data)
  }

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      const data = await fetchProducts(activeCategory)
      if (isMounted) {
        setProducts(data)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [activeCategory])

  // Admin Handlers
  const handleSaveProduct = async (productData: Partial<Product>): Promise<boolean> => {
    const res = await createProduct(productData)
    if (res.success) {
      await reloadProducts()
      setIsCreatingProduct(false)
      setEditingProduct(null)
      return true
    }
    return false
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

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
  }

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev])
  }

  const handleAddCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => [newCoupon, ...prev])
  }

  const handleToggleCoupon = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
    )
  }

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId))
  }

  // Cart operations
  const handleAddToCart = (product: Product, selectedColor?: string, selectedSize?: string) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      )

      if (existingIndex > -1) {
        const next = [...prev]
        next[existingIndex].quantity += 1
        return next
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            selectedColor: selectedColor || (product.colors && product.colors[0]),
            selectedSize: selectedSize || 'Standard',
          },
        ]
      }
    })
    setIsCartOpen(true)
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const handleShopDrop = () => {
    setActiveCategory('todos')
    const el = document.getElementById('catalogo')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleExploreCaps = () => {
    setActiveCategory('gorras')
    const el = document.getElementById('catalogo')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
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
                initialProduct={editingProduct}
                onSaveProduct={handleSaveProduct}
                onCancel={() => {
                  setIsCreatingProduct(false)
                  setEditingProduct(null)
                }}
                onDeleteProduct={handleDeleteProduct}
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

  // RENDER PUBLIC STOREFRONT VIEW
  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col selection:bg-[#D4FF00] selection:text-black">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Navigation Bar with Admin shortcut */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={(cat) => {
          setActiveCategory(cat)
          const el = document.getElementById('catalogo')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }}
        onOpenAdmin={() => {
          window.location.hash = 'admin'
          setCurrentView('admin')
        }}
      />

      <main className="flex-1">
        {/* 3. Hero Section (Drop 004 / Underground Essentials + Mascot) */}
        <Hero
          onShopDrop={handleShopDrop}
          onExploreCaps={handleExploreCaps}
        />

        {/* 4. Marquee Endless Ticker */}
        <MarqueeTicker />

        {/* 5. 01 / LA SELECCIÓN GJ - LOS MÁS BUSCADOS */}
        <FeaturedProducts
          products={products}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onAddToCart={(product, color) => handleAddToCart(product, color)}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        {/* 6. 02 / ENCUENTRA TU ESENCIA - ELIGE TU CÓDIGO (Clothing, Caps & Accesorios) */}
        <CategoriesBanner
          onSelectCategory={(cat) => {
            setActiveCategory(cat)
            const el = document.getElementById('catalogo')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
        />

        {/* 7. 03 / RECIÉN ATERRIZADO - Editorial, Manifiesto y Pilares */}
        <EditorialSection
          onDiscoverNews={handleShopDrop}
        />

        {/* 8. Newsletter (ENTRA AL CÍRCULO) */}
        <Newsletter />
      </main>

      {/* 9. Comprehensive Streetwear Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setActiveCategory(cat)
          const el = document.getElementById('catalogo')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      {/* Floating Discreet Admin Quick Access Pill */}
      <div className="fixed bottom-4 right-4 z-40 hidden sm:block">
        <button
          onClick={() => {
            window.location.hash = 'admin'
            setCurrentView('admin')
          }}
          className="px-3 py-1.5 bg-[#141414]/90 hover:bg-[#D4FF00] text-gray-400 hover:text-black border border-[#262626] hover:border-[#D4FF00] rounded-full text-[10px] font-mono uppercase tracking-widest backdrop-blur-sm transition-all duration-200 shadow-xl cursor-pointer"
        >
          ⚙ Panel Admin
        </button>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        coupons={coupons}
      />

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}

export default App
