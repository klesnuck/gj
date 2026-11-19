/**
 * Utility: Streetwear Dark Gray Studio Background Processor
 * 
 * Permite transformar imágenes de catálogo (con fondo transparente, negro/oscuro o claro)
 * en imágenes con fondo gris oscuro de estudio profesional (#383838 - #161616) con iluminación
 * suave tipo softbox y sombra ambiental natural, ideal tanto para prendas negras como blancas.
 */

export interface StudioOptions {
  tolerance?: number // Tolerancia de color de fondo (15 - 80, default: 35)
  radialGlow?: boolean // Spotlight suave en el centro
  feather?: number // Suavizado de bordes en píxeles (default: 2)
  addFloorShadow?: boolean // Sombra ambiental en la base
}

/**
 * Carga una imagen en un elemento HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
    img.src = src
  })
}

/**
 * Detecta si la imagen ya cuenta con píxeles transparentes (formato PNG recortado)
 */
function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const data = ctx.getImageData(0, 0, width, height).data
    // Muestreo rápido de píxeles
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] < 240) {
        return true
      }
    }
  } catch {
    // Si hay error de CORS en canvas, asumimos opaco
  }
  return false
}

/**
 * Aplica el fondo blanco de estudio profesional a una imagen con fondo transparente, oscuro o uniforme.
 */
