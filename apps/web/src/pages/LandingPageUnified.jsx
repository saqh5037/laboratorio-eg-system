import React, { lazy, Suspense } from 'react';
import { useLandingSections } from '../hooks/useLandingSections';
import { useLandingContent } from '../hooks/useLandingContent';
import SectionRenderer from '../components/landing/SectionRenderer';

// Animations CSS (mantenemos las animaciones originales)
const animationStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  @keyframes blobFloat {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(10px, -10px) rotate(2deg); }
    66% { transform: translate(-10px, 10px) rotate(-2deg); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  .animate-blob-float {
    animation: blobFloat 10s ease-in-out infinite;
  }
  .value-card {
    animation: fadeInUp 0.6s ease-out backwards;
  }
  .value-card:nth-child(1) { animation-delay: 0.1s; }
  .value-card:nth-child(2) { animation-delay: 0.2s; }
  .value-card:nth-child(3) { animation-delay: 0.3s; }
  .value-card:nth-child(4) { animation-delay: 0.4s; }
  .value-card:nth-child(5) { animation-delay: 0.5s; }
  .contact-card:nth-child(1) { animation: slideInUp 0.6s ease-out 0.1s backwards; }
  .contact-card:nth-child(2) { animation: slideInUp 0.6s ease-out 0.2s backwards; }
  .contact-card:nth-child(3) { animation: slideInUp 0.6s ease-out 0.3s backwards; }
  .contact-card:nth-child(4) { animation: slideInUp 0.6s ease-out 0.4s backwards; }
  .contact-card:nth-child(5) { animation: slideInUp 0.6s ease-out 0.5s backwards; }
  .contact-card:nth-child(6) { animation: slideInUp 0.6s ease-out 0.6s backwards; }
  .testimonial-card { animation: slideInUp 0.6s ease-out 0.2s backwards; }
  .cert-card:nth-child(1) { animation: slideInUp 0.6s ease-out 0.1s backwards; }
  .cert-card:nth-child(2) { animation: slideInUp 0.6s ease-out 0.2s backwards; }
  .cert-card:nth-child(3) { animation: slideInUp 0.6s ease-out 0.3s backwards; }
`;

/**
 * LoadingFallback Component
 * Componente de carga consistente con el diseño original
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-eg-purple/5">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-eg-purple/30 border-t-eg-purple rounded-full animate-spin"></div>
      <p className="text-eg-purple text-lg font-normal">Cargando...</p>
    </div>
  </div>
);

/**
 * LandingPageUnified Component
 * Landing page 100% dinámica controlada desde base de datos
 *
 * TRANSFORMACIÓN COMPLETA:
 * - Antes: 1114 líneas hardcoded
 * - Después: ~150 líneas dinámicas
 *
 * Características:
 * - Estructura completamente configurable desde DB
 * - Soporta diferentes layouts por laboratorio
 * - Cambios en tiempo real sin deploy
 * - Componentes modulares y reutilizables
 *
 * Cómo funciona:
 * 1. useLandingSections() carga la estructura de secciones desde DB
 * 2. useLandingContent() carga todo el contenido (valores, certificaciones, etc.)
 * 3. SectionRenderer mapea cada sección a su componente correspondiente
 * 4. Los componentes renderizan usando la configuración y el contenido
 */
const LandingPageUnified = () => {
  // ============================================
  // LOAD DATA FROM API
  // ============================================

  // Cargar estructura de secciones desde DB
  const { sections, loading: sectionsLoading, error: sectionsError } = useLandingSections();

  // Cargar contenido completo de la landing
  const {
    values,
    certifications,
    testimonials,
    contactInfo,
    contentBlocks,
    statistics,
    loading: contentLoading,
    error: contentError
  } = useLandingContent();

  // ============================================
  // LOADING & ERROR HANDLING
  // ============================================

  // Mostrar loading mientras carga cualquiera de los dos
  if (sectionsLoading || contentLoading) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <style>{animationStyles}</style>
        <LoadingFallback />
      </div>
    );
  }

  // Manejar errores (no bloqueamos la página, solo mostramos warning en consola)
  if (sectionsError) {
    console.error('Error loading sections:', sectionsError);
  }
  if (contentError) {
    console.error('Error loading content:', contentError);
  }

  // ============================================
  // PREPARE CONTENT OBJECT
  // ============================================

  // Preparar objeto de contenido para pasar a SectionRenderer
  // Usamos nombres con prefijo "landing_" para coincidir con dataSource en DB
  const content = {
    landing_values: values,
    landing_certifications: certifications,
    landing_testimonials: testimonials,
    landing_contact_info: contactInfo,
    landing_content_blocks: contentBlocks,
    landing_statistics: statistics
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Inyectar estilos de animaciones */}
      <style>{animationStyles}</style>

      <main>
        {sections.map(section => (
          <Suspense key={section.section_key} fallback={<LoadingFallback />}>
            <SectionRenderer section={section} content={content} />
          </Suspense>
        ))}
      </main>
    </div>
  );
};

export default LandingPageUnified;
