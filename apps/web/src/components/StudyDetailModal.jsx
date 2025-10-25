import { useEffect, useState } from 'react';
import { X, Beaker, Clock, DollarSign, AlertCircle, TestTube, Droplet, Info, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StudyTreeView from './StudyTreeView';
import TubeIcon from './icons/TubeIcon';
import { getSampleIcon } from '../utils/getSampleIcon';
import { getTubeColorFromName, getTubeDescription } from '../utils/getTubeColorFromName';

const StudyDetailModal = ({ study, isOpen, onClose }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, isOpen]);

  if (!study || !isOpen) return null;

  const esPrueba = study.tipo_item === 'prueba';
  const esGrupo = study.tipo_item === 'grupo';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Modal Content - Perfectamente centrado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="w-[85vw] lg:w-[70vw] xl:w-[60vw] max-w-4xl h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Compacto */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-eg-purple to-eg-pink text-white px-5 py-4 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Beaker className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">{study.codigo}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold leading-tight">{study.nombre}</h2>
                  <p className="text-white/90 text-sm mt-1">{study.categoria}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body - Scrollable - Ocupa todo el espacio disponible */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-5">
                {/* Grid de información principal - Compacto */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {/* Precio */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Precio</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">${study.precio?.toFixed(2)}</p>
                  </div>

                  {/* Tiempo de entrega */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Tiempo de Entrega</span>
                    </div>
                    <p className="text-lg font-semibold text-blue-700">
                      {study.tiempoEntrega === 0 || study.tiempoEntrega === 'No especificado'
                        ? 'Mismo día'
                        : `${study.tiempoEntrega} día(s)`}
                    </p>
                  </div>

                  {/* Tipo de estudio */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <TestTube className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Tipo</span>
                    </div>
                    <p className="text-lg font-semibold text-purple-700">{study.tipoEstudio}</p>
                  </div>
                </div>

                {/* Información específica de PRUEBA */}
                {esPrueba && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-eg-purple" />
                      Información de la Muestra
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Tipo de Muestra */}
                      {study.tipoMuestra && (() => {
                        const { Icon, color, bgColor, borderColor, filled } = getSampleIcon(study.tipoMuestra);
                        return (
                          <div className={`bg-gradient-to-br ${bgColor} border ${borderColor} rounded-lg p-3 hover:shadow-md transition-shadow`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Icon
                                className="w-4 h-4"
                                style={{
                                  color: filled ? color : 'transparent',
                                  stroke: color,
                                  strokeWidth: filled ? 0 : 2,
                                  fill: filled ? color : 'none'
                                }}
                              />
                              <span className="text-sm font-medium text-gray-700">Tipo de Muestra</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon
                                className="w-6 h-6 flex-shrink-0"
                                style={{
                                  color: filled ? color : 'transparent',
                                  stroke: color,
                                  strokeWidth: filled ? 0 : 2,
                                  fill: filled ? color : 'none'
                                }}
                              />
                              <p className="text-base font-semibold text-gray-800">
                                {study.tipoMuestra}
                                {study.codigoMuestra && (
                                  <span className="text-sm text-gray-500 ml-1">({study.codigoMuestra})</span>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Tipo de Contenedor/Tubo */}
                      {study.tipoContenedor && (() => {
                        const realColor = getTubeColorFromName(study.tipoContenedor, study.colorContenedor);
                        const description = getTubeDescription(study.tipoContenedor);
                        return (
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                              <TestTube className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">Tipo de Tubo</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div title={description}>
                                <TubeIcon
                                  color={realColor}
                                  size={44}
                                />
                              </div>
                              <p className="text-base font-semibold text-gray-800">
                                {study.tipoContenedor}
                                {study.abrevContenedor && (
                                  <span className="text-sm text-gray-500 ml-1">({study.abrevContenedor})</span>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Ayuno requerido */}
                {study.requiereAyuno && (
                  <div className="mb-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800">Requiere ayuno</span>
                    </div>
                  </div>
                )}

                {/* Descripción */}
                {study.descripcion && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{study.descripcion}</p>
                  </div>
                )}

                {/* Árbol de pruebas (solo para grupos/perfiles) */}
                {esGrupo && study.pruebas && study.pruebas.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <TestTube className="w-5 h-5 text-eg-purple" />
                      Pruebas Incluidas ({study.pruebas.length})
                    </h3>
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                      <StudyTreeView
                        studyId={study.id}
                        studyName={study.nombre}
                        studyCode={study.codigo}
                        studyType={study.tipo}
                        pruebas={study.pruebas || []}
                        cantidadPruebas={study.cantidadPruebas || 0}
                      />
                    </div>
                  </div>
                )}

                {/* Botón "Más información" */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-eg-pinkLight to-eg-pink/20 border border-eg-pink/30 rounded-lg hover:from-eg-pink/20 hover:to-eg-pink/30 hover:shadow-md transition-all"
                  >
                    <span className="text-base font-semibold text-eg-purple flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Información Adicional
                    </span>
                    {showMoreInfo ? (
                      <ChevronUp className="w-5 h-5 text-eg-purple" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-eg-purple" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showMoreInfo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-3">
                          {/* DEBUG: Mostrar estructura de datos */}
                          {console.log('STUDY DATA:', {
                            nombre: study.nombre,
                            diasProceso: study.diasProceso,
                            valoresReferenciales: study.valoresReferenciales,
                            fichaTecnica: study.fichaTecnica
                          })}
                          {/* Días de Proceso */}
                          {esPrueba && study.diasProceso && study.diasProceso.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Días de Proceso
                              </h4>
                              <div className="flex gap-2">
                                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dia, index) => {
                                  const enabled = study.diasProceso.includes(dia);
                                  return (
                                    <div
                                      key={index}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                                        enabled
                                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                                      }`}
                                      title={enabled ? 'Disponible' : 'No disponible'}
                                    >
                                      {dia}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Valores Referenciales */}
                          {esPrueba && study.valoresReferenciales && study.valoresReferenciales.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Valores de Referencia</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Rango de Edad</th>
                                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Sexo</th>
                                      <th className="px-2 py-2 text-right font-semibold text-gray-600">Valor Mínimo</th>
                                      <th className="px-2 py-2 text-right font-semibold text-gray-600">Valor Máximo</th>
                                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Observaciones</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {study.valoresReferenciales.map((vr) => (
                                      <tr key={vr.id} className={vr.esPanico ? 'bg-red-50' : vr.esEmbarazo ? 'bg-pink-50' : ''}>
                                        <td className="px-2 py-2 text-gray-700">{vr.rangoEdad}</td>
                                        <td className="px-2 py-2 text-gray-700">
                                          {vr.sexo === 'Masculino' && '♂ '}
                                          {vr.sexo === 'Femenino' && '♀ '}
                                          {vr.sexo}
                                        </td>
                                        <td className="px-2 py-2 text-right text-gray-700 font-mono">{vr.valorMin}</td>
                                        <td className="px-2 py-2 text-right text-gray-700 font-mono">{vr.valorMax}</td>
                                        <td className="px-2 py-2 text-gray-600 text-xs">
                                          {vr.esPanico && <span className="text-red-600 font-semibold">⚠ Pánico </span>}
                                          {vr.esEmbarazo && <span className="text-pink-600 font-semibold">🤰 Embarazo </span>}
                                          {vr.comentario}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Metodología */}
                          {study.metodologia && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Metodología</h4>
                              <p className="text-sm text-gray-600">{study.metodologia}</p>
                            </div>
                          )}

                          {/* Valores Normales (texto simple) */}
                          {study.valoresNormales && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Valores Normales (Texto)</h4>
                              <p className="text-sm text-gray-600 whitespace-pre-line">{study.valoresNormales}</p>
                            </div>
                          )}

                          {/* Información de Toma de Muestra */}
                          {esPrueba && study.fichaTecnica?.infoTomaMuestra && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Información de Toma de Muestra</h4>
                              <p className="text-sm text-gray-600 whitespace-pre-line">{study.fichaTecnica.infoTomaMuestra}</p>
                            </div>
                          )}

                          {/* Criterios de Rechazo */}
                          {esPrueba && study.fichaTecnica?.criteriosRechazo && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Criterios de Rechazo</h4>
                              <p className="text-sm text-gray-600 whitespace-pre-line">{study.fichaTecnica.criteriosRechazo}</p>
                            </div>
                          )}

                          {/* Volumen Mínimo y Estabilidad */}
                          {esPrueba && (study.fichaTecnica?.volumenMinimo || study.fichaTecnica?.diasEstabilidad) && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {study.fichaTecnica.volumenMinimo && (
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-1">Volumen Mínimo</h4>
                                    <p className="text-gray-600">{study.fichaTecnica.volumenMinimo} mL</p>
                                  </div>
                                )}
                                {study.fichaTecnica.diasEstabilidad && (
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-1">Días de Estabilidad</h4>
                                    <p className="text-gray-600">{study.fichaTecnica.diasEstabilidad} días</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Mensaje si no hay información adicional */}
                          {!study.metodologia &&
                           !study.valoresNormales &&
                           (!study.valoresReferenciales || study.valoresReferenciales.length === 0) &&
                           (!study.diasProceso || study.diasProceso.length === 0) &&
                           !study.fichaTecnica?.infoTomaMuestra &&
                           !study.fichaTecnica?.criteriosRechazo && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                              <p className="text-sm text-gray-500 italic">
                                No hay información adicional disponible para este estudio.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Footer - Compacto */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-5 py-3 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-xs text-gray-600">
                  Última actualización: {new Date(study.fechaActualizacion).toLocaleDateString('es-ES')}
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-eg-purple to-eg-pink text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StudyDetailModal;
