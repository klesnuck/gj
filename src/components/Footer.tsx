import React from 'react'
import { ArrowUpRight, Instagram, Phone } from 'lucide-react'

interface FooterProps {
  onSelectCategory?: (category: string) => void
  onOpenAdmin?: () => void
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAdmin }) => {
  return (
    <footer className="w-full bg-[#070707] text-white pt-10 sm:pt-16 pb-10 sm:pb-12 border-t border-[#1a1a1a] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Links Grid: 2 columnas en móvil (Explora al lado de TT / Marca) */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 pb-10 sm:pb-12 border-b border-[#1c1c1c]">

          {/* Columna 1: Marca, Redes Sociales y Contacto */}
          <div className="col-span-1 md:col-span-8 space-y-3 sm:space-y-4">
            <div className="flex items-center">
              <span className="font-display text-3xl sm:text-5xl tracking-tighter font-extrabold text-white">
                gj.
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-gray-400 uppercase">
              CLOTHING AND CAPS®
            </div>
            <p className="text-xs sm:text-sm font-sans text-gray-400 max-w-sm leading-relaxed">
              La calle es nuestra. El estilo es tuyo.
            </p>

            {/* Redes Sociales: Instagram & TikTok */}
            <div className="flex items-center space-x-3 sm:space-x-4 pt-1">
              <a
                href="https://www.instagram.com/gjboutique.slw?exln=MXZjaG51cm44d25hYw%3D%3D&utm_source=qr"
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

            {/* Número de Contacto Directo */}
            <div className="pt-2 sm:pt-3">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
                CONTACTO DIRECTO
              </span>
              <a
                href="https://wa.me/528444923686"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold text-[#D4FF00] hover:underline mt-1"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4FF00]" />
                <span>844 492 3686</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Columna 2: EXPLORA (A lado en móvil) */}
          <div className="col-span-1 md:col-span-4 space-y-3 sm:space-y-4 md:pl-6">
            <h4 className="text-xs font-mono font-bold tracking-widest text-gray-300 uppercase">
              EXPLORA
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm font-sans text-gray-400">
              <li>
                <button
                  onClick={() => onSelectCategory?.('todos')}
                  className="hover:text-[#D4FF00] transition-colors text-left cursor-pointer"
                >
                  Novedades
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.('ropa')}
                  className="hover:text-[#D4FF00] transition-colors text-left cursor-pointer"
                >
                  Ropa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.('gorras')}
                  className="hover:text-[#D4FF00] transition-colors text-left cursor-pointer"
                >
                  Gorras
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.('accesorios')}
                  className="hover:text-[#D4FF00] transition-colors text-left cursor-pointer"
                >
                  Accesorios
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Payment Row */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500">
          <div className="text-center sm:text-left text-[11px] sm:text-xs">
            © 2026 GJ CLOTHING AND CAPS. TODOS LOS DERECHOS RESERVADOS.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a href="#privacidad" className="hover:text-gray-300 transition-colors text-[11px] sm:text-xs">
              Aviso de privacidad
            </a>
            <a href="#terminos" className="hover:text-gray-300 transition-colors text-[11px] sm:text-xs">
              Términos y condiciones
            </a>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-gray-500 hover:text-[#D4FF00] transition-colors cursor-pointer font-bold tracking-wider uppercase text-[11px]"
                title="Acceso Administración GJ"
              >
                [PANEL ADMIN]
              </button>
            )}
          </div>

          <div className="text-gray-400 font-semibold tracking-wider text-[11px] sm:text-xs text-center sm:text-right">
            VISA / Mastercard / Mercado Pago
          </div>
        </div>

      </div>
    </footer>
  )
}
