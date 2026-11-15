/**
 * Mercado Pago Integration Helper for gj. CLOTHING AND CAPS
 * 
 * Proporciona soporte completo para:
 * 1. Tokenización segura de tarjetas con el SDK oficial v2 de Mercado Pago.
 * 2. Detección automática del emisor de tarjeta (Visa, Mastercard, Amex, Carnet).
 * 3. Formateo en vivo de número de tarjeta, vencimiento y código de seguridad.
 * 4. Cálculo de mensualidades / cuotas.
 * 5. Modo Sandbox / Pruebas para desarrollo y modo Producción cuando se coloca la llave real.
 */

import { supabase } from './supabase'

declare global {
  interface Window {
    MercadoPago?: any
  }
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'carnet' | 'unknown'

export interface CardTokenPayload {
  cardNumber: string
  cardholderName: string
  cardExpirationMonth: string
  cardExpirationYear: string
  securityCode: string
  docType?: string
  docNumber?: string
}

export interface TokenizeResult {
  success: boolean
  token?: string
  brand?: CardBrand
  lastFour?: string
  errorMessage?: string
}

const STORAGE_KEY_PUBLIC_KEY = 'gj_mercadopago_public_key'
const STORAGE_KEY_ACCESS_TOKEN = 'gj_mercadopago_access_token'

/**
 * Obtiene la llave pública de Mercado Pago configurada (de variables de entorno o guardada en admin).
 */
export function getMercadoPagoPublicKey(): string {
  const envKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || ''
  if (envKey.trim()) return envKey.trim()

  try {
    const stored = localStorage.getItem(STORAGE_KEY_PUBLIC_KEY) || ''
    return stored.trim()
  } catch {
    return ''
  }
}

/**
 * Guarda la llave pública en la configuración local de la tienda.
 */
export function saveMercadoPagoPublicKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_PUBLIC_KEY, key.trim())
  } catch (e) {
    console.warn(e)
  }
}

/**
 * Obtiene el Access Token para el backend.
 */
export function getMercadoPagoAccessToken(): string {
  try {
    return (localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN) || '').trim()
  } catch {
    return ''
  }
}

/**
 * Guarda el Access Token.
 */
export function saveMercadoPagoAccessToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, token.trim())
  } catch (e) {
    console.warn(e)
  }
}

const CONFIG_DROP_CODE = '__MERCADOPAGO_CONFIG__'

/**
 * Guarda las credenciales de Mercado Pago en la nube (Supabase)
 * para que funcionen automáticamente en cualquier celular, laptop o cliente.
 */
export async function saveMercadoPagoConfigToSupabase(publicKey: string, accessToken: string): Promise<boolean> {
  saveMercadoPagoPublicKey(publicKey)
  saveMercadoPagoAccessToken(accessToken)

  if (!supabase) return false

  try {
    const { error } = await supabase.from('drops').upsert({
      code: CONFIG_DROP_CODE,
      name: 'Mercado Pago Cloud Credentials',
      tagline: publicKey.trim(),
      description: accessToken.trim(),
      volume: 'CONFIG',
      is_active: false,
    }, { onConflict: 'code' })

    if (error) {
      console.warn('Error al sincronizar Mercado Pago en Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Error al guardar credenciales en Supabase:', err)
    return false
  }
}

/**
 * Sincroniza las credenciales de Mercado Pago desde la nube (Supabase)
 * para que cualquier dispositivo nuevo (como tu celular) las tenga al instante.
 */
export async function syncMercadoPagoConfigFromSupabase(): Promise<{ publicKey: string; accessToken: string } | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('drops')
      .select('tagline, description')
      .eq('code', CONFIG_DROP_CODE)
      .maybeSingle()

    if (!error && data) {
      const pubKey = (data.tagline || '').trim()
      const token = (data.description || '').trim()
      if (pubKey) {
        saveMercadoPagoPublicKey(pubKey)
      }
      if (token) {
        saveMercadoPagoAccessToken(token)
      }
      return { publicKey: pubKey, accessToken: token }
    }
  } catch (err) {
    console.warn('Error sincronizando credenciales MP desde Supabase:', err)
  }
  return null
}

