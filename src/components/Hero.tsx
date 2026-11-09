import React from 'react'
import { ArrowUpRight } from 'lucide-react'

interface HeroProps {
  onShopDrop: () => void
  onExploreCaps: () => void
}

export const Hero: React.FC<HeroProps> = ({ onShopDrop, onExploreCaps }) => {
  return (
    <section className="relative w-full bg-[#090909] overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:pr-4">
            
            {/* Drop Indicator Tag */}
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse"></span>
              <span className="text-xs sm:text-sm font-mono tracking-widest text-[#D4FF00] font-semibold uppercase">
                DROP 004 / UNDERGROUND ESSENTIALS
              </span>
            </div>

            {/* Giant Title + Mascot Standing Next to It */}
            <div className="flex items-end gap-4 sm:gap-6">
              
              {/* Massive Headline */}
              <h1 className="font-display text-5xl sm:text-7xl lg:text-[84px] xl:text-[92px] leading-[0.88] font-black uppercase tracking-tight text-white select-none shrink-0">
                TU CALLE.<br />
                <span className="text-white">TUS REGLAS.</span>
              </h1>

              {/* Streetwear Mascot standing right next to the title */}
              <div className="relative shrink-0 group mb-1">
                {/* Subtle Ambient Lime Glow */}
                <div className="absolute inset-0 bg-[#D4FF00]/20 blur-xl rounded-full scale-90 group-hover:bg-[#D4FF00]/30 transition-all duration-300 pointer-events-none" />
                
                {/* Mascot Image */}
                <div className="relative w-16 sm:w-24 md:w-28 lg:w-32 h-36 sm:h-52 md:h-60 lg:h-64 flex items-end">
                  <img
                    src="/images/gj-mascot.png"
                    alt="gj. Rick Mascot"
                    className="w-full h-full object-contain object-bottom filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-300 cursor-pointer"
                  />
                  {/* Streetwear Badge */}
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.5 bg-[#D4FF00] text-black font-mono font-black text-[9px] uppercase tracking-wider shadow-md rotate-6 select-none pointer-events-none">
                    GJ*
                  </span>
                </div>
              </div>

            </div>

            {/* Subtitle */}
            <p className="text-gray-400 text-base sm:text-lg max-w-lg font-sans leading-relaxed">
              No seguimos el hype. Lo llevamos puesto. Ropa y gorras para quienes marcan su propio ritmo.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onShopDrop}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(212,255,0,0.25)]"
              >
                <span>COMPRAR EL DROP</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={onExploreCaps}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#121212] hover:bg-[#1a1a1a] text-white hover:text-[#D4FF00] border border-[#2b2b2b] hover:border-[#D4FF00] font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200"
              >
                <span>EXPLORAR GORRAS</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Microcopy tagline */}
            <div className="pt-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
                PIEZAS LIMITADAS. ACTITUD ILIMITADA.
              </span>
            </div>

          </div>

          {/* Right Hero Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[5/4] bg-[#121212] overflow-hidden border border-[#222222] group">
              
              {/* Top Tag: NUEVA COLECCIÓN */}
              <div className="absolute top-4 left-4 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4FF00] text-black text-[11px] font-mono font-bold tracking-wider uppercase">
                  NUEVA COLECCIÓN
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>

              {/* Main Model Photo */}
              <img
                src="/images/hero-banner.jpg"
                alt="Underground Essentials - Drop 004"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-95 contrast-105"
                onError={(e) => {
                  // Fallback to high quality streetwear urban photo if crop not loaded
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80'
                }}
              />

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

              {/* Bottom Overlay Info */}
              <div className="absolute bottom-5 left-5 z-20">
                <div className="text-[11px] font-mono text-[#D4FF00] tracking-widest font-semibold uppercase mb-0.5">
                  GJ* / VOL. 004
                </div>
                <div className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-white font-bold leading-none">
                  BUILT FOR THE STREETS.
                </div>
              </div>

              {/* Circular Action Button */}
              <button
                onClick={onShopDrop}
                aria-label="Ver colección"
                className="absolute bottom-5 right-5 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-[#D4FF00] text-white hover:text-black border border-white/20 hover:border-[#D4FF00] flex items-center justify-center transition-all duration-300 transform group-hover:rotate-45"
              >
                <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

