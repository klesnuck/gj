import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function devApiServer(): Plugin {
  return {
    name: 'dev-api-server',
    configureServer(server) {
      server.middlewares.use('/api/process-payment', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ message: 'Method Not Allowed' }))
          return
        }

        let rawBody = ''
        req.on('data', (chunk) => {
          rawBody += chunk
        })
        req.on('end', async () => {
          try {
            const body = JSON.parse(rawBody || '{}')
            const tokenToUse = body.accessToken || process.env.VITE_MERCADOPAGO_ACCESS_TOKEN || ''

            const idempotencyKey = `gj_dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenToUse}`,
                'X-Idempotency-Key': idempotencyKey,
              },
              body: JSON.stringify({
                token: body.token,
                transaction_amount: body.transaction_amount,
                installments: body.installments || 1,
                description: body.description || 'Compra gj. CLOTHING',
                payment_method_id: body.payment_method_id,
                payer: body.payer,
              }),
            })

            const data = await mpRes.json()
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = mpRes.status
            res.end(JSON.stringify(data))
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 500
            res.end(JSON.stringify({ message: err?.message || 'Error en servidor local' }))
          }
        })
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devApiServer()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
