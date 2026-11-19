import React, { useState, useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'

interface CategoriesBannerProps {
  onSelectCategory: (category: string) => void
}

export const CategoriesBanner: React.FC<CategoriesBannerProps> = ({ onSelectCategory }) => {
  const clothingCardRef = useRef<HTMLDivElement | null>(null)
  const capsCardRef = useRef<HTMLDivElement | null>(null)
  const [clothingInView, setClothingInView] = useState(false)
  const [capsInView, setCapsInView] = useState(false)

  // En celular/pantallas táctiles, activar la animación 3D automáticamente al deslizar hacia abajo
  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: none), (max-width: 767px)')
    let observer: IntersectionObserver | null = null

    const setupObserver = () => {
      if (observer) {
        observer.disconnect()
        observer = null
      }

      if (!mediaQuery.matches) {
        setClothingInView(false)
        setCapsInView(false)
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target === clothingCardRef.current) {
              setClothingInView(entry.isIntersecting)
            } else if (entry.target === capsCardRef.current) {
              setCapsInView(entry.isIntersecting)
            }
          })
        },
        {
          threshold: 0.55,
          rootMargin: '-10% 0px -10% 0px',
        }
      )

      if (clothingCardRef.current) observer.observe(clothingCardRef.current)
      if (capsCardRef.current) observer.observe(capsCardRef.current)
    }

    setupObserver()
    mediaQuery.addEventListener('change', setupObserver)

    return () => {
      mediaQuery.removeEventListener('change', setupObserver)
      if (observer) observer.disconnect()
    }
  }, [])

  return (
    <section className="w-full bg-[#090909] py-16 sm:py-24 border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4">
          <div>
            <span className="text-xs font-mono tracking-widest text-gray-500 uppercase block mb-1">
              01 / ENCUENTRA TU ESENCIA
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white font-extrabold leading-none">
              ELIGE TU CÓDIGO
            </h2>
          </div>
        </div>

        {/* 2-Column Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Card 1: CLOTHING */}
          <div
            ref={clothingCardRef}
            onClick={() => onSelectCategory('ropa')}
            className="group relative h-[380px] sm:h-[420px] lg:h-[460px] bg-[#121212] border border-[#202020] overflow-hidden cursor-pointer"
          >
            {/* Top Index Tag */}
            <div className="absolute top-5 left-5 z-20">
              <span className="text-xs font-mono tracking-widest text-gray-400 uppercase">
                01 / ROPA
              </span>
            </div>

            {/* Background Image (Foto completa en blanco y negro) */}
            <img
              src="/images/clothing-essentials.jpg"
              alt="Colección Ropa Streetwear"
              className={`w-full h-full object-cover object-center grayscale contrast-120 transition-all duration-700 ease-out ${
                clothingInView
                  ? 'brightness-40 scale-102'
                  : 'brightness-90 group-hover:brightness-40 group-hover:scale-102'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  '/images/category-clothing.jpg'
              }}
            />

            {/* Gradient Overlay (Detrás de la silueta para que resalte y no quede oscurecida) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none z-0" />

            {/* Silhouette Layer (Sobresale hacia el frente con escala 110%, elevación, sombra 3D y aura neon) */}
            <img
              src="/images/clothing-silhouette.png"
              alt="Silueta Persona Streetwear"
              className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-all duration-700 ease-out z-10 [filter:drop-shadow(0_20px_30px_rgba(0,0,0,0.95))_drop-shadow(0_0_25px_rgba(212,255,0,0.35))] ${
                clothingInView
                  ? 'opacity-100 scale-110 -translate-y-2 contrast-115 brightness-105'
                  : 'opacity-0 group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-y-2 group-hover:contrast-115 group-hover:brightness-105'
              }`}
            />

            {/* Bottom Content */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between">
              <div>
                <h3
                  className={`font-display text-5xl sm:text-6xl lg:text-7xl uppercase font-black tracking-tight leading-none transition-colors ${
                    clothingInView ? 'text-[#D4FF00]' : 'text-white group-hover:text-[#D4FF00]'
                  }`}
                >
                  CLOTHING
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm font-sans mt-1">
                  Siluetas amplias. Presencia sin esfuerzo.
                </p>
              </div>

              <div
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 ml-4 ${
                  clothingInView
                    ? 'bg-[#D4FF00] text-black border-[#D4FF00] rotate-45'
                    : 'bg-black/70 group-hover:bg-[#D4FF00] text-white group-hover:text-black border-white/20 group-hover:border-[#D4FF00] group-hover:rotate-45'
                }`}
              >
                <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
          </div>

          {/* Card 2: CAPS */}
          <div
            ref={capsCardRef}
            onClick={() => onSelectCategory('gorras')}
            className="group relative h-[380px] sm:h-[420px] lg:h-[460px] bg-[#121212] border border-[#202020] overflow-hidden cursor-pointer"
          >
            {/* Top Index Tag */}
            <div className="absolute top-5 left-5 z-20">
              <span className="text-xs font-mono tracking-widest text-gray-400 uppercase">
                02 / GORRAS
              </span>
            </div>

            {/* Background Image (Foto completa en blanco y negro) */}
            <img
              src="/images/caps-showcase.jpg"
              alt="Colección Gorras Streetwear"
              className={`w-full h-full object-cover object-center grayscale contrast-120 transition-all duration-700 ease-out ${
                capsInView
                  ? 'brightness-40 scale-102'
                  : 'brightness-90 group-hover:brightness-40 group-hover:scale-102'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  '/images/category-caps.jpg'
              }}
            />

            {/* Gradient Overlay (Detrás de la silueta para que resalte y no quede oscurecida) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none z-0" />

            {/* Silhouette Layer (Sobresale hacia el frente con escala 110%, elevación, sombra 3D y aura neon) */}
            <img
              src="/images/caps-silhouette.png"
              alt="Silueta Gorra Streetwear"
              className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-all duration-700 ease-out z-10 [filter:drop-shadow(0_20px_30px_rgba(0,0,0,0.95))_drop-shadow(0_0_25px_rgba(212,255,0,0.35))] ${
                capsInView
                  ? 'opacity-100 scale-110 -translate-y-2 contrast-115 brightness-105'
                  : 'opacity-0 group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-y-2 group-hover:contrast-115 group-hover:brightness-105'
              }`}
            />

            {/* Bottom Content */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between">
              <div>
                <h3
                  className={`font-display text-5xl sm:text-6xl lg:text-7xl uppercase font-black tracking-tight leading-none transition-colors ${
                    capsInView ? 'text-[#D4FF00]' : 'text-white group-hover:text-[#D4FF00]'
                  }`}
                >
                  CAPS
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm font-sans mt-1">
                  El detalle que cambia todo.
                </p>
              </div>

              <div
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 ml-4 ${
                  capsInView
                    ? 'bg-[#D4FF00] text-black border-[#D4FF00] rotate-45'
                    : 'bg-black/70 group-hover:bg-[#D4FF00] text-white group-hover:text-black border-white/20 group-hover:border-[#D4FF00] group-hover:rotate-45'
                }`}
              >
                <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
          </div>

        </div>

        {/* 03 Accesorios Horizontal Strip Banner */}
        <div
          onClick={() => onSelectCategory('accesorios')}
          className="group w-full bg-[#111111] hover:bg-[#161616] border border-[#202020] hover:border-[#383838] px-6 py-4.5 sm:py-5 flex items-center justify-between transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <span className="text-xs font-mono text-gray-500 font-bold uppercase mb-1 sm:mb-0">
              03
            </span>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <span className="font-display text-xl sm:text-2xl uppercase tracking-wider text-white font-bold group-hover:text-[#D4FF00] transition-colors">
                LOS DETALLES TAMBIÉN HABLAN.
              </span>
              <span className="text-xs sm:text-sm text-gray-400 font-sans">
                Bolsos, calcetas y accesorios para completar el fit.
              </span>
            </div>
          </div>

          <div className="text-[#D4FF00] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ml-4 shrink-0">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

      </div>
    </section>
  )
}

