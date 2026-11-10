import React from 'react'

export const AnnouncementBar: React.FC = () => {
  return (
    <aside aria-label="Anuncios de la tienda" className="w-full bg-[#D4FF00] text-black py-1.5 px-4 text-[11px] font-mono font-bold tracking-wider uppercase select-none z-50 relative border-b border-black">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2.5 text-center">
        <span>ENVÍO GRATIS EN COMPRAS DESDE $1,999 MXN</span>
        <span className="inline-block w-2.5 h-2.5 bg-black text-[#D4FF00] text-[9px] font-black rounded-xs leading-none flex items-center justify-center">
          ✦
        </span>
        <span>DROP 004 - YA DISPONIBLE</span>
      </div>
    </aside>
  )
}
