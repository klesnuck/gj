import { useState } from 'react'
import {
  Upload,
  Trash2,
  Bold,
  Italic,
  List,
  Save,
  ArrowUpRight,
  Check,
} from 'lucide-react'
import type { Product } from '../../types/database.types'

interface ProductFormProps {
  onSaveProduct: (productData: Partial<Product>) => Promise<boolean>
  onCancel: () => void
}

interface VariantRow {
  size: string
  sku: string
  stock: number
  price: number
}

export const ProductForm = ({ onSaveProduct, onCancel }: ProductFormProps) => {
  // Form State initialized with values from screenshot
  const [title, setTitle] = useState('Hoodie No Signal')
  const [description, setDescription] = useState(
    'Hoodie de algodón pesado de 450 g, corte relaxed fit y acabado negro. Bordado frontal No Signal. Hecho para la calle, sin pedir permiso.'
  )
  const [category, setCategory] = useState<'gorras' | 'playeras' | 'hoodies' | 'accesorios'>('hoodies')
  const [price, setPrice] = useState<number>(1499)
  const [tag, setTag] = useState('NUEVO')
  const [tagType, setTagType] = useState<'white' | 'lime'>('lime')
  const [collection, setCollection] = useState('Drop 004')
  const [status, setStatus] = useState<'borrador' | 'publicado'>('borrador')
  const [inOnlineStore, setInOnlineStore] = useState(true)
  const [imageUrl, setImageUrl] = useState('/images/product-hoodie.jpg')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Color & Variants State
  const [colorName] = useState('Negro')
  const [colorHex] = useState('#171717')
  const [variants, setVariants] = useState<VariantRow[]>([
    { size: 'S', sku: 'GJ-NS-BLK-S', stock: 8, price: 1499 },
    { size: 'M', sku: 'GJ-NS-BLK-M', stock: 12, price: 1499 },
    { size: 'L', sku: 'GJ-NS-BLK-L', stock: 16, price: 1499 },
    { size: 'XL', sku: 'GJ-NS-BLK-XL', stock: 8, price: 1499 },
  ])

  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)

  const handleVariantChange = (index: number, field: keyof VariantRow, value: string | number) => {
    setVariants((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: 'XXL',
        sku: `GJ-NS-BLK-${prev.length + 1}`,
        stock: 5,
        price: price,
      },
    ])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const tempUrl = URL.createObjectURL(file)
      setImageUrl(tempUrl)
    }
  }

  const handlePublish = async (newStatus: 'borrador' | 'publicado' = 'publicado') => {
    setIsSubmitting(true)
    const productPayload: Partial<Product> = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category,
      price,
      currency: 'MXN',
      tag: tag || null,
      tag_type: tagType,
      description,
      specs: `${colorName} / Relaxed fit / 450 g`,
      colors: [colorHex],
      image_url: imageUrl,
      stock: totalStock,
      is_featured: true,
    }

    const ok = await onSaveProduct(productPayload)
    setIsSubmitting(false)
    if (ok) {
      setStatus(newStatus)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    }
  }

  return (
    <div className="w-full text-white space-y-8">
      
      {/* Top Breadcrumb & Page Title Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-gray-500 tracking-widest uppercase mb-1">
              CATÁLOGO / NUEVA PIEZA
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white font-extrabold leading-none">
              NUEVO PRODUCTO
            </h1>
            <p className="text-xs sm:text-sm font-sans text-gray-400 mt-2">
              Prepara la ficha, revisa las variantes y dale salida al siguiente drop.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => handlePublish('borrador')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#131313] hover:bg-[#1a1a1a] text-white border border-[#2b2b2b] hover:border-[#3d3d3d] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>GUARDAR BORRADOR</span>
              <Save className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => handlePublish('publicado')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#D4FF00]/15 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <span>¡PUBLICADO!</span>
                  <Check className="w-4 h-4 stroke-[3]" />
                </>
              ) : (
                <>
                  <span>PUBLICAR PRODUCTO</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Small Status indicator */}
        <div className="flex items-center justify-end">
          <span className="text-[11px] font-mono text-gray-500 uppercase flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'publicado' ? 'bg-[#D4FF00]' : 'bg-gray-500'}`} />
            {status === 'publicado' ? 'PUBLICADO EN TIENDA' : 'BORRADOR · SIN PUBLICAR'}
          </span>
        </div>
      </div>

      {/* Main Two Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Forms) - 8 Cols */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 01: Imágenes del producto */}
          <div className="bg-[#101010] border border-[#202020] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-[#D4FF00]">01</span>
                <h3 className="font-sans text-sm font-semibold text-white tracking-wide">
                  Imágenes del producto
                </h3>
              </div>
              <span className="text-xs font-mono text-gray-500">1 de 6 imágenes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              
              {/* Main Uploaded Thumbnail */}
              <div className="sm:col-span-4 relative aspect-[4/5] bg-[#161616] border border-[#262626] overflow-hidden group">
                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-white text-black text-[9px] font-mono font-bold tracking-wider uppercase">
                  PRINCIPAL
                </span>
                <img
                  src={imageUrl}
                  alt="Vista previa carga"
                  className="w-full h-full object-cover object-center"
                />
                <button
                  onClick={() => setImageUrl('/images/product-tshirt.jpg')}
                  className="absolute bottom-2 right-2 p-1.5 bg-black/80 hover:bg-red-500 text-gray-400 hover:text-white transition-colors"
                  title="Cambiar imagen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Drag & Drop Zone */}
              <div className="sm:col-span-8 border-2 border-dashed border-[#262626] hover:border-[#D4FF00]/50 bg-[#121212] p-8 flex flex-col items-center justify-center text-center transition-colors group relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-[#D4FF00] mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 stroke-[2]" />
                </div>
                <p className="text-xs font-mono font-medium text-white mb-1">
                  Arrastra tus imágenes aquí
                </p>
                <p className="text-xs font-mono text-[#D4FF00] underline mb-2">
                  o selecciona archivos
                </p>
                <p className="text-[10px] font-mono text-gray-500">
                  JPG, PNG o WEBP · Máx. 10 MB
                </p>
              </div>

            </div>

            <p className="text-[11px] font-mono text-gray-500 pt-1">
              Recomendado: 1600 × 1800 px. La primera imagen será la portada.
            </p>
          </div>

          {/* Section 02: Información general */}
          <div className="bg-[#101010] border border-[#202020] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-[#D4FF00]">02</span>
                <h3 className="font-sans text-sm font-semibold text-white tracking-wide">
                  Información general
                </h3>
              </div>
              <span className="text-xs font-mono text-gray-500">* Campos obligatorios</span>
            </div>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Nombre del producto *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Hoodie No Signal"
                className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-4 py-2.5 text-sm font-sans text-white focus:outline-none transition-colors"
              />
            </div>

            {/* Description with Toolbar */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Descripción *
              </label>
              <div className="border border-[#282828] bg-[#141414]">
                {/* Toolbar */}
                <div className="flex items-center space-x-1 p-1.5 border-b border-[#242424] text-gray-400">
                  <button type="button" className="p-1 hover:text-white hover:bg-[#1f1f1f] rounded">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1 hover:text-white hover:bg-[#1f1f1f] rounded">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1 hover:text-white hover:bg-[#1f1f1f] rounded">
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent p-3 text-xs sm:text-sm font-sans text-gray-200 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Category & Sale Price Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Categoría *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-4 py-2.5 text-sm font-sans text-white focus:outline-none cursor-pointer"
                >
                  <option value="hoodies">Hoodies</option>
                  <option value="playeras">Playeras</option>
                  <option value="gorras">Gorras</option>
                  <option value="accesorios">Accesorios</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Precio de venta *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-mono text-gray-400">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] pl-8 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-[10px] font-mono text-gray-500 block">
                  MXN · IVA incluido
                </span>
              </div>

            </div>

            {/* Tag / Badge Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Etiqueta Destacada
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-4 py-2.5 text-sm font-sans text-white focus:outline-none cursor-pointer"
                >
                  <option value="NUEVO">NUEVO</option>
                  <option value="BEST SELLER">BEST SELLER</option>
                  <option value="EDICIÓN LIMITADA">EDICIÓN LIMITADA</option>
                  <option value="">Sin etiqueta</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Color de Etiqueta
                </label>
                <select
                  value={tagType}
                  onChange={(e) => setTagType(e.target.value as 'white' | 'lime')}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-4 py-2.5 text-sm font-sans text-white focus:outline-none cursor-pointer"
                >
                  <option value="lime">Verde Neón (#D4FF00)</option>
                  <option value="white">Blanco (#FFFFFF)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Section 03: Variantes y existencias */}
          <div className="bg-[#101010] border border-[#202020] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-[#D4FF00]">03</span>
                <h3 className="font-sans text-sm font-semibold text-white tracking-wide">
                  Variantes y existencias
                </h3>
              </div>
              <span className="text-xs font-mono text-gray-500">
                {variants.length} variantes / {totalStock} unidades
              </span>
            </div>

            {/* Color selection line */}
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="text-gray-400">Color:</span>
              <div className="flex items-center space-x-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-full inline-block border border-white/20"
                  style={{ backgroundColor: colorHex }}
                />
                <span className="text-white font-semibold">{colorName}</span>
              </div>
              <button
                type="button"
                className="text-[#D4FF00] hover:underline cursor-pointer ml-2"
              >
                + Añadir color
              </button>
            </div>

            {/* Variants Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#222222] text-gray-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">TALLA</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">EXISTENCIAS</th>
                    <th className="py-2.5 px-3 text-right">PRECIO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b1b1b]">
                  {variants.map((v, i) => (
                    <tr key={i} className="hover:bg-[#141414]">
                      <td className="py-2.5 px-3 font-bold text-white">{v.size}</td>
                      <td className="py-2.5 px-3 text-gray-400">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleVariantChange(i, 'sku', e.target.value)}
                          className="bg-transparent border-b border-[#2b2b2b] focus:border-[#D4FF00] focus:outline-none py-0.5 text-xs text-gray-300 w-32"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => handleVariantChange(i, 'stock', Number(e.target.value))}
                          className="bg-[#161616] border border-[#2b2b2b] focus:border-[#D4FF00] focus:outline-none py-1 px-2 text-xs text-center text-white w-16"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#D4FF00] font-semibold">
                        ${v.price.toLocaleString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="text-xs font-mono text-[#D4FF00] hover:underline cursor-pointer block pt-2"
            >
              + Añadir variante
            </button>
          </div>

        </div>

        {/* Right Column (Sidebar Preview & Publication) - 4 Cols */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: VISTA PREVIA EN TIENDA */}
          <div className="bg-[#101010] border border-[#202020] p-6 space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-gray-400 uppercase">
              VISTA PREVIA EN TIENDA
            </h4>

            {/* Live Product Card Mockup */}
            <div className="bg-[#151515] border border-[#262626] p-3 space-y-3">
              <div className="relative aspect-square bg-[#0f0f0f] overflow-hidden">
                {tag && (
                  <span
                    className={`absolute top-2 left-2 z-10 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest ${
                      tagType === 'lime' ? 'bg-[#D4FF00] text-black' : 'bg-white text-black'
                    }`}
                  >
                    {tag}
                  </span>
                )}
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span className="truncate mr-2 font-sans">{title || 'Sin nombre'}</span>
                  <span className="font-mono text-sm whitespace-nowrap">
                    ${price.toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="text-[11px] font-sans text-gray-400">
                  {colorName} / Relaxed fit / 450 g
                </div>
                <div className="pt-1">
                  <span
                    className="w-3 h-3 rounded-full inline-block border border-white/20"
                    style={{ backgroundColor: colorHex }}
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] font-mono text-gray-500 leading-relaxed">
              Así se verá tu producto en el catálogo. No será visible hasta publicarlo.
            </p>
          </div>

          {/* Card: Publicación */}
          <div className="bg-[#101010] border border-[#202020] p-6 space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-gray-300 uppercase">
              Publicación
            </h4>

            {/* State selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-4 py-2.5 text-xs font-mono text-white focus:outline-none cursor-pointer"
              >
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>

            {/* Collection selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Colección
              </label>
              <select
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-4 py-2.5 text-xs font-mono text-white focus:outline-none cursor-pointer"
              >
                <option value="Drop 004">Drop 004</option>
                <option value="Drop 003">Drop 003</option>
                <option value="Underground Basics">Underground Basics</option>
              </select>
            </div>

            {/* Store checkbox */}
            <div className="pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-mono text-gray-300">
                <input
                  type="checkbox"
                  checked={inOnlineStore}
                  onChange={(e) => setInOnlineStore(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#181818] border-[#333] text-[#D4FF00] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#D4FF00]"
                />
                <span>Tienda en línea</span>
              </label>
              <p className="text-[10px] font-mono text-gray-500 mt-2">
                Al publicar, las {totalStock} unidades estarán disponibles para comprar.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Sticky Bottom Summary Bar */}
      <div className="sticky bottom-0 z-30 w-full bg-[#0d0d0d] border-t border-[#1e1e1e] py-3.5 px-6 flex items-center justify-between text-xs font-mono shadow-2xl">
        <span className="text-gray-400">
          Revisa imágenes, precio y existencias antes de publicar.
        </span>

        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white underline cursor-pointer"
        >
          Descartar cambios
        </button>
      </div>

    </div>
  )
}
