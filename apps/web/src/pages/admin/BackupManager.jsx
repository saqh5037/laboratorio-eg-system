import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import {
  Database,
  Download,
  Upload,
  Save,
  Trash2,
  RotateCcw,
  Clock,
  User,
  FileJson,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_CONFIG_API_URL || 'http://localhost:3005';

export default function BackupManager() {
  const { token } = useAdminAuth();
  const [backups, setBackups] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(null);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [importData, setImportData] = useState(null);
  const [showImportPreview, setShowImportPreview] = useState(false);

  // Fetch current company info
  const fetchCurrentCompany = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/company`);
      const data = await response.json();
      if (data.success) {
        setCurrentCompany(data.data);
      }
    } catch (error) {
      console.error('Error fetching current company:', error);
    }
  };

  // Fetch backups list
  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/backup/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBackups(data.data);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Error al cargar backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentCompany();
      fetchBackups();
    }
  }, [token]);

  // Save current configuration as backup
  const handleSaveBackup = async () => {
    if (!backupName.trim()) {
      toast.error('Nombre del backup requerido');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/api/backup/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: backupName.trim(),
          description: backupDescription.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Backup "${backupName}" guardado exitosamente`);
        setShowSaveForm(false);
        setBackupName('');
        setBackupDescription('');
        fetchBackups();
      } else {
        toast.error(data.error || 'Error al guardar backup');
      }
    } catch (error) {
      console.error('Error saving backup:', error);
      toast.error('Error al guardar backup');
    } finally {
      setSaving(false);
    }
  };

  // Export current config as JSON download
  const handleExportJSON = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/backup/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `config-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Configuración exportada a JSON');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error al exportar configuración');
    }
  };

  // Handle file upload for import
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json.version || !json.data) {
          toast.error('Formato de backup inválido');
          return;
        }
        setImportData(json);
        setShowImportPreview(true);
        toast.success('Archivo cargado correctamente');
      } catch (err) {
        toast.error('Error al parsear JSON');
      }
    };
    reader.readAsText(file);
  };

  // Import configuration from JSON
  const handleImportJSON = async () => {
    if (!importData) return;

    try {
      setRestoring(true);
      const response = await fetch(`${API_BASE}/api/backup/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: importData })
      });

      const data = await response.json();
      if (data.success) {
        // Limpiar caché de localStorage para forzar actualización
        localStorage.removeItem('eg_company_cache');
        localStorage.removeItem('eg_company_cache_timestamp');

        toast.success('Configuración importada. Recargando página...');
        setShowImportPreview(false);
        setImportData(null);

        // Recargar página con delay mínimo para que el toast se vea
        setTimeout(() => {
          window.location.reload(true); // Hard reload
        }, 300);
      } else {
        toast.error(data.error || 'Error al importar');
      }
    } catch (error) {
      console.error('Error importing:', error);
      toast.error('Error al importar configuración');
    } finally {
      setRestoring(false);
    }
  };

  // Restore from saved backup
  const handleRestoreBackup = async (backupId) => {
    try {
      setRestoring(true);
      const response = await fetch(`${API_BASE}/api/backup/${backupId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Limpiar caché de localStorage para forzar actualización
        localStorage.removeItem('eg_company_cache');
        localStorage.removeItem('eg_company_cache_timestamp');

        toast.success('Configuración restaurada. Recargando página...');
        setShowConfirmRestore(null);

        // Recargar página con delay mínimo para que el toast se vea
        setTimeout(() => {
          window.location.reload(true); // Hard reload para limpiar todo el caché
        }, 300); // Delay mínimo de 300ms para feedback visual
      } else {
        toast.error(data.error || 'Error al restaurar');
      }
    } catch (error) {
      console.error('Error restoring:', error);
      toast.error('Error al restaurar backup');
    } finally {
      setRestoring(false);
    }
  };

  // Delete backup
  const handleDeleteBackup = async (backupId, backupName) => {
    if (!confirm(`¿Estás seguro de eliminar el backup "${backupName}"?`)) return;

    try {
      const response = await fetch(`${API_BASE}/api/backup/${backupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Backup eliminado');
        fetchBackups();
      } else {
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Error al eliminar backup');
    }
  };

  // View backup details
  const handleViewBackup = async (backupId) => {
    try {
      const response = await fetch(`${API_BASE}/api/backup/${backupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setShowPreview(data.data);
      }
    } catch (error) {
      console.error('Error fetching backup details:', error);
      toast.error('Error al cargar detalles del backup');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determinar si un backup corresponde a la configuración activa
  const isActiveBackup = (backup) => {
    if (!currentCompany || !backup.data) {
      return false;
    }

    // Extraer el nombre de la empresa desde la estructura de datos del backup
    // Los backups guardan la config en: backup.data.data.company_info[0].name (es un array)
    const backupCompanyName = backup.data?.data?.company_info?.[0]?.name;

    if (!backupCompanyName) {
      return false;
    }

    // Comparar nombre de empresa (case-insensitive, trimmed)
    const currentName = currentCompany.name?.toLowerCase().trim();
    const backupName = backupCompanyName?.toLowerCase().trim();

    return currentName === backupName;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="text-eg-purple" />
            Gestión de Backups
          </h1>
          <p className="text-gray-600 mt-1">
            Guarda y restaura configuraciones completas del sistema
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Save Current Config */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowSaveForm(true)}
          className="p-6 bg-gradient-to-br from-eg-purple to-eg-pink text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Save size={32} className="mb-3" />
          <h3 className="text-lg font-semibold">Guardar Configuración</h3>
          <p className="text-sm opacity-90 mt-1">Crear backup de config actual</p>
        </motion.button>

        {/* Export JSON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportJSON}
          className="p-6 bg-white border-2 border-eg-purple text-eg-purple rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Download size={32} className="mb-3" />
          <h3 className="text-lg font-semibold">Exportar JSON</h3>
          <p className="text-sm opacity-75 mt-1">Descargar config como archivo</p>
        </motion.button>

        {/* Import JSON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => document.getElementById('import-file').click()}
          className="p-6 bg-white border-2 border-green-500 text-green-600 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Upload size={32} className="mb-3" />
          <h3 className="text-lg font-semibold">Importar JSON</h3>
          <p className="text-sm opacity-75 mt-1">Cargar config desde archivo</p>
        </motion.button>
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Saved Backups List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileJson className="text-eg-purple" />
          Backups Guardados
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-eg-purple border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando backups...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Database size={48} className="mx-auto mb-3 opacity-50" />
            <p>No hay backups guardados</p>
            <p className="text-sm">Haz clic en "Guardar Configuración" para crear el primero</p>
          </div>
        ) : (
          <div className="space-y-4">
            {backups.map((backup) => {
              const isActive = isActiveBackup(backup);
              return (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 transition-all ${
                  isActive
                    ? 'border-green-500 bg-green-50/50 ring-2 ring-green-500/20'
                    : 'border-gray-200 hover:border-eg-purple'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{backup.name}</h3>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                          <CheckCircle size={12} />
                          ACTIVO
                        </span>
                      )}
                    </div>
                    {backup.description && (
                      <p className="text-sm text-gray-600 mt-1">{backup.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(backup.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {backup.created_by}
                      </span>
                      {backup.metadata && (
                        <span className="flex items-center gap-1">
                          <Info size={14} />
                          {backup.metadata.total_navigation_items} nav items,{' '}
                          {backup.metadata.total_system_configs} configs
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewBackup(backup.id)}
                      className="p-2 text-gray-600 hover:text-eg-purple hover:bg-eg-purple/10 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => setShowConfirmRestore(backup)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Restaurar"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id, backup.name)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save Backup Modal */}
      {showSaveForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Save className="text-eg-purple" />
              Guardar Backup
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Backup *
                </label>
                <input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="ej: elizabeth-gutierrez, microtech-demo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Descripción del backup..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSaveForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBackup}
                disabled={saving}
                className="px-4 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirm Restore Modal */}
      {showConfirmRestore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold">Confirmar Restauración</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Estás a punto de restaurar la configuración desde el backup{' '}
              <strong>"{showConfirmRestore.name}"</strong>.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Advertencia:</strong> Esta acción reemplazará toda la configuración actual
                (navegación, empresa, temas, etc.). Se recomienda hacer un backup primero.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmRestore(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRestoreBackup(showConfirmRestore.id)}
                disabled={restoring}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {restoring ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Restaurando...
                  </>
                ) : (
                  <>
                    <RotateCcw size={18} />
                    Restaurar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Import Preview Modal */}
      {showImportPreview && importData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Upload className="text-green-600" />
                Vista Previa de Importación
              </h3>
              <button
                onClick={() => setShowImportPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Información del Backup</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Versión:</strong> {importData.version}
                  </p>
                  <p>
                    <strong>Exportado:</strong> {formatDate(importData.exported_at)}
                  </p>
                </div>
              </div>

              {importData.metadata && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Contenido a Importar</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>
                      <strong>Navigation Items:</strong> {importData.metadata.total_navigation_items}
                    </p>
                    <p>
                      <strong>Temas:</strong> {importData.metadata.total_themes}
                    </p>
                    <p>
                      <strong>System Configs:</strong> {importData.metadata.total_system_configs}
                    </p>
                    <p>
                      <strong>Carousel Slides:</strong> {importData.metadata.total_carousel_slides}
                    </p>
                    <p>
                      <strong>Landing Content:</strong> {importData.metadata.total_landing_content}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Advertencia:</strong> Esta acción reemplazará TODA la configuración actual.
                  Asegúrate de tener un backup antes de continuar.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowImportPreview(false);
                  setImportData(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportJSON}
                disabled={restoring}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {restoring ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Confirmar Importación
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Backup Details Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Detalles: {showPreview.name}
              </h3>
              <button
                onClick={() => setShowPreview(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{JSON.stringify(showPreview.data, null, 2)}</pre>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
