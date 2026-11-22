import React, { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { MarqueeTicker } from './MarqueeTicker'

interface HeroProps {
  onShopDrop: () => void
  onExploreCaps?: () => void
}

/* ------------------------------------------------------------------ */
/*  Assets                                                             */
/* ------------------------------------------------------------------ */
const ASSET = {
  // portada: el arte "GJ CLOTHING & CAPS" sin la gorra (la gorra va encima como capa propia)
  poster: { src: '/images/showcase/hero-bg-nocap.webp', w: 1376, h: 768 },
  // gorra recortada del arte, y dónde está dentro de la portada (fracciones)
  posterCap: { src: '/images/showcase/hero-cap.webp', w: 732, h: 552, x: 0.35538, y: 0.28906, fw: 0.26599 },
  capPhoto: { src: '/images/showcase/cap-hero.webp', w: 980, h: 691 }, // foto HD, visera a la derecha
  capToon: { src: '/images/showcase/cap-toon.webp', w: 658, h: 395 }, // gorra dibujada
  mascot: { src: '/images/showcase/mascot-hd.webp', w: 350, h: 1371 },
  capInMascot: { x: 0.05714, y: 0.00438, w: 0.92857, h: 0.14588 },
}
const MASCOT_RATIO = ASSET.mascot.w / ASSET.mascot.h
const POSTER_RATIO = ASSET.poster.w / ASSET.poster.h

/* ---------------------------- math utils --------------------------- */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (t: number) => t * t * (3 - 2 * t)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

type Rect = { x: number; y: number; w: number; h: number }
type Pt = { x: number; y: number }
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) })
const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) })
const center = (r: Rect): Pt => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 })
const rectAt = (c: Pt, w: number, ratio: number): Rect => ({ x: c.x - w / 2, y: c.y - w / ratio / 2, w, h: w / ratio })

/** every moving layer is a 1000px-wide box moved with transform only (GPU, no layout) */
const BASE = 1000
const place = (el: HTMLElement | null, r: Rect, extra = '', opacity?: number) => {
  if (!el) return
  el.style.transform = `translate3d(${r.x}px, ${r.y}px, 0) scale(${r.w / BASE}) ${extra}`
  if (opacity !== undefined) {
    el.style.opacity = String(opacity)
    el.style.visibility = opacity < 0.002 ? 'hidden' : 'visible'
  }
}
/** rotate around the vertical axis through the layer's centre */
const pivot = (deg: number, extra = '') =>
  `translateX(${BASE / 2}px) perspective(${BASE * 1.6}px) rotateY(${deg}deg) ${extra} translateX(${-BASE / 2}px)`

/* ------------------------------------------------------------------ */
/*  Timeline 0 → 1                                                    */
/* ------------------------------------------------------------------ */
const T = {
  posterOut: [0.02, 0.1] as const, // el arte de fondo se desvanece
  move: [0.07, 0.27] as const, // la gorra viaja al centro
  flip1: [0.07, 0.16] as const, // gira: gorra del arte → foto HD (visera al otro lado)
  flip2: [0.19, 0.29] as const, // gira: foto → gorra dibujada
  revealStart: 0.3,
  hover: [0.32, 0.5] as const,
  settle: [0.44, 0.66] as const,
  land: 0.66,
  orbit: [0.64, 0.8] as const,
  out: [0.78, 1] as const,
}

