import React from 'react'

export const MarqueeTicker: React.FC = () => {
  const items = [
    'SIN PERMISO',
    'SIN COPIAS',
    'SOLO IDENTIDAD',
    'GJ CLOTHING AND CAPS',
  ]

  // Repeat items for seamless infinite marquee loop
  const repeated = [...items, ...items, ...items, ...items]

  return (
    <div className="w-full bg-black border-y border-[#202020] py-3.5 overflow-hidden select-none">
      <div className="flex w-max animate-marquee">
        {repeated.map((text, idx) => (
          <div key={idx} className="flex items-center space-x-6 sm:space-x-10 mx-3 sm:mx-5">
            <span className="font-display text-xl sm:text-2xl tracking-wider uppercase text-white font-bold whitespace-nowrap">
              {text}
            </span>
            {/* 8-pointed neon star badge */}
            <span className="inline-flex items-center justify-center w-5 h-5 text-[#D4FF00] font-black text-lg select-none">
              ✱
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

