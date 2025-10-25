# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.3.0] - 2025-10-20

### ✨ Agregado - Ficha Técnica Completa

#### Backend API (server/models/index.js)
- **Valores Referenciales**: Agregado subquery de `valores_referenciales` en:
  - `Prueba.findAll()` - Obtener todas las pruebas
  - `Prueba.findById()` - Obtener prueba por ID
  - `Prueba.search()` - Búsqueda de pruebas
  - `UnifiedSearch.search()` - Búsqueda unificada
- **Información incluida en valores referenciales**:
  - Rangos de edad (edad_desde, edad_hasta) con unidades de tiempo (Años, Meses, Días, Semanas)
  - Diferenciación por sexo (Masculino/Femenino/Ambos)
  - Valores mínimo y máximo de referencia
  - Comentarios adicionales con información clínica
  - Flags especiales: pánico (valores críticos) y embarazo

#### Frontend - Adaptador de Datos (src/adapters/studyAdapter.js)
- **Método `formatDiasProceso()`**: Convierte días booleanos (lunes, martes, etc.) a array ['L','M','X','J','V','S','D']
- **Método `formatValoresReferenciales()`**: Formatea valores de referencia de formato backend a frontend
  - Genera rangos de edad legibles ("0-12 años", "Todas las edades")
  - Convierte códigos de sexo a texto ("M" → "Masculino", "F" → "Femenino")
- **Actualizado `fromBackend()`** para incluir:
  - `diasProceso` - Días de procesamiento del estudio
  - `valoresReferenciales` - Valores de referencia formateados
  - `metodologia` - Metodología del estudio
  - `valoresNormales` - Valores normales esperados
  - `infoTomaMuestra` - Información sobre toma de muestra
  - `criteriosRechazo` - Criterios de rechazo de muestra
  - `diasEstabilidad` - Días de estabilidad de la muestra

#### Frontend - Hook de Datos (src/hooks/useLabDataDB.js)
- **Mapeo de campos de ficha técnica** en objetos de estudio:
  - `diasProceso` - Array de días de proceso
  - `valoresReferenciales` - Array de valores de referencia
  - `fichaTecnica` - Objeto con información técnica completa
  - `infoTomaMuestra`, `criteriosRechazo`, `volumenMinimo`, `diasEstabilidad`

#### Modal de Detalle (src/components/StudyDetailModal.jsx)
- **Sección "Días de Proceso"**:
  - Indicadores visuales circulares para cada día (L-M-X-J-V-S-D)
  - Color verde para días disponibles, gris para no disponibles
  - Icono de calendario
- **Tabla "Valores de Referencia"**:
  - Columnas: Rango de Edad, Sexo, Valor Mínimo, Valor Máximo, Observaciones
  - Símbolos de sexo: ♂ (Masculino), ♀ (Femenino)
  - Indicadores especiales: ⚠ (Pánico) en rojo, 🤰 (Embarazo) en rosa
  - Highlighting de filas según tipo (pánico: bg-red-50, embarazo: bg-pink-50)
- **Secciones adicionales**:
  - Metodología del estudio
  - Información de toma de muestra
  - Criterios de rechazo
  - Volumen mínimo y días de estabilidad

### 🗑️ Removido - Componentes PWA Molestos

#### PWA Components (src/components/PWAComponents.jsx)
- **Eliminado componente `UpdatePrompt`**:
  - Popup de "Actualización disponible"
  - Botón "Actualizar ahora" y "Después"
  - Eliminada lógica de detección y manejo de actualizaciones
- **Eliminado componente `NotificationSetup`**:
  - Popup de "Activar notificaciones"
  - Descripción "Recibe alertas sobre resultados y actualizaciones importantes"
  - Botón "Activar" y lógica de permisos
- **Actualizado `PWAWrapper`**:
  - Removidas referencias a `<UpdatePrompt />` y `<NotificationSetup />`
  - Mantiene solo componentes esenciales:
    - `<NetworkStatus />` - Indicador de estado de conexión (online/offline)
    - `<InstallPrompt />` - Prompt de instalación PWA

### 🔄 Cambiado - Sincronización de Datos

#### Servicio de Sincronización
- Ejecutada sincronización manual desde base de datos Labsis
- Generado JSON actualizado: 513 estudios (349 pruebas + 164 grupos)
- Tamaño del archivo: 1.2 MB (1239.51 KB) - antes: 611 KB
- Datos sincronizados:
  - Valores referenciales completos con todas las edades y sexos
  - Días de proceso transformados a formato array
  - Ficha técnica completa con metodología e información adicional
- Archivo copiado a servidor remoto AWS (52.55.189.120)

### 🐛 Corregido

- **Hook useLabDataDB**: Corregido mapeo de campos que causaba `undefined` en `diasProceso` y `valoresReferenciales`
- **Backend API**: Actualizado con queries correctos para incluir valores referenciales en todas las consultas
- **JSON estático**: Sincronizado con cambios recientes de Labsis

### 📝 Notas Técnicas

#### Flujo de Datos
1. **Labsis (PostgreSQL 14.18)** → Base de datos origen con información clínica
2. **sync-service** → Extrae datos con queries SQL y transforma a JSON
3. **laboratorio-eg/public/data/precios.json** → JSON estático para PWA offline
4. **Backend API (Node.js/Express)** → Servidor REST en puerto 3001
5. **useLabDataDB Hook** → Carga y mapea datos para React
6. **StudyDetailModal** → Presenta información al usuario

