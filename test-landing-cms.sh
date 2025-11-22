#!/bin/bash

# Test script for Landing CMS
# Este script prueba todos los endpoints de la API landing

BASE_URL="http://localhost:3005"
TOKEN="" # Agregar token de admin si es necesario

echo "====================================="
echo "Testing Landing CMS API Endpoints"
echo "====================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar respuesta
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=${4:-200}

    echo -n "Testing: $description... "

    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
        -H "Content-Type: application/json")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$ d')

    if [ "$http_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $http_code)"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
        return 1
    fi
}

# Contador de tests
TOTAL=0
PASSED=0
FAILED=0

run_test() {
    ((TOTAL++))
    if test_endpoint "$@"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
}

echo "📋 PUBLIC ENDPOINTS (No auth required)"
echo "----------------------------------------"

# Endpoint principal
run_test GET "/api/landing" "Get all landing content"

# Values
run_test GET "/api/landing/values" "Get active values"

# Certifications
run_test GET "/api/landing/certifications" "Get active certifications"

# Testimonials
run_test GET "/api/landing/testimonials" "Get active testimonials"

# Contact Info
run_test GET "/api/landing/contact" "Get active contact info"

# Content Blocks
run_test GET "/api/landing/content" "Get active content blocks"

# Statistics
run_test GET "/api/landing/statistics" "Get active statistics"

echo ""
echo "🔍 FILTERED ENDPOINTS"
echo "----------------------------------------"

# Contact by type
run_test GET "/api/landing/contact?type=phone" "Get contact info by type (phone)"
run_test GET "/api/landing/contact?type=email" "Get contact info by type (email)"

# Content by section
run_test GET "/api/landing/content?section=nosotros-header" "Get content by section"

echo ""
echo "📊 DATA VERIFICATION"
echo "----------------------------------------"

# Verificar cantidad de datos
echo -n "Checking data counts... "
response=$(curl -s "$BASE_URL/api/landing")
values_count=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['data']['values']))")
certs_count=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['data']['certifications']))")
testim_count=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['data']['testimonials']))")
contact_count=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['data']['contactInfo']))")
content_count=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['data']['contentBlocks']))")
stats_count=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['data']['statistics']))")

echo -e "${GREEN}✓${NC}"
echo "  - Values: $values_count"
echo "  - Certifications: $certs_count"
echo "  - Testimonials: $testim_count"
echo "  - Contact Info: $contact_count"
echo "  - Content Blocks: $content_count"
echo "  - Statistics: $stats_count"

echo ""
echo "====================================="
echo "Test Results Summary"
echo "====================================="
echo -e "Total tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
