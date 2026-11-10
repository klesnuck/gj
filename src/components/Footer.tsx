import React from 'react'
import { ArrowUpRight, Instagram } from 'lucide-react'

interface FooterProps {
  onSelectCategory?: (category: string) => void
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  return (
    <footer className="w-full bg-[#070707] text-white pt-16 sm:pt-20 pb-12 border-t border-[#1a1a1a] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-16 border-b border-[#1c1c1c]">
          
          {/* Col 1: Brand & Identity (spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#141414] border border-[#2b2b2b] overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                <img
                  src="/images/gj-mascot-avatar.png"
                  alt="gj. mascot"
                  className="w-full h-full object-cover scale-125 translate-y-0.5"
                />
              </div>
              <span className="font-display text-4xl sm:text-5xl tracking-tighter font-extrabold text-white">
                gj.
              </span>
            </div>
            <div className="text-xs font-mono font-bold tracking-widest text-gray-400 uppercase">
              CLOTHING AND CAPS®
            </div>
            <p className="text-sm font-sans text-gray-400 max-w-xs">
              La calle es nuestra. El estilo es tuyo.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-sm bg-[#141414] border border-[#262626] flex items-center justify-center text-gray-400 hover:text-[#D4FF00] hover:border-[#D4FF00] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-[#D4FF00] transition-colors"
              >
                <span>TikTok</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: EXPLORA */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-gray-300 uppercase">
              EXPLORA
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-gray-400">
              <li>
                <button
                  onClick={() => onSelectCategory?.('todos')}
                  className="hover:text-[#D4FF00] transition-colors text-left"
                >
                  Novedades
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.('playeras')}
                  className="hover:text-[#D4FF00] transition-colors text-left"
                >
                  Ropa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.('gorras')}
                  className="hover:text-[#D4FF00] transition-colors text-left"
                >
                  Gorras
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.('accesorios')}
                  className="hover:text-[#D4FF00] transition-colors text-left"
                >
                  Accesorios
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: TE AYUDAMOS */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-gray-300 uppercase">
              TE AYUDAMOS
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-gray-400">
              <li>
                <a href="#envios" className="hover:text-[#D4FF00] transition-colors">
                  Envíos y entregas
                </a>
              </li>
              <li>
                <a href="#cambios" className="hover:text-[#D4FF00] transition-colors">
                  Cambios y devoluciones
                </a>
              </li>
              <li>
                <a href="#guia-tallas" className="hover:text-[#D4FF00] transition-colors">
                  Guía de tallas
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-[#D4FF00] transition-colors">
                  Preguntas frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: HABLEMOS */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-gray-300 uppercase">
              HABLEMOS
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-gray-400">
              <li>
                <a href="#contacto" className="hover:text-[#D4FF00] transition-colors">
                  Contacto
                </a>
              </li>
              <li>
                <a href="mailto:hola@gjclothing.mx" className="hover:text-[#D4FF00] transition-colors font-mono text-xs">
                  hola@gjclothing.mx
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#D4FF00] transition-colors"
                >
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
              <li className="pt-2 text-xs font-mono text-gray-500">
                México / MXN $
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Payment Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500">
          <div>
            © 2026 GJ CLOTHING AND CAPS. TODOS LOS DERECHOS RESERVADOS.
          </div>

          <div className="flex items-center space-x-6">
            <a href="#privacidad" className="hover:text-gray-300 transition-colors">
              Aviso de privacidad
            </a>
            <a href="#terminos" className="hover:text-gray-300 transition-colors">
              Términos y condiciones
            </a>
          </div>

          <div className="text-gray-400 font-semibold tracking-wider">
            VISA / Mastercard / Mercado Pago
          </div>
        </div>

      </div>
    </footer>
  )
}

