import React from 'react'
import { ArrowUpRight } from 'lucide-react'

interface HeroProps {
  onShopDrop: () => void
  onExploreCaps: () => void
}

export const Hero: React.FC<HeroProps> = ({ onShopDrop, onExploreCaps }) => {
  return (
    <section className="relative w-full bg-[#090909] overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 md:py-16 lg:py-20 border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Responsive Grid: Stacks on mobile (<768px), side-by-side on tablet & desktop (>=768px) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 lg:gap-12 items-center">

          {/* Left Column: Headlines & CTAs */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">

            {/* Drop Indicator Tag */}
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse"></span>
              <span className="text-xs sm:text-sm font-mono tracking-widest text-[#D4FF00] font-semibold uppercase">
                SLW
              </span>
            </div>

            {/* Giant Responsive Title */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[96px] leading-[0.88] font-black uppercase tracking-tight text-white select-none break-words">
              REVIVIENDO.<br />
              <span className="text-white">EL HYPE.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-lg font-sans leading-relaxed">
              No seguimos el hype. Lo llevamos puesto.
            </p>

            {/* Action Buttons - Stacked on narrow phones, row on tablets and desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2 w-full sm:w-auto">
              <button
                onClick={onShopDrop}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(212,255,0,0.25)] cursor-pointer"
              >
                <span>VER LO MAS VENDIDO</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={onExploreCaps}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 bg-[#121212] hover:bg-[#1a1a1a] text-white hover:text-[#D4FF00] border border-[#2b2b2b] hover:border-[#D4FF00] font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer"
              >
                <span>EXPLORAR GORRAS</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Microcopy Tagline */}
            <div className="pt-1">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-gray-500">
                PIEZAS LIMITADAS. ACTITUD ILIMITADA.
              </span>
            </div>

          </div>

          {/* Right Column: Rick Mascot Stage (Free-standing, Vertical Neon Aura, Sticker Badge, 100% GPU Smooth) */}
          <div className="md:col-span-5 w-full flex items-center justify-center lg:justify-end pt-4 sm:pt-6 md:pt-0">
            <div className="relative group cursor-pointer flex flex-col items-center justify-center p-3 sm:p-5 select-none">
              
              {/* Soft Vertical Neon Aura Gradient (Pre-rendered GPU gradient - Zero CPU blur lag) */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[300px] md:w-[340px] lg:w-[380px] h-[360px] sm:h-[440px] md:h-[500px] lg:h-[560px] pointer-events-none opacity-60 group-hover:opacity-95 transition-opacity duration-500 ease-out"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(212, 255, 0, 0.28) 0%, rgba(212, 255, 0, 0.08) 45%, transparent 72%)',
                }}
              />

              {/* Hardware-Accelerated Floating Wrapper */}
              <div className="relative animate-smooth-float transform-gpu will-change-transform flex flex-col items-center">
                
                {/* Character Stage with exact shrink-wrap aspect for precise badge anchoring */}
                <div className="relative h-[340px] sm:h-[420px] md:h-[460px] lg:h-[520px] xl:h-[580px] flex items-end justify-center">
                  
                  {/* Floating Streetwear Sticker Badge (Anchored next to Rick's cap) */}
                  <div className="absolute top-2 sm:top-3 -right-3 sm:-right-5 lg:-right-6 z-20 pointer-events-none">
                    <span className="inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#D4FF00] text-black font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg rotate-6 select-none group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                      GJ*
                    </span>
                  </div>

                  {/* Rick Mascot Image with Silky GPU-Accelerated Hover */}
                  <img
                    src="/images/gj-mascot.png"
                    alt="gj. Rick Streetwear Mascot"
                    className="h-full w-auto max-w-none object-contain object-bottom filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] transform-gpu will-change-transform group-hover:scale-[1.03] group-hover:-rotate-1 transition-transform duration-500 ease-out"
                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                  />

                </div>

                {/* Ground Shadow right under shoes */}
                <div className="w-28 sm:w-36 md:w-44 h-3 bg-black/90 rounded-full blur-[3px] pointer-events-none -mt-1 group-hover:scale-95 group-hover:opacity-70 transition-all duration-500" />
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
