# Phase 3: Plan Detallado para Refactor de LandingPageUnified.jsx

**Objetivo:** Transformar la landing page de hardcoded (1114 líneas) a 100% dinámica usando el sistema implementado.

**Tiempo estimado:** 3-4 horas

---

## 📋 Checklist de Pasos

### ✅ Pre-requisitos (YA COMPLETADOS)
- [x] Backend API funcionando (`/api/landing/sections`)
- [x] Hook `useLandingSections()` creado
- [x] Componente `SectionRenderer` funcionando
- [x] Componentes base creados (`GridSection`, `TestimonialsCarousel`)
- [x] 7 secciones seed en base de datos

### ⏳ Pasos del Refactor

#### Paso 1: Análisis y Backup (15 min)
- [ ] Crear backup del archivo original
- [ ] Identificar todas las secciones hardcoded
- [ ] Mapear secciones a tipos de componentes
- [ ] Listar dependencias externas

#### Paso 2: Estructura Base Dinámica (30 min)
- [ ] Importar hooks necesarios
- [ ] Implementar `useLandingSections()` y `useLandingContent()`
- [ ] Crear estructura de renderizado con `.map()`
- [ ] Agregar loading states y error handling

#### Paso 3: Secciones Simples (30 min)
- [ ] Verificar Hero (carousel) - YA funciona
- [ ] Verificar Certificaciones (grid) - YA funciona
- [ ] Verificar Testimonios (carousel) - YA funciona
- [ ] Verificar CTA - YA funciona
- [ ] Verificar Footer - YA funciona

#### Paso 4: Sección Nosotros - Composite (1 hora)
- [ ] Crear `NosotrosSection.jsx` extrayendo código actual
- [ ] Implementar lógica de subsecciones en `CompositeSection`
- [ ] Crear `SubsectionRenderer` para subsecciones
- [ ] Conectar con data sources
- [ ] Verificar animaciones y estilos

#### Paso 5: Sección Contacto - Composite (1 hora)
- [ ] Crear `ContactoSection.jsx` extrayendo código actual
- [ ] Implementar formulario con validación
- [ ] Conectar con data sources
- [ ] Integrar mapa
- [ ] Verificar WhatsApp CTA

#### Paso 6: Testing y Ajustes (30 min)
- [ ] Testing visual en MICROTEC
- [ ] Testing visual en DIMOGEN
- [ ] Testing visual en Lab EG
- [ ] Verificar responsive design
- [ ] Verificar animaciones
- [ ] Testing de formularios
- [ ] Verificar SEO tags
- [ ] Performance testing

#### Paso 7: Limpieza y Documentación (15 min)
- [ ] Eliminar código comentado
- [ ] Actualizar imports
- [ ] Agregar comentarios JSDoc
- [ ] Verificar no hay console.logs

---

## 🔧 Implementación Detallada

### Paso 1: Backup y Análisis

```bash
# Crear backup
cp apps/web/src/pages/LandingPageUnified.jsx \
   apps/web/src/pages/LandingPageUnified.jsx.backup

# Ver estructura actual
wc -l apps/web/src/pages/LandingPageUnified.jsx
# Output: 1114 líneas
```

**Secciones identificadas:**
1. Lines 365-369: Hero Carousel ✅ (ya dinámica)
2. Lines 372-519: Nosotros ⚠️ (compleja - requiere CompositeSection)
3. Lines 522-552: Certificaciones ✅ (grid simple)
4. Lines 555-619: Testimonios ✅ (carousel)
5. Lines 622-1098: Contacto ⚠️ (compleja - requiere CompositeSection)
6. Lines ~1100: CTA ✅ (ya dinámica)
7. Lines ~1110: Footer ✅ (ya dinámica)

### Paso 2: Estructura Base Nueva

```javascript
// apps/web/src/pages/LandingPageUnified.jsx (NUEVA VERSIÓN)

import React, { lazy, Suspense } from 'react';
import { useLandingSections } from '../hooks/useLandingSections';
import { useLandingContent } from '../hooks/useLandingContent';
import SectionRenderer from '../components/landing/SectionRenderer';

// Animations CSS (mantener existente)
const animationStyles = `...`;

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-eg-purple/5">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-eg-purple/30 border-t-eg-purple rounded-full animate-spin"></div>
      <p className="text-eg-purple text-lg font-normal">Cargando...</p>
    </div>
  </div>
);

const LandingPageUnified = () => {
  // Load sections structure from DB
  const { sections, loading: sectionsLoading, error: sectionsError } = useLandingSections();

  // Load content data from DB
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

  // Handle loading state
  if (sectionsLoading || contentLoading) {
    return <LoadingFallback />;
  }

  // Handle errors (non-blocking)
  if (sectionsError) {
    console.error('Error loading sections:', sectionsError);
  }
  if (contentError) {
    console.error('Error loading content:', contentError);
  }

  // Prepare content object for SectionRenderer
  const content = {
    landing_values: values,
    landing_certifications: certifications,
    landing_testimonials: testimonials,
    landing_contact_info: contactInfo,
    landing_content_blocks: contentBlocks,
    landing_statistics: statistics
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Inject animation styles */}
      <style>{animationStyles}</style>

      <main>
        {sections.map((section) => (
          <Suspense key={section.section_key} fallback={<LoadingFallback />}>
            <SectionRenderer
              section={section}
              content={content}
            />
          </Suspense>
        ))}
      </main>
    </div>
  );
};

export default LandingPageUnified;
```

