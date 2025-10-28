#!/bin/bash

# Health Check Script for Services
# Usage: ./health-check.sh <service-name> <port>

SERVICE_NAME=$1
PORT=$2
MAX_RETRIES=${3:-30}
RETRY_INTERVAL=${4:-2}

if [ -z "$SERVICE_NAME" ] || [ -z "$PORT" ]; then
  echo "❌ Usage: $0 <service-name> <port> [max-retries] [retry-interval]"
  exit 1
fi

echo "🔍 Health checking $SERVICE_NAME on port $PORT..."
echo "⏰ Max retries: $MAX_RETRIES, Interval: ${RETRY_INTERVAL}s"

for i in $(seq 1 $MAX_RETRIES); do
  # Try /health endpoint first, then /api/health
  if curl -f -s http://localhost:$PORT/health > /dev/null 2>&1; then
    echo "✅ $SERVICE_NAME is healthy! (attempt $i/$MAX_RETRIES)"
    exit 0
  elif curl -f -s http://localhost:$PORT/api/health > /dev/null 2>&1; then
    echo "✅ $SERVICE_NAME is healthy! (attempt $i/$MAX_RETRIES)"
    exit 0
  fi

  echo "⏳ Attempt $i/$MAX_RETRIES failed, retrying in ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

echo "❌ $SERVICE_NAME health check failed after $MAX_RETRIES attempts"
exit 1