export const Hero: React.FC<HeroProps> = ({ onShopDrop }) => {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const posterDeskRef = useRef<HTMLDivElement>(null)
  const posterMobRef = useRef<HTMLDivElement>(null)
  const charDeskRef = useRef<HTMLDivElement>(null)
  const charMobRef = useRef<HTMLDivElement>(null)
  const copyDeskRef = useRef<HTMLDivElement>(null)
  const copyMobRef = useRef<HTMLDivElement>(null)

  const posterCapRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const toonRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  const floorRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const stickerRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  const [reduced, setReduced] = useState(false)
  const [navH, setNavH] = useState(81)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => setReduced(mq.matches)
    onMq()
    mq.addEventListener?.('change', onMq)
    const header = document.querySelector('header')
    let ro: ResizeObserver | undefined
    if (header) {
      const upd = () => setNavH(Math.round(header.getBoundingClientRect().height))
      upd()
      ro = new ResizeObserver(upd)
      ro.observe(header)
    }
    return () => {
      mq.removeEventListener?.('change', onMq)
      ro?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (reduced) return
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return

    let raf = 0
    let target = 0
    let current = 0
    let L = { W: 0, H: 0, mobile: false, capStart: { x: 0, y: 0, w: 0, h: 0 } as Rect, charEnd: { x: 0, y: 0, w: 0, h: 0 } as Rect }

    const measure = () => {
      const sr = stage.getBoundingClientRect()
      const W = sr.width
      const H = sr.height
      const mobile = W < 1024
      const rel = (el: HTMLElement | null): Rect => {
        const r = el!.getBoundingClientRect()
        return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height }
      }
      // the poster layer is scaled by the animation; measure its untransformed box
      const posterEl = mobile ? posterMobRef.current : posterDeskRef.current
      const prevT = posterEl!.style.transform
      posterEl!.style.transform = 'none'
      const poster = rel(posterEl)
      posterEl!.style.transform = prevT
      const pc = ASSET.posterCap
      const capW = pc.fw * poster.w
      const capStart = { x: poster.x + pc.x * poster.w, y: poster.y + pc.y * poster.h, w: capW, h: capW / (pc.w / pc.h) }
      const cb = rel(mobile ? charMobRef.current : charDeskRef.current)
      const ch = Math.min(cb.h, cb.w / MASCOT_RATIO)
      const charEnd = { x: cb.x + (cb.w - ch * MASCOT_RATIO) / 2, y: cb.y + cb.h - ch, w: ch * MASCOT_RATIO, h: ch }
      L = { W, H, mobile, capStart, charEnd }
    }

    const readScroll = () => {
      const r = section.getBoundingClientRect()
      const total = section.offsetHeight - stage.offsetHeight
      target = clamp(-(r.top - navH) / Math.max(total, 1))
    }

    const render = (p: number) => {
      const { W, H, mobile, capStart, charEnd } = L
      const U = Math.min(H, W * (mobile ? 1.55 : 1.1))

      /* ---------------- character / camera ---------------- */
      const headY = H * (mobile ? 0.42 : 0.45)
      const frame = (h: number, dy = 0): Rect => ({
        x: W / 2 - (h * MASCOT_RATIO) / 2,
        y: headY - (ASSET.capInMascot.y + ASSET.capInMascot.h * 0.55) * h + dy,
        w: h * MASCOT_RATIO,
        h,
      })
      const closeH = U * (mobile ? 1.8 : 2.0)
      const wide = frame(closeH * 0.7, H * 0.05)
      const close = frame(closeH)
      let charR = lerpRect(wide, close, easeInOut(seg(p, T.revealStart, T.land)))
      const orbitT = easeInOut(seg(p, ...T.orbit))
      charR = { ...charR, x: charR.x + Math.sin(orbitT * Math.PI) * (mobile ? 0.035 : 0.06) * W }
      const outT = easeInOut(seg(p, ...T.out))
      if (outT > 0) charR = lerpRect(charR, charEnd, outT)
      const capTarget: Rect = {
        x: charR.x + ASSET.capInMascot.x * charR.w,
        y: charR.y + ASSET.capInMascot.y * charR.h,
        w: ASSET.capInMascot.w * charR.w,
        h: ASSET.capInMascot.h * charR.h,
      }
      const headC = center(capTarget)

      /* ---------------- cap path: centre C + width S ---------------- */
      const mv = easeInOut(seg(p, ...T.move))
      const centerS = Math.min(W * (mobile ? 0.8 : 0.4), H * 0.7)
      let C = lerpPt(center(capStart), { x: W / 2, y: H * 0.47 }, mv)
      let S = lerp(capStart.w, centerS, mv) * (1 + 0.08 * Math.sin(mv * Math.PI))
      const hoverT = easeInOut(seg(p, ...T.hover))
      const settleT = easeInOut(seg(p, ...T.settle))
      const k = lerp(1.75, 1.0, settleT)
      const lift = Math.min(lerp(0.4, 0, easeOut(settleT)) * capTarget.h, ((k - 1) * capTarget.h) / 2 + capTarget.h * 0.02)
      if (hoverT > 0) {
        C = lerpPt(C, { x: headC.x, y: headC.y - lift }, hoverT)
        S = lerp(S, capTarget.w * k, hoverT)
      }

      /* ---------------- rotation: only one cap is ever visible ---------------- */
      // flip 1: the artwork's cap turns edge-on, the HD photo comes out the other side
      const f1 = easeInOut(seg(p, ...T.flip1)) * 180
      const sway = lerp(0, 22, easeInOut(seg(p, T.flip1[1], T.flip2[0] + 0.02)))
      const f2 = easeInOut(seg(p, ...T.flip2)) * 180
      let photoYaw = f1 < 90 ? -90 : -90 + (f1 - 90)
      if (f1 >= 180) photoYaw = sway + (f2 * (90 - sway)) / 90
      const toonYaw = f2 <= 90 ? -90 : -90 + (f2 - 90)
      const tilt = Math.sin(mv * Math.PI) * 3
      const vis = (yaw: number) => Math.abs(yaw) < 84

      place(posterCapRef.current, rectAt(C, S, ASSET.posterCap.w / ASSET.posterCap.h), pivot(f1), f1 < 90 && vis(f1) ? 1 : 0)
      place(
        photoRef.current,
        rectAt(C, S, ASSET.capPhoto.w / ASSET.capPhoto.h),
        pivot(photoYaw, `rotateZ(${tilt}deg)`),
        f1 >= 90 && f2 < 90 && vis(photoYaw) ? 1 : 0,
      )
      place(toonRef.current, rectAt(C, S, ASSET.capToon.w / ASSET.capToon.h), pivot(toonYaw), f2 >= 90 && vis(toonYaw) && p < T.land ? 1 : 0)

      /* ---------------- poster + copy ---------------- */
      const po = ease(seg(p, ...T.posterOut))
      for (const el of [posterDeskRef.current, posterMobRef.current]) {
        if (!el) continue
        el.style.opacity = String(1 - po)
        el.style.transform = `scale(${1 + po * 0.12})`
        el.style.filter = po > 0.02 ? `blur(${po * 10}px)` : 'none'
      }
      const cOut = ease(seg(p, ...T.posterOut))
      const cIn = easeOut(seg(p, T.out[0] + 0.08, 1))
      const co = p < 0.5 ? 1 - cOut : cIn
      for (const el of [copyDeskRef.current, copyMobRef.current]) {
        if (!el) continue
        el.style.opacity = String(co)
        el.style.translate = `${p < 0.5 ? -30 * cOut : -24 * (1 - cIn)}px 0`
        el.style.pointerEvents = co > 0.6 ? 'auto' : 'none'
      }

      /* ---------------- character ---------------- */
      const charIn = easeOut(seg(p, T.revealStart, T.revealStart + 0.12))
      const yaw = Math.sin(orbitT * Math.PI) * -12 * (1 - outT)
      if (mascotRef.current) {
        const bounce = Math.sin(seg(p, T.land, T.land + 0.04) * Math.PI) * 0.012
        place(mascotRef.current, charR, `perspective(${BASE * 3}px) rotateY(${yaw}deg) scale(${1 + bounce}, ${1 - bounce})`, charIn)
        const blur = (1 - charIn) * 12
        mascotRef.current.style.filter = blur > 0.2 ? `blur(${blur}px)` : 'none'
      }

      /* ---------------- light ---------------- */
      if (spotRef.current) {
        const sp = p < T.revealStart ? C : lerpPt(C, headC, seg(p, T.revealStart, T.land))
        spotRef.current.style.transform = `translate3d(${sp.x - 650}px, ${sp.y - 650}px, 0)`
        spotRef.current.style.opacity = String(seg(p, 0.03, 0.12) * (1 - outT * 0.6))
      }
      if (glowRef.current) {
        const c = center(charR)
        const gw = charR.w * 3
        const gh = charR.h * 1.05
        glowRef.current.style.transform = `translate3d(${c.x - gw / 2}px, ${c.y - gh / 2}px, 0)`
        glowRef.current.style.width = `${gw}px`
        glowRef.current.style.height = `${gh}px`
        glowRef.current.style.opacity = String(charIn * lerp(0.3, 0.75, outT))
      }
      if (floorRef.current) {
        const sw = charR.w * 0.72
        floorRef.current.style.transform = `translate3d(${charR.x + (charR.w - sw) / 2}px, ${charR.y + charR.h - 6}px, 0)`
        floorRef.current.style.width = `${sw}px`
        floorRef.current.style.opacity = String(seg(outT, 0.5, 1))
      }
      if (flashRef.current) {
        const f = seg(p, T.land - 0.01, T.land + 0.05)
        const size = capTarget.w * (1.1 + f * 1.4)
        flashRef.current.style.transform = `translate3d(${headC.x - size / 2}px, ${headC.y - size / 2}px, 0)`
        flashRef.current.style.width = `${size}px`
        flashRef.current.style.height = `${size}px`
        flashRef.current.style.opacity = String(f > 0 && f < 1 ? Math.sin(f * Math.PI) * 0.3 : 0)
      }
      if (stickerRef.current) {
        const s = easeOut(seg(p, 0.94, 1))
        stickerRef.current.style.transform = `translate3d(${capTarget.x + capTarget.w * 0.86}px, ${capTarget.y + capTarget.h * 0.18}px, 0) rotate(${lerp(-25, 8, s)}deg) scale(${s})`
        stickerRef.current.style.opacity = String(s)
      }
      if (hintRef.current) hintRef.current.style.opacity = String(1 - seg(p, 0.01, 0.05))
    }

    const tick = () => {
      const diff = target - current
      current = Math.abs(diff) < 0.0003 ? target : current + diff * 0.11
      render(current)
      raf = current !== target ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      readScroll()
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onResize = () => {
      measure()
      readScroll()
      current = target
      render(current)
    }

    onResize()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', onResize)
    const ro = new ResizeObserver(onResize)
    ro.observe(stage)
    document.fonts?.ready.then(onResize).catch(() => {})
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [reduced, navH])

  const layer = (ratio: number, z: number): React.CSSProperties => ({
    position: 'absolute',
    left: 0,
    top: 0,
    width: BASE,
    height: BASE / ratio,
    transformOrigin: '0 0',
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    zIndex: z,
  })

  /* -------- reduced motion: static poster -------- */
  if (reduced) {
    return (
      <section className="relative w-full bg-black">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <img src="/images/showcase/hero-bg.webp" alt="GJ Clothing & Caps" className="w-full h-auto" />
          <div className="mt-6">
            <HeroCopy onShopDrop={onShopDrop} />
          </div>
        </div>
        <MarqueeTicker />
      </section>
    )
  }

  return (
    <section ref={sectionRef} aria-label="GJ Clothing & Caps — presentación" className="relative w-full bg-black h-[340vh] lg:h-[380vh]">
      <div ref={stageRef} className="sticky w-full overflow-hidden bg-black" style={{ top: navH, height: `calc(100svh - ${navH}px)` }}>
        {/* ---------- luz ---------- */}
        <div
          ref={spotRef}
          className="absolute left-0 top-0 w-[1300px] h-[1300px] rounded-full pointer-events-none opacity-0"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 40%, transparent 66%)', willChange: 'transform, opacity' }}
        />
        <div
          ref={glowRef}
          className="absolute left-0 top-0 pointer-events-none opacity-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,255,0,0.22) 0%, rgba(212,255,0,0.06) 42%, transparent 70%)', willChange: 'transform, opacity' }}
        />

        {/* ================= ESCRITORIO: la portada a escala, con los textos encima ================= */}
        <div
          className="hidden lg:block absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 [container-type:inline-size]"
          style={{ width: `min(100%, calc((100svh - ${navH}px) * 1.95))`, aspectRatio: `${POSTER_RATIO}` }}
        >
          <div ref={posterDeskRef} className="absolute inset-0 will-change-transform" style={{ transformOrigin: '50% 45%' }}>
            <img src={ASSET.poster.src} alt="" draggable={false} className="w-full h-full select-none" />
          </div>
          <div ref={copyDeskRef} className="absolute z-30 left-[7.85%] top-[36%] w-[34%]">
            <PosterCopy onShopDrop={onShopDrop} />
          </div>
          <div ref={charDeskRef} className="absolute left-[60%] right-[8%] top-[9%] bottom-[16%]" />
        </div>

        {/* ================= MÓVIL / TABLET ================= */}
        <div className="lg:hidden absolute inset-x-0 top-0 bottom-[46px] flex flex-col px-4 sm:px-6">
          <div ref={copyMobRef} className="relative z-30 pt-6 sm:pt-10">
            <HeroCopy onShopDrop={onShopDrop} />
          </div>
          <div className="relative flex-1 min-h-0">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
              <div ref={posterMobRef} className="shrink-0 w-[160%] will-change-transform" style={{ aspectRatio: `${POSTER_RATIO}`, transformOrigin: '50% 45%' }}>
                <img src={ASSET.poster.src} alt="" draggable={false} className="w-full h-full select-none" />
              </div>
            </div>
            <div ref={charMobRef} className="absolute inset-x-0 top-[4%] bottom-[4%]" />
          </div>
        </div>

        {/* ---------- actores ---------- */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div ref={floorRef} className="absolute left-0 top-0 h-3 rounded-full bg-black blur-[3px] opacity-0" style={{ willChange: 'transform, opacity' }} />
          <div ref={mascotRef} style={{ ...layer(MASCOT_RATIO, 1), opacity: 0 }}>
            <img src={ASSET.mascot.src} alt="" draggable={false} className="w-full h-full select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)]" />
          </div>
          <div
            ref={flashRef}
            className="absolute left-0 top-0 rounded-full opacity-0"
            style={{ zIndex: 2, background: 'radial-gradient(circle, transparent 54%, rgba(212,255,0,0.35) 60%, transparent 66%)', willChange: 'transform, opacity' }}
          />
          <div ref={posterCapRef} style={{ ...layer(ASSET.posterCap.w / ASSET.posterCap.h, 4) }}>
            <img src={ASSET.posterCap.src} alt="Gorra New York Yankees azul cielo" draggable={false} className="w-full h-full select-none" />
          </div>
          <div ref={photoRef} style={{ ...layer(ASSET.capPhoto.w / ASSET.capPhoto.h, 4), opacity: 0 }}>
            <img src={ASSET.capPhoto.src} alt="" draggable={false} className="w-full h-full select-none drop-shadow-[0_30px_40px_rgba(0,0,0,0.7)]" />
          </div>
          <div ref={toonRef} style={{ ...layer(ASSET.capToon.w / ASSET.capToon.h, 5), opacity: 0 }}>
            <img src={ASSET.capToon.src} alt="" draggable={false} className="w-full h-full select-none" />
          </div>
          <div ref={stickerRef} className="absolute left-0 top-0 origin-top-left opacity-0" style={{ zIndex: 8, willChange: 'transform, opacity' }}>
            <span className="inline-block px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-[#D4FF00] text-black font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg">GJ*</span>
          </div>
        </div>

        {/* ---------- indicador + barra inferior ---------- */}
        <div ref={hintRef} className="absolute bottom-[62px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none">
          <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] text-gray-400 uppercase">Desliza</span>
          <span className="block w-px h-7 bg-gradient-to-b from-[#D4FF00] to-transparent animate-pulse" />
        </div>
        <div className="absolute bottom-0 inset-x-0 z-40">
          <MarqueeTicker />
        </div>
      </div>
    </section>
  )
}

