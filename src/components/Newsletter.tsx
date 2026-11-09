import React, { useState } from 'react'
import { ArrowUpRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { subscribeNewsletter } from '../lib/supabase'

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setStatus('error')
      setFeedbackMessage('Ingresa un correo electrónico válido.')
      return
    }

    setStatus('loading')
    const result = await subscribeNewsletter(email.trim())

    if (result.success) {
      setStatus('success')
      setFeedbackMessage(result.message)
      setEmail('')
    } else {
      setStatus('error')
      setFeedbackMessage(result.message)
    }
  }

  return (
    <section className="w-full bg-[#090909] py-16 sm:py-24 border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-[#D4FF00] uppercase block">
              NO TE ENTERES CUANDO YA SE AGOTÓ.
            </span>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white font-black leading-none">
              ENTRA AL CÍRCULO.
            </h2>
            <p className="text-gray-400 text-sm sm:text-base font-sans leading-relaxed pt-1">
              Acceso anticipado a drops, lanzamientos exclusivos y cero ruido.
            </p>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status !== 'idle') setStatus('idle')
                  }}
                  placeholder="Tu correo electrónico"
                  className="w-full bg-[#131313] text-white placeholder-gray-500 px-5 py-4 border border-[#262626] focus:border-[#D4FF00] focus:outline-none text-sm font-mono tracking-wide transition-colors"
                  required
                />
                
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider shrink-0 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>QUIERO ENTRAR</span>
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>

              {/* Status Notifications */}
              {status === 'success' && (
                <div className="flex items-center gap-2 text-xs font-mono text-[#D4FF00] pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{feedbackMessage}</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-2 text-xs font-mono text-red-400 pt-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-[11px] font-mono text-gray-500 tracking-normal pt-1">
                Al suscribirte, aceptas nuestro aviso de privacidad. Puedes salir cuando quieras.
              </p>
            </form>
          </div>

        </div>

      </div>
    </section>
  )
}

