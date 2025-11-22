# Development Guide - Dynamic Landing System

**Última actualización:** 20 de noviembre de 2025
**Versión:** 1.0.0
**Estado:** ✅ Producción Ready

---

## 📋 Índice

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Arquitectura](#arquitectura)
3. [Setup y Configuración](#setup-y-configuración)
4. [Estructura de Base de Datos](#estructura-de-base-de-datos)
5. [Componentes Frontend](#componentes-frontend)
6. [APIs Backend](#apis-backend)
7. [Cómo Agregar una Nueva Sección](#cómo-agregar-una-nueva-sección)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Resumen del Sistema

El sistema de landing pages dinámicas permite gestionar completamente la estructura y contenido de las landing pages desde base de datos, sin necesidad de modificar código o hacer deploys.

### Características Principales

- ✅ **100% Dinámico:** Toda la estructura controlada desde DB
- ✅ **Multi-tenant:** Cada laboratorio puede tener estructura diferente
- ✅ **Zero Downtime:** Cambios sin necesidad de deploy
- ✅ **Modular:** Componentes reutilizables y extensibles
- ✅ **Type-Safe:** JSDoc para documentación de tipos
- ✅ **Cache:** Redis con TTL de 5 minutos
- ✅ **Error Boundaries:** Manejo robusto de errores

### Métricas del Refactor

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Líneas de código** | 1114 | 176 | **-84%** |
| **Archivos** | 1 monolítico | 4 modulares | +300% |
| **Flexibilidad** | 0% | 100% | ∞ |
| **Deploy requerido** | Sí | No | ✅ |

---

## Arquitectura

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    LandingPageUnified.jsx                   │
│  - Carga estructura de secciones (useLandingSections)      │
│  - Carga contenido completo (useLandingContent)            │
│  - Prepara objeto de contenido unificado                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     SectionRenderer.jsx                      │
│  - Recibe: section (estructura) + content (datos)           │
│  - Mapea section_type a componente React                    │
│  - Error Boundary para manejo de errores                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────┴───────┐
         │  section_type │
         └───────┬───────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌──────────┐
│carousel│  │  grid  │  │composite │
└───┬────┘  └───┬────┘  └────┬─────┘
    │           │             │
    ▼           ▼             ▼
┌────────┐  ┌────────┐  ┌──────────┐
│ Hero   │  │ Grid   │  │ Nosotros │
│Carousel│  │Section │  │ Contacto │
│   +    │  └────────┘  └──────────┘
│Testimo │
│nials   │
└────────┘
```

### Componentes Clave

#### Frontend (`apps/web/`)
```
src/
├── pages/
│   └── LandingPageUnified.jsx       # Controller principal (176 líneas)
├── components/landing/
│   ├── SectionRenderer.jsx          # Master renderer + Error Boundary
│   ├── CompositeSection.jsx         # Router de secciones complejas
│   ├── GridSection.jsx              # Grid genérico configurable
│   ├── TestimonialsCarousel.jsx     # Carrusel de testimonios
│   ├── HeroCarouselEG.jsx          # Hero carousel
│   ├── CTASectionEG.jsx            # Sección CTA + estadísticas
│   └── sections/
│       ├── NosotrosSection.jsx      # Sección "Nosotros" completa (289 líneas)
│       └── ContactoSection.jsx      # Sección "Contacto" completa (677 líneas)
├── hooks/
│   ├── useLandingSections.js        # Hook para estructura de secciones
│   └── useLandingContent.js         # Hook para contenido
└── services/
    └── landingContentApi.js         # Cliente API REST
```

#### Backend (`apps/config-api/`)
```
src/
├── routes/
│   └── landingSections.routes.js    # 9 endpoints REST
├── services/
│   └── LandingSectionService.js     # 11 métodos CRUD + cache
└── migrations/
    └── 022_create_landing_sections.sql  # Schema + seeds
```

---

## Setup y Configuración

### Requisitos Previos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis (opcional pero recomendado para cache)
- npm o yarn

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd laboratorio-eg-system

# 2. Instalar dependencias (Turborepo maneja todo)
npm install

# 3. Configurar variables de entorno
cp apps/web/.env.example apps/web/.env
cp apps/config-api/.env.example apps/config-api/.env

# 4. Configurar databases en .env
# apps/config-api/.env
DATABASE_ROUTER_ENABLED=true
MICROTEC_CONFIG_DB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/microtec_config
DIMOGEN_CONFIG_DB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/dimogen_config
LABEG_CONFIG_DB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/labeg_config

# 5. Ejecutar migraciones en cada base de datos
PGPASSWORD='labsis' psql -h localhost -U labsis -d microtec_config -f apps/config-api/migrations/022_create_landing_sections.sql
PGPASSWORD='labsis' psql -h localhost -U labsis -d dimogen_config -f apps/config-api/migrations/022_create_landing_sections.sql
PGPASSWORD='labsis' psql -h localhost -U labsis -d labeg_config -f apps/config-api/migrations/022_create_landing_sections.sql

# 6. Iniciar servidores de desarrollo
npm run dev  # Inicia todos los servicios con Turborepo
```

### Verificación de Setup

```bash
# Backend API (config-api)
curl http://localhost:3005/api/landing/sections
# Debe retornar: { success: true, sections_count: 7, ... }

# Frontend Web
open http://localhost:5173
# Debe mostrar la landing page completa
```

---

## Estructura de Base de Datos

### Tabla: `landing_sections`

Controla la estructura y orden de las secciones de la landing page.

```sql
CREATE TABLE IF NOT EXISTS landing_sections (
  id SERIAL PRIMARY KEY,
  section_key VARCHAR(50) NOT NULL UNIQUE,
  section_type VARCHAR(50) NOT NULL,
  title VARCHAR(200),
  subtitle VARCHAR(300),
  layout_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_visible BOOLEAN DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  display_conditions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Campos Importantes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `section_key` | VARCHAR(50) | Identificador único (ej: 'hero', 'nosotros', 'contacto') |
| `section_type` | VARCHAR(50) | Tipo de componente ('carousel', 'grid', 'composite', 'statistics_cta', 'footer') |
| `title` | VARCHAR(200) | Título de la sección (opcional) |
| `subtitle` | VARCHAR(300) | Subtítulo de la sección (opcional) |
| `layout_config` | JSONB | Configuración flexible del layout (ver ejemplos abajo) |
| `is_visible` | BOOLEAN | Si la sección se muestra o no |
| `order_index` | INT | Orden de aparición (0 = primero) |
| `display_conditions` | JSONB | Condiciones para mostrar (ej: solo en desktop) |

#### Ejemplos de `layout_config`

**Grid Section (Certificaciones):**
```json
{
  "dataSource": "landing_certifications",
  "gridColumns": 3,
  "cardStyle": "bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300",
  "showIcon": true,
  "iconSize": 12,
  "backgroundColor": "white",
  "textColor": "gray-900"
}
```

**Composite Section (Nosotros):**
```json
{
  "component": "NosotrosSection",
  "backgroundColor": "eg-purple",
  "textColor": "white"
}
```

**Carousel Section (Hero):**
```json
{
  "component": "HeroCarouselEG",
  "autoplay": true,
  "interval": 5000
}
```

### Otras Tablas Relevantes

- **`landing_values`**: Valores corporativos
- **`landing_certifications`**: Certificaciones y acreditaciones
- **`landing_testimonials`**: Testimonios de clientes
- **`landing_contact_info`**: Información de contacto
- **`landing_content_blocks`**: Bloques de texto/contenido
- **`landing_statistics`**: Estadísticas para CTA

---

## Componentes Frontend

### 1. LandingPageUnified.jsx

**Responsabilidad:** Controller principal que orquesta la carga y renderizado de la landing.

**Props:** Ninguno (component raíz)

**Hooks Utilizados:**
```javascript
const { sections, loading, error } = useLandingSections();
const { values, certifications, testimonials, contactInfo, contentBlocks, statistics } = useLandingContent();
```

**Flujo:**
1. Carga estructura de secciones desde `/api/landing/sections`
2. Carga todo el contenido desde `/api/landing`
3. Prepara objeto `content` con prefijos `landing_*`
4. Itera sobre `sections` y renderiza cada una con `SectionRenderer`

**Ejemplo de uso:**
```javascript
// Este componente es el entry point, no necesita props
<LandingPageUnified />
```

---

### 2. SectionRenderer.jsx

**Responsabilidad:** Master renderer que mapea `section_type` a componentes React específicos.

**Props:**
```javascript
/**
 * @param {Object} section - Configuración de la sección desde DB
 * @param {string} section.section_key - Identificador único
 * @param {string} section.section_type - Tipo de componente
 * @param {Object} section.layout_config - Configuración de layout
 * @param {Object} content - Todo el contenido de landing
 */
```

**Switch Mapping:**
```javascript
switch (section_type) {
  case 'carousel':
    if (layout_config.component === 'HeroCarouselEG') return <HeroCarouselEG />;
    if (layout_config.component === 'TestimonialsCarousel') return <TestimonialsCarousel section={section} content={content} />;
    break;

  case 'grid':
    return <GridSection section={section} content={content} />;

  case 'composite':
    return <CompositeSection section={section} content={content} />;

  case 'statistics_cta':
    return <CTASectionEG />;

  case 'footer':
    return <DynamicFooter />;
}
```

**Error Boundary:** Incluye `SectionErrorBoundary` que captura errores de rendering y muestra fallback en desarrollo.

---

### 3. GridSection.jsx

**Responsabilidad:** Renderiza secciones con layout de grid configurable (certificaciones, servicios, features, etc.).

**Props:**
```javascript
/**
 * @param {Object} section - Configuración de la sección
 * @param {Object} section.layout_config
 * @param {string} section.layout_config.dataSource - Key del contenido (ej: 'landing_certifications')
 * @param {number} section.layout_config.gridColumns - Número de columnas (1-6)
 * @param {string} section.layout_config.cardStyle - Clases CSS para cards
 * @param {boolean} section.layout_config.showIcon - Si mostrar iconos
 * @param {number} section.layout_config.iconSize - Tamaño del icono
 * @param {string} section.layout_config.backgroundColor - Color de fondo
 * @param {string} section.layout_config.textColor - Color de texto
 * @param {boolean} section.layout_config.decorativeBlobs - Mostrar blobs decorativos
 * @param {Object} content - Contenido de landing
 */
```

**Características:**
- Grid responsive automático (1 col mobile, 2 cols tablet, N cols desktop)
- Soporte para iconos con `renderIcon()`
- Animaciones fade-in-up con delay escalonado
- Decorative blobs animados opcionales
- Fallback en desarrollo si no hay datos

**Ejemplo de uso:**
```javascript
<GridSection
  section={{
    section_key: 'certificaciones',
    title: 'Certificaciones',
    subtitle: 'Cumplimos con los más altos estándares',
    layout_config: {
      dataSource: 'landing_certifications',
      gridColumns: 3,
      showIcon: true,
      iconSize: 12
    }
  }}
  content={{
    landing_certifications: [
      { id: 1, title: 'ISO 9001', icon_name: 'FaCertificate', description: '...' }
    ]
  }}
/>
```

---

### 4. CompositeSection.jsx

**Responsabilidad:** Router para secciones complejas que contienen múltiples subsecciones.

**Props:**
```javascript
/**
 * @param {Object} section - Configuración de la sección
 * @param {string} section.section_key - 'nosotros' | 'contacto' | ...
 * @param {Object} content - Contenido de landing
 */
```

**Routing:**
```javascript
switch (section_key) {
  case 'nosotros':
    return <NosotrosSection section={section} content={content} />;

  case 'contacto':
    return <ContactoSection section={section} content={content} companyInfo={companyInfo} />;

  default:
    return <DebugWarning /> // En desarrollo
}
```

**Cuándo usarlo:** Para secciones que tienen múltiples subsecciones con lógica compleja (formularios, carousels internos, múltiples grids, etc.)

---

### 5. NosotrosSection.jsx

**Responsabilidad:** Sección "Nosotros" completa con 4 subsecciones.

**Props:**
```javascript
/**
 * @param {Object} section - Configuración de la sección
 * @param {Object} content - Contenido de landing
 * @param {Array} content.landing_values - Valores corporativos
 * @param {Array} content.landing_content_blocks - Bloques de contenido
 */
```

**Subsecciones:**
1. **Hero Header:** Título y subtítulo con decorative blobs
2. **Historia:** Two-column grid (texto + imagen) con animación
3. **Valores:** Grid de 5 valores con iconos y animaciones
4. **Propósito:** Card destacada con misión y visión

**Content Blocks Requeridos:**
```javascript
// Helper para obtener contenido
const getContentBlock = (sectionName, blockType) => {
  return contentBlocks.find(
    b => b.section === sectionName && b.block_type === blockType
  )?.content || '';
};

// Bloques necesarios:
'nosotros-header' -> 'badge', 'title', 'subtitle'
'historia' -> 'badge', 'title', 'paragraph', 'image'
'valores-header' -> 'title', 'subtitle'
'proposito' -> 'badge', 'title', 'mision', 'vision'
```

---

### 6. ContactoSection.jsx

**Responsabilidad:** Sección "Contacto" completa con formulario, mapa, y contact cards.

**Props:**
```javascript
/**
 * @param {Object} section - Configuración de la sección
 * @param {Object} content - Contenido de landing
 * @param {Object} companyInfo - Información de la empresa (useCompanyInfo)
 */
```

**State Management:**
```javascript
const [formData, setFormData] = useState({
  nombre: '',
  email: '',
  telefono: '',
  mensaje: ''
});
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});
const [submitStatus, setSubmitStatus] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Validaciones:**
- Nombre: 2-100 caracteres
- Email: Regex estándar
- Teléfono: 10 dígitos (opcional)
- Mensaje: 10-1000 caracteres

**Subsecciones:**
1. **Hero Header**
2. **Contact Cards:** Grid de 6 cards (dirección, teléfono, email, horarios, servicios, redes sociales)
3. **WhatsApp CTA:** Botón dinámico con número de WhatsApp
4. **Contact Center:** Horarios específicos de atención
5. **Google Maps:** Embed con fallback si falla
6. **Contact Form:** Formulario completo con validación real-time

---

## APIs Backend

### Endpoints Públicos

#### GET `/api/landing/sections`
Retorna todas las secciones visibles ordenadas.

**Response:**
```json
{
  "success": true,
  "total": 7,
  "sections_count": 7,
  "section_keys": ["hero", "nosotros", "certificaciones", "testimonios", "contacto", "cta", "footer"],
  "sections": [
    {
      "id": 1,
      "section_key": "hero",
      "section_type": "carousel",
      "title": null,
      "subtitle": null,
      "layout_config": {
        "component": "HeroCarouselEG",
        "autoplay": true,
        "interval": 5000
      },
      "is_visible": true,
      "order_index": 0
    }
  ]
}
```

**Cache:** 5 minutos (Redis)

---

#### GET `/api/landing`
Retorna TODO el contenido activo en una sola llamada (optimizado).

**Response:**
```json
{
  "success": true,
  "data": {
    "values": [...],
    "certifications": [...],
    "testimonials": [...],
    "contactInfo": [...],
    "contentBlocks": [...],
    "statistics": [...]
  }
}
```

**Cache:** 5 minutos (Redis)

---

### Endpoints Admin (Protected)

Requieren autenticación con `Authorization: Bearer <token>`

#### GET `/api/admin/landing/sections/all`
Obtiene todas las secciones (incluyendo no visibles).

#### POST `/api/admin/landing/sections`
Crea una nueva sección.

**Body:**
```json
{
  "section_key": "nueva-seccion",
  "section_type": "grid",
  "title": "Título",
  "subtitle": "Subtítulo",
  "layout_config": {
    "dataSource": "landing_servicios",
    "gridColumns": 3
  },
  "is_visible": true,
  "order_index": 99
}
```

#### PUT `/api/admin/landing/sections/:id`
Actualiza una sección existente.

#### DELETE `/api/admin/landing/sections/:id`
Elimina una sección (soft delete recomendado).

#### PATCH `/api/admin/landing/sections/:id/toggle`
Alterna visibilidad rápidamente.

#### PATCH `/api/admin/landing/sections/reorder`
Reordena múltiples secciones en una transacción.

**Body:**
```json
{
  "sections": [
    { "id": 1, "order_index": 0 },
    { "id": 3, "order_index": 1 },
    { "id": 2, "order_index": 2 }
  ]
}
```

---

## Cómo Agregar una Nueva Sección

### Caso 1: Usar GridSection (Sección Simple)

Si tu sección es un simple grid de items (como certificaciones, servicios, features), no necesitas crear un componente nuevo.

**Pasos:**

1. **Agregar datos a la base de datos:**

```sql
-- Ejemplo: Nueva tabla de servicios
CREATE TABLE landing_servicios (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- Insertar datos de ejemplo
INSERT INTO landing_servicios (title, description, icon_name, sort_order) VALUES
('Análisis Clínicos', 'Exámenes de sangre, orina, heces...', 'FaFlask', 1),
('Imagenología', 'Rayos X, ultrasonido, tomografía...', 'FaXRay', 2),
('Microbiología', 'Cultivos, antibiogramas...', 'FaMicroscope', 3);
```

2. **Agregar endpoint al backend:**

```javascript
// apps/config-api/src/routes/landing.routes.js
router.get('/servicios', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM landing_servicios
      WHERE is_active = true
      ORDER BY sort_order ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

3. **Actualizar frontend API service:**

```javascript
// apps/web/src/services/landingContentApi.js
export async function getActiveServicios() {
  const response = await fetch(`${API_BASE_URL}/api/landing/servicios`);
  return handleResponse(response);
}

// Actualizar getAllLandingContent para incluir servicios
```

4. **Actualizar useLandingContent hook:**

```javascript
// apps/web/src/hooks/useLandingContent.js
const [content, setContent] = useState({
  values: [],
  certifications: [],
  testimonials: [],
  contactInfo: [],
  contentBlocks: [],
  statistics: [],
  servicios: [] // ✅ Agregar aquí
});
```

5. **Crear sección en la base de datos:**

```sql
INSERT INTO landing_sections (
  section_key,
  section_type,
  title,
  subtitle,
  layout_config,
  is_visible,
  order_index
) VALUES (
  'servicios',
  'grid',
  'Nuestros Servicios',
  'Contamos con la más amplia gama de estudios',
  '{
    "dataSource": "landing_servicios",
    "gridColumns": 3,
    "cardStyle": "bg-white p-6 rounded-lg shadow-lg",
    "showIcon": true,
    "iconSize": 10,
    "backgroundColor": "gray-50"
  }'::jsonb,
  true,
  3
);
```

6. **¡Listo!** La sección aparecerá automáticamente en la landing page sin tocar más código.

---

### Caso 2: Crear Composite Section (Sección Compleja)

Si tu sección tiene lógica compleja (formularios, múltiples subsecciones, state management), necesitas crear un componente dedicado.

**Ejemplo: Sección "Equipo"**

1. **Crear el componente:**

```javascript
// apps/web/src/components/landing/sections/EquipoSection.jsx
import React from 'react';
import { renderIcon } from '../../../utils/iconMapper';

const EquipoSection = ({ section, content }) => {
  const equipo = content.landing_equipo || [];

  return (
    <section id={section.section_key} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        {section.title && (
          <h2 className="text-4xl font-bold text-center mb-12">
            {section.title}
          </h2>
        )}

        {/* Grid de miembros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {equipo.map(miembro => (
            <div key={miembro.id} className="text-center">
              <img
                src={miembro.foto_url}
                alt={miembro.nombre}
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold">{miembro.nombre}</h3>
              <p className="text-gray-600">{miembro.cargo}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EquipoSection;
```

2. **Registrar en CompositeSection:**

```javascript
// apps/web/src/components/landing/CompositeSection.jsx
import EquipoSection from './sections/EquipoSection';

const CompositeSection = ({ section, content }) => {
  switch (section_key) {
    case 'nosotros':
      return <NosotrosSection section={section} content={content} />;
    case 'contacto':
      return <ContactoSection section={section} content={content} companyInfo={companyInfo} />;
    case 'equipo': // ✅ Agregar aquí
      return <EquipoSection section={section} content={content} />;
    default:
      return <DebugWarning />;
  }
};
```

3. **Crear sección en DB:**

```sql
INSERT INTO landing_sections (
  section_key,
  section_type,
  title,
  layout_config,
  is_visible,
  order_index
) VALUES (
  'equipo',
  'composite',
  'Nuestro Equipo',
  '{"component": "EquipoSection"}'::jsonb,
  true,
  4
);
```

4. **¡Listo!** La sección se renderizará automáticamente.

---

## Testing

### Testing Manual

#### 1. Estructura de Secciones
```bash
curl http://localhost:3005/api/landing/sections | jq .
# Verificar: success: true, sections_count > 0
```

#### 2. Contenido Completo
```bash
curl http://localhost:3005/api/landing | jq .
# Verificar: data.values, data.certifications, etc.
```

#### 3. Frontend Visual
```bash
npm run dev
open http://localhost:5173
# Verificar: Todas las secciones visibles, sin errores en console
```

### Edge Cases a Testear

#### Secciones sin datos
```javascript
// GridSection debe mostrar warning en dev
// En producción debe retornar null sin romper la página
```

#### Contenido malformado
```javascript
// Error Boundary debe capturar y mostrar fallback
// La página debe continuar funcionando
```

#### Sección no implementada
```javascript
// SectionRenderer debe mostrar warning en dev
// En producción debe skipear la sección
```

### Testing Automatizado (Futuro)

```javascript
// Ejemplo con Vitest
describe('GridSection', () => {
  it('renders items correctly', () => {
    const section = {
      section_key: 'test',
      layout_config: { dataSource: 'landing_values', gridColumns: 3 }
    };
    const content = {
      landing_values: [
        { id: 1, title: 'Test', description: 'Test desc' }
      ]
    };

    render(<GridSection section={section} content={content} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Error: "Failed to resolve import"

**Síntoma:** Vite no encuentra un import
```
Failed to resolve import "../HeroCarouselEG"
```

**Solución:**
1. Verificar que el path sea correcto (relativo al archivo)
2. Limpiar cache de Vite:
```bash
cd apps/web
rm -rf node_modules/.vite
npm run dev
```

---

### Error: Sección no aparece en la landing

**Síntoma:** Agregaste una sección pero no se ve

**Checklist:**
1. ✅ ¿Está `is_visible = true` en DB?
```sql
SELECT section_key, is_visible FROM landing_sections;
```

2. ✅ ¿Está el `order_index` correcto?
```sql
SELECT section_key, order_index FROM landing_sections ORDER BY order_index;
```

3. ✅ ¿El `section_type` está soportado en SectionRenderer?
```javascript
// Revisar switch en SectionRenderer.jsx
```

4. ✅ ¿El cache de Redis está desactualizado?
```bash
# Invalidar cache
curl -X POST http://localhost:3005/api/admin/landing/sections/invalidate-cache
```

---

### Error: Datos vacíos en componente

**Síntoma:** El componente renderiza pero no muestra datos

**Checklist:**
1. ✅ ¿El `dataSource` coincide con la key en content?
```javascript
// layout_config.dataSource debe ser igual a la key en content object
{ dataSource: 'landing_certifications' } → content.landing_certifications
```

2. ✅ ¿La API backend retorna datos?
```bash
curl http://localhost:3005/api/landing | jq .data.certifications
```

3. ✅ ¿El hook `useLandingContent` incluye la data?
```javascript
// Revisar que la key esté en el return del hook
```

---

### Warning: JSX attribute

**Síntoma:**
```
Received 'true' for a non-boolean attribute 'jsx'
```

**Solución:** Usar `<style>` en vez de `<style jsx>`
```javascript
// ❌ Incorrecto
<style jsx>{`...`}</style>

// ✅ Correcto
<style>{`...`}</style>
```

---

## Best Practices

### 1. Naming Conventions

**Secciones:**
- section_key: kebab-case (`'nosotros'`, `'contacto'`, `'valores-corporativos'`)
- section_type: snake_case (`'carousel'`, `'grid'`, `'composite'`, `'statistics_cta'`)

**Content:**
- dataSource: snake_case con prefijo `landing_` (`'landing_certifications'`, `'landing_values'`)
- Componentes: PascalCase (`NosotrosSection`, `GridSection`)

### 2. Performance

**Usar cache agresivamente:**
```javascript
// Backend: Redis con TTL 5 minutos
const cacheKey = `landing:sections:${labKey}`;
await redisClient.setex(cacheKey, 300, JSON.stringify(sections));
```

**Lazy loading:**
```javascript
// Frontend: React.Suspense
<Suspense fallback={<LoadingFallback />}>
  <SectionRenderer section={section} content={content} />
</Suspense>
```

### 3. Error Handling

**Non-blocking errors:**
```javascript
// Si una sección falla, las demás deben continuar
try {
  return <SectionComponent />;
} catch (error) {
  if (import.meta.env.DEV) {
    return <ErrorFallback error={error} />;
  }
  return null; // En producción, skip silencioso
}
```

### 4. Type Safety

**Usar JSDoc para documentar:**
```javascript
/**
 * @param {Object} section
 * @param {string} section.section_key
 * @param {string} section.section_type
 * @param {Object} section.layout_config
 * @param {Object} content
 * @returns {React.Element}
 */
const GridSection = ({ section, content }) => { ... }
```

### 5. Git Commits

**Commits atómicos:**
```bash
# ❌ Incorrecto
git commit -m "changes"

# ✅ Correcto
git commit -m "feat(landing): add GridSection component with responsive grid

- Support for configurable column counts
- Icon rendering with iconMapper
- Staggered fade-in animations
- Fallback for empty data in development

Tested with certifications and values sections."
```

---

## Deployment Checklist

Antes de hacer deploy a producción:

- [ ] ✅ Todas las migraciones ejecutadas en todas las DBs
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Redis configurado y funcionando
- [ ] ✅ Build sin errores: `npm run build`
- [ ] ✅ Tests manuales pasados
- [ ] ✅ Console.logs removidos
- [ ] ✅ Error boundaries probados
- [ ] ✅ Cache invalidation funcionando
- [ ] ✅ Responsive design verificado
- [ ] ✅ Performance aceptable (Lighthouse > 90)

---

## Recursos Adicionales

- **Documentación de Phases:** Ver [PHASE3_REFACTOR_COMPLETE.md](./PHASE3_REFACTOR_COMPLETE.md)
- **Plan de Refactor:** Ver [PHASE3_REFACTOR_PLAN.md](./PHASE3_REFACTOR_PLAN.md)
- **Implementación Técnica:** Ver [DYNAMIC_LANDING_IMPLEMENTATION.md](./DYNAMIC_LANDING_IMPLEMENTATION.md)
- **Turborepo Docs:** https://turbo.build/repo/docs
- **React Suspense:** https://react.dev/reference/react/Suspense

---

**¡Happy Coding! 🚀**
