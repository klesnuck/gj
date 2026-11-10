import { useState } from 'react'
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  Package,
  AlertTriangle,
  X,
  CheckCircle,
  Star,
} from 'lucide-react'
import type { Product } from '../../types/database.types'

interface ProductListProps {
  products: Product[]
  onAddNew: () => void
  onEditProduct?: (product: Product) => void
  onDeleteProduct?: (productId: string) => void
  onViewProductInStore?: (product: Product) => void
  onToggleFeatured?: (productId: string) => void
}

export const ProductList = ({
  products,
  onAddNew,
  onEditProduct,
  onDeleteProduct,
  onViewProductInStore,
  onToggleFeatured,
}: ProductListProps) => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deletedToast, setDeletedToast] = useState<string | null>(null)

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
    const matchesCat =
      selectedCategory === 'todos' || p.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCat
  })

  const confirmDelete = () => {
    if (!productToDelete) return
    const title = productToDelete.title
    onDeleteProduct?.(productToDelete.id)
    setProductToDelete(null)
    setDeletedToast(`Producto "${title}" eliminado con éxito.`)
    setTimeout(() => {
      setDeletedToast(null)
    }, 3500)
  }

  return (
    <div className="space-y-6 text-white relative">
      
      {/* Toast Notification for Deleted Product */}
      {deletedToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-[#121212] border border-[#D4FF00] text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-5 h-5 text-[#D4FF00] shrink-0" />
          <span className="font-mono text-xs text-gray-200">{deletedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase block mb-1">
            CATÁLOGO · DROP 004
          </span>
          <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white font-extrabold leading-none">
            PRODUCTOS ({products.length})
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Administra tus prendas activas, ajusta existencias o retira productos del catálogo.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-lg shadow-[#D4FF00]/15"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>NUEVO PRODUCTO</span>
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o modelo..."
            className="w-full bg-[#131313] border border-[#242424] focus:border-[#D4FF00] pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['todos', 'gorras', 'playeras', 'hoodies', 'accesorios'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#141414] text-gray-400 hover:text-white border border-[#242424]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#101010] border border-[#202020] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#222222] bg-[#141414] text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">PRODUCTO</th>
                <th className="py-3 px-4">CATEGORÍA</th>
                <th className="py-3 px-4">PRECIO</th>
                <th className="py-3 px-4">EXISTENCIAS</th>
                <th className="py-3 px-4">ETIQUETA</th>
                <th className="py-3 px-4 text-center">EN "MÁS BUSCADOS"</th>
                <th className="py-3 px-4 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1b1b]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No se encontraron productos coincidentes.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const isCap = product.category.toLowerCase() === 'gorras'

                  return (
                    <tr key={product.id} className="hover:bg-[#141414] transition-colors group">
                      {/* Title & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-11 h-11 object-cover bg-black border border-[#262626] shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white font-sans text-sm flex items-center gap-2">
                              <span>{product.title}</span>
                              {isCap && (
                                <span className="px-1.5 py-0.2 bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-[#D4FF00] text-[9px] font-mono font-bold uppercase">
                                  Unitalla
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500">{product.slug}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-gray-400 uppercase font-bold">
                        {product.category}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-semibold text-[#D4FF00]">
                        ${product.price.toLocaleString('es-MX')} MXN
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-gray-300">
                        <span className="font-bold text-white">{product.stock ?? 15}</span>{' '}
                        <span className="text-gray-500">
                          {isCap ? 'piezas (unitalla)' : 'unidades'}
                        </span>
                      </td>

                      {/* Tag */}
                      <td className="py-3 px-4">
                        {product.tag ? (
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              product.tag_type === 'lime'
                                ? 'bg-[#D4FF00] text-black'
                                : 'bg-white text-black'
                            }`}
                          >
                            {product.tag}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>

                      {/* Toggle En Portada / Más Buscados */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleFeatured?.(product.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                            product.is_featured
                              ? 'bg-[#D4FF00] text-black shadow-sm shadow-[#D4FF00]/25'
                              : 'bg-[#181818] text-gray-500 hover:text-white border border-[#282828] hover:border-gray-500'
                          }`}
                          title={
                            product.is_featured
                              ? 'En portada (Haz clic para quitar de Los más buscados)'
                              : 'No mostrado en portada (Haz clic para poner en Los más buscados)'
                          }
                        >
                          <Star
                            className={`w-3 h-3 ${
                              product.is_featured ? 'fill-black text-black' : 'text-gray-500'
                            }`}
                          />
                          <span>{product.is_featured ? 'EN PORTADA' : 'NO'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          
                          {/* Ver en Tienda */}
                          {onViewProductInStore && (
                            <button
                              onClick={() => onViewProductInStore(product)}
                              title="Ver en tienda"
                              className="p-1.5 text-gray-400 hover:text-[#D4FF00] hover:bg-[#1a1a1a] rounded transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Editar Producto */}
                          {onEditProduct && (
                            <button
                              onClick={() => onEditProduct(product)}
                              title="Editar producto"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#171717] hover:bg-[#222222] text-gray-300 hover:text-white border border-[#2b2b2b] rounded text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                          )}

                          {/* Quitar / Eliminar Producto */}
                          <button
                            onClick={() => setProductToDelete(product)}
                            title="Quitar / Eliminar producto"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#181111] hover:bg-red-950/80 text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-600/70 rounded text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 stroke-[2.2]" />
                            <span className="hidden sm:inline">Quitar</span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal: Eliminar Producto */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setProductToDelete(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
          />

          {/* Dialog */}
          <div className="relative bg-[#101010] border border-red-900/60 max-w-md w-full p-6 text-white shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setProductToDelete(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Alert Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display text-xl uppercase tracking-wider text-white font-extrabold leading-none">
                  ¿QUITAR ESTE PRODUCTO?
                </h3>
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
                  ACCIÓN PERMANENTE
                </span>
              </div>
            </div>

            {/* Product Card Preview inside Modal */}
            <div className="p-3 bg-[#151515] border border-[#242424] flex items-center space-x-3 mb-4">
              <img
                src={productToDelete.image_url}
                alt={productToDelete.title}
                className="w-12 h-12 object-cover bg-black border border-[#2e2e2e] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white font-sans text-sm truncate">
                  {productToDelete.title}
                </div>
                <div className="text-xs font-mono text-[#D4FF00]">
                  ${productToDelete.price.toLocaleString('es-MX')} MXN · {productToDelete.category}
                </div>
                <div className="text-[10px] font-mono text-gray-500">
                  Stock actual: {productToDelete.stock} unidades
                </div>
              </div>
            </div>

            <p className="text-xs font-mono text-gray-400 leading-relaxed mb-6">
              Esta prenda se quitará inmediatamente del catálogo, del panel de administración y de la tienda en línea. No estará disponible para compra.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 bg-[#181818] hover:bg-[#222222] text-gray-300 font-mono text-xs uppercase tracking-wider border border-[#2d2d2d] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Sí, Quitar Producto</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
