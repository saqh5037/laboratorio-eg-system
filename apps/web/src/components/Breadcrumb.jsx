import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const routeNameMap = {
    estudios: 'Estudios',
    hematologia: 'Hematología',
    quimica: 'Química Sanguínea',
    microbiologia: 'Microbiología',
    inmunologia: 'Inmunología',
    nosotros: 'Nosotros',
    contacto: 'Contacto',
    resultados: 'Resultados',
    pacientes: 'Pacientes',
    reportes: 'Reportes',
    configuracion: 'Configuración',
    ayuda: 'Ayuda',
  };

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
      <Link
        to="/"
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <FaHome size={14} />
        <span>Inicio</span>
      </Link>

      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = routeNameMap[pathname] || pathname;

        return (
          <div key={pathname} className="flex items-center space-x-2">
            <FaChevronRight className="text-gray-400 dark:text-gray-600" size={12} />
            {isLast ? (
              <span className="text-gray-900 dark:text-white font-medium">
                {name}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;