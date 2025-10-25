import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'react-hot-toast';

const StudyDetailModal = ({ study, isOpen, onClose }) => {
  const { toggleFavorite, isFavorite, addToCart } = useApp();
  
  if (!study) return null;

  const handleShare = (platform) => {
    const text = `${study.nombre} - LaboratorioEG\nCódigo: ${study.codigo}\nPrecio: $${study.precio} USD`;
    const url = window.location.href;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`);
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${study.nombre}&body=${encodeURIComponent(text + '\n' + url)}`;
    }
    
    toast.success('Compartiendo información...');
  };

  const handleDownloadPDF = () => {
    // Aquí iría la lógica de generación de PDF con jsPDF
    toast.success('Descargando información en PDF...');
  };

  const handleScheduleAppointment = () => {
    window.open('https://wa.me/584149019327?text=Hola,%20quiero%20agendar%20una%20cita%20para%20el%20estudio:%20' + study.nombre);
  };

  // Mock de datos detallados
  const detailedInfo = {
    descripcion: "Análisis completo de células sanguíneas que evalúa glóbulos rojos, blancos y plaquetas. Fundamental para detectar anemias, infecciones y trastornos hematológicos.",
    utilidadClinica: "Diagnóstico de anemias, infecciones, leucemias, control de tratamientos, evaluación preoperatoria.",
    metodologia: "Citometría de flujo automatizada con revisión microscópica",
    tipoMuestra: "Sangre venosa",
    volumenRequerido: "3-5 ml",
    tipoTubo: "Tubo tapa morada (EDTA)",
    ayuno: study.ayuno ? "Sí, 8-12 horas" : "No requerido",
    medicamentos: "No suspender medicamentos sin consultar al médico",
    horarioToma: "Lunes a Sábado: 7:00 AM - 11:00 AM",
    tiempoProcesamiento: study.tiempo || "4 horas",
    diasEntrega: "Mismo día después de las 3:00 PM",
    horariosRetiro: "Lunes a Viernes: 3:00 PM - 5:00 PM | Sábados: 12:00 PM - 2:00 PM"
  };

  // Si es un perfil, mostrar estudios incluidos
  const perfilEstudios = study.tipo === 'perfil' ? [
    'Hematología Completa',
    'Glicemia',
    'Urea',
    'Creatinina',
    'Colesterol Total',
    'Triglicéridos',
    'HDL Colesterol',
    'LDL Colesterol'
  ] : null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-eg-purple to-eg-purple/80 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Dialog.Title as="h2" className="text-2xl font-medium mb-2">
                        {study.nombre}
                      </Dialog.Title>
                      <div className="flex items-center gap-4 text-white/90">
                        <span className="flex items-center gap-1">
                          <span className="text-xs">Código:</span>
                          <span className="font-medium">{study.codigo}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-xs">Área:</span>
                          <span className="font-medium">{study.area}</span>
                        </span>
                        {study.tipo === 'perfil' && (
                          <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                            PERFIL
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-right">
                        <p className="text-3xl font-light">${study.precio}</p>
                        <p className="text-xs text-white/80">USD</p>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Información General */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-lg font-medium text-eg-dark mb-3 flex items-center gap-2">
                      <span className="text-eg-purple">📋</span>
                      Información General
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Descripción</h4>
                        <p className="text-sm text-gray-600">{detailedInfo.descripcion}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Utilidad Clínica</h4>
                        <p className="text-sm text-gray-600">{detailedInfo.utilidadClinica}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Metodología</h4>
                        <p className="text-sm text-gray-600">{detailedInfo.metodologia}</p>
                      </div>
                    </div>
                  </motion.section>

                  {/* Requisitos Pre-Analíticos */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-medium text-eg-dark mb-3 flex items-center gap-2">
                      <span className="text-eg-purple">🧪</span>
                      Requisitos Pre-Analíticos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Muestra Requerida</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                          <li>• Tipo: {detailedInfo.tipoMuestra}</li>
                          <li>• Volumen: {detailedInfo.volumenRequerido}</li>
                          <li>• Tubo: {detailedInfo.tipoTubo}</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-orange-900 mb-2">Preparación</h4>
                        <ul className="space-y-1 text-sm text-orange-800">
                          <li>• Ayuno: {detailedInfo.ayuno}</li>
                          <li>• Medicamentos: {detailedInfo.medicamentos}</li>
                          <li>• Horario: {detailedInfo.horarioToma}</li>
                        </ul>
                      </div>
                    </div>
                  </motion.section>

                  {/* Información de Entrega */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-medium text-eg-dark mb-3 flex items-center gap-2">
                      <span className="text-eg-purple">⏰</span>
                      Información de Entrega
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium text-green-900 mb-1">Procesamiento</h4>
                          <p className="text-green-800">{detailedInfo.tiempoProcesamiento}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900 mb-1">Entrega</h4>
                          <p className="text-green-800">{detailedInfo.diasEntrega}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900 mb-1">Horarios</h4>
                          <p className="text-green-800">{detailedInfo.horariosRetiro}</p>
                        </div>
                      </div>
                    </div>
                  </motion.section>

                  {/* Estudios incluidos (para perfiles) */}
                  {perfilEstudios && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-lg font-medium text-eg-dark mb-3 flex items-center gap-2">
                        <span className="text-eg-purple">📝</span>
                        Estudios Incluidos en el Perfil
                      </h3>
                      <div className="bg-eg-purple/5 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {perfilEstudios.map((estudio, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-eg-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-700">{estudio}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-3 bg-green-100 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Ahorro:</strong> Este perfil representa un ahorro del 35% comparado con realizar los estudios por separado.
                          </p>
                        </div>
                      </div>
                    </motion.section>
                  )}

                  {/* Información de Contacto */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Información de Contacto</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📞 Teléfonos: (0212) 762-0561 - 763-5909 - 763-6628</p>
                      <p>📍 Av. Libertador, Edificio Majestic, Piso 1, Consultorio 18</p>
                      <p>📋 RIF: J-40233378-1</p>
                    </div>
                  </motion.section>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3 justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFavorite(study)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2
                          ${isFavorite(study.id) 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      >
                        <svg className="w-5 h-5" fill={isFavorite(study.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {isFavorite(study.id) ? 'En Favoritos' : 'Agregar a Favoritos'}
                      </button>
                      
                      <button
                        onClick={() => addToCart(study)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Agregar al Presupuesto
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="Compartir por WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={handleDownloadPDF}
                        className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        title="Descargar PDF"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={handleScheduleAppointment}
                        className="px-4 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Agendar Cita
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default StudyDetailModal;