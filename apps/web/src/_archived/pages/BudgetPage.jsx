import { useState } from 'react';
import { useUnifiedApp } from '../contexts/UnifiedAppContext';
import BudgetCalculator from '../components/directorio/calculator/BudgetCalculator';
import { ShoppingCart, FileText, Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Página de presupuesto con calculadora integrada
 */
function BudgetPage() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    calculateCartTotal,
    clearCart
  } = useUnifiedApp();

  const [showCalculator, setShowCalculator] = useState(false);
  const totals = calculateCartTotal();

  if (cart.length === 0 && !showCalculator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Tu presupuesto está vacío
          </h2>
          <p className="text-gray-500 mb-6">
            Agrega estudios desde el catálogo para crear un presupuesto
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/estudios'}
              className="px-6 py-3 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors"
            >
              Explorar Estudios
            </button>
            <button
              onClick={() => setShowCalculator(true)}
              className="block mx-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Abrir Calculadora Manual
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Presupuesto de Estudios
              </h1>
              <p className="text-gray-600 mt-1">
                {totals.itemCount} {totals.itemCount === 1 ? 'estudio' : 'estudios'} seleccionado{totals.itemCount === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCalculator(true)}
                className="px-4 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Generar PDF
              </button>
              <button
                onClick={clearCart}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de estudios */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Estudios Seleccionados
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.nombre}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {item.area}
                          </span>
                          <span>Código: {item.codigo}</span>
                          <span>{item.tipoMuestra}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Cantidad */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, (item.cantidad || 1) - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center"
                            disabled={item.cantidad <= 1}
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-medium">
                            {item.cantidad || 1}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, (item.cantidad || 1) + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Precio */}
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ${(item.precio * (item.cantidad || 1)).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${item.precio.toFixed(2)} c/u
                          </div>
                        </div>
                        
                        {/* Eliminar */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen del presupuesto */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen del Presupuesto
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({totals.discountPercentage}%)</span>
                    <span>-${totals.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Información de descuentos */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Descuentos por volumen
                </h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className={totals.itemCount >= 3 ? 'font-semibold' : ''}>
                    • 3-5 estudios: 5% de descuento
                  </li>
                  <li className={totals.itemCount >= 6 ? 'font-semibold' : ''}>
                    • 6-10 estudios: 10% de descuento
                  </li>
                  <li className={totals.itemCount >= 11 ? 'font-semibold' : ''}>
                    • 11+ estudios: 15% de descuento
                  </li>
                </ul>
              </div>

              {/* Acciones */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setShowCalculator(true)}
                  className="w-full px-4 py-3 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Generar Presupuesto PDF
                </button>
                
                <button
                  onClick={() => {
                    // Compartir por WhatsApp
                    const message = `Presupuesto de Laboratorio EG:\n${cart.map(item => `- ${item.nombre} x${item.cantidad || 1}`).join('\n')}\n\nTotal: $${totals.total.toFixed(2)}`;
                    window.open(`https://wa.me/584149019327?text=${encodeURIComponent(message)}`);
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Compartir por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de calculadora */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Generar Presupuesto</h2>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <BudgetCalculator onClose={() => setShowCalculator(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetPage;