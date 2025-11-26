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
  Database,
  HelpCircle,
  Briefcase,
  Info,
  MessageSquare,
  FlaskConical,
  ClipboardList
} from 'lucide-react';
import { useLab } from '../../../contexts/LabContext';

// =====================================================
// NAVEGACIÓN POR LABORATORIO
// =====================================================

// Menú de Elizabeth Gutiérrez
const egNavigationItems = [
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
    description: 'Información corporativa'
  },
  {
    name: 'Navegación',
    path: '/admin/navigation',
    icon: Menu,
    description: 'Gestionar menús y enlaces'
  }
];

// Menú de DIMOGEN
const dimogenNavigationItems = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
    description: 'Vista general y métricas'
  },
  {
    name: 'Info Empresa',
    path: '/admin/company',
    icon: Building2,
    description: 'Información corporativa'
  },
  {
    name: 'FAQs',
    path: '/admin/dimogen/faqs',
    icon: HelpCircle,
    description: 'Preguntas frecuentes'
  },
  {
    name: 'Servicios',
    path: '/admin/dimogen/services',
    icon: Briefcase,
    description: 'Líneas de negocio'
  },
  {
    name: 'Sobre Nosotros',
    path: '/admin/dimogen/about',
    icon: Info,
    description: 'Filosofía y valores'
  },
  {
    name: 'Testimonios',
    path: '/admin/dimogen/testimonials',
    icon: MessageSquare,
    description: 'Testimonios de clientes'
  },
  {
    name: 'Carrusel',
    path: '/admin/carousel',
    icon: Images,
    description: 'Gestionar slides del carrusel'
  },
  {
    name: 'Temas',
    path: '/admin/themes',
    icon: Palette,
    description: 'Personalizar colores'
  }
];

// Menú de Microtec (placeholder)
const microtecNavigationItems = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
    description: 'Vista general y métricas'
  },
  {
    name: 'Info Empresa',
    path: '/admin/company',
    icon: Building2,
    description: 'Información corporativa'
  },
  {
    name: 'Temas',
    path: '/admin/themes',
    icon: Palette,
    description: 'Personalizar colores'
  }
];

// =====================================================
// MÓDULOS COMPARTIDOS (disponibles para todos los labs)
// =====================================================
const sharedModules = [
  {
    name: 'Resultados',
    path: '/admin/results',
    icon: FlaskConical,
    description: 'Módulo de resultados'
  },
  {
    name: 'Estudios',
    path: '/admin/studies',
    icon: ClipboardList,
    description: 'Directorio de estudios'
  }
];

// =====================================================
// CONFIGURACIÓN DEL SISTEMA
// =====================================================
const systemItems = [
  {
    name: 'Backups',
    path: '/admin/backups',
    icon: Database,
    description: 'Backup y restore'
  },
  {
    name: 'Configuraciones',
    path: '/admin/configurations',
    icon: Settings,
    description: 'Configuraciones del sistema'
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

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================
export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { activeLab, currentLab } = useLab();

  // Obtener items de navegación según el lab activo
  const getNavigationItems = () => {
    switch (activeLab) {
      case 'dimogen':
        return dimogenNavigationItems;
      case 'microtec':
        return microtecNavigationItems;
      default:
        return egNavigationItems;
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Renderizar un item de navegación
  const renderNavItem = (item, colorClass = 'eg-purple') => {
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
            ? `text-white shadow-md`
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
        style={active ? { backgroundColor: currentLab.color } : {}}
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
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: currentLab.color }}
              >
                <span className="text-white font-bold text-xs">{currentLab.shortName}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{currentLab.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Lab indicator (desktop) */}
          <div
            className="hidden lg:flex items-center gap-2 px-4 py-3 border-b"
            style={{ backgroundColor: `${currentLab.color}10`, borderColor: `${currentLab.color}30` }}
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ backgroundColor: currentLab.color }}
            >
              <span className="text-white font-bold text-xs">{currentLab.shortName.charAt(0)}</span>
            </div>
            <span className="text-sm font-medium" style={{ color: currentLab.color }}>
              {currentLab.name}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {/* Items principales del lab */}
              {navigationItems.map((item) => renderNavItem(item))}

              {/* Separador - Módulos compartidos */}
              <div className="border-t border-gray-200 my-3 pt-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">
                  Módulos
                </p>
                {sharedModules.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.path}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed"
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs">Próximamente</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Separador - Sistema */}
              <div className="border-t border-gray-200 my-3 pt-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">
                  Sistema
                </p>
                {systemItems.map((item) => renderNavItem(item))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div
              className="rounded-lg p-3"
              style={{
                background: `linear-gradient(to bottom right, ${currentLab.color}15, ${currentLab.colorLight}30)`
              }}
            >
              <p className="text-xs font-medium text-gray-800 mb-1">
                Administrando: {currentLab.name}
              </p>
              <p className="text-xs text-gray-600">
                Los cambios se aplican a este laboratorio
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