/**
 * Indica si Mercado Pago tiene una llave válida configurada.
 */
export function isMercadoPagoConfigured(): boolean {
  const key = getMercadoPagoPublicKey()
  return Boolean(key && (key.startsWith('TEST-') || key.startsWith('APP_USR-')))
}

/**
 * Indica si la llave actual es de modo Sandbox / Pruebas.
 */
export function isSandboxKey(key?: string): boolean {
  const target = key || getMercadoPagoPublicKey()
  return target.startsWith('TEST-')
}

/**
 * Carga dinámicamente el SDK oficial de Mercado Pago v2 en la ventana del navegador.
 */
export function loadMercadoPagoSDK(): Promise<any> {
  return new Promise((resolve) => {
    if (window.MercadoPago) {
      const pubKey = getMercadoPagoPublicKey()
      try {
        const mp = new window.MercadoPago(pubKey || 'TEST-DEMO-KEY', { locale: 'es-MX' })
        resolve(mp)
      } catch (err) {
        resolve(null)
      }
      return
    }

    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.async = true
    script.onload = () => {
      try {
        const pubKey = getMercadoPagoPublicKey()
        const mp = new window.MercadoPago(pubKey || 'TEST-DEMO-KEY', { locale: 'es-MX' })
        resolve(mp)
      } catch (err) {
        resolve(null)
      }
    }
    script.onerror = () => {
      console.warn('No se pudo cargar el SDK oficial de Mercado Pago; se usará modo simulación local.')
      resolve(null)
    }
    document.head.appendChild(script)
  })
}

/**
 * Detecta la marca de la tarjeta basándose en los primeros dígitos (BIN).
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const clean = cardNumber.replace(/\D/g, '')
  if (/^4/.test(clean)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard'
  if (/^3[47]/.test(clean)) return 'amex'
  if (/^(50|58|60|62|63)/.test(clean)) return 'carnet'
  return 'unknown'
}

/**
 * Formatea el número de tarjeta con espacios cada 4 dígitos (o 4-6-5 para Amex).
 */
export function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 16)
  if (clean.startsWith('34') || clean.startsWith('37')) {
    // Formato Amex: 4 - 6 - 5
    const p1 = clean.slice(0, 4)
    const p2 = clean.slice(4, 10)
    const p3 = clean.slice(10, 15)
    return [p1, p2, p3].filter(Boolean).join(' ')
  }
  // Formato estándar: 4 - 4 - 4 - 4
  const parts: string[] = []
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.slice(i, i + 4))
  }
  return parts.join(' ')
}

/**
 * Formatea la fecha de vencimiento a MM / AA.
 */
export function formatCardExpiry(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 4)
  if (clean.length >= 3) {
    return `${clean.slice(0, 2)} / ${clean.slice(2, 4)}`
  }
  if (clean.length === 2 && !value.includes('/')) {
    return `${clean} / `
  }
  return clean
}

/**
 * Tokeniza una tarjeta de crédito o débito con el SDK de Mercado Pago.
 * Si no hay llave de Mercado Pago configurada, genera un token seguro de prueba para que
 * el flujo de la tienda funcione de principio a fin.
 */
