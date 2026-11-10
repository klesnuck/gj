export const COLOR_NAME_TO_HEX: Record<string, string> = {
  gris: '#8E8E93',
  grey: '#8E8E93',
  gray: '#8E8E93',
  'gris jaspe': '#9CA3AF',
  'gris oscuro': '#4B5563',
  'gris claro': '#D1D5DB',
  negro: '#111111',
  black: '#111111',
  blanco: '#F3F4F6',
  white: '#F3F4F6',
  beige: '#D4C5B9',
  stone: '#C4B69F',
  arena: '#D2B48C',
  marron: '#5C4033',
  cafe: '#4A3728',
  verde: '#4A5243',
  olivo: '#556B2F',
  azul: '#1E3A8A',
  navy: '#0F172A',
  marino: '#0F172A',
  rojo: '#DC2626',
  tinto: '#7F1D1D',
  vino: '#581845',
  amarillo: '#FACC15',
  naranja: '#EA580C',
  rosa: '#EC4899',
  morado: '#7E22CE',
}

/**
 * Resolves a display hex code for a color circle.
 * If specs say "Gris" but color is "#171717", it resolves to the actual grey hex!
 */
export function resolveColorHex(color: string, specs?: string | null): string {
  if (specs) {
    const firstPart = specs.split('/')[0].trim().toLowerCase()
    for (const [name, hex] of Object.entries(COLOR_NAME_TO_HEX)) {
      if (firstPart.includes(name)) {
        return hex
      }
    }
  }

  const clean = color.toLowerCase().trim()
  if (COLOR_NAME_TO_HEX[clean]) {
    return COLOR_NAME_TO_HEX[clean]
  }

  return color
}

/**
 * Given a color name entered by the user (e.g. "Gris"), returns the best matching hex.
 */
export function getColorHexFromName(name: string): string | null {
  const clean = name.toLowerCase().trim()
  for (const [key, hex] of Object.entries(COLOR_NAME_TO_HEX)) {
    if (clean.includes(key)) {
      return hex
    }
  }
  return null
}

