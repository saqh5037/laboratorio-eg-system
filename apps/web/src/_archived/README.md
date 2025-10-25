# Archivos Archivados - Laboratorio EG

**Fecha de archivado:** 18 de octubre, 2025

## ¿Por qué estos archivos están aquí?

Estos archivos fueron movidos a esta carpeta durante una limpieza del proyecto para:
1. Mantener solo las funcionalidades activas: Landing Page, Estudios, y Resultados
2. Reducir el tamaño del código base (~50% de reducción)
3. Mejorar la mantenibilidad del proyecto
4. Facilitar el desarrollo futuro

## Archivos archivados

### Páginas no utilizadas (6)
- `Home.jsx` - Duplicado de LandingPageUnified
- `Home.jsx.backup` - Backup antiguo
- `TreeViewDemo.jsx` - Demo de desarrollo
- `FavoritesPage.jsx` - Funcionalidad de favoritos no implementada
- `SearchPage.jsx` - Página de búsqueda separada no usada
- `BudgetPage.jsx` - Calculadora de presupuesto no implementada

### Componentes landing duplicados (6)
- `CTASection.jsx` - Versión antigua (ahora usando CTASectionEG)
- `FooterModern.jsx` - Versión antigua (ahora usando FooterEG)
- `HeroCarousel.jsx` - Versión antigua (ahora usando HeroCarouselEG)
- `StudiesSection.jsx` - Versión antigua (ahora usando StudiesSectionEG)
- `CategoryMenu.jsx` - No utilizado
- `NavigationMenu.jsx` - No utilizado

### Componentes no utilizados (18+)
- Funcionalidades avanzadas no implementadas: accesibilidad, gestos táctiles, tooltips
- Componentes duplicados: Skeletons, LoadingSpinner variations
- Experimentos: AnimatedElements, ParallaxSection
- Features sin usar: FavoritesList, VirtualizedStudyList

### Hooks no utilizados (5)
- `useTouchGestures.js` - Gestos táctiles no implementados
- `useKeyboardNavigation.js` - Navegación por teclado avanzada
- `useLabDatabase.js` - Versión antigua (ahora usando useLabDataDB)
- `useTreeData.js` - Tree data no usado
- `useLabData.js` - Versión antigua

### Carpeta completa archivada
- `directorio/` - Sistema de directorio completo no utilizado (calculator, modals, navigation)

## ¿Cómo recuperar un archivo?

Si necesitas algún archivo archivado, simplemente muévelo de vuelta:

```bash
# Ejemplo: Recuperar FavoritesPage
mv src/_archived/pages/FavoritesPage.jsx src/pages/

# No olvides agregarlo al git si es necesario
git add src/pages/FavoritesPage.jsx
```

## Respaldos disponibles

Por seguridad, se crearon múltiples puntos de restauración:

1. **Commit de backup:** `2e9d481` - "✨ Mejoras de logo y favicon - Estado antes de limpieza del proyecto"
2. **Rama de backup:** `backup-pre-limpieza-20251018`
3. **Tag de backup:** `backup-before-cleanup-20251018`

### Rollback completo

Si necesitas volver al estado anterior completamente:

```bash
# Opción 1: Rollback al tag
git reset --hard backup-before-cleanup-20251018

# Opción 2: Rollback a la rama
git checkout backup-pre-limpieza-20251018
```

## Eliminación definitiva

**NO ELIMINAR** esta carpeta hasta confirmar que no se necesita ningún archivo (mínimo 1-2 semanas de pruebas).

Después del período de prueba, si confirmas que todo funciona correctamente:

```bash
rm -rf src/_archived/
git add .
git commit -m "🗑️ Eliminación final de archivos archivados"
```

---

**Mantenido por:** Claude Code
**Última actualización:** Octubre 18, 2025