**Reducción:** De 1114 líneas → ~80 líneas (!!!)

### Paso 3: No requiere cambios

Las secciones simples ya funcionan con los componentes existentes:
- ✅ Hero → `HeroCarouselEG`
- ✅ Certificaciones → `GridSection`
- ✅ Testimonios → `TestimonialsCarousel`
- ✅ CTA → `CTASectionEG`
- ✅ Footer → `DynamicFooter`

### Paso 4: Refactor Sección Nosotros

**Crear archivo:** `apps/web/src/components/landing/sections/NosotrosSection.jsx`

```javascript
import React from 'react';
import { renderIcon } from '../../../utils/iconMapper';

const NosotrosSection = ({ section, content }) => {
  const { subsections, backgroundColor, decorativeBlobs } = section.layout_config;

  // Extract data
  const values = content.landing_values || [];
  const contentBlocks = content.landing_content_blocks || [];

  // Helper to get content block
  const getContentBlock = (section, blockType) => {
    const block = contentBlocks.find(b => b.section === section && b.block_type === blockType);
    return block ? block.content : '';
  };

  // Find specific subsections
  const heroHeaderSubsection = subsections.find(s => s.type === 'hero_header');
  const twoColumnSubsection = subsections.find(s => s.type === 'two_column_grid');
  const valuesGridSubsection = subsections.find(s => s.type === 'values_grid');
  const purposeCardSubsection = subsections.find(s => s.type === 'purpose_card');

  return (
    <section
      id={section.section_key}
      className={`w-full min-h-screen bg-${backgroundColor} relative overflow-hidden`}
    >
      {/* Decorative Blobs */}
      {decorativeBlobs && (
        <>
          <div className="absolute top-0 left-0 w-[500px] h-[500px] opacity-30 pointer-events-none z-0 animate-blob-float">
            {/* SVG blob */}
          </div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-40 pointer-events-none z-0 animate-blob-float">
            {/* SVG blob */}
          </div>
        </>
      )}

      {/* Hero Header */}
      {heroHeaderSubsection && (
        <header className="relative z-10 w-full pt-12 pb-8 text-center px-6 md:px-12 lg:px-24">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4">
              {section.title}
            </h1>
            <p className="text-xl md:text-2xl text-white">
              {section.subtitle}
            </p>
          </div>
        </header>
      )}

      {/* Two Column Grid (Historia + Image) */}
      {twoColumnSubsection && (
        <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 pb-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Content Card */}
            <div className="bg-white rounded-3xl p-10 shadow-2xl">
              <div dangerouslySetInnerHTML={{
                __html: getContentBlock('historia', 'html')
              }} />
            </div>

            {/* Image Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative">
              <img
                src={getContentBlock('historia', 'image')}
                alt="Historia"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Values Grid */}
      {valuesGridSubsection && (
        <div className="relative z-10 bg-gradient-to-b from-white via-eg-pink/20 to-eg-purple/15 py-16">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {values.map((value, index) => (
                <div key={value.id} className="value-card text-center">
                  <div className="bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 rounded-full p-5 w-fit mx-auto mb-4">
                    {renderIcon(value.icon_name, 'text-eg-purple w-12 h-12')}
                  </div>
                  <h3 className="text-xl font-semibold text-eg-purple mb-2">
                    {value.title}
                  </h3>
                  <p className="text-eg-dark text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Purpose Card */}
      {purposeCardSubsection && (
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 py-16">
          <div className="bg-gradient-to-br from-eg-purple/43 via-eg-pink/28 to-eg-purple/38 rounded-3xl p-14 text-center border-2 border-eg-purple/40">
            <div dangerouslySetInnerHTML={{
              __html: getContentBlock('proposito', 'html')
            }} />
          </div>
        </div>
      )}
    </section>
  );
};

export default NosotrosSection;
```

**Actualizar CompositeSection:**

