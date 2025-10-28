#!/bin/bash

# Backup Script for Deployment
# Usage: ./backup.sh <environment>

ENVIRONMENT=${1:-production}
BACKUP_DIR="/home/dynamtek/backups/$(date +%Y%m%d_%H%M%S)"
DEPLOY_PATH="/home/dynamtek/apps/$ENVIRONMENT"

echo "📦 Creating backup for $ENVIRONMENT environment..."
echo "📍 Backup location: $BACKUP_DIR"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PM2 configuration
echo "💾 Backing up PM2 configuration..."
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/ 2>/dev/null || echo "⚠️ PM2 dump not found"

# Backup .env files
echo "📝 Backing up .env files..."
if [ -d "$DEPLOY_PATH" ]; then
  find $DEPLOY_PATH/apps -name ".env" -exec cp --parents {} $BACKUP_DIR/ \; 2>/dev/null || true

  # Save current git commit
  cd $DEPLOY_PATH
  if [ -d ".git" ]; then
    git rev-parse HEAD > $BACKUP_DIR/commit.txt
    git log -1 --pretty=format:"%H%n%an%n%ae%n%s" > $BACKUP_DIR/commit-info.txt
    echo "📍 Commit saved: $(cat $BACKUP_DIR/commit.txt)"
  fi
else
  echo "⚠️ Deployment path not found: $DEPLOY_PATH"
fi

# Backup database connection info (without passwords)
echo "🗄️ Saving database info..."
cat > $BACKUP_DIR/db-info.txt << EOF
Environment: $ENVIRONMENT
Backup Date: $(date)
Host: $(hostname)
User: $(whoami)
EOF

# Create backup manifest
echo "📋 Creating backup manifest..."
cat > $BACKUP_DIR/manifest.txt << EOF
Backup created: $(date)
Environment: $ENVIRONMENT
Backed up by: $(whoami)
Hostname: $(hostname)

Contents:
EOF
ls -lh $BACKUP_DIR >> $BACKUP_DIR/manifest.txt

echo "✅ Backup created successfully!"
echo "📍 Location: $BACKUP_DIR"
echo ""
echo "📊 Backup contents:"
ls -lh $BACKUP_DIR

# Keep only last 10 backups
echo ""
echo "🧹 Cleaning old backups (keeping last 10)..."
cd /home/dynamtek/backups
ls -t | tail -n +11 | xargs -r rm -rf
echo "✅ Cleanup complete!"
