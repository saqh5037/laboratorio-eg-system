import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedApp as useApp } from '../../../contexts/UnifiedAppContext';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

const BudgetCalculator = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, clearCart, updateCartItemQuantity, calculateCartTotal } = useApp();
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    cedula: ''
  });

  const totals = calculateCartTotal();

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(123, 104, 166); // eg-purple
    doc.text('LABORATORIO EG', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(139, 140, 142); // eg-gray
    doc.text('RIF: J-40233378-1', 20, 28);
    doc.text('43 años de experiencia en servicios de laboratorio clínico', 20, 34);
    doc.text('Av. Libertador, Edificio Majestic, Piso 1, Consultorio 18', 20, 40);
    doc.text('Teléfonos: (0212) 762-0561 - 763-5909 - 763-6628', 20, 46);
    
    // Line separator
    doc.setDrawColor(123, 104, 166);
    doc.line(20, 52, 190, 52);
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(35, 31, 32); // eg-dark
    doc.text('PRESUPUESTO DE ESTUDIOS', 105, 62, { align: 'center' });
    
    // Client info
    if (clientInfo.name) {
      doc.setFontSize(12);
      doc.text(`Cliente: ${clientInfo.name}`, 20, 75);
      if (clientInfo.cedula) doc.text(`C.I.: ${clientInfo.cedula}`, 20, 82);
      if (clientInfo.phone) doc.text(`Teléfono: ${clientInfo.phone}`, 20, 89);
      if (clientInfo.email) doc.text(`Email: ${clientInfo.email}`, 20, 96);
    }
    
    // Date
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-VE')}`, 150, 75);
    
    // Table headers
    let yPos = clientInfo.name ? 110 : 80;
    doc.setFillColor(123, 104, 166);
    doc.rect(20, yPos, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text('Estudio', 25, yPos + 7);
    doc.text('Código', 90, yPos + 7);
    doc.text('Cant.', 120, yPos + 7);
    doc.text('Precio Unit.', 135, yPos + 7);
    doc.text('Total', 170, yPos + 7);
    
    // Table content
    doc.setTextColor(35, 31, 32);
    doc.setFontSize(10);
    yPos += 15;
    
    cart.forEach((item) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(item.nombre.substring(0, 30), 25, yPos);
      doc.text(item.codigo, 90, yPos);
      doc.text(String(item.quantity || 1), 125, yPos);
      doc.text(`$${item.precio}`, 140, yPos);
      doc.text(`$${(item.precio * (item.quantity || 1)).toFixed(2)}`, 170, yPos);
      yPos += 8;
    });
    
    // Totals
    yPos += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(120, yPos, 190, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.text('Subtotal:', 120, yPos);
    doc.text(`$${totals.subtotal.toFixed(2)}`, 170, yPos);
    
    if (totals.discount > 0) {
      yPos += 8;
      doc.setTextColor(76, 175, 80); // green
      doc.text(`Descuento (${(totals.discount * 100).toFixed(0)}%):`, 120, yPos);
      doc.text(`-$${totals.discountAmount.toFixed(2)}`, 170, yPos);
    }
    
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(123, 104, 166);
    doc.text('TOTAL:', 120, yPos);
    doc.text(`$${totals.total.toFixed(2)} USD`, 170, yPos);
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(139, 140, 142);
    doc.text('* Precios sujetos a cambio sin previo aviso', 20, 270);
    doc.text('* Presupuesto válido por 15 días', 20, 276);
    doc.text('* Algunos estudios requieren cita previa', 20, 282);
    
    // Save
    doc.save(`Presupuesto_LaboratorioEG_${new Date().getTime()}.pdf`);
    toast.success('PDF generado exitosamente');
  };

  const shareWhatsApp = () => {
    let message = `*PRESUPUESTO LABORATORIO EG*\n`;
    message += `RIF: J-40233378-1\n\n`;
    
    if (clientInfo.name) {
      message += `*Cliente:* ${clientInfo.name}\n`;
      if (clientInfo.cedula) message += `*C.I.:* ${clientInfo.cedula}\n`;
      message += `\n`;
    }
    
    message += `*ESTUDIOS SOLICITADOS:*\n`;
    message += `------------------------\n`;
    
    cart.forEach((item) => {
      message += `• ${item.nombre}\n`;
      message += `  Código: ${item.codigo}\n`;
      message += `  Cantidad: ${item.quantity || 1}\n`;
      message += `  Precio: $${(item.precio * (item.quantity || 1)).toFixed(2)}\n\n`;
    });
    
    message += `------------------------\n`;
    message += `*Subtotal:* $${totals.subtotal.toFixed(2)}\n`;
    
    if (totals.discount > 0) {
      message += `*Descuento (${(totals.discount * 100).toFixed(0)}%):* -$${totals.discountAmount.toFixed(2)}\n`;
    }
    
    message += `*TOTAL:* $${totals.total.toFixed(2)} USD\n\n`;
    
    message += `📍 Av. Libertador, Edificio Majestic\n`;
    message += `📞 (0212) 762-0561\n`;
    message += `⏰ Lunes a Viernes: 7:00 AM - 4:00 PM`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
    toast.success('Presupuesto listo para compartir');
  };

  const sendEmail = () => {
    const subject = 'Presupuesto - Laboratorio EG';
    let body = 'PRESUPUESTO LABORATORIO EG\n\n';
    
    cart.forEach((item) => {
      body += `${item.nombre} - Cantidad: ${item.quantity || 1} - $${(item.precio * (item.quantity || 1)).toFixed(2)}\n`;
    });
    
    body += `\nTOTAL: $${totals.total.toFixed(2)} USD\n\n`;
    body += 'Contacto: (0212) 762-0561\n';
    body += 'Dirección: Av. Libertador, Edificio Majestic, Piso 1, Consultorio 18';
    
    window.location.href = `mailto:${clientInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-eg-purple to-eg-purple/80 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-medium mb-1">Calculadora de Presupuesto</h2>
                <p className="text-white/80 text-sm">
                  {cart.length} {cart.length === 1 ? 'estudio' : 'estudios'} seleccionados
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
            {/* Left: Cart Items */}
            <div className="flex-1 p-6 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Presupuesto vacío
                  </h3>
                  <p className="text-gray-600">
                    Agrega estudios para crear tu presupuesto
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.nombre}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Código: {item.codigo} • {item.area}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartItemQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity || 1}</span>
                              <button
                                onClick={() => updateCartItemQuantity(item.id, (item.quantity || 1) + 1)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            <span className="text-sm text-gray-600">
                              ${item.precio} c/u
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-medium text-eg-purple">
                            ${(item.precio * (item.quantity || 1)).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm mt-2 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="mt-4 text-red-600 hover:text-red-700 text-sm transition-colors"
                >
                  Limpiar todo el presupuesto
                </button>
              )}
            </div>

            {/* Right: Summary & Actions */}
            <div className="w-full lg:w-96 bg-gray-50 p-6 border-l border-gray-200">
              {/* Client Info */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información del Cliente (Opcional)
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple/50"
                  />
                  <input
                    type="text"
                    placeholder="Cédula de identidad"
                    value={clientInfo.cedula}
                    onChange={(e) => setClientInfo({...clientInfo, cedula: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple/50"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple/50"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple/50"
                  />
                </div>
              </div>

              {/* Totals */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Resumen del Presupuesto
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totals.itemCount} estudios)</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento ({(totals.discount * 100).toFixed(0)}%)</span>
                      <span>-${totals.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-xl font-medium text-eg-purple">
                      <span>Total</span>
                      <span>${totals.total.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                {/* Discount Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Descuentos por volumen:</strong><br/>
                    • 3-5 estudios: 5% descuento<br/>
                    • 6-10 estudios: 10% descuento<br/>
                    • 11+ estudios: 15% descuento
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={generatePDF}
                  disabled={cart.length === 0}
                  className="w-full py-3 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generar PDF
                </button>
                
                <button
                  onClick={shareWhatsApp}
                  disabled={cart.length === 0}
                  className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Compartir por WhatsApp
                </button>
                
                <button
                  onClick={sendEmail}
                  disabled={cart.length === 0 || !clientInfo.email}
                  className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar por Email
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BudgetCalculator;