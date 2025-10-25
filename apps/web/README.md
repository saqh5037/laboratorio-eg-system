# 🏥 Laboratorio Elizabeth Gutiérrez - PWA

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-purple.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![Performance](https://img.shields.io/badge/Core%20Web%20Vitals-Optimized-green.svg)](https://web.dev/vitals/)

Progressive Web Application para el sistema de gestión de estudios clínicos y análisis de laboratorio **Laboratorio Elizabeth Gutiérrez**.

## 🌟 Características Principales

### 📱 **Progressive Web App (PWA)**
- ✅ **Instalable** en dispositivos móviles y desktop
- ✅ **Funciona offline** con cache inteligente
- ✅ **Actualizaciones automáticas** con notificaciones al usuario
- ✅ **Sincronización en background** cuando regresa la conectividad
- ✅ **Push notifications** preparadas para implementación futura

### 🚀 **Performance Optimizado**
- ✅ **Code Splitting** por rutas con lazy loading
- ✅ **Core Web Vitals** optimizados (LCP, FID, CLS, FCP)
- ✅ **Virtual Scrolling** para listas grandes
- ✅ **Imágenes optimizadas** con WebP y lazy loading
- ✅ **Bundle splitting** estratégico para mejor cache
- ✅ **Preloading** de recursos críticos

### 🏥 **Funcionalidades Médicas**
- 📊 **Catálogo de estudios** con búsqueda avanzada
- 🔍 **Vista jerárquica** tipo árbol para navegación
- ⭐ **Sistema de favoritos** con carpetas y notas personales
- 📈 **Exportación de datos** en JSON y CSV
- 🎯 **Búsqueda fuzzy** con Fuse.js
- 📱 **Diseño responsive** mobile-first

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS con tema médico personalizado
- **Routing**: React Router v7 con lazy loading
- **Animations**: Framer Motion
- **PWA**: Service Worker + Web App Manifest
- **Search**: Fuse.js para búsqueda avanzada
- **Data**: Excel processing con XLSX
- **Performance**: Web Vitals monitoring

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPO]
cd laboratorio-eg

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:5173
```

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con HMR
npm run build        # Build de producción optimizado
npm run preview      # Preview del build de producción
npm run lint         # Verificar código con ESLint

# PWA
npm run build        # Genera Service Worker y optimizaciones PWA
```

## 📱 Instalación como PWA

### En Móviles (Android/iOS)
1. Abrir la aplicación en el navegador
2. Tocar el botón "Instalar" cuando aparezca el prompt
3. O usar "Agregar a pantalla de inicio" desde el menú del navegador

### En Desktop (Chrome/Edge)
1. Buscar el ícono de instalación en la barra de direcciones
2. Hacer click en "Instalar Laboratorio EG"
3. La app aparecerá como aplicación nativa

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── PWAComponents.jsx       # Componentes PWA (install, update prompts)
│   ├── LoadingSpinner.jsx      # Spinners y estados de carga
│   ├── ErrorBoundary.jsx       # Manejo de errores
│   ├── OptimizedImage.jsx      # Imágenes optimizadas
│   ├── FavoritesList.jsx       # Lista de favoritos con drag & drop
│   └── ...
├── pages/              # Páginas de la aplicación
│   ├── Home.jsx               # Página principal
│   ├── Estudios.jsx           # Catálogo de estudios
│   ├── FavoritesPage.jsx      # Gestión de favoritos
│   └── TreeViewDemo.jsx       # Vista jerárquica
├── hooks/              # Custom hooks
│   ├── useFavorites.js        # Gestión de favoritos
│   ├── useLabData.js          # Datos del laboratorio
│   └── useAdvancedSearch.js   # Búsqueda avanzada
├── utils/              # Utilidades
│   ├── pwa.js                 # PWA Manager
│   ├── performance.js         # Monitoreo de performance
│   └── excelProcessor.js      # Procesamiento de Excel
├── contexts/           # Contextos de React
│   └── ThemeContext.jsx       # Tema light/dark
└── layouts/            # Layouts principales
    └── MainLayout.jsx         # Layout principal con sidebar
```

## 🎨 Tema y Diseño

### Colores Principales
- **Purple**: `#7B68A6` - Color principal del laboratorio
- **Pink**: `#E8C4DD` - Color secundario y acentos
- **Gray**: `#76767A` - Texto secundario y elementos UI

