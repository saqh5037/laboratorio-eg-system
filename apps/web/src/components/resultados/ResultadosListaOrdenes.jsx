/**
 * Vista de LISTA COMPACTA de Órdenes de Laboratorio
 * Optimizado para adultos mayores con sistema de semáforo sutil
 * Mantiene identidad visual EG (purple/pink)
 */

export default function ResultadosListaOrdenes({ ordenes, onSelectOrden }) {
  // Función helper para formatear fecha compacta
  const formatearFechaCorta = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Clasificación de estado con sistema de semáforo
  const getSemaforoEstado = (orden) => {
    const total = parseInt(orden.total_pruebas);
    const conResultado = parseInt(orden.pruebas_con_resultado);

    if (conResultado === total && orden.estado === 'Validado') {
      return 'completo'; // Verde - Todo listo
    } else if (conResultado > 0) {
      return 'proceso'; // Amarillo - En progreso
    } else {
      return 'pendiente'; // Gris - Sin resultados
    }
  };

  // Configuración de colores por estado de semáforo (SUTIL)
  const semaforoConfig = {
    completo: {
      borderClass: 'border-l-4 border-green-500',
      bgClass: 'bg-green-50/20',
      dotClass: 'bg-green-500',
      mensaje: 'Listo para ver'
    },
    proceso: {
      borderClass: 'border-l-4 border-yellow-500',
      bgClass: 'bg-yellow-50/20',
      dotClass: 'bg-yellow-500',
      mensaje: 'En proceso'
    },
    pendiente: {
      borderClass: 'border-l-4 border-gray-400',
      bgClass: 'bg-white',
      dotClass: 'bg-gray-400',
      mensaje: 'Pendiente'
    }
  };

  if (!ordenes || ordenes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-eg-purple/10 border-2 border-eg-purple/30 rounded-full mb-6">
          <svg className="w-10 h-10 text-eg-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl text-gray-900 mb-2">
          No hay órdenes disponibles
        </h3>
        <p className="text-lg text-gray-600">
          No se encontraron órdenes de laboratorio para este paciente
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-eg-purple/20 shadow-lg overflow-hidden">
      {/* Header estilo tabla con gradiente EG */}
      <div className="bg-gradient-to-r from-eg-purple to-eg-pink text-white px-6 py-4 hidden md:block">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-2 text-base font-medium">Orden #</div>
          <div className="col-span-2 text-base font-medium">Estado</div>
          <div className="col-span-3 text-base font-medium">Fecha</div>
          <div className="col-span-4 text-base font-medium">Progreso</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Lista de órdenes - Desktop */}
      <div className="divide-y divide-gray-200 hidden md:block">
        {ordenes.map((orden) => {
          const semaforo = getSemaforoEstado(orden);
          const config = semaforoConfig[semaforo];
          const porcentaje = (parseInt(orden.pruebas_con_resultado) / parseInt(orden.total_pruebas)) * 100;

          return (
            <div
              key={orden.id}
              className={`${config.borderClass} ${config.bgClass} px-6 py-4 hover:bg-eg-purple/5 transition-all duration-200 cursor-pointer group min-h-[52px]`}
              onClick={() => onSelectOrden(orden)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectOrden(orden);
                }
              }}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Columna 1: Número de Orden */}
                <div className="col-span-2">
                  <span className="text-xl text-gray-900 group-hover:text-eg-purple transition-colors">
                    #{orden.numero}
                  </span>
                </div>

                {/* Columna 2: Estado con dot indicator */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border-2 ${
                    orden.estado === 'Validado'
                      ? 'bg-eg-purple/10 text-eg-purple border-eg-purple/30'
                      : 'bg-eg-pink/10 text-eg-purple border-eg-pink/30'
                  }`}>
                    {/* Dot indicator del semáforo */}
                    <span className={`w-2.5 h-2.5 rounded-full ${config.dotClass}`} aria-hidden="true"></span>
                    {orden.estado}
                  </span>
                </div>

                {/* Columna 3: Fecha con icono */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2 text-base text-gray-700">
                    <svg className="w-4 h-4 text-eg-purple flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatearFechaCorta(orden.fecha)}</span>
                  </div>
                </div>

                {/* Columna 4: Progreso con barra y números */}
                <div className="col-span-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border border-gray-300">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            porcentaje === 100
                              ? 'bg-gradient-to-r from-eg-purple to-eg-pink'
                              : 'bg-eg-purple'
                          }`}
                          style={{ width: `${porcentaje}%` }}
                          role="progressbar"
                          aria-valuenow={porcentaje}
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-label={`${orden.pruebas_con_resultado} de ${orden.total_pruebas} pruebas completadas`}
                        />
                      </div>
                    </div>
                    <span className="text-base text-gray-900 whitespace-nowrap font-medium min-w-[60px] text-right">
                      {orden.pruebas_con_resultado}/{orden.total_pruebas}
                    </span>
                  </div>
                </div>

                {/* Columna 5: Botón de acción */}
                <div className="col-span-1 flex justify-end">
                  <div className="w-10 h-10 rounded-full bg-eg-purple/10 flex items-center justify-center group-hover:bg-eg-purple group-hover:scale-110 transition-all duration-200">
                    <svg className="w-5 h-5 text-eg-purple group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista de órdenes - Móvil (tarjetas apiladas) */}
      <div className="md:hidden space-y-4 p-4">
        {ordenes.map((orden) => {
          const semaforo = getSemaforoEstado(orden);
          const config = semaforoConfig[semaforo];
          const porcentaje = (parseInt(orden.pruebas_con_resultado) / parseInt(orden.total_pruebas)) * 100;

          return (
            <div
              key={orden.id}
              className={`${config.borderClass} ${config.bgClass} rounded-r-xl shadow-md p-4 active:scale-98 transition-all cursor-pointer min-h-[72px]`}
              onClick={() => onSelectOrden(orden)}
              role="button"
              tabIndex={0}
            >
              {/* Fila 1: Número de orden + Estado */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl text-gray-900">#{orden.numero}</span>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-base border-2 ${
                  orden.estado === 'Validado'
                    ? 'bg-eg-purple/10 text-eg-purple border-eg-purple/30'
                    : 'bg-eg-pink/10 text-eg-purple border-eg-pink/30'
                }`}>
                  <span className={`w-3 h-3 rounded-full ${config.dotClass}`}></span>
                  {orden.estado}
                </span>
              </div>

              {/* Fila 2: Fecha */}
              <div className="flex items-center gap-2 text-base text-gray-700 mb-3">
                <svg className="w-5 h-5 text-eg-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatearFechaCorta(orden.fecha)}</span>
              </div>

              {/* Fila 3: Progreso grande */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        porcentaje === 100
                          ? 'bg-gradient-to-r from-eg-purple to-eg-pink'
                          : 'bg-eg-purple'
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
                <span className="text-lg text-gray-900 font-medium whitespace-nowrap min-w-[70px] text-right">
                  {orden.pruebas_con_resultado}/{orden.total_pruebas}
                </span>
              </div>

              {/* Indicador de mensaje */}
              <div className="mt-3 text-sm text-gray-600">
                {config.mensaje}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
