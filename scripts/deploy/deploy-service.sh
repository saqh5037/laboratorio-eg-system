#!/bin/bash

# Generic Service Deployment Script
# Usage: ./deploy-service.sh <service-name> <environment> <port>

SERVICE_NAME=$1
ENVIRONMENT=$2
PORT=$3

if [ -z "$SERVICE_NAME" ] || [ -z "$ENVIRONMENT" ] || [ -z "$PORT" ]; then
  echo "❌ Usage: $0 <service-name> <environment> <port>"
  echo "Example: $0 results-api production 3003"
  exit 1
fi

DEPLOY_PATH="/home/dynamtek/apps/$ENVIRONMENT"
PM2_NAME="${SERVICE_NAME}-${ENVIRONMENT}"

echo "🚀 Deploying $SERVICE_NAME to $ENVIRONMENT..."
echo "📍 Deploy path: $DEPLOY_PATH/apps/$SERVICE_NAME"
echo "🏷️  PM2 name: $PM2_NAME"

# Navigate to service directory
cd $DEPLOY_PATH/apps/$SERVICE_NAME || {
  echo "❌ Service directory not found!"
  exit 1
}

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production || {
  echo "❌ npm install failed!"
  exit 1
}

# Stop service if running
echo "🛑 Stopping existing service..."
pm2 stop $PM2_NAME 2>/dev/null || echo "Service not running"

# Start or restart service
echo "▶️  Starting service..."
if pm2 describe $PM2_NAME > /dev/null 2>&1; then
  pm2 restart $PM2_NAME --env $ENVIRONMENT
else
  if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js --env $ENVIRONMENT --name $PM2_NAME
  else
    pm2 start src/index.js --name $PM2_NAME --env $ENVIRONMENT
  fi
fi

# Save PM2 configuration
pm2 save

# Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 5

# Health check
echo "🔍 Running health check..."
./../../scripts/deploy/health-check.sh $SERVICE_NAME $PORT

if [ $? -eq 0 ]; then
  echo "✅ $SERVICE_NAME deployed successfully!"

  # Show PM2 status
  echo ""
  echo "📊 PM2 Status:"
  pm2 show $PM2_NAME

  # Show recent logs
  echo ""
  echo "📋 Recent logs:"
  pm2 logs $PM2_NAME --lines 20 --nostream
else
  echo "❌ $SERVICE_NAME deployment failed health check!"
  echo "📋 Showing error logs:"
  pm2 logs $PM2_NAME --lines 50 --nostream --err
  exit 1
fi
