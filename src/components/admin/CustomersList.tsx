import { useState } from 'react'
import {
  Users,
  Search,
  MessageCircle,
  Phone,
  MapPin,
  Plus,
  X,
} from 'lucide-react'
import type { Customer } from '../../types/database.types'

interface CustomersListProps {
  customers: Customer[]
  onAddCustomer?: (customer: Customer) => void
}

export const CustomersList = ({ customers: initialCustomers, onAddCustomer }: CustomersListProps) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState<'all' | 'saltillo' | 'otras'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // New customer form state
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newCity, setNewCity] = useState('Saltillo, Coah.')

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newPhone) return

    const created: Customer = {
      id: `cust-${Date.now()}`,
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      city: newCity,
      ordersCount: 0,
      totalSpent: 0,
      registeredAt: 'Hoy',
      lastOrderDate: 'Sin pedidos aún',
    }

    setCustomers([created, ...customers])
    onAddCustomer?.(created)
    setNewName('')
    setNewPhone('')
    setNewEmail('')
    setShowAddModal(false)
  }

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    const isSaltillo = c.city.toLowerCase().includes('saltillo')
    const matchesCity =
      cityFilter === 'all' ||
      (cityFilter === 'saltillo' && isSaltillo) ||
      (cityFilter === 'otras' && !isSaltillo)
    return matchesSearch && matchesCity
  })

  const saltilloCustomersCount = customers.filter((c) =>
    c.city.toLowerCase().includes('saltillo')
  ).length

  const getCleanPhone = (phone: string) => phone.replace(/[^0-9]/g, '')

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase block mb-1">
            BASE DE DATOS · CLIENTES REGISTRADOS
          </span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white font-extrabold leading-none">
            DIRECTORIO DE CLIENTES ({customers.length})
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#D4FF00]/15 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ REGISTRAR CLIENTE</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#101010] border border-[#202020]">
          <div className="text-xs font-mono text-gray-400 uppercase">Total Registrados</div>
          <div className="font-display text-3xl text-white font-bold mt-1">
            {customers.length}
          </div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">Comunidad activa</div>
        </div>

        <div className="p-4 bg-[#101010] border border-[#202020]">
          <div className="text-xs font-mono text-gray-400 uppercase">Clientes Saltillo</div>
          <div className="font-display text-3xl text-[#D4FF00] font-bold mt-1">
            {saltilloCustomersCount}
          </div>
          <div className="text-[10px] font-mono text-[#D4FF00] mt-1">
            {Math.round((saltilloCustomersCount / customers.length) * 100)}% base local
          </div>
        </div>

        <div className="p-4 bg-[#101010] border border-[#202020]">
          <div className="text-xs font-mono text-gray-400 uppercase">Teléfonos Registrados</div>
          <div className="font-display text-3xl text-emerald-400 font-bold mt-1">
            {customers.filter((c) => c.phone).length}
          </div>
          <div className="text-[10px] font-mono text-emerald-400/80 mt-1">100% con WhatsApp directo</div>
        </div>

        <div className="p-4 bg-[#101010] border border-[#202020]">
          <div className="text-xs font-mono text-gray-400 uppercase">Ticket Promedio</div>
          <div className="font-display text-3xl text-white font-bold mt-1">
            $1,840
          </div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">MXN por cliente</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o ciudad..."
            className="w-full bg-[#131313] border border-[#242424] focus:border-[#D4FF00] pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none"
          />
        </div>

        {/* City Filter */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCityFilter('all')}
            className={`px-3 py-1.5 rounded-none text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
              cityFilter === 'all'
                ? 'bg-white text-black border-white font-bold'
                : 'bg-[#121212] text-gray-400 border-[#262626]'
            }`}
          >
            Todos ({customers.length})
          </button>
          <button
            onClick={() => setCityFilter('saltillo')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
              cityFilter === 'saltillo'
                ? 'bg-[#182109] text-[#D4FF00] border-[#D4FF00] font-bold'
                : 'bg-[#121212] text-gray-400 border-[#262626]'
            }`}
          >
            <MapPin className="w-3 h-3 text-[#D4FF00]" />
            <span>Saltillo ({saltilloCustomersCount})</span>
          </button>
          <button
            onClick={() => setCityFilter('otras')}
            className={`px-3 py-1.5 rounded-none text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
              cityFilter === 'otras'
                ? 'bg-blue-950/60 text-blue-400 border-blue-400 font-bold'
                : 'bg-[#121212] text-gray-400 border-[#262626]'
            }`}
          >
            Nacionales ({customers.length - saltilloCustomersCount})
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#101010] border border-[#202020] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#222222] bg-[#141414] text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">CLIENTE</th>
                <th className="py-3 px-4">NÚMERO DE TELÉFONO</th>
                <th className="py-3 px-4">CIUDAD / UBICACIÓN</th>
                <th className="py-3 px-4 text-center">PEDIDOS</th>
                <th className="py-3 px-4 text-right">TOTAL GASTADO</th>
                <th className="py-3 px-4 text-center">CONTACTO RÁPIDO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1b1b]">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-[#141414] transition-colors">
                  {/* Name & Email */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#2c2c2c] flex items-center justify-center font-bold text-xs text-[#D4FF00] shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white font-sans text-sm">
                          {customer.name}
                        </div>
                        <div className="text-[10px] text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Phone with quick call */}
                  <td className="py-3 px-4 font-bold text-white">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm tracking-wider text-gray-200">
                        {customer.phone}
                      </span>
                    </div>
                  </td>

                  {/* City */}
                  <td className="py-3 px-4">
                    {customer.city.toLowerCase().includes('saltillo') ? (
                      <span className="inline-flex items-center gap-1 text-[#D4FF00] font-semibold">
                        <MapPin className="w-3 h-3 text-[#D4FF00]" />
                        {customer.city}
                      </span>
                    ) : (
                      <span className="text-gray-400">{customer.city}</span>
                    )}
                  </td>

                  {/* Orders Count */}
                  <td className="py-3 px-4 text-center font-bold text-white">
                    <span className="inline-block px-2 py-0.5 bg-[#181818] border border-[#2a2a2a] rounded">
                      {customer.ordersCount} compras
                    </span>
                  </td>

                  {/* Total Spent */}
                  <td className="py-3 px-4 text-right font-bold text-[#D4FF00]">
                    ${customer.totalSpent.toLocaleString('es-MX')} MXN
                  </td>

                  {/* Quick Action: WhatsApp & Call */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <a
                        href={`https://wa.me/${getCleanPhone(customer.phone)}?text=Hola%20${encodeURIComponent(customer.name)},%20te%20escribimos%20de%20la%20tienda%20oficial%20gj.%20CLOTHING%20AND%20CAPS`}
                        target="_blank"
                        rel="noreferrer"
                        title="Abrir chat de WhatsApp"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded text-[11px] font-bold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${getCleanPhone(customer.phone)}`}
                        title="Llamar al cliente"
                        className="p-1.5 bg-[#181818] hover:bg-[#252525] text-gray-300 hover:text-white border border-[#2a2a2a] rounded transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Customer */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          <div className="relative bg-[#101010] border border-[#282828] max-w-md w-full text-white p-6 sm:p-8 space-y-5 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#D4FF00]" />
                <h3 className="font-display text-2xl uppercase tracking-wider font-bold">
                  REGISTRAR CLIENTE
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Juan Pérez Ramos"
                  className="w-full bg-[#141414] border border-[#262626] focus:border-[#D4FF00] px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase">Número de Teléfono (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+52 844 123 4567"
                  className="w-full bg-[#141414] border border-[#262626] focus:border-[#D4FF00] px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase">Correo Electrónico</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="juan@gmail.com"
                  className="w-full bg-[#141414] border border-[#262626] focus:border-[#D4FF00] px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase">Ciudad / Ubicación</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Saltillo, Coahuila"
                  className="w-full bg-[#141414] border border-[#262626] focus:border-[#D4FF00] px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                >
                  GUARDAR CLIENTE
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-3 bg-[#161616] hover:bg-[#202020] text-gray-300 uppercase text-xs transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