#### Stack Tecnológico
- React 19.1.1
- Vite 7.1.2 (HMR)
- PostgreSQL 14.18
- Node.js + Express (Backend API)
- Framer Motion (animaciones)
- Tailwind CSS (estilos)
- Lucide React (iconos)

---

## [1.2.1-prod] - 2025-10-18

### Agregado
- Indicadores visuales de tubos de muestra con colores
- Iconos de tipos de muestra (sangre, orina, heces, etc.)
- Tag de versión Git creado

---

## [1.0.0] - 2024-08-17

### 🎉 Lanzamiento inicial - PWA completa para Laboratorio Elizabeth Gutiérrez

Esta es la primera versión estable de la Progressive Web Application para el sistema de gestión de estudios clínicos del Laboratorio Elizabeth Gutiérrez.

### ✨ Agregado

#### 📱 **Progressive Web App (PWA)**
- **Service Worker** con cache offline inteligente
- **Web App Manifest** con iconos y metadatos optimizados
- **Instalación nativa** en dispositivos móviles y desktop
- **Actualizaciones automáticas** con notificaciones al usuario
- **Sincronización en background** para datos offline
- **Iconografía médica** personalizada con branding del laboratorio

#### 🚀 **Performance Optimizations**
- **Code splitting** automático por rutas con React.lazy()
- **Bundle optimization** con chunks estratégicos (vendor, UI, utils)
- **Image optimization** con soporte WebP y lazy loading
- **Virtual scrolling** para listas grandes de estudios
- **Preloading** de recursos críticos
- **Core Web Vitals** monitoring integrado

#### 🏥 **Funcionalidades Médicas**
- **Catálogo de estudios** completo con más de 200 análisis clínicos
- **Búsqueda avanzada** con fuzzy search usando Fuse.js
- **Vista jerárquica** tipo árbol para navegación por categorías
- **Sistema de favoritos** completo con carpetas y organización
- **Notas personales** por estudio favorito
- **Exportación de datos** en formatos JSON y CSV
- **Filtros avanzados** por categoría, precio y tiempo de entrega

#### 🎨 **UI/UX**
- **Diseño responsive** mobile-first optimizado
- **Tema médico personalizado** con colores del laboratorio
- **Animaciones fluidas** con Framer Motion
- **Iconografía médica** específica por categoría de estudio
- **Loading states** profesionales con spinners temáticos
- **Error boundaries** con manejo graceful de errores

#### 🛠️ **Infraestructura Técnica**
- **React 19** con las últimas optimizaciones
- **Vite 7.1.2** para build ultra-rápido
- **Tailwind CSS** con configuración personalizada
- **React Router v7** con lazy loading
- **TypeScript-ready** para futura migración
- **ESLint** configurado para calidad de código

### 🔧 **Configuraciones**

#### **Build Optimization**
- Target moderno: ES2020+ para mejor performance
- Terser minification con eliminación de console.log en producción
- CSS code splitting automático
- Asset optimization con nombres de archivo hash-based

#### **PWA Configuration**
- Cache strategies configuradas por tipo de recurso
- Offline fallbacks elegantes con branding
- Background sync para favoritos y acciones offline
- Push notifications preparadas para implementación futura

#### **Performance Monitoring**
- Métricas automáticas de Core Web Vitals
- Error tracking con contexto detallado
- Performance budgets configurados
- Monitoring de recursos lentos

### 📊 **Datos y Estructura**

#### **Estudios de Laboratorio**
- Base de datos con estructura jerárquica completa
- Categorías: Hematología, Química Sanguínea, Microbiología, etc.
- Información detallada: códigos, precios, tiempos de entrega
- Sistema de pruebas incluidas por estudio

#### **Sistema de Favoritos**
- Persistencia en localStorage con backup automático
- Organización en carpetas con colores personalizables
- Notas y tags por estudio
- Niveles de prioridad (alta, normal, baja)
- Exportación e importación de colecciones

### 🔒 **Seguridad y Compatibilidad**
- Sanitización de datos de entrada
- Gestión segura de localStorage
- Compatibilidad con navegadores modernos (Chrome 87+, Firefox 78+, Safari 13.1+, Edge 88+)
- Soporte completo para dispositivos móviles Android 5.0+ y iOS 13.4+

### 📱 **Experiencia de Usuario**
- Instalación con un clic desde el navegador
- Funcionamiento completo sin conexión a internet
- Interfaz adaptada para uso profesional médico
- Accesos rápidos a funciones principales
- Búsqueda instantánea en todo el catálogo

### 🧪 **Calidad y Testing**
- Error boundaries en todos los componentes críticos
- Validación de datos en formularios
- Manejo de estados de error y loading
- Feedback visual para todas las acciones del usuario

---

## Tipos de cambios
- `Added` para nuevas funcionalidades.
- `Changed` para cambios en funcionalidades existentes.
- `Deprecated` para funcionalidades que serán eliminadas en futuras versiones.
- `Removed` para funcionalidades eliminadas.
- `Fixed` para corrección de bugs.
- `Security` para actualizaciones de seguridad.

---

**Próximas versiones planeadas:**
- v1.1.0: Integración con API backend del laboratorio
- v1.2.0: Push notifications para resultados
- v1.3.0: Autenticación de usuarios y perfiles
- v1.4.0: Integración con sistemas de pago
- v1.5.0: Telemedicina y consultas en línea