export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request) {
  // Manejo de preflight CORS si aplica
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Método no permitido. Solo se acepta POST.' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  try {
    const body = await request.json()
    const {
      token,
      transaction_amount,
      installments,
      description,
      payment_method_id,
      payer,
      accessToken,
    } = body || {}

    // Tomar token enviado desde el cliente o variable de entorno de Vercel
    const tokenToUse =
      (accessToken || '').trim() ||
      (process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim() ||
      (process.env.VITE_MERCADOPAGO_ACCESS_TOKEN || '').trim()

    if (!tokenToUse) {
      return new Response(
        JSON.stringify({
          message:
            'Falta configurar el Access Token de Mercado Pago en el panel Admin de la tienda.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'El token de la tarjeta es requerido.' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    const idempotencyKey = `gj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Llamada server-to-server a Mercado Pago (sin restricciones CORS de navegador)
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenToUse}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        token,
        transaction_amount: Number(transaction_amount),
        installments: Number(installments) || 1,
        description: description || 'Compra gj. CLOTHING AND CAPS',
        payment_method_id: payment_method_id || 'visa',
        payer: {
          email: payer?.email || 'cliente@gjclothing.mx',
          first_name: payer?.first_name || undefined,
          last_name: payer?.last_name || undefined,
        },
      }),
    })

    const data = await mpResponse.json()

    return new Response(JSON.stringify(data), {
      status: mpResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err: any) {
    console.error('Error interno al procesar pago en api/process-payment:', err)
    return new Response(
      JSON.stringify({
        message: err?.message || 'Error interno del servidor al procesar el pago.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}
