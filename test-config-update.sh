#!/bin/bash

# Test script para verificar actualización de configuración

echo "=== Testing Config Update Endpoint ==="
echo ""

# Obtener token de admin
echo "1. Login as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://192.168.1.125:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."
echo ""

# Obtener valor actual
echo "2. Getting current value of ui.pages.resultados.enabled..."
CURRENT_VALUE=$(curl -s http://192.168.1.125:3005/api/config/ui.pages.resultados.enabled | grep -o '"value":[^,}]*' | cut -d':' -f2)
echo "   Current value: $CURRENT_VALUE"
echo ""

# Actualizar configuración
echo "3. Updating ui.pages.resultados.enabled to false..."
UPDATE_RESPONSE=$(curl -s -X PUT http://192.168.1.125:3005/api/config/ui.pages.resultados.enabled \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":false}')

echo "   Response: $UPDATE_RESPONSE"
echo ""

# Verificar actualización
echo "4. Verifying updated value..."
NEW_VALUE=$(curl -s http://192.168.1.125:3005/api/config/ui.pages.resultados.enabled | grep -o '"value":[^,}]*' | cut -d':' -f2)
echo "   New value: $NEW_VALUE"
echo ""

if [ "$NEW_VALUE" = "false" ]; then
  echo "✅ SUCCESS: Configuration updated correctly!"
else
  echo "❌ FAILED: Value did not update"
fi

# Restaurar valor original
echo ""
echo "5. Restoring original value..."
curl -s -X PUT http://192.168.1.125:3005/api/config/ui.pages.resultados.enabled \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"value\":$CURRENT_VALUE}" > /dev/null

echo "✅ Value restored to $CURRENT_VALUE"
