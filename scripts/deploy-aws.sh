#!/bin/bash

###############################################################################
# AWS EC2 Deployment Script - Laboratorio EG System
#
# Purpose: Deploy latest code from GitHub to AWS EC2 production server
# Usage: ./scripts/deploy-aws.sh [branch-name]
# Default branch: main
#
# Requirements:
#   - SSH access to AWS EC2 server
#   - labsisapp.pem key file in ~/.ssh/ or current directory
#   - AWS_EC2_HOST and AWS_EC2_USER environment variables set
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BRANCH=${1:-main}
SSH_KEY="${SSH_KEY:-$HOME/.ssh/labsisapp.pem}"
AWS_HOST="${AWS_EC2_HOST:-54.197.68.252}"
AWS_USER="${AWS_EC2_USER:-dynamtek}"
PROJECT_DIR="~/laboratorio-eg-system"

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if SSH key exists
    if [ ! -f "$SSH_KEY" ]; then
        log_error "SSH key not found at: $SSH_KEY"
        log_info "Please provide the path to labsisapp.pem:"
        log_info "export SSH_KEY=/path/to/labsisapp.pem"
        exit 1
    fi

    # Check SSH key permissions
    KEY_PERMS=$(stat -f "%A" "$SSH_KEY" 2>/dev/null || stat -c "%a" "$SSH_KEY" 2>/dev/null)
    if [ "$KEY_PERMS" != "600" ] && [ "$KEY_PERMS" != "400" ]; then
        log_warning "SSH key has incorrect permissions: $KEY_PERMS"
        log_info "Fixing permissions..."
        chmod 600 "$SSH_KEY"
    fi

    # Check if git is installed
    if ! command -v git &> /dev/null; then
        log_error "git is not installed"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

test_ssh_connection() {
    log_info "Testing SSH connection to $AWS_USER@$AWS_HOST..."

    if ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o BatchMode=yes "${AWS_USER}@${AWS_HOST}" "echo 'Connection successful'" &> /dev/null; then
        log_success "SSH connection successful"
    else
        log_error "SSH connection failed"
        log_info "Please verify:"
        log_info "  - SSH key is correct"
        log_info "  - Server is accessible"
        log_info "  - Username is correct"
        exit 1
    fi
}

create_backup() {
    log_info "Creating pre-deployment backup..."

    ssh -i "$SSH_KEY" "${AWS_USER}@${AWS_HOST}" << 'ENDSSH'
        set -e
        BACKUP_DIR="$HOME/backups"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)

        mkdir -p "$BACKUP_DIR"

        if [ -d "$HOME/laboratorio-eg-system" ]; then
            cd "$HOME/laboratorio-eg-system"
            CURRENT_COMMIT=$(git rev-parse HEAD)
            echo "Current commit: $CURRENT_COMMIT"
            echo "$CURRENT_COMMIT" > "$BACKUP_DIR/pre_deploy_commit_$TIMESTAMP.txt"
        elif [ -d "$HOME/proyectos/laboratorio-eg-system" ]; then
            cd "$HOME/proyectos/laboratorio-eg-system"
            CURRENT_COMMIT=$(git rev-parse HEAD)
            echo "Current commit: $CURRENT_COMMIT"
            echo "$CURRENT_COMMIT" > "$BACKUP_DIR/pre_deploy_commit_$TIMESTAMP.txt"
        fi

        echo "Backup created: pre_deploy_commit_$TIMESTAMP.txt"
ENDSSH

    log_success "Backup created"
}

