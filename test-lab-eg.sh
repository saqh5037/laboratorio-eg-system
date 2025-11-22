#!/bin/bash

echo "================================="
echo "TESTING LABORATORIO EG - COMPLETO"
echo "================================="
echo ""

# Test 1: Landing Page Data
echo "✅ TEST 1: LANDING PAGE DATA"
echo "----------------------------"
VALUES=$(curl -s http://localhost:3005/api/landing | jq '.data.values | length')
CERTS=$(curl -s http://localhost:3005/api/landing | jq '.data.certifications | length')
TESTIMONIALS=$(curl -s http://localhost:3005/api/landing | jq '.data.testimonials | length')
echo "  - Valores corporativos: $VALUES"
echo "  - Certificaciones: $CERTS"
echo "  - Testimonios: $TESTIMONIALS"
echo ""

# Test 2: Navigation Menu
echo "✅ TEST 2: NAVIGATION MENU"
echo "-------------------------"
NAV_ITEMS=$(curl -s http://localhost:3005/api/navigation | jq '.data.header | length')
CONTACTO_URL=$(curl -s http://localhost:3005/api/navigation | jq -r '.data.header[] | select(.label == "Contacto") | .url')
echo "  - Total items: $NAV_ITEMS"
echo "  - Contacto URL: $CONTACTO_URL"
echo ""

# Test 3: Carousel
echo "✅ TEST 3: CAROUSEL SLIDES"
echo "-------------------------"
SLIDES=$(curl -s http://localhost:3005/api/carousel | jq '. | length')
ACTIVE_SLIDES=$(curl -s http://localhost:3005/api/carousel | jq '[.[] | select(.is_active == true)] | length')
echo "  - Total slides: $SLIDES"
echo "  - Slides activos: $ACTIVE_SLIDES"
curl -s http://localhost:3005/api/carousel | jq -r '.[] | "  - \(.id). \(.title) (\(if .is_active then "ACTIVO" else "INACTIVO" end))"'
echo ""

# Test 4: Company Info & Favicon
echo "✅ TEST 4: COMPANY INFO & FAVICON"
echo "---------------------------------"
COMPANY_NAME=$(curl -s http://localhost:3005/api/company | jq -r '.data.name')
FAVICON=$(curl -s http://localhost:3005/api/company | jq -r '.data.favicon_url')
LOGO=$(curl -s http://localhost:3005/api/company | jq -r '.data.logo_icon_url')
echo "  - Nombre: $COMPANY_NAME"
echo "  - Favicon: $FAVICON"
echo "  - Logo: $LOGO"
echo ""

# Test 5: Admin Login
echo "✅ TEST 5: ADMIN LOGIN"
echo "---------------------"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
  echo "  ✓ Login exitoso"
  ROLE=$(echo "$LOGIN_RESPONSE" | jq -r '.user.role')
  echo "  - Role: $ROLE"
else
  echo "  ✗ Login falló"
  echo "$LOGIN_RESPONSE" | jq '.'
fi
echo ""

# Test 6: Database Connection
echo "✅ TEST 6: DATABASE CONNECTION"
echo "-----------------------------"
DB_NAME="lis_bot_comunicacion_elizabeth_gutierrez"
ADMIN_COUNT=$(PGPASSWORD='labsis' psql -h localhost -U labsis -d $DB_NAME -t -c "SELECT COUNT(*) FROM admin_users;")
NAV_COUNT=$(PGPASSWORD='labsis' psql -h localhost -U labsis -d $DB_NAME -t -c "SELECT COUNT(*) FROM navigation_items;")
CAROUSEL_COUNT=$(PGPASSWORD='labsis' psql -h localhost -U labsis -d $DB_NAME -t -c "SELECT COUNT(*) FROM carousel_slides;")
echo "  - Admin users: $ADMIN_COUNT"
echo "  - Navigation items: $NAV_COUNT"
echo "  - Carousel slides: $CAROUSEL_COUNT"
echo ""

echo "================================="
echo "TESTING COMPLETADO"
echo "================================="
