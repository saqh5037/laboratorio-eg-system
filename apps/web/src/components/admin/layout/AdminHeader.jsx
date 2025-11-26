import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { useCompanyInfo } from '../../../hooks/useCompanyInfo';
import { useLab } from '../../../contexts/LabContext';
import { Menu, User, LogOut, Settings, Bell } from 'lucide-react';
import LabSelector from '../LabSelector';

export default function AdminHeader({ onToggleSidebar }) {
  const { user, logout } = useAdminAuth();
  const { companyInfo } = useCompanyInfo();
  const { currentLab } = useLab();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Menu toggle + Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <Link to="/admin" className="flex items-center space-x-3">
            {companyInfo?.logo_icon_url ? (
              <img
                src={companyInfo.logo_icon_url}
                alt={companyInfo.logo_alt_text || companyInfo.short_name || 'Admin'}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, ${currentLab?.color || '#0047CB'}, ${currentLab?.colorLight || '#00A3E0'})`
                }}
              >
                <span className="text-white font-bold text-sm">
                  {companyInfo?.short_name?.substring(0, 3) || 'LEG'}
                </span>
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-800">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500">
                {companyInfo?.name || 'Sistema de Gestión'}
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Lab Selector */}
        <div className="flex-1 flex justify-center px-4">
          <LabSelector />
        </div>

        {/* Right: User menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications (futuro) */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {/* Badge de notificaciones (futuro) */}
            {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: currentLab?.color || '#0047CB' }}
              >
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <Link
                    to="/admin/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configuración</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
