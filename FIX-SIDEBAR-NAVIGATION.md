# Fix: Sidebar Navigation Vacío en Mobile/iPad

## Problema
El sidebar no mostraba opciones al hacer click en el botón hamburguesa en dispositivos móviles (iPhone/iPad).

## Causa Raíz
La tabla `navigation_items` en la base de datos `lis_bot_comunicacion_elizabeth_gutierrez` no tenía items con `location = 'sidebar'`.

El API de config (puerto 3005) consulta la base de datos del laboratorio activo (`elizabeth-gutierrez`), pero los items de sidebar solo existían en la base de datos de control `lis_bot_comunicacion`.

## Solución Implementada

### 1. Inserción de Items de Sidebar
Se insertaron 5 items de navegación en la tabla `navigation_items`:

```sql
INSERT INTO navigation_items (location, label, url, icon, target, is_external, is_active, requires_auth, show_on_mobile, show_on_desktop, sort_order)
VALUES
  ('sidebar', 'Inicio', '/', 'Home', '_self', false, true, false, true, true, 1),
  ('sidebar', 'Estudios', '/estudios', 'FlaskConical', '_self', false, true, false, true, true, 2),
  ('sidebar', 'Resultados', '/resultados', 'FileBarChart', '_self', false, true, false, true, true, 3),
  ('sidebar', 'Nosotros', '/#nosotros', 'Info', '_self', false, true, false, true, true, 4),
  ('sidebar', 'Contacto', '/#contacto', 'Mail', '_self', false, true, false, true, true, 5);
```

### 2. Reinicio del Servicio Config-API
Se reinició el servicio config-api para limpiar el caché y cargar los nuevos datos.

## Verificación

```bash
# Verificar items en la base de datos
PGPASSWORD=labsis psql -h localhost -U labsis -d lis_bot_comunicacion_elizabeth_gutierrez -c \
  "SELECT id, label, url, icon, location FROM navigation_items WHERE location = 'sidebar' ORDER BY sort_order;"

# Verificar endpoint del API
curl -s "http://192.168.1.125:3005/api/navigation/location/sidebar" | jq '.data[] | "\(.label) - \(.url)"'
```

## Resultado
✅ El sidebar ahora muestra correctamente 5 opciones de navegación cuando se hace click en el botón hamburguesa.
✅ Funciona correctamente en iPhone y iPad (dispositivos < 1024px de ancho).

## Archivos Modificados
- Base de datos: `lis_bot_comunicacion_elizabeth_gutierrez.navigation_items`
- Servicio reiniciado: config-api (puerto 3005)

## Fecha
2025-11-22

## Commits Relacionados
- db6059c - Unificar menú hamburguesa para iPhone y iPad
- 4f9f3a4 - Aumentar z-index del Sidebar para mejor visibilidad en mobile
- 14c12f7 - Actualizar Node.js de v18 a v20 para compatibilidad con Vite
