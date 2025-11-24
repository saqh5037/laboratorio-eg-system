#!/bin/sh
set -e

echo "🚀 Starting Laboratorio EG Frontend..."

# Replace environment variable placeholders in built files
# Vite uses %VITE_*% syntax for runtime replacement
echo "🔧 Replacing environment variables in static files..."

# Find all JS and HTML files and replace placeholders
find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i \
  -e "s|%VITE_API_URL%|${VITE_API_URL}|g" \
  -e "s|%VITE_CONFIG_API_URL%|${VITE_CONFIG_API_URL}|g" \
  -e "s|%VITE_RESULTS_API_URL%|${VITE_RESULTS_API_URL}|g" \
  -e "s|%VITE_MESSAGING_BOT_API_URL%|${VITE_MESSAGING_BOT_API_URL}|g" \
  {} +

echo "✅ Environment variables replaced successfully"
echo "📍 VITE_API_URL: ${VITE_API_URL}"
echo "📍 VITE_CONFIG_API_URL: ${VITE_CONFIG_API_URL}"
echo "📍 VITE_RESULTS_API_URL: ${VITE_RESULTS_API_URL}"
echo "📍 VITE_MESSAGING_BOT_API_URL: ${VITE_MESSAGING_BOT_API_URL}"

# Execute the CMD
echo "🌐 Starting Nginx..."
exec "$@"
