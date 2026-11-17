import React, { useState } from 'react'
import { Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, AlertCircle } from 'lucide-react'
import { authenticateAdmin } from '../../lib/supabase'

interface AdminLoginProps {
  onLoginSuccess: () => void
  onBackToStore: () => void
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsLoading(true)

    try {
      const result = await authenticateAdmin(username, password)
      if (result.success) {
        sessionStorage.setItem('gj_admin_auth', 'true')
        onLoginSuccess()
      } else {
        setErrorMsg(result.message || 'Usuario o contraseña incorrectos.')
      }
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#070707] text-white flex flex-col justify-between selection:bg-[#D4FF00] selection:text-black font-sans relative overflow-hidden">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4FF00]/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-red-950/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10 border-b border-[#141414]">
        <div className="flex items-center space-x-3">
          <span className="font-display text-3xl sm:text-4xl font-black text-white tracking-tighter">
            gj.
          </span>
          <span className="px-2 py-0.5 bg-[#141414] border border-[#242424] text-[10px] font-mono text-[#D4FF00] font-bold uppercase tracking-widest">
            PANEL DE ACCESO
          </span>
        </div>

        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-[#D4FF00] transition-colors cursor-pointer uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la tienda</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md bg-[#0c0c0c] border border-[#202020] p-8 sm:p-10 shadow-2xl relative">
          
          {/* Top Neon Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4FF00] to-transparent" />

          {/* Badge & Title */}
          <div className="space-y-3 mb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#262626] text-[#D4FF00] font-mono text-[10px] font-bold uppercase tracking-wider">
              <Shield className="w-3 h-3 text-[#D4FF00]" />
              <span>SEGURIDAD // SISTEMA ADMINISTRATIVO</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl uppercase font-black tracking-tight text-white leading-none">
              INICIAR SESIÓN.
            </h1>
            <p className="text-xs font-mono text-gray-400 leading-relaxed">
              Ingresa tus credenciales autorizadas para gestionar inventario, pedidos y promociones.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-red-950/50 border border-red-500/80 text-red-300 text-xs font-mono flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-widest text-gray-300 font-bold block">
                USUARIO
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="Usuario admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-widest text-gray-300 font-bold block">
                  CONTRASEÑA
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#D4FF00] pl-10 pr-11 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-[#D4FF00] hover:bg-[#bfe600] disabled:bg-gray-700 disabled:text-gray-400 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#D4FF00]/15"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>VERIFICANDO CREDENCIALES...</span>
                  </>
                ) : (
                  <>
                    <span>ENTRAR AL PANEL</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Footer note inside card */}
          <div className="mt-8 pt-4 border-t border-[#181818] flex items-center justify-between text-[10px] font-mono text-gray-500">
            <span>GJ CLOTHING & CAPS®</span>
            <span>AUTENTICACIÓN SEGURA</span>
          </div>

        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="w-full py-4 text-center text-xs font-mono text-gray-600 relative z-10">
        © 2026 GJ. ACCESO PRIVADO RESTRINGIDO.
      </footer>

    </div>
  )
}