export async function tokenizeCard(payload: CardTokenPayload): Promise<TokenizeResult> {
  const cleanNumber = payload.cardNumber.replace(/\D/g, '')
  const brand = detectCardBrand(cleanNumber)
  const lastFour = cleanNumber.slice(-4) || '0000'

  // Validaciones básicas de integridad
  if (cleanNumber.length < 15 || cleanNumber.length > 16) {
    return {
      success: false,
      errorMessage: 'El número de tarjeta debe tener entre 15 y 16 dígitos.',
    }
  }

  const expMonth = parseInt(payload.cardExpirationMonth, 10)
  if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
    return {
      success: false,
      errorMessage: 'El mes de vencimiento debe estar entre 01 y 12.',
    }
  }

  const expYear = parseInt(payload.cardExpirationYear, 10)
  const currentYear = new Date().getFullYear() % 100
  if (isNaN(expYear) || expYear < currentYear) {
    return {
      success: false,
      errorMessage: 'La tarjeta ingresada se encuentra vencida.',
    }
  }

  if (payload.securityCode.length < 3) {
    return {
      success: false,
      errorMessage: 'El código de seguridad (CVV) es inválido.',
    }
  }

  const pubKey = getMercadoPagoPublicKey()

  // Si hay llave real configurada, intentar tokenizar con el SDK v2 de Mercado Pago
  if (pubKey && (pubKey.startsWith('TEST-') || pubKey.startsWith('APP_USR-'))) {
    try {
      const mp = await loadMercadoPagoSDK()
      if (mp && typeof mp.createCardToken === 'function') {
        const fullYear = expYear < 100 ? 2000 + expYear : expYear
        const response = await mp.createCardToken({
          cardNumber: cleanNumber,
          cardholderName: payload.cardholderName.trim(),
          cardExpirationMonth: payload.cardExpirationMonth.padStart(2, '0'),
          cardExpirationYear: fullYear.toString(),
          securityCode: payload.securityCode,
        })

        if (response && response.id) {
          return {
            success: true,
            token: response.id,
            brand,
            lastFour,
          }
        }
      }
    } catch (err: any) {
      console.warn('Error al tokenizar con Mercado Pago SDK:', err)
      return {
        success: false,
        errorMessage:
          err?.message ||
          'No se pudo verificar la tarjeta con Mercado Pago. Verifica los datos o la llave pública.',
      }
    }
  }

  // Modo Simulación Segura (Demo/Sandbox sin llave cargada todavía)
  // Permite al dueño de la tienda probar la compra completa antes de ingresar su llave real
  const mockToken = `tok_mp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  return {
    success: true,
    token: mockToken,
    brand,
    lastFour,
  }
}

/**
 * Retorna las opciones de cuotas / mensualidades calculadas para el total del carrito.
 */
export function getInstallmentOptions(totalAmount: number): {
  installments: number
  amountPerInstallment: number
  label: string
}[] {
  const options = [
    {
      installments: 1,
      amountPerInstallment: totalAmount,
      label: `1 pago de $${totalAmount.toLocaleString('es-MX')} MXN (Sin intereses)`,
    },
  ]

  // Para compras superiores a $1,500 MXN, ofrecer 3 y 6 meses
  if (totalAmount >= 1500) {
    const three = Math.round((totalAmount / 3) * 100) / 100
    options.push({
      installments: 3,
      amountPerInstallment: three,
      label: `3 meses de $${three.toLocaleString('es-MX')} MXN (Sin intereses)`,
    })
  }

  if (totalAmount >= 2500) {
    const six = Math.round((totalAmount / 6) * 100) / 100
    options.push({
      installments: 6,
      amountPerInstallment: six,
      label: `6 meses de $${six.toLocaleString('es-MX')} MXN (Sin intereses)`,
    })
  }

  return options
}

export interface ProcessPaymentPayload {
  token: string
  transactionAmount: number
  installments: number
  description: string
  paymentMethodId: CardBrand | string
  payerEmail: string
  payerName?: {
    firstName?: string
    lastName?: string
  }
}

export interface ProcessPaymentResult {
  success: boolean
  status?: 'approved' | 'in_process' | 'rejected' | 'pending'
  statusDetail?: string
  paymentId?: string | number
  errorMessage?: string
}

export function translateMercadoPagoStatusDetail(detail?: string): string {
  switch (detail) {
    case 'accredited':
      return '¡Pago acreditado exitosamente!'
    case 'cc_rejected_insufficient_amount':
      return 'Fondos insuficientes en la tarjeta. Intenta con otra tarjeta.'
    case 'cc_rejected_bad_filled_security_code':
      return 'El código de seguridad (CVV) es incorrecto.'
    case 'cc_rejected_bad_filled_date':
      return 'La fecha de vencimiento es incorrecta.'
    case 'cc_rejected_bad_filled_other':
      return 'Revisa los datos de tu tarjeta e intenta nuevamente.'
    case 'cc_rejected_call_for_authorize':
      return 'Debes autorizar el pago con tu banco emisor e intentar de nuevo.'
    case 'cc_rejected_card_disabled':
      return 'Tu tarjeta no está habilitada para compras por internet. Llama a tu banco.'
    case 'cc_rejected_duplicated_payment':
      return 'Ya realizaste un pago por este valor. Si necesitas volver a pagar usa otra tarjeta.'
    case 'cc_rejected_high_risk':
      return 'El pago fue rechazado por las políticas de seguridad de Mercado Pago (no se permiten auto-compras con la misma cuenta del vendedor).'
    case 'cc_rejected_max_attempts':
      return 'Llegaste al límite de intentos permitidos con esta tarjeta. Elige otra.'
    default:
      return detail
        ? `Pago no aprobado por el emisor (${detail}).`
        : 'El pago no pudo ser completado. Por favor verifica tus datos o intenta con otra tarjeta.'
  }
}

/**
 * Procesa el cobro real enviando el token generado a la API oficial de Payments de Mercado Pago.
 * Requiere el Access Token (APP_USR-... o TEST-...) configurado.
 */
export async function createMercadoPagoPayment(payload: ProcessPaymentPayload): Promise<ProcessPaymentResult> {
  const accessToken = getMercadoPagoAccessToken()
  const pubKey = getMercadoPagoPublicKey()

  // Si no hay credenciales de Mercado Pago guardadas, simular cobro aprobado para demostración
  if (!pubKey && !accessToken) {
    return {
      success: true,
      status: 'approved',
      statusDetail: 'accredited',
      paymentId: `sim_${Date.now()}`,
    }
  }

  if (!accessToken) {
    return {
      success: false,
      errorMessage: 'Falta configurar el Access Token en el panel Admin (Mercado Pago) para autorizar los cobros.',
    }
  }

  // Normalizar identificador de método de pago para Mercado Pago México
  let methodId = (payload.paymentMethodId || 'visa').toLowerCase()
  if (methodId === 'mastercard') methodId = 'master'
  if (methodId === 'unknown') methodId = 'visa'

  const idempotencyKey = `gj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  try {
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        token: payload.token,
        transaction_amount: Number(payload.transactionAmount.toFixed(2)),
        installments: payload.installments || 1,
        description: payload.description,
        payment_method_id: methodId,
        payer: {
          email: payload.payerEmail.trim().toLowerCase(),
          first_name: payload.payerName?.firstName?.trim() || undefined,
          last_name: payload.payerName?.lastName?.trim() || undefined,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Error de Mercado Pago API:', data)
      const errorDetail =
        data?.message ||
        data?.cause?.[0]?.description ||
        'Error de comunicación con la pasarela de Mercado Pago.'
      return {
        success: false,
        errorMessage: errorDetail,
      }
    }

    if (data.status === 'approved') {
      return {
        success: true,
        status: 'approved',
        statusDetail: data.status_detail,
        paymentId: data.id,
      }
    }

    if (data.status === 'in_process' || data.status === 'pending') {
      return {
        success: true,
        status: data.status,
        statusDetail: data.status_detail,
        paymentId: data.id,
      }
    }

    // Pago rechazado
    return {
      success: false,
      status: data.status,
      statusDetail: data.status_detail,
      paymentId: data.id,
      errorMessage: translateMercadoPagoStatusDetail(data.status_detail),
    }
  } catch (err: any) {
    console.error('Excepción al conectar con Mercado Pago:', err)
    return {
      success: false,
      errorMessage: err?.message || 'Error de red al procesar el pago con Mercado Pago.',
    }
  }
}
