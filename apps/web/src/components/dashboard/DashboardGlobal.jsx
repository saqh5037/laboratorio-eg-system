import { FiltrosCollapsible } from './FiltrosCollapsible';

/**
 * Dashboard Global Ultra-Compacto del Paciente
 * Filtros colapsables únicamente
 * Stats y acciones movidas al header principal
 *
 * @param {Object} props
 * @param {string} props.pacienteNombre - Nombre completo del paciente (no usado, legacy)
 * @param {string} props.pacienteCi - CI del paciente (no usado, legacy)
 * @param {Array} props.ordenes - Array de órdenes del paciente (no usado, legacy)
 */
export function DashboardGlobal({ pacienteNombre, pacienteCi, ordenes = [], filtrosExpanded, onToggleFiltros }) {
  return (
    <div className="mb-4">
      {/* Solo filtros colapsables */}
      <FiltrosCollapsible
        externalIsExpanded={filtrosExpanded}
        onToggleExpanded={onToggleFiltros}
      />
    </div>
  );
}

export default DashboardGlobal;
