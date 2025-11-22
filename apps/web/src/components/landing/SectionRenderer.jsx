import React from 'react';
import HeroCarouselEG from './HeroCarouselEG';
import CTASectionEG from './CTASectionEG';
import DynamicFooter from '../DynamicFooter';
import GridSection from './GridSection';
import CompositeSection from './CompositeSection';
import TestimonialsCarousel from './TestimonialsCarousel';

/**
 * SectionRenderer Component
 * Master renderer que mapea section_type a componentes React
 *
 * Este componente actúa como un switch/router para renderizar diferentes
 * tipos de secciones basándose en la configuración de la base de datos.
 *
 * @param {Object} props
 * @param {Object} props.section - Configuración de la sección desde DB
 * @param {Object} props.content - Todo el contenido de landing (values, certs, etc.)
 * @returns {React.Element} Sección renderizada
 */
const SectionRenderer = ({ section, content }) => {
  const { section_key, section_type, layout_config } = section;

  // Switch por tipo de sección
  switch (section_type) {
    case 'carousel':
      // Hero Carousel o Testimonials Carousel
      if (layout_config.component === 'HeroCarouselEG') {
        return <HeroCarouselEG />;
      } else if (layout_config.component === 'TestimonialsCarousel') {
        return <TestimonialsCarousel section={section} content={content} />;
      }
      return (
        <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            ⚠️ Tipo de carousel no reconocido: {layout_config.component}
          </p>
        </div>
      );

    case 'grid':
      // Grid genérico (certificaciones, servicios, features, etc.)
      return <GridSection section={section} content={content} />;

    case 'composite':
      // Secciones complejas con múltiples subsecciones (nosotros, contacto)
      return <CompositeSection section={section} content={content} />;

    case 'statistics_cta':
      // Sección de estadísticas + CTA
      return <CTASectionEG />;

    case 'footer':
      // Footer dinámico
      return <DynamicFooter />;

    default:
      // Tipo de sección no reconocido
      if (import.meta.env.DEV) {
        return (
          <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-bold mb-2">
              ⚠️ Tipo de sección no implementado
            </h3>
            <p className="text-red-700 text-sm mb-2">
              <strong>Section Key:</strong> {section_key}
            </p>
            <p className="text-red-700 text-sm mb-2">
              <strong>Section Type:</strong> {section_type}
            </p>
            <details className="mt-4">
              <summary className="cursor-pointer text-red-600 font-medium">
                Ver configuración completa
              </summary>
              <pre className="mt-2 p-4 bg-red-100 rounded text-xs overflow-auto">
                {JSON.stringify(section, null, 2)}
              </pre>
            </details>
          </div>
        );
      }

      // En producción, no mostrar nada
      return null;
  }
};

// Error Boundary específico para secciones
class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SectionRenderer] Error rendering section:', {
      section: this.props.section?.section_key,
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (import.meta.env.DEV) {
        return (
          <div className="p-8 bg-red-50 border-2 border-red-300 rounded-lg my-4">
            <h3 className="text-red-800 font-bold mb-2">
              ❌ Error al renderizar sección
            </h3>
            <p className="text-red-700 text-sm mb-2">
              <strong>Section:</strong> {this.props.section?.section_key || 'Unknown'}
            </p>
            <p className="text-red-700 text-sm">
              <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
            </p>
          </div>
        );
      }

      // En producción, no mostrar nada si hay error
      return null;
    }

    return this.props.children;
  }
}

/**
 * Wrapper con Error Boundary
 */
const SectionRendererWithErrorBoundary = (props) => (
  <SectionErrorBoundary section={props.section}>
    <SectionRenderer {...props} />
  </SectionErrorBoundary>
);

export default SectionRendererWithErrorBoundary;
