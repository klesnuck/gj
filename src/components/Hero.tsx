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
                SLW
              </span>
            </div>

            {/* Giant Title */}
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl xl:text-[96px] leading-[0.88] font-black uppercase tracking-tight text-white select-none">
              REVIVIENDO.<br />
              <span className="text-white">EL HYPE.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-base sm:text-lg max-w-lg font-sans leading-relaxed">
              No seguimos el hype. Lo llevamos puesto.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onShopDrop}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(212,255,0,0.25)]"
              >
                <span>VER LO MAS VENDIDO</span>
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

          {/* Right Hero: Mascot Character with Sticker Badge and Hover Animation */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="relative group cursor-pointer flex flex-col items-center justify-center py-4">
              
              {/* Ambient Lime Glow behind mascot */}
              <div className="absolute inset-0 bg-[#D4FF00]/15 blur-3xl rounded-full scale-75 group-hover:bg-[#D4FF00]/30 transition-all duration-500 pointer-events-none" />

              {/* Character + Sticker Container */}
              <div className="relative w-44 sm:w-56 md:w-64 lg:w-72 h-[380px] sm:h-[440px] md:h-[480px] lg:h-[500px] flex items-end justify-center">
                
                {/* Floating Streetwear Sticker Badge (lo que trae arriba) */}
                <div className="absolute top-2 right-2 sm:right-4 z-20">
                  <span className="inline-block px-2.5 py-1 bg-[#D4FF00] text-black font-mono font-black text-xs uppercase tracking-wider shadow-lg rotate-6 select-none group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                    GJ*
                  </span>
                </div>

                {/* Rick Mascot Image with interactive hover animation */}
                <img
                  src="/images/gj-mascot.png"
                  alt="gj. Rick Mascot"
                  className="relative z-10 w-full h-full object-contain object-bottom filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-300"
                />

                {/* Bottom Shadow Ellipse */}
                <div className="absolute -bottom-2 w-3/4 h-4 bg-black/80 rounded-full blur-md pointer-events-none" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
