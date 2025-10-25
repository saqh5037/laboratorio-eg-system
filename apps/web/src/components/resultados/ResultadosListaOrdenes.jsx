export default function ResultadosListaOrdenes({ ordenes, onSelectOrden }) {
  // Función helper para formatear fecha
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
    <div className="space-y-5">
      <div className="grid gap-5">
        {ordenes.map((orden) => {
          const fechaFormateada = formatearFecha(orden.fecha);
          const tieneResultados = parseInt(orden.pruebas_con_resultado) > 0;
          const estanTodos = parseInt(orden.pruebas_con_resultado) === parseInt(orden.total_pruebas);

          return (
            <div
              key={orden.id}
              className="bg-white border-2 border-eg-purple/20 rounded-xl overflow-hidden shadow-lg hover:border-eg-purple hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
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
              {/* Barra superior de color según estado */}
              <div className={`h-2 ${orden.estado === 'Validado' ? 'bg-gradient-to-r from-eg-purple to-eg-pink' : 'bg-eg-pink'}`}></div>

              <div className="p-4 md:p-6">
                <div className="flex items-start gap-3 md:gap-6">
                  {/* Icono grande de documento - Más pequeño en móvil */}
                  <div className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    orden.estado === 'Validado'
                      ? 'bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 border-2 border-eg-purple/30'
                      : 'bg-eg-pink/10 border-2 border-eg-pink/30'
                  }`}>
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-eg-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  {/* Info Principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                      <h4 className="text-lg md:text-2xl text-gray-900 group-hover:text-eg-purple transition-colors">
                        Orden #{orden.numero}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-base font-medium border-2 ${
                        orden.estado === 'Validado'
                          ? 'bg-eg-purple text-white border-eg-purple'
                          : 'bg-eg-pink text-white border-eg-pink'
                      }`}>
                        {orden.estado}
                      </span>
                    </div>

                    <p className="text-sm md:text-lg text-gray-600 mb-3 md:mb-5 flex items-center gap-2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-eg-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {fechaFormateada}
                    </p>

                    {/* Progreso de Resultados - Más compacto en móvil */}
                    <div className="bg-gradient-to-r from-eg-purple/5 to-eg-pink/5 rounded-xl p-3 md:p-4 mb-3 md:mb-4 border border-eg-purple/10">
                      <div className="flex items-center justify-between text-sm md:text-base text-gray-700 mb-2 md:mb-3">
                        <span className="flex items-center gap-1 md:gap-2">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-eg-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="hidden sm:inline">Pruebas Realizadas</span>
                          <span className="sm:hidden">Pruebas</span>
                        </span>
                        <span className="text-lg md:text-xl font-medium text-eg-purple">{orden.pruebas_con_resultado} / {orden.total_pruebas}</span>
                      </div>
                      <div className="w-full bg-white/50 rounded-full h-2 md:h-3 overflow-hidden border border-eg-purple/20">
                        <div
                          className={`h-2 md:h-3 rounded-full transition-all duration-500 ${
                            estanTodos ? 'bg-gradient-to-r from-eg-purple via-eg-pink to-eg-purple bg-[length:200%_100%] animate-pulse' : 'bg-eg-purple'
                          }`}
                          style={{
                            width: `${(parseInt(orden.pruebas_con_resultado) / parseInt(orden.total_pruebas)) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Estado de Disponibilidad - Más compacto en móvil */}
                    {tieneResultados ? (
                      <div className="flex items-center gap-2 md:gap-3 text-sm md:text-lg bg-eg-purple/10 text-eg-purple px-3 py-2 md:px-4 md:py-3 rounded-lg border-2 border-eg-purple/30">
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Resultados disponibles</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 md:gap-3 text-sm md:text-lg bg-gray-100 text-gray-600 px-3 py-2 md:px-4 md:py-3 rounded-lg border-2 border-gray-300">
                        <svg className="w-5 h-5 md:w-6 md:h-6 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">En proceso...</span>
                      </div>
                    )}
                  </div>

                  {/* Icono de Flecha - Más pequeño en móvil */}
                  <div className="flex-shrink-0 hidden sm:flex">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-eg-purple/10 flex items-center justify-center group-hover:bg-eg-purple group-hover:scale-110 transition-all">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-eg-purple group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
