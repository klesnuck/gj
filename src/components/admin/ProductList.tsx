import { useState } from 'react'
import { Plus, Search, Trash2, Edit3, Eye, Package } from 'lucide-react'
import type { Product } from '../../types/database.types'

interface ProductListProps {
  products: Product[]
  onAddNew: () => void
  onEditProduct?: (product: Product) => void
  onDeleteProduct?: (productId: string) => void
  onViewProductInStore?: (product: Product) => void
}

export const ProductList = ({
  products,
  onAddNew,
  onEditProduct,
  onDeleteProduct,
  onViewProductInStore,
}: ProductListProps) => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
    const matchesCat =
      selectedCategory === 'todos' || p.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase block mb-1">
            CATÁLOGO · DROP 004
          </span>
          <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white font-extrabold leading-none">
            PRODUCTOS ({products.length})
          </h2>
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
            placeholder="Buscar por nombre..."
            className="w-full bg-[#131313] border border-[#242424] focus:border-[#D4FF00] pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {['todos', 'gorras', 'playeras', 'hoodies', 'accesorios'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
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
                <th className="py-3 px-4 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1b1b]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No se encontraron productos coincidentes.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-[#141414] transition-colors">
                    {/* Title & Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-10 h-10 object-cover bg-black border border-[#262626] shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white font-sans text-sm">
                            {product.title}
                          </div>
                          <div className="text-[10px] text-gray-500">{product.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-gray-400 uppercase">{product.category}</td>

                    {/* Price */}
                    <td className="py-3 px-4 font-semibold text-[#D4FF00]">
                      ${product.price.toLocaleString('es-MX')} MXN
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4 text-gray-300">
                      <span className="font-bold">{product.stock ?? 15}</span> unidades
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

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {onViewProductInStore && (
                          <button
                            onClick={() => onViewProductInStore(product)}
                            title="Ver en tienda"
                            className="p-1.5 text-gray-400 hover:text-[#D4FF00] hover:bg-[#1f1f1f] rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onEditProduct && (
                          <button
                            onClick={() => onEditProduct(product)}
                            title="Editar"
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1f1f1f] rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteProduct && (
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            title="Eliminar"
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#1f1f1f] rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

