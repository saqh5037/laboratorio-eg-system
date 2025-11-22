import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfigManager } from '../../hooks/useConfigManager';
import { getRecentAudit } from '../../services/auditApi';
import Card from '../../components/admin/ui/Card';
import Badge from '../../components/admin/ui/Badge';
import {
  LayoutDashboard,
  FileText,
  Lock,
  Zap,
  AlertTriangle,
  Activity,
  Settings,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { configs, isLoading, getConfigValue, updateConfig } = useConfigManager();
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Cargar actividad reciente
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoadingActivity(true);
        const response = await getRecentAudit(10);
        setRecentActivity(response.data || []);
      } catch (error) {
        console.error('Error al cargar actividad reciente:', error);
        setRecentActivity([]);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchRecentActivity();
  }, []);

  // Calcular métricas
  const getPagesCount = () => {
    const pages = ['resultados', 'estudios', 'nosotros', 'contacto'];
    const enabled = pages.filter(page =>
      getConfigValue(`ui.pages.${page}.enabled`) !== false
    );
    return { enabled: enabled.length, total: pages.length };
  };

  const getAuthMethodsCount = () => {
    const methods = ['telegram', 'whatsapp', 'cedula', 'sms'];
    const enabled = methods.filter(method =>
      getConfigValue(`auth.methods.${method}.enabled`) === true
    );
    return { enabled: enabled.length, total: methods.length };
  };

  const getFeaturesCount = () => {
    const features = [
      'features.pwa.notifications.enabled',
      'features.pwa.service_worker.enabled',
      'features.pwa.offline_mode.enabled',
      'features.pwa.background_sync.enabled',
      'features.pwa.install_prompt.enabled',
      'features.dashboard.global.enabled',
      'features.dashboard.heatmap.enabled',
      'features.dashboard.charts.enabled',
      'features.dashboard.health_score.enabled',
      'features.export.pdf.enabled',
      'features.export.json.enabled',
      'features.search.advanced.enabled',
      'features.favorites.enabled',
      'features.favorites.folders.enabled'
    ];
    const enabled = features.filter(feat => getConfigValue(feat) !== false);
    return { enabled: enabled.length, total: features.length };
  };

  const isMaintenanceMode = () => {
    return getConfigValue('system.maintenance_mode.enabled') === true;
  };

  const handleMaintenanceToggle = async () => {
    const currentValue = isMaintenanceMode();
    await updateConfig('system.maintenance_mode.enabled', !currentValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Desconocida';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') return `"${value}"`;
    return String(value);
  };

  const pagesCount = getPagesCount();
  const authCount = getAuthMethodsCount();
  const featuresCount = getFeaturesCount();
  const maintenance = isMaintenanceMode();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eg-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-eg-purple" />
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Vista general del sistema</p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Páginas Activas */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/configurations')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Páginas Activas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {pagesCount.enabled}/{pagesCount.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant={pagesCount.enabled === pagesCount.total ? 'success' : 'warning'}>
              {pagesCount.enabled === pagesCount.total ? 'Todas activas' : 'Parcial'}
            </Badge>
          </div>
        </Card>

        {/* Métodos Auth */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/configurations')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Métodos Auth</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {authCount.enabled}/{authCount.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Lock className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant={authCount.enabled > 0 ? 'success' : 'danger'}>
              {authCount.enabled > 0 ? 'Configurado' : 'Sin métodos'}
            </Badge>
          </div>
        </Card>

        {/* Features */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/configurations')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Features</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {featuresCount.enabled}/{featuresCount.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-eg-purple" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-eg-purple h-2 rounded-full transition-all"
                style={{ width: `${(featuresCount.enabled / featuresCount.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Mantenimiento */}
        <Card className={`hover:shadow-lg transition-shadow ${maintenance ? 'border-orange-200 bg-orange-50' : ''}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mantenimiento</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {maintenance ? 'ACTIVO' : 'Inactivo'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              maintenance ? 'bg-orange-200' : 'bg-green-100'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${maintenance ? 'text-orange-600' : 'text-green-600'}`} />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleMaintenanceToggle}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                maintenance
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {maintenance ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </Card>
      </div>

      {/* Información del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Info */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-eg-purple" />
            Sistema
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Versión</p>
              <p className="font-medium text-gray-900">{getConfigValue('system.version') || '1.0.0'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ambiente</p>
              <Badge variant={getConfigValue('system.environment') === 'production' ? 'success' : 'warning'}>
                {getConfigValue('system.environment') || 'development'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Lab Info */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-eg-purple" />
            Laboratorio
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Nombre</p>
              <p className="font-medium text-gray-900">{getConfigValue('system.lab.name') || 'Laboratorio EG'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Teléfono</p>
              <p className="font-medium text-gray-900">{getConfigValue('system.lab.phone') || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-eg-purple" />
            Acciones Rápidas
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/admin/configurations')}
              className="w-full px-4 py-2 bg-eg-purple hover:bg-eg-purple/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configuraciones
            </button>
            <button
              onClick={() => navigate('/admin/audit')}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Audit Log
            </button>
          </div>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-eg-purple" />
            Actividad Reciente
          </h3>
          <button
            onClick={() => navigate('/admin/audit')}
            className="text-sm text-eg-purple hover:text-eg-purple/80 font-medium"
          >
            Ver todo →
          </button>
        </div>

        {loadingActivity ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eg-purple"></div>
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay actividad reciente
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
                {recentActivity.map((item, index) => (
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
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.changed_by || 'Sistema'}
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
      </Card>
    </div>
  );
}
