import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  FileText,
  Shield,
  AlertTriangle,
  Images,
  Palette,
  FileText as FileTextAlt,
  Building2,
  Menu,
  X,
  Database
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
    description: 'Vista general y métricas'
  },
  {
    name: 'Carrusel',
    path: '/admin/carousel',
    icon: Images,
    description: 'Gestionar slides del carrusel'
  },
  {
    name: 'Contenido Landing',
    path: '/admin/landing-content',
    icon: FileTextAlt,
    description: 'Gestionar contenido de la landing page'
  },
  {
    name: 'Temas',
    path: '/admin/themes',
    icon: Palette,
    description: 'Personalizar colores y branding'
  },
  {
    name: 'Info Empresa',
    path: '/admin/company',
    icon: Building2,
    description: 'Información corporativa global'
  },
  {
    name: 'Navegación',
    path: '/admin/navigation',
    icon: Menu,
    description: 'Gestionar menús y enlaces'
  },
  {
    name: 'Backups',
    path: '/admin/backups',
    icon: Database,
    description: 'Backup y restore de configuración'
  },
  {
    name: 'Configuraciones',
    path: '/admin/configurations',
    icon: Settings,
    description: 'Gestionar configuraciones del sistema'
  },
  {
    name: 'Audit Log',
    path: '/admin/audit',
    icon: FileText,
    description: 'Historial de cambios'
  },
  {
    name: 'Mantenimiento',
    path: '/admin/maintenance',
    icon: AlertTriangle,
    description: 'Modo mantenimiento'
  },
  {
    name: 'Ajustes',
    path: '/admin/settings',
    icon: Shield,
    description: 'Ajustes del admin'
  }
];

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-screen lg:h-auto
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          z-50 lg:z-auto lg:translate-x-0 lg:block
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header del sidebar (solo mobile) */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Menú</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg
                      transition-all duration-200
                      ${active
                        ? 'bg-eg-purple text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-800'}`}>
                        {item.name}
                      </p>
                      {!active && (
                        <p className="text-xs text-gray-500">{item.description}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-eg-purple/10 to-eg-pink/10 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-800 mb-1">
                Modo Administrador
              </p>
              <p className="text-xs text-gray-600">
                Los cambios afectan a todos los usuarios del sistema
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