/* Texto de la portada en escritorio: escala junto con el arte (unidades cqw) */
const PosterCopy: React.FC<{ onShopDrop: () => void }> = ({ onShopDrop }) => (
  <div className="flex flex-col">
    <div className="inline-flex items-center gap-[0.6cqw] mb-[1.2cqw]">
      <span className="w-[0.55cqw] h-[0.55cqw] min-w-[6px] min-h-[6px] rounded-full bg-[#D4FF00] animate-pulse" />
      <span className="text-[max(12px,1.05cqw)] font-mono tracking-widest text-[#D4FF00] font-semibold uppercase">SLW</span>
    </div>
    <h1 className="font-display text-[7cqw] leading-[0.92] uppercase tracking-tight text-white select-none">
      REVIVIENDO.
      <br />
      EL HYPE.
    </h1>
    <p className="mt-[2.6cqw] text-gray-400 text-[max(14px,1.35cqw)] leading-snug">No seguimos el hype. Lo llevamos puesto.</p>
    <div className="mt-[2.6cqw] flex">
      <button
        onClick={onShopDrop}
        className="inline-flex items-center justify-center gap-[0.8cqw] px-[2cqw] py-[1.15cqw] bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-[max(12px,1.1cqw)] uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 shadow-[0_0_24px_rgba(212,255,0,0.4)] cursor-pointer"
      >
        <span>VER LO MÁS VENDIDO</span>
        <ArrowUpRight className="w-[1.1cqw] h-[1.1cqw] min-w-[14px] min-h-[14px] stroke-[2.5]" />
      </button>
    </div>
    <span className="mt-[2.8cqw] text-[max(10px,0.85cqw)] font-mono uppercase tracking-widest text-gray-500">ESTAMOS DE VUELTA!!.</span>
  </div>
)

const HeroCopy: React.FC<{ onShopDrop: () => void }> = ({ onShopDrop }) => (
  <div className="flex flex-col space-y-3 sm:space-y-5">
    <div className="inline-flex items-center gap-2">
      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D4FF00] animate-pulse" />
      <span className="text-[11px] sm:text-sm font-mono tracking-widest text-[#D4FF00] font-semibold uppercase">SLW</span>
    </div>
    <h1 className="font-display text-[15vw] sm:text-7xl md:text-8xl [@media(max-height:520px)]:text-5xl leading-[0.86] font-black uppercase tracking-tight text-white select-none">
      REVIVIENDO.
      <br />
      EL HYPE.
    </h1>
    <p className="[@media(max-height:520px)]:hidden text-gray-400 text-sm sm:text-base max-w-md leading-snug">No seguimos el hype. Lo llevamos puesto.</p>
    <div className="flex">
      <button
        onClick={onShopDrop}
        className="inline-flex items-center justify-center gap-2.5 px-5 sm:px-7 py-3 sm:py-3.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 shadow-[0_0_24px_rgba(212,255,0,0.35)] cursor-pointer"
      >
        <span>VER LO MÁS VENDIDO</span>
        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  </div>
)
