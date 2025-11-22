import { useState, useEffect } from 'react';
import { getAuditLog, getAuditStats } from '../../services/auditApi';
import Card from '../../components/admin/ui/Card';
import Badge from '../../components/admin/ui/Badge';
import {
  Clock,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Calendar,
  FileText
} from 'lucide-react';

export default function AuditLog() {
  // Data state
  const [auditData, setAuditData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    key: '',
    changed_by: '',
    from_date: '',
    to_date: ''
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalResults, setTotalResults] = useState(0);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await getAuditStats();
        // El backend retorna: { total_changes, changes_last_24h, changes_by_user, most_changed_configs }
        // Transformar al formato esperado por el frontend
        const apiStats = response || {};
        const transformedStats = {
          total_changes: apiStats.total_changes || 0,
          changes_today: apiStats.changes_last_24h || 0,
          unique_users: apiStats.changes_by_user?.length || 0,
          most_modified_key: apiStats.most_changed_configs?.[0]?.key || null,
          most_modified_count: apiStats.most_changed_configs?.[0]?.changes || null
        };
        setStats(transformedStats);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch audit log with filters and pagination
  useEffect(() => {
    const fetchAuditLog = async () => {
      try {
        setLoading(true);
        const offset = (page - 1) * pageSize;

        // Build params
        const params = {
          limit: pageSize,
          offset
        };

        if (filters.key) params.key = filters.key;
        if (filters.changed_by) params.changed_by = filters.changed_by;
        if (filters.from_date) params.from_date = filters.from_date;
        if (filters.to_date) params.to_date = filters.to_date;

        const response = await getAuditLog(params);
        // Backend retorna: { data: [...], pagination: { total, limit, offset, has_more } }
        setAuditData(response.data || []);
        setTotalResults(response.pagination?.total || 0);
      } catch (error) {
        console.error('Error al cargar audit log:', error);
        setAuditData([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLog();
  }, [page, pageSize, filters]);

  // Handlers
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      key: '',
      changed_by: '',
      from_date: '',
      to_date: ''
    });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  // Formatting helpers
  const formatDate = (dateString) => {
    if (!dateString) return 'Desconocida';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') return `"${value}"`;
    return String(value);
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalResults / pageSize);
  const startResult = totalResults > 0 ? (page - 1) * pageSize + 1 : 0;
  const endResult = Math.min(page * pageSize, totalResults);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Clock className="w-8 h-8 text-eg-purple" />
          Audit Log
        </h1>
        <p className="text-gray-600 mt-1">Historial completo de cambios en configuraciones</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Cambios</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statsLoading ? '...' : (stats?.total_changes || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cambios Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statsLoading ? '...' : (stats?.changes_today || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statsLoading ? '...' : (stats?.unique_users || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-eg-purple" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Más Modificada</p>
              <p className="text-sm font-medium text-gray-900 mt-2 truncate" title={stats?.most_modified_key}>
                {statsLoading ? '...' : (stats?.most_modified_key || 'N/A')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.most_modified_count ? `${stats.most_modified_count} cambios` : ''}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-eg-purple" />
              Filtros
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Key filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Configuración
              </label>
              <input
                type="text"
                value={filters.key}
                onChange={(e) => handleFilterChange('key', e.target.value)}
                placeholder="Buscar por key..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
              />
            </div>

            {/* User filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={filters.changed_by}
                onChange={(e) => handleFilterChange('changed_by', e.target.value)}
                placeholder="Buscar por usuario..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
              />
            </div>

            {/* From date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={filters.from_date}
                onChange={(e) => handleFilterChange('from_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
              />
            </div>

            {/* To date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filters.to_date}
                onChange={(e) => handleFilterChange('to_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Cambios
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Mostrando {startResult}-{endResult} de {totalResults} resultados
            </p>
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eg-purple"></div>
          </div>
        ) : auditData.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No se encontraron cambios</p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-2 text-eg-purple hover:text-eg-purple/80 text-sm font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Configuración
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cambio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {item.key}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {item.old_value !== null && item.old_value !== undefined && (
                          <>
                            <span className="inline-flex items-center gap-1 text-xs text-red-600">
                              <XCircle className="w-3 h-3" />
                              {formatValue(item.old_value)}
                            </span>
                            <span className="text-gray-400">→</span>
                          </>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          {formatValue(item.new_value)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-eg-purple/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-eg-purple">
                            {(item.changed_by || 'S')[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-gray-900">{item.changed_by || 'Sistema'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(item.changed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalResults > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
