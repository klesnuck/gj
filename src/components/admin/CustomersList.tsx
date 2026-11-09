import { useState, useEffect } from 'react'
import { Mail, CheckCircle2, Search, ArrowUpRight } from 'lucide-react'

export const CustomersList = () => {
  const [search, setSearch] = useState('')
  const [subscribers, setSubscribers] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gj_newsletter_subscribers') || '[]')
      // Preload with active drop subscribers if empty
      if (saved.length === 0) {
        setSubscribers([
          'valeria.street@gmail.com',
          'diego.caps@hotmail.com',
          'andrea.mx@outlook.com',
          'carlos.underground@gmail.com',
          'rodrigo.fit@gmail.com',
        ])
      } else {
        setSubscribers(saved)
      }
    } catch {
      setSubscribers([])
    }
  }, [])

  const filtered = subscribers.filter((s) => s.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase block mb-1">
            COMUNIDAD · ENTRA AL CÍRCULO
          </span>
          <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white font-extrabold leading-none">
            CLIENTES & SUSCRIPTORES ({subscribers.length})
          </h2>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por correo..."
            className="w-full bg-[#131313] border border-[#242424] focus:border-[#D4FF00] pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#101010] border border-[#202020]">
          <div className="text-xs font-mono text-gray-400 uppercase">Total en el Círculo</div>
          <div className="font-display text-3xl text-white font-bold mt-1">
            {subscribers.length}
          </div>
          <div className="text-[10px] font-mono text-[#D4FF00] mt-1">
            +18% en Drop 004
          </div>
        </div>

        <div className="p-4 bg-[#101010] border border-[#202020]">
          <div className="text-xs font-mono text-gray-400 uppercase">Tasa de Apertura</div>
          <div className="font-display text-3xl text-[#D4FF00] font-bold mt-1">
            64.2%
          </div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">
            Acceso anticipado a drops
          </div>
        </div>

        <div className="p-4 bg-[#101010] border border-[#202020]">
          <div className="text-xs font-mono text-gray-400 uppercase">Clientes Recurrentes</div>
          <div className="font-display text-3xl text-white font-bold mt-1">
            42%
          </div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">
            Compraron Drop 003 y 004
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#101010] border border-[#202020] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#222222] bg-[#141414] text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">SUSCRIPTOR</th>
                <th className="py-3 px-4">ORIGEN</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-4 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1b1b]">
              {filtered.map((email, i) => (
                <tr key={i} className="hover:bg-[#141414] transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#181818] border border-[#282828] flex items-center justify-center text-[#D4FF00]">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span>{email}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">Landing · Entra al Círculo</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[#D4FF00]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Activo
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex items-center gap-1 text-gray-400 hover:text-[#D4FF00] transition-colors"
                    >
                      <span>Enviar</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