### Componentes de Diseño
- **Medical Icons**: Iconografía específica para cada categoría de estudio
- **Cards**: Tarjetas modernas con información de estudios
- **Responsive**: Mobile-first con breakpoints optimizados
- **Animations**: Transiciones suaves con Framer Motion

## 📊 Performance Metrics

### Core Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s

### Bundle Size Optimization
- **Main Bundle**: < 250KB gzipped
- **Vendor Bundle**: < 150KB gzipped
- **Code Splitting**: Por rutas principales
- **Tree Shaking**: Eliminación de código no utilizado

## 🔧 PWA Features

### Service Worker
- **Cache First**: Para recursos estáticos (CSS, JS, imágenes)
- **Network First**: Para datos dinámicos (API calls)
- **Stale While Revalidate**: Para recursos que pueden estar desactualizados
- **Background Sync**: Para sincronización offline

### Offline Capabilities
- ✅ Navegación completa sin internet
- ✅ Cache de estudios y favoritos
- ✅ Página offline elegante con branding
- ✅ Sincronización automática al recuperar conexión

### Installation & Updates
- ✅ Prompts de instalación personalizados
- ✅ Notificaciones de actualización
- ✅ Actualizaciones seamless sin interrupciones
- ✅ Iconos nativos para todos los dispositivos

## 📁 Estructura de Datos

### Estudios de Laboratorio
```javascript
{
  id: "estudio_001",
  nombre: "Hematología Completa",
  codigo: "1001",
  categoria: "Hematología",
  precio: 350.00,
  tiempoEntrega: "2-4 horas",
  preparacion: "Ayuno no requerido",
  pruebas: ["Hemoglobina", "Hematocrito", "Leucocitos", ...]
}
```

### Sistema de Favoritos
```javascript
{
  id: "fav_001",
  studyId: "estudio_001",
  folderId: "folder_001",
  notes: "Estudio importante para seguimiento",
  tags: ["rutinario", "urgente"],
  priority: "high",
  dateAdded: "2024-01-15T10:30:00Z"
}
```

## 🧪 Testing

### Pruebas de PWA
```bash
# Lighthouse CI para PWA audit
npx lighthouse --view
```

### Performance Testing
```bash
# Análisis de bundle
npm run build --report
```

## 🚀 Deployment

### Build de Producción
```bash
npm run build
```

Esto genera:
- Archivos optimizados en `/dist`
- Service Worker configurado
- Manifest PWA incluido
- Assets optimizados y comprimidos

### Variables de Entorno
Crear `.env.production`:
```env
VITE_API_URL=https://api.laboratorio-eg.com
VITE_VAPID_PUBLIC_KEY=your_vapid_key_here
```

## 📈 Monitoreo y Analytics

### Performance Monitoring
La aplicación incluye monitoreo automático de:
- Core Web Vitals en tiempo real
- Tiempo de carga de componentes
- Errores y excepciones
- Métricas de uso offline

### Error Tracking
- Error Boundary para manejo graceful de errores
- Logging automático de errores críticos
- Información de contexto para debugging

## 🔒 Seguridad

- ✅ HTTPS requerido para PWA
- ✅ Content Security Policy headers
- ✅ Sanitización de datos de entrada
- ✅ Validación de formularios
- ✅ Gestión segura de localStorage

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 87+
- ✅ Firefox 78+
- ✅ Safari 13.1+
- ✅ Edge 88+

### Dispositivos
- ✅ Android 5.0+ (Chrome)
- ✅ iOS 13.4+ (Safari)
- ✅ Windows 10+ (Edge/Chrome)
- ✅ macOS 10.15+ (Safari/Chrome)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🏥 Sobre Laboratorio Elizabeth Gutiérrez

**Laboratorio Elizabeth Gutiérrez** cuenta con más de 43 años de experiencia en análisis clínicos y diagnóstico médico, ofreciendo:

- 🔬 Análisis clínicos especializados
- 🩸 Estudios de hematología y química sanguínea
- 🦠 Microbiología y cultivos
- 🧬 Estudios genéticos y moleculares
- ⚡ Resultados rápidos y confiables
- 👥 Atención personalizada

---

**Desarrollado con ❤️ para mejorar la atención médica**

## 📞 Contacto

- **Sitio Web**: [laboratorio-eg.com](https://laboratorio-eg.com)
- **Email**: contacto@laboratorio-eg.com
- **Teléfono**: +52 (555) 123-4567

---

**Versión**: 1.0.0  
**Última actualización**: Agosto 2024
