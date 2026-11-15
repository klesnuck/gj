import { useState } from 'react'
import {
  CreditCard,
  ShieldCheck,
  Key,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Save,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react'
import {
  getMercadoPagoPublicKey,
  saveMercadoPagoPublicKey,
  getMercadoPagoAccessToken,
  saveMercadoPagoAccessToken,
  isMercadoPagoConfigured,
  isSandboxKey,
  loadMercadoPagoSDK,
} from '../../lib/mercadopago'

export const MercadoPagoSettings = () => {
  const [publicKey, setPublicKey] = useState(() => getMercadoPagoPublicKey())
  const [accessToken, setAccessToken] = useState(() => getMercadoPagoAccessToken())
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [testStatus, setTestStatus] = useState<{
    type: 'success' | 'error' | 'loading'
    message: string
  } | null>(null)

  const isConfigured = isMercadoPagoConfigured()
  const isSandbox = isSandboxKey(publicKey)

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    saveMercadoPagoPublicKey(publicKey.trim())
    saveMercadoPagoAccessToken(accessToken.trim())
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleTestConnection = async () => {
    setTestStatus({
      type: 'loading',
      message: 'Conectando con los servidores de Mercado Pago...',
    })

    try {
      saveMercadoPagoPublicKey(publicKey.trim())
      const mp = await loadMercadoPagoSDK()

      if (mp) {
        setTestStatus({
          type: 'success',
          message: '¡Conexión exitosa! El SDK oficial de Mercado Pago v2 está listo para procesar tarjetas.',
        })
      } else {
        setTestStatus({
          type: 'error',
          message: 'No se pudo inicializar el SDK. Verifica que tu Public Key sea correcta.',
        })
      }
    } catch (err: any) {
      setTestStatus({
        type: 'error',
        message: err?.message || 'Error al conectar con Mercado Pago.',
      })
    }
  }

  const handleReset = () => {
    if (confirm('¿Deseas restablecer las credenciales a los valores por defecto?')) {
      setPublicKey('')
      setAccessToken('')
      saveMercadoPagoPublicKey('')
      saveMercadoPagoAccessToken('')
      setTestStatus(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase block mb-1">
            PASARELA DE PAGOS · MÉXICO
          </span>
          <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white font-extrabold leading-none flex items-center gap-3">
            <span>MERCADO PAGO</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#009ee3]/20 text-[#009ee3] border border-[#009ee3]/40 font-bold">
              OFICIAL
            </span>
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Configura tus credenciales para recibir pagos con tarjeta de crédito, débito, transferencias SPEI y OXXO.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#141d14] border border-[#2a4e2a] text-[#86efac] font-mono text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span>{isSandbox ? 'MODO SANDBOX (PRUEBAS)' : 'MODO PRODUCCIÓN (ACTIVO)'}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1f1911] border border-[#523e1e] text-[#fde047] font-mono text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#eab308]" />
              <span>MODO SIMULACIÓN (PENDIENTE DE LLAVES)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Form + Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 7 Cols: Credentials Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-[#101010] border border-[#202020] p-6 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-[#D4FF00]" />
                <h3 className="font-sans text-sm font-semibold text-white tracking-wide">
                  Credenciales de tu cuenta
                </h3>
              </div>
              <span className="text-[10px] font-mono text-gray-500">
                mercadopago.com.mx
              </span>
            </div>

            {/* Public Key Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Public Key (Llave Pública) *
                </label>
                <span className="text-[10px] font-mono text-gray-500">
                  Visible en checkout para tokenizar tarjetas
                </span>
              </div>
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx o TEST-xxxxxxxx..."
                className="w-full bg-[#151515] border border-[#2b2b2b] focus:border-[#D4FF00] px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
              />
              <p className="text-[10px] font-mono text-gray-500">
                Usa una llave que empiece con <strong>TEST-</strong> para pruebas o <strong>APP_USR-</strong> para ventas reales.
              </p>
            </div>

            {/* Access Token Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Access Token (Token de Acceso)
                </label>
                <span className="text-[10px] font-mono text-gray-500">
                  Uso en servidor / backend
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxx..."
                  className="w-full bg-[#151515] border border-[#2b2b2b] focus:border-[#D4FF00] px-4 py-2.5 text-xs font-mono text-white focus:outline-none pr-10"
                />
                <Lock className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[10px] font-mono text-gray-500">
                Tu Access Token privado permanece protegido.
              </p>
            </div>

            {/* Test Status Banner if triggered */}
            {testStatus && (
              <div
                className={`p-3.5 border text-xs font-mono flex items-start gap-2.5 animate-in fade-in ${
                  testStatus.type === 'success'
                    ? 'bg-[#111d14] border-[#22c55e]/40 text-emerald-300'
                    : testStatus.type === 'error'
                    ? 'bg-[#211111] border-red-800 text-red-300'
                    : 'bg-[#141414] border-[#333] text-gray-300'
                }`}
              >
                {testStatus.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                {testStatus.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                {testStatus.type === 'loading' && <Sparkles className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5 animate-spin" />}
                <span>{testStatus.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1a1a1a]">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-gray-400 hover:text-white border border-[#262626] hover:border-gray-500 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1c1c1c] hover:bg-[#252525] text-white border border-[#333] hover:border-[#D4FF00] text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4FF00]" />
                  <span>Probar Conexión</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#D4FF00] hover:bg-[#bfe600] text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-md shadow-[#D4FF00]/15 cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <span>¡GUARDADO!</span>
                      <CheckCircle className="w-4 h-4 stroke-[3]" />
                    </>
                  ) : (
                    <>
                      <span>GUARDAR CAMBIOS</span>
                      <Save className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>

          {/* Test Cards Reference Table */}
          <div className="bg-[#101010] border border-[#202020] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c1c1c]">
              <span className="text-xs font-mono font-bold text-[#D4FF00] uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Tarjetas oficiales de prueba (Sandbox)</span>
              </span>
              <span className="text-[10px] font-mono text-gray-500">Vencimiento: cualquiera futuro</span>
            </div>

            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#222] text-gray-400 text-[10px] uppercase">
                    <th className="py-2 pr-3">Tipo / Caso</th>
                    <th className="py-2 pr-3">Número de tarjeta</th>
                    <th className="py-2 pr-3">CVV</th>
                    <th className="py-2">Resultado esperado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a] text-gray-300">
                  <tr>
                    <td className="py-2.5 pr-3 text-white font-bold">Visa Aprobada</td>
                    <td className="py-2.5 pr-3 text-[#D4FF00]">4012 0010 3714 1112</td>
                    <td className="py-2.5 pr-3">123</td>
                    <td className="py-2.5 text-emerald-400">Aprobación inmediata</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 text-white font-bold">Mastercard Aprobada</td>
                    <td className="py-2.5 pr-3 text-[#D4FF00]">5031 7557 3452 3456</td>
                    <td className="py-2.5 pr-3">123</td>
                    <td className="py-2.5 text-emerald-400">Aprobación inmediata</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 text-white font-bold">Fondos Insuficientes</td>
                    <td className="py-2.5 pr-3 text-red-400">4012 0010 3714 1113</td>
                    <td className="py-2.5 pr-3">123</td>
                    <td className="py-2.5 text-red-400">Rechazo por saldo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 5 Cols: Step-by-Step Guide */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-[#121212] border border-[#262626] p-6 space-y-4">
            <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4FF00]" />
              <span>¿Cómo obtener tus credenciales?</span>
            </h3>

            <ol className="space-y-3.5 text-xs text-gray-300 font-sans leading-relaxed list-decimal list-inside">
              <li>
                Inicia sesión en tu cuenta de Mercado Pago en{' '}
                <a
                  href="https://www.mercadopago.com.mx/developers/panel/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4FF00] hover:underline inline-flex items-center gap-0.5 font-mono"
                >
                  Mercado Pago Developers <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>
                Haz clic en el botón <strong>"Crear aplicación"</strong> (puedes nombrarla <em>GJ Clothing Store</em>).
              </li>
              <li>
                En el menú lateral de tu aplicación, entra a <strong>"Credenciales de prueba"</strong> o <strong>"Credenciales de producción"</strong>.
              </li>
              <li>
                Copia tu <strong>Public Key</strong> (empieza con <em>APP_USR-</em> o <em>TEST-</em>).
              </li>
              <li>
                Pégala aquí en este panel y haz clic en <strong>Guardar Cambios</strong>.
              </li>
            </ol>

            <div className="p-3 bg-[#181818] border border-[#2c2c2c] space-y-1 text-[11px] font-mono text-gray-400">
              <p className="text-white font-bold">✓ Cifrado de extremo a extremo</p>
              <p>
                Los datos de las tarjetas nunca tocan tu servidor; el SDK oficial de Mercado Pago los tokeniza directamente según la norma de seguridad bancaria <strong>PCI-DSS nivel 1</strong>.
              </p>
            </div>
          </div>

          <div className="bg-[#101010] border border-[#202020] p-5 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              Métodos de pago que aceptarás:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-300">
              <div className="p-2.5 bg-[#141414] border border-[#222]">
                💳 Tarjetas Visa / Master
              </div>
              <div className="p-2.5 bg-[#141414] border border-[#222]">
                💳 American Express
              </div>
              <div className="p-2.5 bg-[#141414] border border-[#222]">
                🏦 Transferencias SPEI
              </div>
              <div className="p-2.5 bg-[#141414] border border-[#222]">
                🏪 Pagos en efectivo OXXO
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

