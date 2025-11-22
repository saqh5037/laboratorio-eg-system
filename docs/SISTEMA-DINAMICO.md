# Sistema de Personalización Dinámica

Documentación completa del sistema de configuración dinámica implementado en 8 fases para Laboratorio Elizabeth Gutiérrez.

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Fases de Implementación](#fases-de-implementación)
4. [Guía de Administración](#guía-de-administración)
5. [Referencia Técnica](#referencia-técnica)
6. [Hooks Disponibles](#hooks-disponibles)
7. [Endpoints API](#endpoints-api)
8. [Migraciones de Base de Datos](#migraciones-de-base-de-datos)

---

## Resumen Ejecutivo

El sistema de personalización dinámica permite configurar completamente la aplicación web sin modificar código. Todo se gestiona desde el panel administrativo (`/admin`).

### Características Principales

- **Configuración centralizada** en PostgreSQL
- **Panel administrativo** completo con CRUD
- **Cambios en tiempo real** sin redeploy
- **Fallbacks inteligentes** para datos faltantes
- **Auditoría completa** de cambios
- **Cache optimizado** para rendimiento

### Componentes Dinámicos

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| Header | Todas las páginas | Menú de navegación dinámico |
| Sidebar | Móvil | Menú lateral con iconos |
| Footer | Landing Page | Enlaces y servicios dinámicos |
| Logos | Global | URLs configurables |
| Temas | Global | Colores y estilos |
| SEO | Global | Meta tags dinámicos |
| Carrusel | Landing | Imágenes y CTAs |
| Info Empresa | Global | Datos de contacto y legales |

---

## Arquitectura del Sistema

```
┌─────────────────┐     ┌──────────────┐     ┌────────────────┐
│   Frontend      │     │  Config API  │     │   PostgreSQL   │
│   (React)       │────▶│   (Express)  │────▶│ lis_bot_com... │
│                 │     │              │     │                │
│ - useNavigation │     │ - /api/nav   │     │ - navigation   │
│ - useCompanyInfo│     │ - /api/company│    │ - company_info │
│ - useThemeColors│     │ - /api/theme │     │ - themes       │
│ - useSystemConfig│    │ - /api/config│     │ - system_config│
└─────────────────┘     └──────────────┘     └────────────────┘
```

### Flujo de Datos

1. **Frontend** llama hooks personalizados
2. **Hooks** fetch data desde Config API
3. **API** consulta/cachea PostgreSQL
4. **Componentes** renderizan datos dinámicos
5. **Admin Panel** actualiza configuración
6. **Cache** se invalida automáticamente

---

## Fases de Implementación

### FASE 1: Base de Datos y API
- Creación de tablas en PostgreSQL
- Endpoints REST en Config API
- Autenticación JWT para admin

### FASE 2: Hooks de React
- `useSystemConfig` - Configuración global
- `useNavigation` - Items de menú
- `useCompanyInfo` - Datos de empresa
- `useThemeColors` - Colores del tema

### FASE 3: Panel Administrativo
- Login seguro (`/admin/login`)
- Dashboard con métricas
- Managers para cada entidad
- Audit log de cambios

### FASE 4: Componentes Dinámicos
- Header con navegación dinámica
- Sidebar con iconos configurables
- Footer con enlaces y servicios
- SEOHead con meta tags

### FASE 5: Temas y Estilos
- ThemeManager para colores
- Persistencia en localStorage
- Transiciones suaves
- Modo oscuro/claro

### FASE 6: Carrusel y Landing
- Imágenes con upload
- CTAs dinámicos
- Autoplay configurable
- Preview en admin

### FASE 7: Información de Empresa
- Datos de contacto
- Redes sociales
- Horarios de atención
- Información legal

### FASE 8: Logos Dinámicos
- URLs configurables
- Preview en tiempo real
- Fallbacks automáticos
- Alt text para SEO

---

## Guía de Administración

### Acceso al Panel

1. Navegar a `http://tu-dominio.com/admin/login`
2. Credenciales por defecto: `admin` / `admin123`
3. **IMPORTANTE:** Cambiar contraseña en producción

### Gestionar Navegación

**Ruta:** `/admin/navigation`

1. Seleccionar ubicación (Header, Sidebar, Footer Quick, Footer Services)
2. Agregar nuevo item con +
3. Configurar:
   - Label: Texto visible
   - URL: Ruta interna o externa
   - Icono: Seleccionar de lista Lucide
   - Target: _self o _blank
   - Activo: Mostrar/ocultar item
4. Reordenar con flechas Up/Down
5. Guardar cambios

### Gestionar Logos

**Ruta:** `/admin/company` → Tab "Logos"

1. Ir a pestaña "Logos"
2. Configurar URLs:
   - **Logo Completo:** Para footer y páginas full
   - **Logo Icono:** Para header móvil
   - **Logo Horizontal:** Para header desktop
   - **Favicon:** Icono del navegador
3. Verificar preview en tiempo real
4. Guardar cambios

### Gestionar Información de Empresa

**Ruta:** `/admin/company`

Tabs disponibles:
- **Identidad:** Nombre, RIF, slogan, fundación
- **Logos:** URLs e imágenes
- **Contacto:** Teléfonos, emails, WhatsApp
- **Dirección:** Sedes con Google Maps
- **Horarios:** Días y horas de atención
- **Redes Sociales:** Facebook, Instagram, etc.
- **SEO:** Meta tags y Open Graph
- **PWA:** Configuración de app móvil
- **Legal:** Políticas y términos

### Gestionar Temas

**Ruta:** `/admin/themes`

1. Ver tema activo actual
2. Modificar colores:
   - Primary (púrpura EG)
   - Secondary (rosa EG)
   - Accent (gradientes)
   - Text colors
3. Preview en vivo
4. Activar tema
5. Los cambios aplican inmediatamente

### Ver Auditoría

**Ruta:** `/admin/audit`

- Historial de todos los cambios
- Usuario responsable
- Fecha y hora exacta
- Valores anteriores y nuevos
- Filtrar por entidad o usuario

---

## Referencia Técnica

### Estructura de Archivos

```
apps/web/src/
├── hooks/
│   ├── useNavigation.js       # Gestión de navegación
│   ├── useCompanyInfo.js      # Datos de empresa
│   ├── useThemeColors.js      # Colores dinámicos
│   └── useSystemConfig.js     # Configuración global
├── components/
│   ├── Header.jsx             # Header dinámico
│   ├── Sidebar.jsx            # Sidebar dinámico
│   ├── DynamicFooter.jsx      # Footer dinámico
│   ├── SEOHead.jsx            # Meta tags dinámicos
│   └── brand/
│       └── BrandLogo.jsx      # Logos dinámicos
├── pages/admin/
│   ├── NavigationManager.jsx  # CRUD navegación
│   ├── CompanyInfoManager.jsx # Info empresa + logos
│   ├── ThemeManager.jsx       # Gestión temas
│   ├── Configurations.jsx     # Config global
│   └── AuditLog.jsx           # Historial cambios
└── contexts/
    ├── AdminAuthContext.jsx   # Auth de admin
    └── UnifiedAppContext.jsx  # Estado global
```

### Variables de Entorno

```bash
# apps/web/.env
VITE_CONFIG_API_URL=http://192.168.1.125:3005

# apps/config-api/.env
DATABASE_URL=postgresql://labsis:labsis@localhost:5432/lis_bot_comunicacion
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=http://localhost:5173,http://192.168.1.125:5173
```

---

## Hooks Disponibles

### useNavigation()

```javascript
import { useNavigation } from '../hooks/useNavigation';

const {
  navigation,        // Objeto con todos los items
  loading,           // Estado de carga
  error,             // Error si existe
  getHeaderItems,    // Items del header
  getSidebarItems,   // Items del sidebar
  getFooterQuickLinks,  // Links rápidos footer
  getFooterServices,    // Servicios footer
  fetchNavigation,      // Refetch manual
} = useNavigation();
```

### useCompanyInfo()

```javascript
import { useCompanyInfo } from '../hooks/useCompanyInfo';

const {
  companyInfo,       // Todos los datos
  loading,
  error,
  updateCompanyInfo, // Actualizar (requiere token)
  fetchCompanyInfo,  // Refetch manual
} = useCompanyInfo();

// Campos disponibles:
// - name, short_name, slogan
// - logo_full_url, logo_icon_url, logo_horizontal_url
// - phone_primary, email_primary, whatsapp
// - address_main, google_maps_embed
// - facebook_url, instagram_url, twitter_url
// - seo_title, seo_description, seo_keywords
// - founded_year, years_of_experience
// - certifications, professionals_count
```

### useThemeColors()

```javascript
import { useThemeColors } from '../hooks/useThemeColors';

const {
  primary,    // Color primario (#7B68A6)
  secondary,  // Color secundario
  accent,
  error,
  success,
  warning,
} = useThemeColors();
```

### useSystemConfig()

```javascript
import { useSystemConfig } from '../hooks/useSystemConfig';

const {
  isPageEnabled,      // Verificar página habilitada
  isMaintenanceMode,  // Modo mantenimiento
  getMaintenanceMessage,
  getConfigValue,     // Obtener config específica
} = useSystemConfig();

// Ejemplo:
if (isPageEnabled('estudios')) {
  // Mostrar página de estudios
}
```

---

## Endpoints API

### Navegación

```
GET    /api/navigation                 # Listar todos los items
POST   /api/navigation                 # Crear item (auth)
PUT    /api/navigation/:id             # Actualizar item (auth)
DELETE /api/navigation/:id             # Eliminar item (auth)
POST   /api/navigation/:id/toggle      # Toggle activo (auth)
POST   /api/navigation/reorder         # Reordenar items (auth)
```

### Información de Empresa

```
GET    /api/company                    # Obtener info
PUT    /api/company                    # Actualizar todo (auth)
PATCH  /api/company/identity           # Solo identidad (auth)
PATCH  /api/company/contact            # Solo contacto (auth)
```

### Temas

```
GET    /api/theme                      # Tema activo
GET    /api/themes                     # Todos los temas
POST   /api/themes                     # Crear tema (auth)
PUT    /api/themes/:id                 # Actualizar (auth)
POST   /api/themes/:id/activate        # Activar tema (auth)
```

### Configuración

```
GET    /api/config                     # Todas las configs
GET    /api/config/grouped             # Agrupadas por categoría
PUT    /api/config/:key                # Actualizar valor (auth)
```

---

## Migraciones de Base de Datos

### Ubicación

```
apps/config-api/migrations/lis_bot_comunicacion/
├── 001_initial_schema.sql
├── 002_audit_logs.sql
├── 010_add_slogan_to_company.sql
├── 024_update_seeds_to_match_current.sql
└── 025_add_logo_urls.sql
```

### Ejecutar Migración

```bash
PGPASSWORD='labsis' psql -h localhost -U labsis -d lis_bot_comunicacion \
  -f apps/config-api/migrations/lis_bot_comunicacion/025_add_logo_urls.sql
```

### Ejemplo: Agregar Campo

```sql
-- migrations/026_new_field.sql
BEGIN;

ALTER TABLE company_info
ADD COLUMN IF NOT EXISTS new_field VARCHAR(500) DEFAULT 'default_value';

UPDATE company_info SET new_field = 'actual_value' WHERE id = 1;

COMMIT;
```

---

## Mejores Prácticas

### Seguridad

1. **Cambiar credenciales** por defecto en producción
2. **JWT_SECRET** debe ser aleatorio y largo
3. **CORS** configurado solo para dominios permitidos
4. **Validación** en frontend y backend

### Performance

1. **Cache** habilitado en Config API (TTL: 5 min)
2. **Timeout** de 10 segundos en hooks
3. **Lazy loading** de componentes pesados
4. **Skeleton loaders** durante carga

### Mantenibilidad

1. **Fallbacks** para todos los campos dinámicos
2. **Validación defensiva** en componentes
3. **Audit log** para tracking de cambios
4. **Documentación** actualizada

### UX

1. **Preview** en tiempo real en admin
2. **Confirmaciones** antes de eliminar
3. **Mensajes** claros de éxito/error
4. **Estados de carga** visibles

---

## Troubleshooting

### El menú no aparece

1. Verificar `VITE_CONFIG_API_URL` apunta a IP correcta
2. Verificar CORS en config-api/.env
3. Revisar consola del navegador por errores
4. Verificar que Config API está corriendo

### Los logos no cargan

1. Verificar que URLs son correctas
2. Imágenes deben estar en `public/` o ser URLs absolutas
3. Revisar Network tab en DevTools
4. Verificar permisos de archivos

### Cambios no se reflejan

1. Cache puede estar activo (esperar 5 min o reiniciar API)
2. Hard refresh en navegador (Ctrl+Shift+R)
3. Limpiar localStorage si es tema
4. Verificar que guardaste en admin

### Error de autenticación en admin

1. Verificar que AdminAuthProvider está en App.jsx
2. Token JWT debe estar en localStorage
3. Verificar que backend usa mismo JWT_SECRET
4. Revisar expiración del token

---

## Roadmap Futuro

- [ ] Drag & Drop real en NavigationManager (@dnd-kit instalado)
- [ ] Upload de imágenes para logos
- [ ] Múltiples idiomas (i18n)
- [ ] Exportar/Importar configuración
- [ ] Versionado de configuración
- [ ] Roles y permisos granulares
- [ ] Preview de cambios antes de publicar
- [ ] Historial de versiones con rollback

---

## Contacto y Soporte

Para soporte técnico o consultas sobre el sistema:
- **Desarrollador:** Claude AI con Claude Code
- **Repositorio:** laboratorio-eg-system
- **Fecha de implementación:** 2025-11-17

---

*Documentación generada automáticamente. Última actualización: 2025-11-17*
