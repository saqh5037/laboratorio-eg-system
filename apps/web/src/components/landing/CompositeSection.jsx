import React from 'react';
import NosotrosSection from './sections/NosotrosSection';
import ContactoSection from './sections/ContactoSection';
import { useCompanyInfo } from '../../hooks/useCompanyInfo';

/**
 * CompositeSection Component
 * Renderiza secciones complejas que contienen múltiples subsecciones
 * Ahora completamente funcional con componentes específicos
 *
 * @param {Object} props
 * @param {Object} props.section - Configuración de la sección
 * @param {Object} props.content - Contenido de landing
 */
const CompositeSection = ({ section, content }) => {
  const { section_key } = section;

  // Cargar info de la empresa (necesario para ContactoSection)
  const { companyInfo } = useCompanyInfo();

  // Route to specific composite section
  switch (section_key) {
    case 'nosotros':
      return <NosotrosSection section={section} content={content} />;

    case 'contacto':
      return <ContactoSection section={section} content={content} companyInfo={companyInfo} />;

    default:
      if (import.meta.env.DEV) {
        return (
          <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              ⚠️ Composite section '{section_key}' no tiene componente implementado
            </p>
          </div>
        );
      }
      return null;
  }
};

export default CompositeSection;
