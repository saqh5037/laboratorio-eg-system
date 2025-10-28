#!/bin/bash

# Complete AWS EC2 Server Setup Script
# This script prepares the server for deployment
# Usage: ./setup-aws-server.sh

echo "🚀 AWS EC2 Server Setup for Laboratorio EG"
echo "================================================="
echo ""

# Check if running on the server
if [ "$(whoami)" != "dynamtek" ]; then
    echo "⚠️  This script should be run on the AWS EC2 server"
    echo "   Run: ssh -i labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com"
    echo "   Then: bash <(curl -s URL_TO_THIS_SCRIPT)"
    exit 1
fi

echo "✅ Running as dynamtek user"
echo ""

# Update system
echo "📦 Step 1: Updating system packages..."
sudo apt update
sudo apt upgrade -y

echo ""
echo "🟢 Step 2: Installing Node.js 18..."

# Install NVM
if [ ! -d "$HOME/.nvm" ]; then
    echo "   Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

    # Load NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
    echo "   NVM already installed"
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install Node.js 18
echo "   Installing Node.js 18..."
nvm install 18
nvm use 18
nvm alias default 18

# Verify Node.js
echo "   Node.js version: $(node --version)"
echo "   npm version: $(npm --version)"

echo ""
echo "⚡ Step 3: Installing PM2..."

# Install PM2 globally
npm install -g pm2

# Setup PM2 startup
echo "   Configuring PM2 startup..."
pm2 startup | tail -1 | sudo bash

# Verify PM2
pm2 --version

echo ""
echo "📁 Step 4: Creating directory structure..."

# Create directories
mkdir -p ~/apps/production
mkdir -p ~/apps/staging
mkdir -p ~/backups
mkdir -p ~/logs

echo "   Created:"
echo "   ✓ ~/apps/production"
echo "   ✓ ~/apps/staging"
echo "   ✓ ~/backups"
echo "   ✓ ~/logs"

ls -la ~/ | grep -E "apps|backups|logs"

echo ""
echo "🔑 Step 5: Setting up SSH keys for GitHub..."

# Check if SSH key exists
if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "   Generating SSH key..."
    ssh-keygen -t ed25519 -C "server@laboratorio-eg" -f ~/.ssh/id_ed25519 -N ""

    echo ""
    echo "   ✅ SSH key generated!"
    echo "   📋 Add this public key to GitHub:"
    echo "      https://github.com/settings/keys"
    echo ""
    echo "   PUBLIC KEY:"
    echo "   =========================================="
    cat ~/.ssh/id_ed25519.pub
    echo "   =========================================="
    echo ""
    echo "   Press ENTER when you've added the key to GitHub..."
    read
else
    echo "   SSH key already exists"
    echo "   Public key:"
    cat ~/.ssh/id_ed25519.pub
fi

# Test GitHub connection
echo "   Testing GitHub connection..."
ssh -T git@github.com 2>&1 | grep -q "successfully authenticated" && echo "   ✅ GitHub connection working!" || echo "   ⚠️  GitHub connection not working yet"

echo ""
echo "🌐 Step 6: Installing and configuring Nginx..."

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "   Installing Nginx..."
    sudo apt install -y nginx
else
    echo "   Nginx already installed"
fi

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Check Nginx status
sudo systemctl status nginx --no-pager | head -5

echo ""
echo "🔧 Step 7: Installing additional dependencies..."

# Install PostgreSQL client (for database operations)
sudo apt install -y postgresql-client

# Install build essentials (for native modules)
sudo apt install -y build-essential

# Install git
sudo apt install -y git

echo ""
echo "🔒 Step 8: Configuring firewall..."

# Check if UFW is active
if sudo ufw status | grep -q "Status: active"; then
    echo "   UFW is active, configuring rules..."
    sudo ufw allow 22/tcp      # SSH
    sudo ufw allow 80/tcp      # HTTP
    sudo ufw allow 443/tcp     # HTTPS
    sudo ufw status
else
    echo "   UFW is not active (firewall managed by AWS Security Groups)"
fi

echo ""
echo "✅ Step 9: Verifying installation..."

echo ""
echo "   System Information:"
echo "   ==================="
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"
echo "   PM2: $(pm2 --version)"
echo "   Nginx: $(nginx -v 2>&1)"
echo "   PostgreSQL client: $(psql --version)"
echo "   Git: $(git --version)"
echo ""

echo "   Directories:"
echo "   ==================="
ls -lh ~/ | grep -E "apps|backups|logs"
echo ""

echo "   PM2 Status:"
echo "   ==================="
pm2 status
echo ""

echo "   Nginx Status:"
echo "   ==================="
sudo systemctl is-active nginx && echo "   ✅ Nginx is running" || echo "   ❌ Nginx is not running"
echo ""

echo "================================================="
echo "🎉 Server setup complete!"
echo "================================================="
echo ""
echo "📋 Next steps:"
echo ""
echo "1. ✅ Node.js 18 installed"
echo "2. ✅ PM2 installed and configured"
echo "3. ✅ Directories created"
echo "4. ✅ Nginx installed"
echo "5. ✅ PostgreSQL client installed"
echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "To test deployment:"
echo "1. Push to 'develop' branch → auto-deploys to staging"
echo "2. Manual deploy to production via GitHub Actions"
echo ""
