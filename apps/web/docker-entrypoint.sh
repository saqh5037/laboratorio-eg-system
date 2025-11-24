#!/bin/sh
set -e

echo "============================================"
echo "🚀 Laboratorio EG Frontend - Docker Startup"
echo "============================================"
echo ""

# Validate required environment variables
echo "🔍 Validating environment variables..."
MISSING_VARS=""

if [ -z "$VITE_API_URL" ]; then
  echo "⚠️  VITE_API_URL not set, using default: http://localhost:3002/api"
fi

if [ -z "$VITE_CONFIG_API_URL" ]; then
  echo "⚠️  VITE_CONFIG_API_URL not set, using default: http://localhost:3005"
fi

if [ -z "$VITE_RESULTS_API_URL" ]; then
  echo "⚠️  VITE_RESULTS_API_URL not set, using default: http://localhost:3003"
fi

echo ""
echo "🔧 Injecting runtime environment variables..."

# Create runtime config script file
cat > /usr/share/nginx/html/env-config.js << 'ENVEOF'
window.__ENV__ = {
  VITE_API_URL: "PLACEHOLDER_VITE_API_URL",
  VITE_CONFIG_API_URL: "PLACEHOLDER_VITE_CONFIG_API_URL",
  VITE_RESULTS_API_URL: "PLACEHOLDER_VITE_RESULTS_API_URL",
  VITE_MESSAGING_BOT_API_URL: "PLACEHOLDER_VITE_MESSAGING_BOT_API_URL",
  MODE: "PLACEHOLDER_NODE_ENV"
};
ENVEOF

# Replace placeholders with actual environment variables
sed -i "s|PLACEHOLDER_VITE_API_URL|${VITE_API_URL:-http://localhost:3002/api}|g" /usr/share/nginx/html/env-config.js
sed -i "s|PLACEHOLDER_VITE_CONFIG_API_URL|${VITE_CONFIG_API_URL:-http://localhost:3005}|g" /usr/share/nginx/html/env-config.js
sed -i "s|PLACEHOLDER_VITE_RESULTS_API_URL|${VITE_RESULTS_API_URL:-http://localhost:3003}|g" /usr/share/nginx/html/env-config.js
sed -i "s|PLACEHOLDER_VITE_MESSAGING_BOT_API_URL|${VITE_MESSAGING_BOT_API_URL:-/api/messaging}|g" /usr/share/nginx/html/env-config.js
sed -i "s|PLACEHOLDER_NODE_ENV|${NODE_ENV:-production}|g" /usr/share/nginx/html/env-config.js

# Verify env-config.js was created successfully
if [ ! -f /usr/share/nginx/html/env-config.js ]; then
  echo "❌ ERROR: env-config.js was not created!"
  exit 1
fi

echo "✅ env-config.js created successfully"

# Inject the script tag into index.html (only if not already present)
if ! grep -q "env-config.js" /usr/share/nginx/html/index.html; then
  sed -i 's|<head>|<head>\n  <script src="/env-config.js"></script>|' /usr/share/nginx/html/index.html
  echo "✅ Script tag injected into index.html"
else
  echo "ℹ️  Script tag already present in index.html"
fi

# Display final configuration
echo ""
echo "============================================"
echo "📋 Runtime Configuration Applied:"
echo "============================================"
echo "📍 VITE_API_URL: ${VITE_API_URL:-http://localhost:3002/api}"
echo "📍 VITE_CONFIG_API_URL: ${VITE_CONFIG_API_URL:-http://localhost:3005}"
echo "📍 VITE_RESULTS_API_URL: ${VITE_RESULTS_API_URL:-http://localhost:3003}"
echo "📍 VITE_MESSAGING_BOT_API_URL: ${VITE_MESSAGING_BOT_API_URL:-/api/messaging}"
echo "📍 NODE_ENV: ${NODE_ENV:-production}"
echo "============================================"
echo ""

# Verify env-config.js contents (for debugging)
echo "🔍 Generated env-config.js contents:"
cat /usr/share/nginx/html/env-config.js
echo ""

# Execute the CMD
echo "🌐 Starting Nginx..."
exec "$@"