```javascript
// apps/web/src/components/landing/CompositeSection.jsx

import React from 'react';
import NosotrosSection from './sections/NosotrosSection';
import ContactoSection from './sections/ContactoSection';

const CompositeSection = ({ section, content }) => {
  const { section_key } = section;

  // Route to specific composite section
  switch (section_key) {
    case 'nosotros':
      return <NosotrosSection section={section} content={content} />;

    case 'contacto':
      return <ContactoSection section={section} content={content} />;

    default:
      console.warn(`Composite section '${section_key}' not implemented`);
      return null;
  }
};

export default CompositeSection;
```

### Paso 5: Refactor Sección Contacto

Similar al paso 4, crear `ContactoSection.jsx` extrayendo el código de líneas 622-1098.

**Archivo:** `apps/web/src/components/landing/sections/ContactoSection.jsx`

Incluir:
- Hero header
- Contact cards grid
- WhatsApp CTA
- Contact center hours
- Map integration
- Contact form con validación

### Paso 6: Testing

```bash
# 1. Verificar que el servidor dev esté corriendo
npm run dev

# 2. Abrir en navegador
open http://localhost:5173

# 3. Testing checklist
- [ ] Hero carousel se muestra
- [ ] Sección Nosotros completa
- [ ] Certificaciones en grid
- [ ] Testimonios carousel
- [ ] Sección Contacto completa
- [ ] Formulario funciona
- [ ] CTA se muestra
- [ ] Footer se muestra
- [ ] Animaciones funcionan
- [ ] Responsive design OK
- [ ] No hay errores en consola
```

**Testing en las 3 bases de datos:**

```bash
# Cambiar laboratorio activo
PGPASSWORD='labsis' psql -h localhost -U labsis -d lis_bot_comunicacion_microtec \
  -c "SELECT section_key FROM landing_sections WHERE is_visible = true ORDER BY order_index;"

# Verificar en navegador que las secciones cambien según la BD activa
```

---

## 📁 Estructura Final de Archivos

```
apps/web/src/
├── pages/
│   └── LandingPageUnified.jsx (✏️ Refactorizado - 80 líneas)
├── components/
│   └── landing/
│       ├── SectionRenderer.jsx (✅ Ya existe)
│       ├── GridSection.jsx (✅ Ya existe)
│       ├── TestimonialsCarousel.jsx (✅ Ya existe)
│       ├── CompositeSection.jsx (✏️ Actualizado)
│       └── sections/
│           ├── NosotrosSection.jsx (🆕 Nuevo)
│           └── ContactoSection.jsx (🆕 Nuevo)
└── hooks/
    └── useLandingSections.js (✅ Ya existe)
```

---

## 🎯 Resultados Esperados

### Antes (Hardcoded)
- ❌ 1114 líneas de código
- ❌ Estructura fija
- ❌ Cambios requieren deploy
- ❌ No reutilizable entre laboratorios

### Después (Dinámico)
- ✅ ~80 líneas en landing principal
- ✅ Estructura 100% configurable desde BD
- ✅ Cambios sin deploy (solo BD)
- ✅ Reutilizable entre laboratorios
- ✅ Componentes modulares y testeables
- ✅ MICROTEC puede tener estructura diferente a DIMOGEN

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Romper funcionalidad existente | Media | Crear backup, testing exhaustivo |
| Animaciones no funcionen | Baja | Mantener CSS de animaciones |
| Formularios fallen | Baja | Copiar lógica existente |
| Performance degradado | Muy Baja | Sistema usa lazy loading |
| SEO afectado | Muy Baja | Mantener structure igual |

---

## 🚀 Comando para Iniciar

Cuando estés listo para iniciar el refactor, ejecuta:

```bash
# 1. Crear backup
cp apps/web/src/pages/LandingPageUnified.jsx \
   apps/web/src/pages/LandingPageUnified.jsx.backup

# 2. Verificar que backend esté corriendo
curl http://localhost:3005/api/landing/sections

# 3. Iniciar refactor siguiendo este plan paso a paso
```

---

## ✅ Checklist Final

Al completar el refactor, verificar:

- [ ] Landing page se ve idéntica al original
- [ ] Todas las secciones renderizán correctamente
- [ ] Animaciones funcionan
- [ ] Formulario de contacto funciona
- [ ] Responsive design OK
- [ ] No hay errores en consola
- [ ] Performance igual o mejor
- [ ] SEO tags presentes
- [ ] Testing en 3 bases de datos OK
- [ ] Código limpio sin comentarios
- [ ] Documentación actualizada

---

**Tiempo total estimado:** 3-4 horas
**Complejidad:** Media-Alta
**Valor entregado:** ALTO - Landing 100% dinámica funcionando

**Próximo paso:** Cuando estés listo, indicame y comenzamos con el Paso 1.
