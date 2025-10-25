import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import { getGruposDisponibles, getColorClasses } from '../../utils/pruebaGroups';

/**
 * Componente para seleccionar grupos de pruebas pre-configurados o manual
 * @param {Object} props
 * @param {Array} props.resultados - Array de resultados disponibles
 * @param {Function} props.onGrupoSeleccionado - Callback con array de IDs seleccionados
 * @param {Function} props.onClose - Callback para cerrar
 */
export function SelectorGrupoPruebas({ resultados = [], onGrupoSeleccionado, onClose }) {
  const [modoSeleccion, setModoSeleccion] = useState('grupos'); // 'grupos' o 'manual'
  const [pruebasSeleccionadas, setPruebasSeleccionadas] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

  // Obtener grupos disponibles basados en los resultados del paciente
  const gruposDisponibles = getGruposDisponibles(resultados);

  // Manejar selección de grupo pre-configurado
  const handleSeleccionarGrupo = (grupo) => {
    setGrupoSeleccionado(grupo);
    const pruebaIds = grupo.pruebasDisponibles.map((p) => p.pruebaId);
    setPruebasSeleccionadas(pruebaIds);
  };

  // Manejar selección manual de prueba
  const handleTogglePrueba = (pruebaId) => {
    setPruebasSeleccionadas((prev) => {
      if (prev.includes(pruebaId)) {
        return prev.filter((id) => id !== pruebaId);
      } else {
        return [...prev, pruebaId];
      }
    });
  };

  // Confirmar selección
  const handleConfirmar = () => {
    if (pruebasSeleccionadas.length >= 2) {
      onGrupoSeleccionado(pruebasSeleccionadas);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de modo */}
      <div className="flex gap-3 border-b border-gray-200 pb-4">
        <button
          onClick={() => setModoSeleccion('grupos')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            modoSeleccion === 'grupos'
              ? 'bg-gradient-to-r from-eg-purple to-eg-pink text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎯 Grupos Pre-configurados
        </button>
        <button
          onClick={() => setModoSeleccion('manual')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            modoSeleccion === 'manual'
              ? 'bg-gradient-to-r from-eg-purple to-eg-pink text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✋ Selección Manual
        </button>
      </div>

      {/* Contenido según modo */}
      <AnimatePresence mode="wait">
        {modoSeleccion === 'grupos' ? (
          <motion.div
            key="grupos"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Info */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Grupos Pre-configurados:</strong> Selecciona un conjunto de
                pruebas relacionadas para comparar su evolución.
              </p>
            </div>

            {/* Lista de grupos disponibles */}
            {gruposDisponibles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {gruposDisponibles.map((grupo) => {
                  const colorClasses = getColorClasses(grupo.color);
                  const isSelected = grupoSeleccionado?.id === grupo.id;

                  return (
                    <motion.button
                      key={grupo.id}
                      onClick={() => handleSeleccionarGrupo(grupo)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `${colorClasses.border} ${colorClasses.bg} ring-2 ring-offset-2 ring-eg-purple shadow-lg`
                          : `${colorClasses.border} ${colorClasses.bg} ${colorClasses.hover}`
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{grupo.icono}</span>
                          <div>
                            <h4 className={`font-bold ${colorClasses.text}`}>
                              {grupo.nombre}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {grupo.descripcion}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <FaCheckCircle className="text-eg-purple text-xl flex-shrink-0" />
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {grupo.cantidadDisponible} de {grupo.cantidadTotal} disponibles
                          </span>
                          <div className="flex gap-1">
                            {grupo.pruebasDisponibles.slice(0, 3).map((prueba, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 ${colorClasses.bg} ${colorClasses.text} rounded text-xs font-medium`}
                              >
                                {prueba.nomenclatura}
                              </span>
                            ))}
                            {grupo.cantidadDisponible > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{grupo.cantidadDisponible - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600">
                  No se encontraron grupos de pruebas disponibles
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Intenta con selección manual
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="manual"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Info */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                ✋ <strong>Selección Manual:</strong> Elige al menos 2 pruebas para
                comparar. Selecciona pruebas relacionadas para mejores resultados.
              </p>
            </div>

            {/* Contador de seleccionadas */}
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Pruebas seleccionadas:
              </span>
              <span className="text-lg font-bold text-eg-purple">
                {pruebasSeleccionadas.length}
              </span>
            </div>

            {/* Lista de pruebas */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {resultados.map((resultado) => {
                const isSelected = pruebasSeleccionadas.includes(resultado.prueba_id);

                return (
                  <motion.button
                    key={resultado.prueba_id}
                    onClick={() => handleTogglePrueba(resultado.prueba_id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-eg-purple/10 border-eg-purple ring-2 ring-offset-2 ring-eg-purple shadow-md'
                        : 'bg-white border-gray-200 hover:border-eg-purple/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-eg-purple border-eg-purple'
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          {isSelected && <FaCheckCircle className="text-white text-sm" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {resultado.prueba_nombre}
                          </h4>
                          {resultado.nomenclatura && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              ({resultado.nomenclatura})
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {resultado.valor} {resultado.unidad}
                        </div>
                        <div
                          className={`text-xs mt-1 px-2 py-0.5 rounded ${
                            resultado.estado === 'normal'
                              ? 'bg-green-100 text-green-700'
                              : resultado.estado === 'bajo'
                              ? 'bg-yellow-100 text-yellow-700'
                              : resultado.estado === 'alto'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {resultado.estado}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="flex-1 py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          <FaTimes />
          Cancelar
        </button>
        <button
          onClick={handleConfirmar}
          disabled={pruebasSeleccionadas.length < 2}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-eg-purple to-eg-pink text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FaCheckCircle />
          Comparar ({pruebasSeleccionadas.length})
        </button>
      </div>

      {pruebasSeleccionadas.length > 0 && pruebasSeleccionadas.length < 2 && (
        <div className="text-center text-sm text-orange-600">
          ⚠️ Selecciona al menos 2 pruebas para comparar
        </div>
      )}
    </div>
  );
}

export default SelectorGrupoPruebas;