deploy() {
    log_info "Starting deployment to AWS Production..."
    log_info "Branch: $BRANCH"
    log_info "Server: $AWS_HOST"

    ssh -i "$SSH_KEY" "${AWS_USER}@${AWS_HOST}" << ENDSSH
        set -e

        echo "📂 Navigating to project directory..."
        if [ -d "\$HOME/laboratorio-eg-system" ]; then
            cd "\$HOME/laboratorio-eg-system"
        elif [ -d "\$HOME/proyectos/laboratorio-eg-system" ]; then
            cd "\$HOME/proyectos/laboratorio-eg-system"
        else
            echo "❌ Project directory not found!"
            echo "Expected: \$HOME/laboratorio-eg-system or \$HOME/proyectos/laboratorio-eg-system"
            exit 1
        fi

        echo "Current directory: \$(pwd)"

        echo "🔄 Fetching latest changes from GitHub..."
        git fetch --all --tags

        echo "🔀 Checking out $BRANCH branch..."
        git checkout $BRANCH

        echo "⬇️  Pulling latest code..."
        git pull origin $BRANCH

        echo "📝 Current commit:"
        git log -1 --oneline

        echo ""
        echo "📦 Installing root dependencies..."
        npm install

        echo ""
        echo "🏗️  Building Frontend (apps/web)..."
        cd apps/web
        npm install
        npm run build
        echo "✅ Frontend built successfully"
        cd ../..

        echo ""
        echo "🔧 Installing Results API dependencies..."
        cd apps/results-api
        npm install
        cd ../..

        echo ""
        echo "🔧 Installing Sync Service dependencies..."
        cd apps/sync-service
        npm install
        cd ../..

        echo ""
        echo "🔧 Installing Messaging Bot dependencies..."
        cd apps/messaging-bot
        npm install
        cd ../..

        echo ""
        echo "♻️  Restarting PM2 services..."
        if pm2 list | grep -q "online"; then
            echo "Restarting existing PM2 processes..."
            pm2 restart all
        else
            echo "Starting PM2 processes from ecosystem config..."
            if [ -f "ecosystem.config.js" ]; then
                pm2 start ecosystem.config.js
            else
                echo "⚠️  No ecosystem.config.js found, please start services manually"
            fi
        fi

        echo ""
        echo "💾 Saving PM2 configuration..."
        pm2 save

        echo ""
        echo "⏳ Waiting for services to stabilize..."
        sleep 10

        echo ""
        echo "📊 PM2 Status:"
        pm2 status

        echo ""
        echo "📝 PM2 Logs (last 20 lines):"
        pm2 logs --lines 20 --nostream || true

        echo ""
        echo "✅ Deployment completed successfully!"
ENDSSH

    if [ $? -eq 0 ]; then
        log_success "Deployment successful!"
    else
        log_error "Deployment failed!"
        log_info "Check the logs above for details"
        exit 1
    fi
}

health_check() {
    log_info "Running health checks..."

    # Wait for services to fully start
    sleep 5

    # Check HTTP endpoint
    if curl -f -s --max-time 10 "http://${AWS_HOST}:8080/labsis" > /dev/null 2>&1; then
        log_success "Health check passed: Server is responding"
        log_info "URL: http://${AWS_HOST}:8080/labsis"
    else
        log_warning "Health check warning: Server not responding on port 8080"
        log_info "Please verify manually: http://${AWS_HOST}:8080/labsis"
        log_info "Or SSH to server and check PM2 logs:"
        log_info "ssh -i $SSH_KEY ${AWS_USER}@${AWS_HOST}"
        log_info "pm2 logs"
    fi
}

deployment_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    log_info "📋 Deployment Summary"
    echo "═══════════════════════════════════════════════════════════"
    echo "Branch:     $BRANCH"
    echo "Server:     $AWS_HOST"
    echo "User:       $AWS_USER"
    echo "Timestamp:  $(date +'%Y-%m-%d %H:%M:%S')"
    echo ""
    log_info "🔗 Verify deployment:"
    echo "   - Frontend: http://${AWS_HOST}:8080/labsis"
    echo "   - SSH: ssh -i $SSH_KEY ${AWS_USER}@${AWS_HOST}"
    echo "   - PM2 logs: pm2 logs"
    echo "═══════════════════════════════════════════════════════════"
}

show_rollback_instructions() {
    log_warning "If there are issues, you can rollback:"
    echo ""
    echo "1. SSH to server:"
    echo "   ssh -i $SSH_KEY ${AWS_USER}@${AWS_HOST}"
    echo ""
    echo "2. Navigate to project directory:"
    echo "   cd ~/laboratorio-eg-system"
    echo ""
    echo "3. Find backup commit:"
    echo "   cat ~/backups/pre_deploy_commit_*.txt | tail -1"
    echo ""
    echo "4. Rollback to previous commit:"
    echo "   git checkout <commit-hash>"
    echo "   npm install"
    echo "   cd apps/web && npm install && npm run build && cd ../.."
    echo "   pm2 restart all"
}

###############################################################################
# Main Execution
###############################################################################

main() {
    echo ""
    log_info "🚀 Laboratorio EG System - AWS Deployment Script"
    echo ""

    # Run checks
    check_prerequisites
    test_ssh_connection

    # Confirm deployment
    echo ""
    log_warning "⚠️  You are about to deploy to AWS PRODUCTION"
    log_info "Branch: $BRANCH"
    log_info "Server: $AWS_HOST"
    echo ""
    read -p "Type 'yes' to continue: " confirm

    if [ "$confirm" != "yes" ]; then
        log_error "Deployment cancelled by user"
        exit 0
    fi

    # Execute deployment
    create_backup
    deploy
    health_check
    deployment_summary
    show_rollback_instructions

    log_success "🎉 Deployment process completed!"
}

# Run main function
main "$@"
