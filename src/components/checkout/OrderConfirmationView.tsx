import React from 'react'
import { CheckCircle2, MessageCircle, ArrowRight, Package, Truck, MapPin } from 'lucide-react'
import type { Order } from '../../types/database.types'

interface OrderConfirmationViewProps {
  order: Order
  onReturnToStore: () => void
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  onReturnToStore,
}) => {
  const isSaltillo = order.shippingType === 'saltillo_local'
  const waPhone = '528444923686'
  const waText = encodeURIComponent(
    `¡Hola gj.! Acabo de realizar el pedido *#${order.orderNumber}* por un total de *$${order.total.toLocaleString(
      'es-MX'
    )} MXN*. Mi nombre es ${order.customerName}. Me gustaría confirmar los detalles de entrega.`
  )
  const waUrl = `https://wa.me/${waPhone}?text=${waText}`

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col font-sans selection:bg-[#D4FF00] selection:text-black">
      
      {/* Top Bar */}
      <aside className="w-full bg-[#D4FF00] text-black py-1.5 px-4 text-[11px] font-mono font-bold tracking-wider uppercase select-none z-40 border-b border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-center">
          <span>ENVÍO GRATIS EN COMPRAS DESDE $1,999 MXN · DROP 004</span>
        </div>
      </aside>

      {/* Header */}
      <header className="w-full bg-[#090909] border-b border-[#1c1c1c] py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={onReturnToStore} className="flex items-center space-x-3 text-left">
            <span className="font-display text-3xl tracking-tighter font-extrabold text-white">
              gj.
            </span>
            <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">
              CLOTHING AND CAPS
            </span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        
        {/* Stepper (All done) */}
        <div className="flex items-center justify-center space-x-6 sm:space-x-10 text-xs font-mono pb-4 border-b border-[#181818]">
          <div className="flex items-center space-x-1.5 text-gray-400">
            <span className="text-[#D4FF00] font-bold">✓</span>
            <span className="uppercase">Carrito</span>
          </div>
          <div className="flex items-center space-x-1.5 text-gray-400">
            <span className="text-[#D4FF00] font-bold">✓</span>
            <span className="uppercase">Pago</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[#D4FF00] font-bold border-b-2 border-[#D4FF00] pb-1">
            <span>03</span>
            <span className="uppercase tracking-wider">Confirmación</span>
          </div>
        </div>

        {/* Hero Confirmation Card */}
        <div className="bg-[#0f0f0f] border border-[#202020] p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          
          {/* Subtle neon glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#D4FF00]/10 blur-3xl pointer-events-none" />

          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-[#D4FF00]/10 border-2 border-[#D4FF00] flex items-center justify-center text-[#D4FF00] mx-auto shadow-lg shadow-[#D4FF00]/20">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-[#D4FF00] uppercase block">
              ¡GRACIAS POR TU COMPRA!
            </span>
            <h1 className="font-display text-5xl sm:text-6xl uppercase tracking-tight text-white font-black leading-none">
              PEDIDO #{order.orderNumber}
            </h1>
            <p className="text-sm font-sans text-gray-400 max-w-md mx-auto">
              Hemos enviado los detalles y el recibo digital a{' '}
              <strong className="text-white">{order.customerEmail}</strong>.
            </p>
          </div>

          {/* Order Snapshot Box */}
          <div className="bg-[#141414] border border-[#252525] p-6 text-left max-w-xl mx-auto space-y-4 text-xs font-mono">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
              <span className="text-gray-400">Cliente:</span>
              <span className="text-white font-bold">{order.customerName}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
              <span className="text-gray-400">Teléfono:</span>
              <span className="text-white font-bold">{order.customerPhone}</span>
            </div>

            <div className="flex items-start justify-between pb-3 border-b border-[#202020]">
              <span className="text-gray-400 shrink-0 mr-3">Entrega:</span>
              <div className="text-right">
                <span className="text-white block font-bold">
                  {isSaltillo ? '📍 Entrega Local en Saltillo' : '📦 Paquetería Nacional'}
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  {order.shippingAddress}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
              <span className="text-gray-400">Método de pago:</span>
              <span className="text-[#D4FF00] font-bold">{order.paymentMethod}</span>
            </div>

            <div className="flex items-baseline justify-between pt-1 text-sm">
              <span className="text-white font-bold uppercase">Total Pagado:</span>
              <span className="font-mono text-2xl font-black text-[#D4FF00]">
                ${order.total.toLocaleString('es-MX')} MXN
              </span>
            </div>

          </div>

          {/* WhatsApp Direct Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircle className="w-4 h-4 fill-black stroke-none" />
              <span>CONFIRMAR POR WHATSAPP</span>
            </a>

            <button
              onClick={onReturnToStore}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#333] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>VOLVER A LA TIENDA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs font-mono text-gray-400 pt-4">
          <div className="p-4 bg-[#0e0e0e] border border-[#1e1e1e]">
            <Package className="w-5 h-5 text-[#D4FF00] mx-auto mb-1" />
            <span>Empaque de colección exclusivo</span>
          </div>
          <div className="p-4 bg-[#0e0e0e] border border-[#1e1e1e]">
            <Truck className="w-5 h-5 text-[#D4FF00] mx-auto mb-1" />
            <span>Guía de rastreo enviada por SMS / WhatsApp</span>
          </div>
          <div className="p-4 bg-[#0e0e0e] border border-[#1e1e1e]">
            <MapPin className="w-5 h-5 text-[#D4FF00] mx-auto mb-1" />
            <span>De nuestra calle a la tuya</span>
          </div>
        </div>

      </main>

    </div>
  )
}

