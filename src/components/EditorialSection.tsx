import React from 'react'
import { ArrowUpRight } from 'lucide-react'

interface EditorialSectionProps {
  onDiscoverNews: () => void
}

export const EditorialSection: React.FC<EditorialSectionProps> = ({ onDiscoverNews }) => {
  return (
    <section className="w-full bg-[#090909] pt-16 sm:pt-24 pb-16 border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Concrete Stairs Editorial Photo */}
          <div className="lg:col-span-6">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#121212] overflow-hidden border border-[#202020] group">
              <img
                src="/images/editorial-stairs.jpg"
                alt="Underground Essentials - GJ Journal"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Overlay Tag */}
              <div className="absolute bottom-4 left-4 z-20">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-gray-300 uppercase bg-black/60 px-2 py-1 backdrop-blur-sm border border-white/10">
                  GJ JOURNAL / CALLE, CULTURA Y COMUNIDAD
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Copy */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:pl-4">
            
            <span className="text-xs font-mono font-bold tracking-widest text-[#D4FF00] uppercase">
              03 / RECIÉN ATERRIZADO
            </span>

            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white font-black leading-[0.9]">
              NO ES MODA.<br />
              ES TU FORMA<br />
              DE ESTAR.
            </h2>

            <p className="text-gray-400 text-sm sm:text-base font-sans leading-relaxed max-w-xl">
              Presentamos Underground Essentials. Texturas pesadas, tonos crudos y siluetas que no piden permiso. El nuevo uniforme de los que hacen las cosas a su manera.
            </p>

            {/* Specs / Drop Info */}
            <div className="grid grid-cols-2 gap-6 pt-2 pb-2 border-y border-[#1e1e1e]">
              <div>
                <div className="font-display text-lg sm:text-xl uppercase tracking-wider text-white font-bold">
                  EDICIÓN LIMITADA
                </div>
                <div className="text-xs font-mono text-gray-500 uppercase mt-0.5">
                  Edición independiente
                </div>
              </div>

              <div>
                <div className="font-display text-lg sm:text-xl uppercase tracking-wider text-white font-bold">
                  SIN RESTOCK
                </div>
                <div className="text-xs font-mono text-gray-500 uppercase mt-0.5">
                  Cuando se va, se va.
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={onDiscoverNews}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(212,255,0,0.25)]"
              >
                <span>DESCUBRIR LAS NOVEDADES</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