export async function applyStudioWhiteBackground(
  imageSrc: string,
  options: StudioOptions = {}
): Promise<string> {
  const {
    tolerance = 32,
    radialGlow = true,
    feather = 2,
    addFloorShadow = true,
  } = options

  const img = await loadImage(imageSrc)

  // Dimensiones de trabajo optimizadas para catálogo (máximo 1400px para alta definición)
  const maxDim = 1400
  let targetWidth = img.width
  let targetHeight = img.height

  if (targetWidth > maxDim || targetHeight > maxDim) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * maxDim) / targetWidth)
      targetWidth = maxDim
    } else {
      targetWidth = Math.round((targetWidth * maxDim) / targetHeight)
      targetHeight = maxDim
    }
  }

  // 1. Canvas original
  const srcCanvas = document.createElement('canvas')
  srcCanvas.width = targetWidth
  srcCanvas.height = targetHeight
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true })
  if (!srcCtx) return imageSrc

  srcCtx.drawImage(img, 0, 0, targetWidth, targetHeight)

  // 2. Comprobar si ya tiene transparencia (ej. PNG proveniente de PhotoRoom / Remove.bg)
  const isAlreadyCutout = hasTransparency(srcCtx, targetWidth, targetHeight)

  let cutoutCanvas = srcCanvas

  if (!isAlreadyCutout) {
    // Algoritmo de flood fill / segmentación de bordes claros
    const imgData = srcCtx.getImageData(0, 0, targetWidth, targetHeight)
    const data = imgData.data
    const w = targetWidth
    const h = targetHeight

    // Muestrear las esquinas para determinar el color del fondo
    const samplePoints = [
      0, // (0, 0)
      (w - 1) * 4, // (w-1, 0)
      ((h - 1) * w) * 4, // (0, h-1)
      ((h - 1) * w + (w - 1)) * 4, // (w-1, h-1)
      Math.floor(w / 2) * 4, // centro arriba
    ]

    let avgR = 0, avgG = 0, avgB = 0
    for (const p of samplePoints) {
      avgR += data[p]
      avgG += data[p + 1]
      avgB += data[p + 2]
    }
    avgR /= samplePoints.length
    avgG /= samplePoints.length
    avgB /= samplePoints.length

    // Luminancia del fondo muestreado
    const bgLuminance = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB

    // Recortar fondos uniformes desde los bordes (oscuros/negros o claros/blancos)
    if (bgLuminance < 75 || bgLuminance > 155) {
      // Guardar copia de los alfas originales por si el recorte invade el centro de la prenda
      const mask = new Uint8Array(w * h)
      const visited = new Uint8Array(w * h)
      const queue: number[] = []

      // Iniciar flood fill desde todo el perímetro de la imagen
      for (let x = 0; x < w; x++) {
        queue.push(x) // borde superior (y = 0)
        queue.push((h - 1) * w + x) // borde inferior (y = h - 1)
      }
      for (let y = 1; y < h - 1; y++) {
        queue.push(y * w) // borde izquierdo (x = 0)
        queue.push(y * w + (w - 1)) // borde derecho (x = w - 1)
      }

      // Tolerancia estricta por canal para NO invadir prendas blancas sobre fondo blanco ni negras sobre negro
      const maxChannelDiff = bgLuminance < 75 ? 10 : Math.min(tolerance, 14)

      const isBgPixel = (idx: number): boolean => {
        const r = data[idx * 4]
        const g = data[idx * 4 + 1]
        const b = data[idx * 4 + 2]
        return (
          Math.abs(r - avgR) <= maxChannelDiff &&
          Math.abs(g - avgG) <= maxChannelDiff &&
          Math.abs(b - avgB) <= maxChannelDiff
        )
      }

      let head = 0
      let centerTotal = 0
      let centerErased = 0
      const cxMin = Math.floor(w * 0.3)
      const cxMax = Math.floor(w * 0.7)
      const cyMin = Math.floor(h * 0.3)
      const cyMax = Math.floor(h * 0.7)
      centerTotal = Math.max(1, (cxMax - cxMin) * (cyMax - cyMin))

      while (head < queue.length) {
        const pos = queue[head++]
        if (visited[pos]) continue
        visited[pos] = 1

        if (isBgPixel(pos)) {
          mask[pos] = 1

          const x = pos % w
          const y = Math.floor(pos / w)

          if (x >= cxMin && x < cxMax && y >= cyMin && y < cyMax) {
            centerErased++
          }

          // Vecinos (4-conectividad)
          if (x > 0 && !visited[pos - 1]) queue.push(pos - 1)
          if (x < w - 1 && !visited[pos + 1]) queue.push(pos + 1)
          if (y > 0 && !visited[pos - w]) queue.push(pos - w)
          if (y < h - 1 && !visited[pos + w]) queue.push(pos + w)
        }
      }

      // Protección inteligente: si el recorte se comió más del 35% del centro donde está la prenda
      // (ej. hoodie blanca sobre fondo blanco puro), cancelar el recorte para no destruir la prenda.
      const centerErasedRatio = centerErased / centerTotal
      if (centerErasedRatio <= 0.35) {
        for (let i = 0; i < w * h; i++) {
          if (mask[i] === 1) {
            data[i * 4 + 3] = 0
          }
        }

        // Suavizado de bordes (Feathering) en los límites de la máscara
        if (feather > 0) {
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const idx = y * w + x
              if (data[idx * 4 + 3] > 0) {
                const hasTranspNeighbor =
                  data[(idx - 1) * 4 + 3] === 0 ||
                  data[(idx + 1) * 4 + 3] === 0 ||
                  data[(idx - w) * 4 + 3] === 0 ||
                  data[(idx + w) * 4 + 3] === 0
                if (hasTranspNeighbor) {
                  data[idx * 4 + 3] = Math.round(data[idx * 4 + 3] * 0.75)
                }
              }
            }
          }
        }

        // Aplicar máscara transparente segura
        srcCtx.putImageData(imgData, 0, 0)
      }
    }
  }

  // 3. Crear Canvas Final con Fondo Gris Oscuro de Estudio Profesional
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = targetWidth
  finalCanvas.height = targetHeight
  const finalCtx = finalCanvas.getContext('2d')
  if (!finalCtx) return imageSrc

  // Fondo base gris oscuro carbón de estudio (#242424)
  finalCtx.fillStyle = '#242424'
  finalCtx.fillRect(0, 0, targetWidth, targetHeight)

  // Iluminación radial suave tipo softbox de estudio (destaca prendas negras y blancas por igual)
  if (radialGlow) {
    const cx = targetWidth / 2
    const cy = targetHeight * 0.45
    const rInner = Math.min(targetWidth, targetHeight) * 0.1
    const rOuter = Math.max(targetWidth, targetHeight) * 0.78

    const grad = finalCtx.createRadialGradient(cx, cy, rInner, cx, cy, rOuter)
    grad.addColorStop(0, 'rgba(62, 62, 62, 1)')    // #3e3e3e centro iluminado
    grad.addColorStop(0.45, 'rgba(42, 42, 42, 1)') // #2a2a2a tono medio
    grad.addColorStop(0.82, 'rgba(28, 28, 28, 1)') // #1c1c1c borde suave
    grad.addColorStop(1, 'rgba(20, 20, 20, 1)')    // #141414 viñeta sutil

    finalCtx.fillStyle = grad
    finalCtx.fillRect(0, 0, targetWidth, targetHeight)
  }

  // Sombra ambiental muy suave en la base de la prenda
  if (addFloorShadow) {
    const shadowCx = targetWidth / 2
    const shadowCy = targetHeight * 0.87
    const shadowRx = targetWidth * 0.34
    const shadowRy = targetHeight * 0.04

    finalCtx.save()
    finalCtx.beginPath()
    finalCtx.ellipse(shadowCx, shadowCy, shadowRx, shadowRy, 0, 0, 2 * Math.PI)
    const shadowGrad = finalCtx.createRadialGradient(
      shadowCx, shadowCy, 0,
      shadowCx, shadowCy, shadowRx
    )
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.38)')
    shadowGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.16)')
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    finalCtx.fillStyle = shadowGrad
    finalCtx.fill()
    finalCtx.restore()
  }

  // Dibujar la prenda recortada con sutil sombra de profundidad 3D
  finalCtx.save()
  finalCtx.shadowColor = 'rgba(0, 0, 0, 0.42)'
  finalCtx.shadowBlur = Math.round(targetWidth * 0.025)
  finalCtx.shadowOffsetY = Math.round(targetHeight * 0.012)
  finalCtx.drawImage(cutoutCanvas, 0, 0)
  finalCtx.restore()

  // Retornar en JPEG de alta calidad optimizado para web
  return finalCanvas.toDataURL('image/jpeg', 0.92)
}

// Aliases de compatibilidad
export const applyStudioGrayBackground = applyStudioWhiteBackground
export const applyStudioBlackBackground = applyStudioWhiteBackground

