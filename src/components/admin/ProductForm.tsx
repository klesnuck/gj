import { useState, useEffect } from 'react'
import {
  Upload,
  Trash2,
  Bold,
  Italic,
  List,
  Save,
  ArrowUpRight,
  Check,
  Package,
  Layers,
  Sparkles,
  Star,
  AlertTriangle,
} from 'lucide-react'
import type { Product } from '../../types/database.types'
import { getColorHexFromName } from '../../lib/colors'
import { parseSizeStocks } from '../../lib/stock'

interface ProductFormProps {
  onSaveProduct: (productData: Partial<Product>) => Promise<boolean>
  onCancel: () => void
  initialProduct?: Product | null
  onDeleteProduct?: (productId: string) => void
}

interface VariantRow {
  size: string
  sku: string
  stock: number
  price: number
}

export const ProductForm = ({
  onSaveProduct,
  onCancel,
  initialProduct,
  onDeleteProduct,
}: ProductFormProps) => {
  const isEditing = Boolean(initialProduct)

  // Form State initialized from 0 (without preset mock descriptions or default hoodie)
  const [title, setTitle] = useState(initialProduct?.title || '')
  const [description, setDescription] = useState(initialProduct?.description || '')
  const [category, setCategory] = useState<'gorras' | 'playeras' | 'hoodies' | 'accesorios'>(
    (initialProduct?.category as any) || 'playeras'
  )
  const [brand, setBrand] = useState(initialProduct?.brand || 'GJ')
  const [price, setPrice] = useState<number>(initialProduct?.price || 0)
  const [tag, setTag] = useState(initialProduct?.tag || '')
  const [status, setStatus] = useState<'borrador' | 'publicado'>('publicado')
  const [inOnlineStore, setInOnlineStore] = useState(true)
  const [isFeatured, setIsFeatured] = useState<boolean>(initialProduct?.is_featured ?? false)

  // Multi-Image Gallery State (starts completely empty: 0 images)
  const [images, setImages] = useState<string[]>(() => {
    if (initialProduct?.images && initialProduct.images.length > 0) {
      return initialProduct.images
    }
    if (initialProduct?.image_url) {
      return [initialProduct.image_url]
    }
    return []
  })
  const [coverIndex, setCoverIndex] = useState<number>(0)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Unitalla vs Tallas State
  const isCap = category === 'gorras'

  // Cap Unitalla Stock & SKU (starts at 0)
  const [capStock, setCapStock] = useState<number>(initialProduct?.stock || 0)
  const [capSku, setCapSku] = useState<string>(
    initialProduct?.slug || ''
  )

  // Clothing Variants (all stock starts strictly from 0 or loads from specs)
  const [colorName, setColorName] = useState(() => {
    if (initialProduct?.specs) {
      const first = initialProduct.specs.split('/')[0].trim()
      if (first) return first
    }
    return 'Negro'
  })
  const [colorHex, setColorHex] = useState(
    initialProduct?.colors?.[0] || '#171717'
  )

  const handleColorNameChange = (val: string) => {
    setColorName(val)
    const matched = getColorHexFromName(val)
    if (matched) {
      setColorHex(matched)
    }
  }
  const [variants, setVariants] = useState<VariantRow[]>(() => {
    if (initialProduct?.specs) {
      const parsed = parseSizeStocks(initialProduct.specs, initialProduct.stock)
      if (Object.keys(parsed).length > 0) {
        return ['S', 'M', 'L', 'XL'].map((s) => ({
          size: s,
          sku: '',
          stock: parsed[s] ?? 0,
          price: initialProduct.price || 0,
        }))
      }
    }
    return [
      { size: 'S', sku: '', stock: 0, price: price },
      { size: 'M', sku: '', stock: 0, price: price },
      { size: 'L', sku: '', stock: 0, price: price },
      { size: 'XL', sku: '', stock: 0, price: price },
    ]
  })

  // Sync price changes to variants
  useEffect(() => {
    if (!isCap) {
      setVariants((prev) => prev.map((v) => ({ ...v, price })))
    }
  }, [price, isCap])

  // Change category cleanly without overwriting user data
  const handleCategoryChange = (newCat: 'gorras' | 'playeras' | 'hoodies' | 'accesorios') => {
    setCategory(newCat)
  }

  // Stock calculation: If gorra, takes capStock directly; if clothes, sums variants
  const totalStock = isCap
    ? Math.max(0, Number(capStock) || 0)
    : variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)

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
        sku: `GJ-ITEM-${prev.length + 1}`,
        stock: 6,
        price: price,
      },
    ])
  }

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  // Helper to compress images on-the-fly to max 1200px and 0.82 quality (reduces large iPhone photos from 8MB to ~150KB)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxDim = 1200
          let width = img.width
          let height = img.height

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', 0.82))
          } else {
            resolve(dataUrl)
          }
        }
        img.onerror = () => resolve(dataUrl)
        img.src = dataUrl
      }
      reader.onerror = () => resolve('')
      reader.readAsDataURL(file)
    })
  }

  // Multi-file upload handler: reads and compresses up to 6 images as Data URLs so they persist forever
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    const filesArray = Array.from(fileList)
    const availableSlots = 6 - images.length
    if (availableSlots <= 0) return

    const filesToRead = filesArray.slice(0, availableSlots)
    const readPromises = filesToRead.map((file) => compressImage(file))

    const newBase64Images = await Promise.all(readPromises)
    setImages((prev) => [...prev, ...newBase64Images.filter(Boolean)].slice(0, 6))
    e.target.value = ''
  }

  const handleRemoveImage = (indexToRemove: number) => {
    if (images.length === 0) return
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
    if (coverIndex === indexToRemove) {
      setCoverIndex(0)
    } else if (coverIndex > indexToRemove) {
      setCoverIndex((prev) => Math.max(0, prev - 1))
    }
  }

  const handleSetCover = (index: number) => {
    setCoverIndex(index)
  }

  const handlePublish = async (newStatus: 'borrador' | 'publicado' = 'publicado') => {
    setIsSubmitting(true)
    const specsComputed = isCap
      ? `${colorName} / Unitalla Ajustable`
      : `${colorName} / Tallas: ${variants
          .map((v) => `${v.size} (${Math.max(0, Number(v.stock) || 0)})`)
          .join(', ')}`

    const currentCover = images[coverIndex] || images[0] || ''

    const productPayload: Partial<Product> = {
      id: initialProduct?.id,
      title: title || 'Sin nombre',
      slug:
        initialProduct?.slug ||
        (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `prenda-${Date.now()}`),
      category,
      brand: brand || 'GJ',
      price: Number(price) || 0,
      currency: 'MXN',
      tag: tag || null,
      tag_type: 'lime',
      description: description || '',
      specs: specsComputed,
      colors: [colorHex],
      image_url: currentCover,
      images: images,
      stock: totalStock,
      is_featured: isFeatured,
      created_at: initialProduct?.created_at,
    }

    setSaveError(null)
    const ok = await onSaveProduct(productPayload)
    setIsSubmitting(false)
    if (ok) {
      setStatus(newStatus)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    } else {
      setSaveError(
        '⚠️ Supabase rechazó la prenda porque tu base de datos tiene bloqueados los permisos de inserción (RLS). Para solucionarlo, debes ejecutar el script SQL en el SQL Editor de tu panel de Supabase.'
      )
    }
  }

  return (
    <div className="w-full text-white space-y-8 animate-in fade-in duration-200">

      {/* Top Breadcrumb & Page Title Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-gray-500 tracking-widest uppercase mb-1">
              CATÁLOGO / {isEditing ? 'EDITAR PRODUCTO' : 'NUEVA PIEZA'}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white font-extrabold leading-none">
              {isEditing ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
            </h1>
            <p className="text-xs sm:text-sm font-sans text-gray-400 mt-2">
              {isCap
                ? 'Prenda de categoría Gorras (Unitalla con broche ajustable). Gestiona stock directo y precio.'
                : 'Prepara la ficha, revisa las tallas disponibles y dale salida al siguiente drop.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isEditing && initialProduct && onDeleteProduct && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Seguro que deseas eliminar el producto "${title}"?`)) {
                    onDeleteProduct(initialProduct.id)
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-3 bg-[#1a1111] hover:bg-red-950/60 text-red-400 border border-red-900/40 hover:border-red-500 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>ELIMINAR</span>
              </button>
            )}

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
                  <span>¡GUARDADO CON ÉXITO!</span>
                  <Check className="w-4 h-4 stroke-[3]" />
                </>
              ) : (
                <>
                  <span>{isEditing ? 'ACTUALIZAR PRODUCTO' : 'PUBLICAR PRODUCTO'}</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Small Status indicator */}
        <div className="flex items-center justify-between pt-1 border-t border-[#181818]">
          <div className="flex items-center gap-2">
            {isCap && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-[#D4FF00] font-mono text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                UNITALLA / AJUSTABLE
              </span>
            )}
            <span className="text-[11px] font-mono text-gray-400">
              Stock total: <strong className="text-white">{totalStock} piezas</strong>
            </span>
          </div>

          <span className="text-[11px] font-mono text-gray-500 uppercase flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${status === 'publicado' ? 'bg-[#D4FF00]' : 'bg-gray-500'
                }`}
            />
            {status === 'publicado' ? 'PUBLICADO EN TIENDA' : 'BORRADOR · SIN PUBLICAR'}
          </span>
        </div>
      </div>

      {/* Error Alert Banner */}
      {saveError && (
        <div className="p-4 bg-red-950/70 border border-red-500 text-red-200 text-xs font-mono space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-red-400 uppercase text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>Error de permisos en Supabase (RLS)</span>
          </div>
          <p>{saveError}</p>
        </div>
      )}

      {/* Main Two Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column (Forms) - 8 Cols */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section 01: Imágenes del producto (Galería de hasta 6 imágenes) */}
          <div className="bg-[#101010] border border-[#202020] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-[#D4FF00]">01</span>
                <h3 className="font-sans text-sm font-semibold text-white tracking-wide">
                  Imágenes del producto
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#D4FF00]">
                {images.length} de 6 imágenes
              </span>
            </div>

            {/* Gallery Grid (Shows all up to 6 images) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {images.map((img, idx) => {
                const isCover = idx === coverIndex
                return (
                  <div
                    key={idx}
                    className={`relative aspect-[4/5] bg-[#161616] border transition-all group overflow-hidden ${isCover
                        ? 'border-[#D4FF00] shadow-[0_0_15px_rgba(212,255,0,0.25)] ring-1 ring-[#D4FF00]'
                        : 'border-[#262626] hover:border-gray-500'
                      }`}
                  >
                    {/* Badge / Button: Portada */}
                    {isCover ? (
                      <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 bg-[#D4FF00] text-black text-[8px] font-mono font-black tracking-wider uppercase shadow-md">
                        PORTADA
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 bg-black/85 hover:bg-[#D4FF00] hover:text-black text-gray-300 text-[8px] font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/20"
                        title="Seleccionar como imagen de portada"
                      >
                        Hacer Portada
                      </button>
                    )}

                    {/* Image Element */}
                    <img
                      src={img}
                      alt={`Foto producto ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />

                    {/* Delete Photo Button */}
                    {images.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute bottom-1.5 right-1.5 p-1 bg-black/80 hover:bg-red-600 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-sm"
                        title="Quitar esta imagen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    {/* Image Slot Counter */}
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-gray-400 bg-black/70 px-1 rounded-sm">
                      #{idx + 1}
                    </span>
                  </div>
                )
              })}

              {/* Empty placeholder slots up to 6 */}
              {Array.from({ length: Math.max(0, 6 - images.length) }).map((_, emptyIdx) => (
                <div
                  key={`empty-${emptyIdx}`}
                  className="hidden sm:flex relative aspect-[4/5] bg-[#121212]/40 border border-dashed border-[#222222] items-center justify-center text-gray-600 text-[10px] font-mono select-none"
                >
                  <span>Slot {images.length + emptyIdx + 1}</span>
                </div>
              ))}
            </div>

            {/* Drag & Drop Zone (Permite subir múltiples fotos hasta completar 6) */}
            {images.length < 6 ? (
              <div className="border-2 border-dashed border-[#262626] hover:border-[#D4FF00]/50 bg-[#121212] p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-colors group relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-[#D4FF00] mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 stroke-[2]" />
                </div>
                <p className="text-xs font-mono font-medium text-white mb-1">
                  Arrastra tus imágenes aquí o haz clic para seleccionar
                </p>
                <p className="text-xs font-mono text-[#D4FF00] underline mb-2">
                  Puedes seleccionar varias imágenes a la vez ({6 - images.length} disponibles)
                </p>
                <p className="text-[10px] font-mono text-gray-500">
                  JPG, PNG o WEBP · Hasta 6 imágenes en total
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-[#141414] border border-[#262626] flex items-center justify-between text-xs font-mono">
                <span className="text-[#D4FF00] font-bold">
                  ✓ Límite de 6 imágenes alcanzado.
                </span>
                <span className="text-gray-400 text-[11px]">
                  Elimina alguna imagen con el icono de papelera si deseas subir otra.
                </span>
              </div>
            )}

            <p className="text-[11px] font-mono text-gray-500 pt-1">
              La imagen marcada con <strong>PORTADA</strong> será la que se muestre en el catálogo y Hero. Puedes cambiar la portada con un clic.
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
                placeholder="Ej. Gorra GJ Signature o Hoodie No Signal"
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
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Categoría *</span>
                  {isCap && (
                    <span className="text-[#D4FF00] text-[10px] font-bold">
                      MODO GORRA: UNITALLA
                    </span>
                  )}
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as any)}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-4 py-2.5 text-sm font-sans text-white focus:outline-none cursor-pointer"
                >
                  <option value="hoodies">Hoodies (Con tallas S, M, L, XL)</option>
                  <option value="playeras">Playeras (Con tallas S, M, L, XL)</option>
                  <option value="gorras">Gorras (Unitalla · Sin tallas)</option>
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
                    min="0"
                    placeholder="0"
                    value={price === 0 ? '' : price}
                    onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] pl-8 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-[10px] font-mono text-gray-500 block">
                  MXN · IVA incluido
                </span>
              </div>

            </div>

            {/* Brand Row */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Marca del Producto *</span>
                <span className="text-[#D4FF00] text-[10px] font-bold">
                  {isCap ? 'FILTRABLE POR MARCA EN GORRAS' : 'MARCA DE LA PRENDA'}
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={['GJ', 'New Era', 'Mitchell & Ness', '47 Brand'].includes(brand) ? brand : 'otro'}
                  onChange={(e) => {
                    if (e.target.value !== 'otro') {
                      setBrand(e.target.value)
                    }
                  }}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-4 py-2.5 text-sm font-sans text-white focus:outline-none cursor-pointer"
                >
                  <option value="GJ">GJ Signature / Oficial</option>
                  <option value="New Era">New Era</option>
                  <option value="Mitchell & Ness">Mitchell & Ness</option>
                  <option value="47 Brand">47 Brand</option>
                  <option value="otro">Otra marca...</option>
                </select>

                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Nombre de la marca..."
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-4 py-2.5 text-sm font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Tag Configuration (Without label color) */}
            <div className="pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Etiqueta Destacada (Opcional)
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] px-4 py-2.5 text-sm font-sans text-white focus:outline-none cursor-pointer"
                >
                  <option value="">Sin etiqueta (Por defecto)</option>
                  <option value="NUEVO">NUEVO</option>
                  <option value="BEST SELLER">BEST SELLER</option>
                  <option value="EDICIÓN LIMITADA">EDICIÓN LIMITADA</option>
                </select>
              </div>
            </div>

            {/* Toggle: En "Los Más Buscados" (Portada) */}
            <div className="p-4 bg-[#141414] border border-[#262626] flex items-center justify-between gap-4 mt-2">
              <div className="space-y-0.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-gray-500'}`} />
                  <span>MOSTRAR EN "LOS MÁS BUSCADOS" (PORTADA)</span>
                </label>
                <p className="text-[11px] text-gray-400 font-sans">
                  Activa esta opción para que este producto aparezca destacado en la sección principal de la tienda.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5 accent-[#D4FF00] cursor-pointer shrink-0"
              />
            </div>

          </div>

          {/* Section 03: Existencias (Condicional: Si es Gorra = Unitalla directa; si es otra = Tabla de tallas) */}
          <div className="bg-[#101010] border border-[#202020] p-6 space-y-4">

            {/* Header of Section 03 */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-[#D4FF00]">03</span>
                <h3 className="font-sans text-sm font-semibold text-white tracking-wide">
                  {isCap ? 'Existencias (Unitalla)' : 'Variantes y existencias por talla'}
                </h3>
              </div>
              <span className="text-xs font-mono text-gray-400 font-bold">
                {isCap ? 'Prenda Unitalla' : `${variants.length} tallas`} ·{' '}
                <span className="text-[#D4FF00]">{totalStock} unidades</span>
              </span>
            </div>

            {/* CASO 1: ES GORRA -> NO SE MUESTRAN TALLAS, SOLO EXISTENCIAS */}
            {isCap ? (
              <div className="space-y-5 pt-1">

                {/* Banner Informativo Unitalla */}
                <div className="p-3.5 bg-[#141414] border border-[#282828] flex items-start gap-3">
                  <div className="p-2 bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-[#D4FF00] shrink-0 mt-0.5">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-mono space-y-1">
                    <div className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                      <span>TALLA ÚNICA AJUSTABLE</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-[#D4FF00] text-black font-extrabold">
                        ONE SIZE
                      </span>
                    </div>
                    <p className="text-gray-400 font-sans leading-relaxed text-[11px]">
                      Las gorras cuentan con broche metálico / velcro ajustable universal, por lo que{' '}
                      <strong className="text-gray-200">no requieren selección de tallas (S, M, L, XL)</strong>. Ingresa únicamente cuántas piezas tienes en stock para este modelo.
                    </p>
                  </div>
                </div>

                {/* Grid de Existencias y SKU Unitalla */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-[#131313] p-4 border border-[#222222]">

                  {/* Campo de Existencias Totales */}
                  <div className="sm:col-span-6 space-y-2">
                    <label className="text-xs font-mono text-gray-300 uppercase tracking-wider font-bold block">
                      Existencias disponibles (Stock) *
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={capStock}
                        onChange={(e) => setCapStock(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-[#181818] border border-[#303030] focus:border-[#D4FF00] px-4 py-2.5 text-base font-mono font-bold text-[#D4FF00] focus:outline-none"
                      />
                      <span className="text-xs font-mono text-gray-400 shrink-0">unidades</span>
                    </div>

                    {/* Botones de ajuste rápido */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-mono text-gray-500 mr-1">Rápido:</span>
                      {[
                        { label: '-5', delta: -5 },
                        { label: '-1', delta: -1 },
                        { label: '+1', delta: 1 },
                        { label: '+5', delta: 5 },
                        { label: '+10', delta: 10 },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => setCapStock((prev) => Math.max(0, prev + btn.delta))}
                          className="px-2 py-0.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] hover:text-[#D4FF00] text-gray-300 font-mono text-[10px] border border-[#333] transition-colors cursor-pointer"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SKU de la Gorra */}
                  <div className="sm:col-span-6 space-y-2">
                    <label className="text-xs font-mono text-gray-300 uppercase tracking-wider block">
                      SKU del producto
                    </label>
                    <input
                      type="text"
                      value={capSku}
                      onChange={(e) => setCapSku(e.target.value)}
                      placeholder="GJ-CAP-001"
                      className="w-full bg-[#181818] border border-[#303030] focus:border-[#D4FF00] px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                    />
                    <span className="text-[10px] font-mono text-gray-500 block">
                      Identificador de inventario único
                    </span>
                  </div>

                </div>

                {/* Color de la Gorra */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                  <span className="text-gray-400">Color principal:</span>
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-4 h-4 rounded-full inline-block border border-white/20"
                      style={{ backgroundColor: colorHex }}
                    />
                    <input
                      type="text"
                      value={colorName}
                      onChange={(e) => handleColorNameChange(e.target.value)}
                      placeholder="ej. Gris / Negro"
                      className="bg-[#141414] border border-[#2b2b2b] px-2.5 py-1 text-xs text-white w-28 focus:outline-none focus:border-[#D4FF00]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    {[
                      { hex: '#111111', name: 'Negro' },
                      { hex: '#8E8E93', name: 'Gris' },
                      { hex: '#F3F4F6', name: 'Blanco' },
                      { hex: '#C4B69F', name: 'Stone' },
                      { hex: '#4A5243', name: 'Verde Olivo' },
                      { hex: '#0F172A', name: 'Navy' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          setColorHex(c.hex)
                          setColorName(c.name)
                        }}
                        title={c.name}
                        className={`w-5 h-5 rounded-full border transition-transform ${colorHex === c.hex ? 'border-[#D4FF00] scale-110' : 'border-white/20'
                          }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* CASO 2: NO ES GORRA (HOODIES, PLAYERAS, ETC) -> TABLA DE TALLAS S, M, L, XL */
              <div className="space-y-4">

                {/* Color selection line */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">Color:</span>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block border border-white/20"
                        style={{ backgroundColor: colorHex }}
                      />
                      <input
                        type="text"
                        value={colorName}
                        onChange={(e) => handleColorNameChange(e.target.value)}
                        placeholder="ej. Gris"
                        className="bg-transparent border-b border-[#2b2b2b] text-white font-semibold w-24 py-0.5 focus:outline-none focus:border-[#D4FF00]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[
                      { hex: '#111111', name: 'Negro' },
                      { hex: '#8E8E93', name: 'Gris' },
                      { hex: '#F3F4F6', name: 'Blanco' },
                      { hex: '#C4B69F', name: 'Stone' },
                      { hex: '#4A5243', name: 'Verde Olivo' },
                      { hex: '#0F172A', name: 'Navy' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          setColorHex(c.hex)
                          setColorName(c.name)
                        }}
                        title={c.name}
                        className={`w-4 h-4 rounded-full border transition-transform ${colorHex === c.hex ? 'border-[#D4FF00] scale-125' : 'border-white/20 hover:scale-110'
                          }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Variants Table */}
                <div className="overflow-x-auto border border-[#222222]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#222222] bg-[#141414] text-gray-500 uppercase tracking-wider">
                        <th className="py-2.5 px-3">TALLA</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3 text-center">EXISTENCIAS</th>
                        <th className="py-2.5 px-3 text-right">PRECIO</th>
                        <th className="py-2.5 px-3 text-right">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b1b1b]">
                      {variants.map((v, i) => (
                        <tr key={i} className="hover:bg-[#141414]">
                          <td className="py-2.5 px-3 font-bold text-white">
                            <input
                              type="text"
                              value={v.size}
                              onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                              className="bg-transparent border-b border-transparent hover:border-[#333] focus:border-[#D4FF00] focus:outline-none py-0.5 text-xs text-white font-bold w-12"
                            />
                          </td>
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
                              min="0"
                              value={v.stock}
                              onChange={(e) =>
                                handleVariantChange(i, 'stock', Math.max(0, Number(e.target.value)))
                              }
                              className="bg-[#161616] border border-[#2b2b2b] focus:border-[#D4FF00] focus:outline-none py-1 px-2 text-xs text-center text-white w-16"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#D4FF00] font-semibold">
                            ${v.price.toLocaleString('es-MX')}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {variants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(i)}
                                className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                title="Eliminar talla"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D4FF00] hover:underline cursor-pointer pt-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>+ Añadir otra talla (ej. XXL, XS)</span>
                </button>

              </div>
            )}

          </div>

        </div>

        {/* Right Column (Sidebar Preview & Publication) - 4 Cols */}
        <div className="lg:col-span-4 space-y-6">

          {/* Card: VISTA PREVIA EN TIENDA */}
          <div className="bg-[#101010] border border-[#202020] p-6 space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold tracking-widest text-gray-400 uppercase">
                VISTA PREVIA EN TIENDA
              </h4>
              <span className="text-[10px] font-mono text-[#D4FF00] uppercase font-bold">
                {isCap ? 'UNITALLA' : 'CON TALLAS'}
              </span>
            </div>

            {/* Live Product Card Mockup */}
            <div className="bg-[#151515] border border-[#262626] p-3 space-y-3 shadow-lg">
              <div className="relative aspect-square bg-[#0f0f0f] overflow-hidden">
                {tag && (
                  <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-[#D4FF00] text-black">
                    {tag}
                  </span>
                )}
                {images.length > 0 ? (
                  <img
                    src={images[coverIndex] || images[0]}
                    alt={title || 'Prenda'}
                    className="w-full h-full object-cover object-center transition-all duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#101010] border border-dashed border-[#222222] text-gray-600 space-y-2 p-4 text-center">
                    <Package className="w-10 h-10 stroke-[1.2] opacity-40 text-[#D4FF00]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                      Sin foto seleccionada
                    </span>
                  </div>
                )}
              </div>

              {/* Mini thumbnails strip in preview */}
              {images.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverIndex(idx)}
                      className={`w-9 h-9 rounded-sm overflow-hidden border transition-all shrink-0 cursor-pointer ${idx === coverIndex
                          ? 'border-[#D4FF00] scale-105'
                          : 'border-[#333] opacity-60 hover:opacity-100'
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span className="truncate mr-2 font-sans">{title || 'Sin nombre'}</span>
                  <span className="font-mono text-sm whitespace-nowrap text-[#D4FF00]">
                    ${price.toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="text-[11px] font-sans text-gray-400">
                  {isCap
                    ? `${colorName} / Unitalla Ajustable`
                    : `${colorName} · ${variants.filter(v => v.stock > 0).map(v => v.size).join(', ') || 'Sin stock cargado'}`}
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span
                    className="w-3.5 h-3.5 rounded-full inline-block border border-white/20"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="text-[10px] font-mono text-gray-500">
                    {totalStock} en existencia ({images.length} fotos)
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Publicación */}
            <div className="pt-3 border-t border-[#1c1c1c] space-y-4">
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
                  <option value="publicado">Publicado (Visible en tienda)</option>
                  <option value="borrador">Borrador (Oculto)</option>
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
                  <span>Disponible para compra en línea</span>
                </label>
                <p className="text-[10px] font-mono text-gray-500 mt-2">
                  Al publicar, las <strong className="text-white">{totalStock} piezas</strong>{' '}
                  {isCap ? 'unitalla' : 'en todas las tallas'} estarán disponibles de inmediato.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Sticky Bottom Summary Bar */}
      <div className="sticky bottom-0 z-30 w-full bg-[#0d0d0d] border-t border-[#1e1e1e] py-3.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono shadow-2xl">
        <span className="text-gray-400 text-center sm:text-left">
          {isCap
            ? '✓ Gorra configurada como Unitalla. Revisa existencias antes de guardar.'
            : '✓ Revisa imágenes, precio y variantes de talla antes de publicar.'}
        </span>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-white underline cursor-pointer"
          >
            Descartar cambios / Volver
          </button>

          <button
            type="button"
            onClick={() => handlePublish('publicado')}
            disabled={isSubmitting}
            className="px-5 py-2 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
          >
            {isEditing ? 'Guardar Cambios' : 'Publicar Ahora'}
          </button>
        </div>
      </div>

    </div>
  )
}
