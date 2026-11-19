/**
 * Utility: Streetwear White Studio Background Processor
 * 
 * Permite transformar imágenes de catálogo (con fondo transparente, negro/oscuro o claro)
 * en imágenes con fondo blanco de estudio profesional (#ffffff - #ececec) con iluminación
 * suave tipo softbox y sombra ambiental sutil, al estilo de Farfetch, SSENSE y Essentials.
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

    // Recortar fondos uniformes desde los bordes (oscuros/negros o claros/grises)
    if (bgLuminance < 80 || bgLuminance > 145) {
      // Matriz de visitados para flood fill conectado desde los bordes
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

      // Tolerancia más precisa en fondos oscuros para no recortar detalles de prendas negras
      const effectiveTol = bgLuminance < 80 ? Math.min(tolerance, 24) : tolerance
      const tolSq = effectiveTol * effectiveTol * 3

      // Distancia euclidiana respecto al color de fondo
      const isBgPixel = (idx: number): boolean => {
        const r = data[idx * 4]
        const g = data[idx * 4 + 1]
        const b = data[idx * 4 + 2]
        const distSq = (r - avgR) ** 2 + (g - avgG) ** 2 + (b - avgB) ** 2
        if (bgLuminance > 145) {
          return distSq <= tolSq || (r > 238 && g > 238 && b > 238)
        }
        return distSq <= tolSq
      }

      let head = 0
      while (head < queue.length) {
        const pos = queue[head++]
        if (visited[pos]) continue
        visited[pos] = 1

        if (isBgPixel(pos)) {
          // Marcar como transparente en el canvas recortado
          data[pos * 4 + 3] = 0

          const x = pos % w
          const y = Math.floor(pos / w)

          // Vecinos (4-conectividad)
          if (x > 0 && !visited[pos - 1]) queue.push(pos - 1)
          if (x < w - 1 && !visited[pos + 1]) queue.push(pos + 1)
          if (y > 0 && !visited[pos - w]) queue.push(pos - w)
          if (y < h - 1 && !visited[pos + w]) queue.push(pos + w)
        }
      }

      // Suavizado de bordes (Feathering) en los límites de la máscara
      if (feather > 0) {
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x
            if (data[idx * 4 + 3] > 0) {
              // Si tiene vecinos transparentes, suavizar el alfa
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

      // Aplicar máscara transparente
      srcCtx.putImageData(imgData, 0, 0)
    }
  }

  // 3. Crear Canvas Final con Fondo Blanco de Estudio Profesional
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = targetWidth
  finalCanvas.height = targetHeight
  const finalCtx = finalCanvas.getContext('2d')
  if (!finalCtx) return imageSrc

  // Fondo base blanco de estudio suave (#f5f5f5)
  finalCtx.fillStyle = '#f5f5f5'
  finalCtx.fillRect(0, 0, targetWidth, targetHeight)

  // Iluminación radial suave tipo softbox de estudio fotográfico
  if (radialGlow) {
    const cx = targetWidth / 2
    const cy = targetHeight * 0.45
    const rInner = Math.min(targetWidth, targetHeight) * 0.12
    const rOuter = Math.max(targetWidth, targetHeight) * 0.78

    const grad = finalCtx.createRadialGradient(cx, cy, rInner, cx, cy, rOuter)
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
    grad.addColorStop(0.45, 'rgba(248, 248, 248, 1)')
    grad.addColorStop(0.82, 'rgba(236, 236, 236, 1)')
    grad.addColorStop(1, 'rgba(226, 226, 226, 1)')

    finalCtx.fillStyle = grad
    finalCtx.fillRect(0, 0, targetWidth, targetHeight)
  }

  // Sombra ambiental sutil en la base de la prenda (contacto con piso de estudio)
  if (addFloorShadow) {
    const shadowCx = targetWidth / 2
    const shadowCy = targetHeight * 0.88
    const shadowRx = targetWidth * 0.34
    const shadowRy = targetHeight * 0.045

    finalCtx.save()
    finalCtx.beginPath()
    finalCtx.ellipse(shadowCx, shadowCy, shadowRx, shadowRy, 0, 0, 2 * Math.PI)
    const shadowGrad = finalCtx.createRadialGradient(
      shadowCx, shadowCy, 0,
      shadowCx, shadowCy, shadowRx
    )
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.16)')
    shadowGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.07)')
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    finalCtx.fillStyle = shadowGrad
    finalCtx.fill()
    finalCtx.restore()
  }

  // Dibujar la prenda recortada con sutil sombra de profundidad 3D sobre fondo claro
  finalCtx.save()
  finalCtx.shadowColor = 'rgba(0, 0, 0, 0.18)'
  finalCtx.shadowBlur = Math.round(targetWidth * 0.022)
  finalCtx.shadowOffsetY = Math.round(targetHeight * 0.012)
  finalCtx.drawImage(cutoutCanvas, 0, 0)
  finalCtx.restore()

  // Retornar en JPEG de alta calidad optimizado para web
  return finalCanvas.toDataURL('image/jpeg', 0.92)
}

// Alias de compatibilidad
export const applyStudioBlackBackground = applyStudioWhiteBackground

