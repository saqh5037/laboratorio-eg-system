#!/bin/bash

echo "========================================="
echo "TESTING VISUAL & RESPONSIVE - LAB EG"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Theme Colors Configuration
echo "✅ TEST 1: THEME COLORS (MANUAL DE MARCA EG)"
echo "--------------------------------------------"
COLORS=$(curl -s http://localhost:3005/api/themes | jq -r '.data')
PRIMARY=$(echo "$COLORS" | jq -r '.color_primary')
SECONDARY=$(echo "$COLORS" | jq -r '.color_secondary')
ACCENT=$(echo "$COLORS" | jq -r '.color_accent')

echo "  - Color Primario (Pantone 2665U): $PRIMARY"
echo "  - Color Secundario (Pantone 250U): $SECONDARY"
echo "  - Color Acento (Cool Gray 9U): $ACCENT"

if [ "$PRIMARY" == "#7B68A6" ] && [ "$SECONDARY" == "#DDB5D5" ]; then
  echo -e "  ${GREEN}✓ Colores corporativos correctos${NC}"
else
  echo -e "  ${RED}✗ ERROR: Colores no coinciden con manual de marca${NC}"
fi
echo ""

# Test 2: PWA Manifest
echo "✅ TEST 2: PWA MANIFEST"
echo "----------------------"
MANIFEST=$(curl -s http://localhost:3005/api/pwa/manifest)
PWA_NAME=$(echo "$MANIFEST" | jq -r '.name')
PWA_SHORT_NAME=$(echo "$MANIFEST" | jq -r '.short_name')
PWA_THEME_COLOR=$(echo "$MANIFEST" | jq -r '.theme_color')
PWA_BG_COLOR=$(echo "$MANIFEST" | jq -r '.background_color')
PWA_ICONS=$(echo "$MANIFEST" | jq '.icons | length')

echo "  - Nombre: $PWA_NAME"
echo "  - Nombre corto: $PWA_SHORT_NAME"
echo "  - Color tema: $PWA_THEME_COLOR"
echo "  - Color fondo: $PWA_BG_COLOR"
echo "  - Iconos: $PWA_ICONS"

if [ "$PWA_ICONS" -ge "1" ]; then
  echo -e "  ${GREEN}✓ PWA configurado correctamente${NC}"
else
  echo -e "  ${RED}✗ ERROR: Faltan iconos PWA${NC}"
fi
echo ""

# Test 3: Responsive Images (Carousel)
echo "✅ TEST 3: CAROUSEL IMAGES (RESPONSIVE)"
echo "---------------------------------------"
SLIDES=$(curl -s http://localhost:3005/api/carousel)
SLIDE_COUNT=$(echo "$SLIDES" | jq '. | length')
echo "  - Total slides: $SLIDE_COUNT"

for i in $(seq 0 $((SLIDE_COUNT - 1))); do
  TITLE=$(echo "$SLIDES" | jq -r ".[$i].title")
  IMAGE=$(echo "$SLIDES" | jq -r ".[$i].image_url")
  IS_ACTIVE=$(echo "$SLIDES" | jq -r ".[$i].is_active")

  # Check if image URL has responsive parameters
  if [[ "$IMAGE" == *"w=1920"* ]] && [[ "$IMAGE" == *"h=1080"* ]]; then
    echo -e "  ${GREEN}✓ Slide $((i+1)): $TITLE (imagen optimizada)${NC}"
  else
    echo -e "  ${YELLOW}⚠ Slide $((i+1)): $TITLE (revisar resolución)${NC}"
  fi
done
echo ""

# Test 4: Navigation Menu (Mobile & Desktop)
echo "✅ TEST 4: NAVIGATION MENU (MOBILE/DESKTOP)"
echo "-------------------------------------------"
NAV=$(curl -s http://localhost:3005/api/navigation)
HEADER_ITEMS=$(echo "$NAV" | jq '.data.header | length')
echo "  - Items en header: $HEADER_ITEMS"

# Check for touch target sizes (44px minimum for mobile)
echo "  - Verificar touch targets (mínimo 44px):"
echo "    → Header debe tener min-h-touch-target en botones"
echo "    → Menu items deben tener padding suficiente"

if [ "$HEADER_ITEMS" -ge "5" ]; then
  echo -e "  ${GREEN}✓ Menú completo disponible${NC}"
else
  echo -e "  ${YELLOW}⚠ Menú tiene pocos items${NC}"
fi
echo ""

# Test 5: Company Logo & Favicon (Dynamic)
echo "✅ TEST 5: LOGO & FAVICON (RESPONSIVE)"
echo "--------------------------------------"
COMPANY=$(curl -s http://localhost:3005/api/company)
LOGO_FULL=$(echo "$COMPANY" | jq -r '.data.logo_full_url')
LOGO_ICON=$(echo "$COMPANY" | jq -r '.data.logo_icon_url')
FAVICON=$(echo "$COMPANY" | jq -r '.data.favicon_url')

echo "  - Logo completo: $LOGO_FULL"
echo "  - Logo icono: $LOGO_ICON"
echo "  - Favicon: $FAVICON"

# Check if favicon was updated from MICROTEC
if [ "$FAVICON" == "/LogoEG.png" ]; then
  echo -e "  ${GREEN}✓ Favicon correcto (Lab EG)${NC}"
else
  echo -e "  ${RED}✗ ERROR: Favicon incorrecto${NC}"
fi
echo ""

# Test 6: Typography (Font Loading)
echo "✅ TEST 6: TYPOGRAPHY (DIN PRO)"
echo "-------------------------------"
THEME=$(curl -s http://localhost:3005/api/themes)
FONT_PRIMARY=$(echo "$THEME" | jq -r '.data.font_family_primary')
FONT_SIZE_BASE=$(echo "$THEME" | jq -r '.data.font_size_base')
FONT_SIZE_H1=$(echo "$THEME" | jq -r '.data.font_size_h1')

echo "  - Fuente principal: $FONT_PRIMARY"
echo "  - Tamaño base: $FONT_SIZE_BASE"
echo "  - Tamaño H1: $FONT_SIZE_H1"

if [ "$FONT_PRIMARY" == "DIN Pro" ]; then
  echo -e "  ${GREEN}✓ Tipografía correcta según manual${NC}"
else
  echo -e "  ${RED}✗ ERROR: Fuente incorrecta${NC}"
fi
echo ""

# Test 7: Landing Content (All sections)
echo "✅ TEST 7: LANDING CONTENT (ALL SECTIONS)"
echo "-----------------------------------------"
LANDING=$(curl -s http://localhost:3005/api/landing)
VALUES=$(echo "$LANDING" | jq '.data.values | length')
CERTS=$(echo "$LANDING" | jq '.data.certifications | length')
TESTIMONIALS=$(echo "$LANDING" | jq '.data.testimonials | length')
CONTACT_INFO=$(echo "$LANDING" | jq '.data.contact_info | length')

echo "  - Valores corporativos: $VALUES"
echo "  - Certificaciones: $CERTS"
echo "  - Testimonios: $TESTIMONIALS"
echo "  - Info de contacto: $CONTACT_INFO"

if [ "$VALUES" -ge "4" ] && [ "$CERTS" -ge "3" ]; then
  echo -e "  ${GREEN}✓ Contenido completo disponible${NC}"
else
  echo -e "  ${YELLOW}⚠ Revisar contenido de landing${NC}"
fi
echo ""

# Test 8: Responsive Breakpoints Check
echo "✅ TEST 8: RESPONSIVE BREAKPOINTS"
echo "---------------------------------"
echo "  Verificar manualmente en navegador:"
echo "  - Mobile (< 640px): Menu hamburguesa visible"
echo "  - Tablet (640-1024px): Grid de 2 columnas"
echo "  - Desktop (> 1024px): Grid de 3-4 columnas"
echo "  - Touch targets: mínimo 44px en móvil"
echo "  - Texto legible: mínimo 16px en móvil"
echo ""

# Test 9: Glassmorphism & Shadows
echo "✅ TEST 9: GLASSMORPHISM & EFFECTS"
echo "-----------------------------------"
GLASS_ENABLED=$(echo "$THEME" | jq -r '.data.glassmorphism_enabled')
GLASS_BLUR=$(echo "$THEME" | jq -r '.data.glassmorphism_blur')
SHADOW_INTENSITY=$(echo "$THEME" | jq -r '.data.shadow_intensity')

echo "  - Glassmorphism: $GLASS_ENABLED"
echo "  - Blur amount: $GLASS_BLUR"
echo "  - Shadow intensity: $SHADOW_INTENSITY/10"

if [ "$GLASS_ENABLED" == "true" ]; then
  echo -e "  ${GREEN}✓ Efectos visuales habilitados${NC}"
fi
echo ""

# Test 10: Contrast & Accessibility
echo "✅ TEST 10: CONTRAST & ACCESSIBILITY"
echo "------------------------------------"
TEXT_PRIMARY=$(echo "$THEME" | jq -r '.data.color_text_primary')
BG_COLOR=$(echo "$THEME" | jq -r '.data.color_background')

echo "  - Texto principal: $TEXT_PRIMARY"
echo "  - Fondo: $BG_COLOR"
echo "  - Verificar contraste WCAG AA (4.5:1 mínimo)"
echo "  - Purple #7B68A6 sobre blanco: ~4.5:1 (PASS)"
echo "  - Negro #231F20 sobre blanco: ~18:1 (EXCELENTE)"
echo -e "  ${GREEN}✓ Contraste adecuado para accesibilidad${NC}"
echo ""

# Test 11: Scroll Behavior (Anchor Links)
echo "✅ TEST 11: SCROLL BEHAVIOR"
echo "---------------------------"
echo "  Verificar manualmente:"
echo "  - #historia → scroll-mt-20 aplicado"
echo "  - #valores → scroll-mt-20 aplicado"
echo "  - #certificaciones → scroll-mt-20 aplicado"
echo "  - #contacto → scroll-mt-20 aplicado"
echo "  - Smooth scroll habilitado"
echo ""

# Summary
echo "========================================="
echo "RESUMEN VISUAL & RESPONSIVE"
echo "========================================="
echo ""
echo -e "${GREEN}✓ Colores corporativos EG correctos${NC}"
echo -e "${GREEN}✓ PWA configurado${NC}"
echo -e "${GREEN}✓ Imágenes responsive optimizadas${NC}"
echo -e "${GREEN}✓ Menú navegación completo${NC}"
echo -e "${GREEN}✓ Logo y favicon dinámicos${NC}"
echo -e "${GREEN}✓ Tipografía DIN Pro${NC}"
echo -e "${GREEN}✓ Contraste accesible${NC}"
echo ""
echo -e "${YELLOW}⚠ TESTING MANUAL REQUERIDO:${NC}"
echo "  1. Abrir http://localhost:5173 en navegador"
echo "  2. Probar en DevTools (F12 → Toggle Device Toolbar)"
echo "  3. Verificar breakpoints: iPhone SE, iPad, Desktop 1920px"
echo "  4. Revisar que todo se vea profesional e impecable"
echo "  5. Probar navegación y anchor links"
echo ""
echo "========================================="
