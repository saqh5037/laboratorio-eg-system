import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useConfigManager } from '../../hooks/useConfigManager';
import Toggle from '../../components/admin/ui/Toggle';
import Card from '../../components/admin/ui/Card';
import Badge from '../../components/admin/ui/Badge';
import {
  FileText, Beaker, Users, Phone,
  MessageCircle, MessageSquare, CreditCard, Smartphone,
  Bell, Wifi, Download, Search, Star, AlertTriangle,
  RefreshCw, Loader2
} from 'lucide-react';

export default function Configurations() {
  const { configs, isLoading, isSaving, updateConfig, getConfigValue } = useConfigManager();
  const [selectedTab, setSelectedTab] = useState(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-eg-purple mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  // Datos de páginas
  const pages = [
    {
      key: 'resultados',
      label: 'Portal de Resultados',
      description: 'Permite a pacientes ver sus resultados clínicos',
      icon: FileText,
      configKey: 'ui.pages.resultados.enabled'
    },
    {
      key: 'estudios',
      label: 'Catálogo de Estudios',
      description: 'Directorio de estudios disponibles',
      icon: Beaker,
      configKey: 'ui.pages.estudios.enabled'
    },
    {
      key: 'nosotros',
      label: 'Página Nosotros',
      description: 'Información sobre el laboratorio',
      icon: Users,
      configKey: 'ui.pages.nosotros.enabled'
    },
    {
      key: 'contacto',
      label: 'Página de Contacto',
      description: 'Formulario de contacto',
      icon: Phone,
      configKey: 'ui.pages.contacto.enabled'
    }
  ];

  // Datos de métodos de autenticación
  const authMethods = [
    {
      id: 'telegram',
      name: 'Telegram',
      icon: MessageCircle,
      description: 'Autenticación vía bot de Telegram',
      enabledKey: 'auth.methods.telegram.enabled',
      priorityKey: 'auth.methods.telegram.priority'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageSquare,
      description: 'Autenticación vía WhatsApp',
      enabledKey: 'auth.methods.whatsapp.enabled',
      priorityKey: 'auth.methods.whatsapp.priority'
    },
    {
      id: 'cedula',
      name: 'Cédula + Fecha',
      icon: CreditCard,
      description: 'Cédula y fecha de nacimiento',
      enabledKey: 'auth.methods.cedula.enabled',
      priorityKey: 'auth.methods.cedula.priority'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: Smartphone,
      description: 'Código por SMS (no implementado)',
      enabledKey: 'auth.methods.sms.enabled',
      priorityKey: 'auth.methods.sms.priority',
      disabled: true
    }
  ];

  // Features agrupadas
  const featureGroups = {
    pwa: {
      title: 'PWA Features',
      features: [
        { key: 'features.pwa.notifications.enabled', label: 'Push Notifications', icon: Bell },
        { key: 'features.pwa.service_worker.enabled', label: 'Service Worker', icon: Wifi },
        { key: 'features.pwa.offline_mode.enabled', label: 'Modo Offline', icon: Wifi },
        { key: 'features.pwa.background_sync.enabled', label: 'Background Sync', icon: RefreshCw },
        { key: 'features.pwa.install_prompt.enabled', label: 'Prompt de Instalación', icon: Download }
      ]
    },
    dashboard: {
      title: 'Dashboard Features',
      features: [
        { key: 'features.dashboard.global.enabled', label: 'Dashboard Global', icon: FileText },
        { key: 'features.dashboard.heatmap.enabled', label: 'Heatmap', icon: FileText },
        { key: 'features.dashboard.charts.enabled', label: 'Gráficas', icon: FileText },
        { key: 'features.dashboard.health_score.enabled', label: 'Health Score', icon: FileText }
      ]
    },
    export: {
      title: 'Exportación',
      features: [
        { key: 'features.export.pdf.enabled', label: 'Export PDF', icon: Download },
        { key: 'features.export.json.enabled', label: 'Export JSON', icon: Download }
      ]
    },
    search: {
      title: 'Búsqueda y Favoritos',
      features: [
        { key: 'features.search.advanced.enabled', label: 'Búsqueda Avanzada', icon: Search },
        { key: 'features.favorites.enabled', label: 'Favoritos', icon: Star },
        { key: 'features.favorites.folders.enabled', label: 'Carpetas de Favoritos', icon: Star }
      ]
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuraciones del Sistema</h1>
        <p className="text-gray-600 mt-1">
          Gestiona las configuraciones globales del sistema
        </p>
      </div>

      {/* Tabs */}
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-eg-purple/10 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              transition-all duration-200
              ${selected
                ? 'bg-white text-eg-purple shadow'
                : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
              }`
            }
          >
            UI - Páginas
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              transition-all duration-200
              ${selected
                ? 'bg-white text-eg-purple shadow'
                : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
              }`
            }
          >
            AUTH - Autenticación
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              transition-all duration-200
              ${selected
                ? 'bg-white text-eg-purple shadow'
                : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
              }`
            }
          >
            FEATURES
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              transition-all duration-200
              ${selected
                ? 'bg-white text-eg-purple shadow'
                : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
              }`
            }
          >
            SYSTEM
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* TAB 1: UI - Páginas */}
          <Tab.Panel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pages.map((page) => {
                const Icon = page.icon;
                const rawValue = getConfigValue(page.configKey);
                const enabled = rawValue !== false;

                const handleToggle = (newValue) => {
                  updateConfig(page.configKey, newValue);
                };

                return (
                  <Card key={page.key} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${enabled ? 'bg-eg-purple/10' : 'bg-gray-100'}`}>
                          <Icon className={`w-6 h-6 ${enabled ? 'text-eg-purple' : 'text-gray-400'}`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{page.label}</h4>
                          <Badge variant={enabled ? 'success' : 'danger'}>
                            {enabled ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{page.description}</p>
                        <Toggle
                          enabled={enabled}
                          onChange={handleToggle}
                          disabled={isSaving}
                          label={enabled ? 'Desactivar página' : 'Activar página'}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Tab.Panel>

          {/* TAB 2: AUTH - Autenticación */}
          <Tab.Panel>
            <div className="space-y-6">
              {/* Sección: Métodos de autenticación */}
              <Card title="Métodos de Autenticación" description="Configura cómo los pacientes pueden autenticarse para ver sus resultados">
                <div className="space-y-4">
                  {authMethods.map((method) => {
                    const Icon = method.icon;
                    const enabled = getConfigValue(method.enabledKey) !== false;
                    const priority = getConfigValue(method.priorityKey) || 99;

                    return (
                      <div key={method.id} className="border border-gray-200 rounded-lg p-4 hover:border-eg-purple/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? 'bg-eg-purple/10' : 'bg-gray-100'}`}>
                            <Icon className={`w-5 h-5 ${enabled ? 'text-eg-purple' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900">{method.name}</h4>
                              {method.disabled && (
                                <Badge variant="warning">No implementado</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1">Prioridad</p>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={priority}
                                onChange={(e) => updateConfig(method.priorityKey, parseInt(e.target.value))}
                                disabled={isSaving || method.disabled}
                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-eg-purple focus:border-transparent disabled:opacity-50"
                              />
                            </div>
                            <Toggle
                              enabled={enabled}
                              onChange={(value) => updateConfig(method.enabledKey, value)}
                              disabled={isSaving || method.disabled}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Sección: Timeouts */}
              <Card title="Configuración de Sesión" description="Tiempos de expiración y seguridad">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiración de código (minutos)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={getConfigValue('auth.code_expiration_minutes') || 15}
                      onChange={(e) => updateConfig('auth.code_expiration_minutes', parseInt(e.target.value))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">5-60 minutos</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración sesión JWT (minutos)
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="1440"
                      value={getConfigValue('auth.jwt_expiration_minutes') || 480}
                      onChange={(e) => updateConfig('auth.jwt_expiration_minutes', parseInt(e.target.value))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">60-1440 minutos (1-24 horas)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo intentos de login
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={getConfigValue('auth.max_login_attempts') || 5}
                      onChange={(e) => updateConfig('auth.max_login_attempts', parseInt(e.target.value))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">3-10 intentos</p>
                  </div>
                </div>
              </Card>
            </div>
          </Tab.Panel>

          {/* TAB 3: FEATURES */}
          <Tab.Panel>
            <div className="space-y-4">
              {Object.entries(featureGroups).map(([groupKey, group]) => (
                <Card key={groupKey} title={group.title}>
                  <div className="space-y-3">
                    {group.features.map((feature) => {
                      const Icon = feature.icon;
                      const enabled = getConfigValue(feature.key) !== false;

                      return (
                        <div key={feature.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{feature.label}</span>
                          </div>
                          <Toggle
                            enabled={enabled}
                            onChange={(value) => updateConfig(feature.key, value)}
                            disabled={isSaving}
                          />
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </Tab.Panel>

          {/* TAB 4: SYSTEM */}
          <Tab.Panel>
            <div className="space-y-6">
              {/* Modo mantenimiento */}
              <Card
                title="Modo Mantenimiento"
                description="Deshabilita temporalmente el acceso de los usuarios al sistema"
                className="border-orange-200 bg-orange-50/30"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-orange-200">
                    <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    <div className="flex-1">
                      <Toggle
                        enabled={getConfigValue('system.maintenance_mode.enabled') === true}
                        onChange={(value) => updateConfig('system.maintenance_mode.enabled', value)}
                        disabled={isSaving}
                        label="Activar modo mantenimiento"
                        description="Los usuarios no podrán acceder al sistema"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje para los usuarios
                    </label>
                    <textarea
                      rows="3"
                      value={getConfigValue('system.maintenance_mode.message') || 'Sistema en mantenimiento. Volvemos pronto.'}
                      onChange={(e) => updateConfig('system.maintenance_mode.message', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                      placeholder="Mensaje que verán los usuarios..."
                    />
                  </div>
                </div>
              </Card>

              {/* Información del laboratorio */}
              <Card title="Información del Laboratorio" description="Datos de contacto y ubicación">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del laboratorio
                    </label>
                    <input
                      type="text"
                      value={getConfigValue('system.lab.name') || ''}
                      onChange={(e) => updateConfig('system.lab.name', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={getConfigValue('system.lab.phone') || ''}
                      onChange={(e) => updateConfig('system.lab.phone', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={getConfigValue('system.lab.whatsapp') || ''}
                      onChange={(e) => updateConfig('system.lab.whatsapp', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={getConfigValue('system.lab.email') || ''}
                      onChange={(e) => updateConfig('system.lab.email', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <textarea
                      rows="2"
                      value={getConfigValue('system.lab.address') || ''}
                      onChange={(e) => updateConfig('system.lab.address', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                    />
                  </div>
                </div>
              </Card>

              {/* Info del sistema (solo lectura) */}
              <Card title="Información del Sistema" description="Versión y entorno (solo lectura)">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Versión</p>
                    <p className="text-lg font-medium text-gray-900">{getConfigValue('system.version') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Entorno</p>
                    <p className="text-lg font-medium text-gray-900 capitalize">{getConfigValue('system.environment') || 'N/A'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Indicator de guardando */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200 flex items-center space-x-3">
          <Loader2 className="w-5 h-5 animate-spin text-eg-purple" />
          <span className="text-sm font-medium text-gray-700">Guardando cambios...</span>
        </div>
      )}
    </div>
  );
}
