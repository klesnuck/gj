import React from 'react'
import { ArrowUpRight } from 'lucide-react'

interface CategoriesBannerProps {
  onSelectCategory: (category: string) => void
}

export const CategoriesBanner: React.FC<CategoriesBannerProps> = ({ onSelectCategory }) => {
  return (
    <section className="w-full bg-[#090909] py-16 sm:py-24 border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4">
          <div>
            <span className="text-xs font-mono tracking-widest text-gray-500 uppercase block mb-1">
              02 / ENCUENTRA TU ESENCIA
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white font-extrabold leading-none">
              ELIGE TU CÓDIGO
            </h2>
          </div>

          <button
            onClick={() => onSelectCategory('todos')}
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono tracking-wider text-gray-400 hover:text-[#D4FF00] uppercase mt-4 md:mt-0 transition-colors cursor-pointer"
          >
            <span>EXPLORAR LA TIENDA</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* 2-Column Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Card 1: CLOTHING */}
          <div
            onClick={() => onSelectCategory('ropa')}
            className="group relative h-[380px] sm:h-[420px] lg:h-[460px] bg-[#121212] border border-[#202020] overflow-hidden cursor-pointer"
          >
            {/* Top Index Tag */}
            <div className="absolute top-5 left-5 z-20">
              <span className="text-xs font-mono tracking-widest text-gray-400 uppercase">
                01 / ROPA
              </span>
            </div>

            {/* Background Image (Foto completa en blanco y negro) */}
            <img
              src="/images/clothing-essentials.jpg"
              alt="Colección Ropa Streetwear"
              className="w-full h-full object-cover object-center grayscale contrast-120 brightness-90 group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  '/images/category-clothing.jpg'
              }}
            />

            {/* Silhouette Layer (Solo la silueta de la persona a color original en hover) */}
            <img
              src="/images/clothing-silhouette.png"
              alt="Silueta Persona Streetwear"
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none" />

            {/* Bottom Content */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between">
              <div>
                <h3 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase text-white font-black tracking-tight leading-none group-hover:text-[#D4FF00] transition-colors">
                  CLOTHING
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm font-sans mt-1">
                  Siluetas amplias. Presencia sin esfuerzo.
                </p>
              </div>

              <div className="w-11 h-11 rounded-full bg-black/70 group-hover:bg-[#D4FF00] text-white group-hover:text-black border border-white/20 group-hover:border-[#D4FF00] flex items-center justify-center transition-all duration-300 group-hover:rotate-45 shrink-0 ml-4">
                <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
          </div>

          {/* Card 2: CAPS */}
          <div
            onClick={() => onSelectCategory('gorras')}
            className="group relative h-[380px] sm:h-[420px] lg:h-[460px] bg-[#121212] border border-[#202020] overflow-hidden cursor-pointer"
          >
            {/* Top Index Tag */}
            <div className="absolute top-5 left-5 z-20">
              <span className="text-xs font-mono tracking-widest text-gray-400 uppercase">
                02 / GORRAS
              </span>
            </div>

            {/* Background Image */}
            <img
              src="/images/category-caps.jpg"
              alt="Colección Gorras Streetwear"
              className="w-full h-full object-cover object-center grayscale contrast-125 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700 brightness-90"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
              }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none" />

            {/* Bottom Content */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between">
              <div>
                <h3 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase text-white font-black tracking-tight leading-none group-hover:text-[#D4FF00] transition-colors">
                  CAPS
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm font-sans mt-1">
                  El detalle que cambia todo.
                </p>
              </div>

              <div className="w-11 h-11 rounded-full bg-black/70 group-hover:bg-[#D4FF00] text-white group-hover:text-black border border-white/20 group-hover:border-[#D4FF00] flex items-center justify-center transition-all duration-300 group-hover:rotate-45 shrink-0 ml-4">
                <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
          </div>

        </div>

        {/* 03 Accesorios Horizontal Strip Banner */}
        <div
          onClick={() => onSelectCategory('accesorios')}
          className="group w-full bg-[#111111] hover:bg-[#161616] border border-[#202020] hover:border-[#383838] px-6 py-4.5 sm:py-5 flex items-center justify-between transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <span className="text-xs font-mono text-gray-500 font-bold uppercase mb-1 sm:mb-0">
              03
            </span>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <span className="font-display text-xl sm:text-2xl uppercase tracking-wider text-white font-bold group-hover:text-[#D4FF00] transition-colors">
                LOS DETALLES TAMBIÉN HABLAN.
              </span>
              <span className="text-xs sm:text-sm text-gray-400 font-sans">
                Bolsos, calcetas y accesorios para completar el fit.
              </span>
            </div>
          </div>

          <div className="text-[#D4FF00] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ml-4 shrink-0">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

      </div>
    </section>
  )
}

