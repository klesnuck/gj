import React from 'react'
import { ArrowUpRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react'

interface EditorialSectionProps {
  onDiscoverNews: () => void
}

export const EditorialSection: React.FC<EditorialSectionProps> = ({ onDiscoverNews }) => {
  return (
    <section className="w-full bg-[#090909] pt-16 sm:pt-24 pb-16 border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-24">
        
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
                  DROP 004
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

        {/* Manifesto Row with Streetwear Mascot Feature */}
        <div id="manifiesto" className="pt-12 border-t border-[#1a1a1a]">
          <div className="bg-[#101010] border border-[#222222] p-6 sm:p-10 relative overflow-hidden">
            {/* Ambient Lime Glow behind mascot */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 w-64 h-64 bg-[#D4FF00]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left Column: Manifesto Headline */}
              <div className="lg:col-span-4">
                <span className="inline-block px-2.5 py-1 bg-[#181818] text-[#D4FF00] border border-[#2d2d2d] font-mono text-[10px] tracking-widest uppercase mb-3 font-semibold">
                  MANIFIESTO / UNIVERSO GJ
                </span>
                <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white font-black leading-none">
                  GJ NO ES PARA TODOS.
                </h3>
                <p className="text-xs font-mono tracking-widest text-[#D4FF00] uppercase mt-2 font-bold">
                  Y ESA ES LA IDEA.
                </p>
              </div>

              {/* Center Column: Philosophy */}
              <div className="lg:col-span-5">
                <p className="text-gray-300 text-base sm:text-lg font-sans leading-relaxed">
                  Nacimos de la calle, no de una tendencia. Elegimos cada pieza por lo que representa: autenticidad, cultura y una forma propia de ver el mundo. Bienvenido a gj clothing and caps.
                </p>
                <div className="mt-4 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse"></span>
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    EDICIÓN LIMITADA · ACTITUD UNDERGROUND
                  </span>
                </div>
              </div>

              {/* Right Column: Mascot Character */}
              <div className="lg:col-span-3 flex flex-col items-center justify-center">
                <div className="relative group cursor-pointer">
                  <div className="w-32 sm:w-40 h-52 sm:h-60 flex items-end justify-center filter drop-shadow-[0_10px_20px_rgba(212,255,0,0.15)] group-hover:scale-105 transition-transform duration-300">
                    <img
                      src="/images/gj-mascot.png"
                      alt="GJ Mascot Character"
                      className="w-full h-full object-contain object-bottom"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span className="inline-block text-[10px] font-mono tracking-widest text-gray-400 bg-black/70 px-3 py-1 border border-[#2a2a2a] uppercase">
                      GJ ICON / VOL. 004
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#1a1a1a]">
          
          {/* Pillar 1 */}
          <div className="flex items-start space-x-4 p-4 bg-[#111111]/60 border border-[#1e1e1e]">
            <div className="w-10 h-10 rounded-sm bg-[#181818] border border-[#2b2b2b] flex items-center justify-center text-[#D4FF00] shrink-0">
              <Truck className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-white">
                DE NUESTRA CALLE A LA TUYA
              </h4>
              <p className="text-xs text-gray-400 font-sans mt-1">
                Envíos a todo México. Gratis desde $1,999.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-start space-x-4 p-4 bg-[#111111]/60 border border-[#1e1e1e]">
            <div className="w-10 h-10 rounded-sm bg-[#181818] border border-[#2b2b2b] flex items-center justify-center text-[#D4FF00] shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-white">
                COMPRA CON CONFIANZA
              </h4>
              <p className="text-xs text-gray-400 font-sans mt-1">
                Pagos seguros con tarjeta y Mercado Pago.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-start space-x-4 p-4 bg-[#111111]/60 border border-[#1e1e1e]">
            <div className="w-10 h-10 rounded-sm bg-[#181818] border border-[#2b2b2b] flex items-center justify-center text-[#D4FF00] shrink-0">
              <RefreshCw className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-white">
                EL FIT TIENE QUE SER TUYO
              </h4>
              <p className="text-xs text-gray-400 font-sans mt-1">
                Cambios fáciles dentro de los primeros 15 días.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

