import { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader onToggleSidebar={toggleSidebar} />

      {/* Layout con sidebar + content */}
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main content */}
        <main className="flex-1 w-full p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
