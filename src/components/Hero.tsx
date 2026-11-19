import React from 'react'
import { ArrowUpRight } from 'lucide-react'

interface HeroProps {
  onShopDrop: () => void
  onExploreCaps?: () => void
}

export const Hero: React.FC<HeroProps> = ({ onShopDrop }) => {
  return (
    <section className="relative w-full bg-[#090909] overflow-hidden pt-4 pb-8 sm:pt-10 sm:pb-16 md:py-16 lg:py-20 border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Responsive Grid: Side-by-side both on mobile and desktop */}
        <div className="grid grid-cols-12 gap-2 xs:gap-3 sm:gap-6 md:gap-8 lg:gap-12 items-center">

          {/* Left Column: Headlines & CTAs */}
          <div className="col-span-7 sm:col-span-7 md:col-span-7 flex flex-col justify-center space-y-2.5 sm:space-y-4 md:space-y-6">

            {/* Drop Indicator Tag */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D4FF00] animate-pulse"></span>
              <span className="text-[10px] sm:text-sm font-mono tracking-widest text-[#D4FF00] font-semibold uppercase">
                SLW
              </span>
            </div>

            {/* Giant Responsive Title */}
            <h1 className="font-display text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[96px] leading-[0.88] font-black uppercase tracking-tight text-white select-none break-words">
              REVIVIENDO.<br />
              <span className="text-white">EL HYPE.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-xs sm:text-base lg:text-lg max-w-lg font-sans leading-snug sm:leading-relaxed">
              No seguimos el hype. Lo llevamos puesto.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 pt-0.5 sm:pt-2 w-full sm:w-auto">
              <button
                onClick={onShopDrop}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2.5 px-3.5 sm:px-7 py-2.5 sm:py-3.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-[10px] xs:text-[11px] sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(212,255,0,0.25)] cursor-pointer"
              >
                <span>VER LO MÁS VENDIDO</span>
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Microcopy Tagline */}
            <div className="pt-0.5 sm:pt-1">
              <span className="text-[8px] xs:text-[9px] sm:text-[11px] font-mono uppercase tracking-widest text-gray-500">
                ESTAMOS DE VUELTA!!.
              </span>
            </div>

          </div>

          {/* Right Column: Rick Mascot Stage (Always on the right, matching laptop composition) */}
          <div className="col-span-5 sm:col-span-5 md:col-span-5 w-full flex items-center justify-center lg:justify-end">
            <div className="relative group cursor-pointer flex flex-col items-center justify-center p-1 sm:p-5 select-none">

              {/* Soft Vertical Neon Aura Gradient */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] xs:w-[200px] sm:w-[300px] md:w-[340px] lg:w-[380px] h-[240px] xs:h-[300px] sm:h-[440px] md:h-[500px] lg:h-[560px] pointer-events-none opacity-60 group-hover:opacity-95 transition-opacity duration-500 ease-out"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(212, 255, 0, 0.28) 0%, rgba(212, 255, 0, 0.08) 45%, transparent 72%)',
                }}
              />

              {/* Hardware-Accelerated Floating Wrapper */}
              <div className="relative animate-smooth-float transform-gpu will-change-transform flex flex-col items-center">

                {/* Character Stage */}
                <div className="relative h-[220px] xs:h-[260px] sm:h-[380px] md:h-[460px] lg:h-[520px] xl:h-[580px] flex items-end justify-center">

                  {/* Floating Streetwear Sticker Badge */}
                  <div className="absolute top-1 sm:top-3 -right-2 sm:-right-5 lg:-right-6 z-20 pointer-events-none">
                    <span className="inline-block px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-[#D4FF00] text-black font-mono font-black text-[9px] sm:text-xs uppercase tracking-wider shadow-lg rotate-6 select-none group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                      GJ*
                    </span>
                  </div>

                  {/* Rick Mascot Image */}
                  <img
                    src="/images/gj-mascot.png"
                    alt="gj. Rick Streetwear Mascot"
                    className="h-full w-auto max-w-none object-contain object-bottom filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] transform-gpu will-change-transform group-hover:scale-[1.03] group-hover:-rotate-1 transition-transform duration-500 ease-out"
                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                  />

                </div>

                {/* Ground Shadow right under shoes */}
                <div className="w-16 xs:w-20 sm:w-36 md:w-44 h-2 sm:h-3 bg-black/90 rounded-full blur-[2px] sm:blur-[3px] pointer-events-none -mt-1 group-hover:scale-95 group-hover:opacity-70 transition-all duration-500" />
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
