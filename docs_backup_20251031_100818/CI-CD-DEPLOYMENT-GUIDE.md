# 🚀 CI/CD Deployment Guide - Laboratorio EG System

Complete guide for deploying the Laboratorio EG system using GitHub Actions.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Workflow Overview](#workflow-overview)
3. [Deployment Process](#deployment-process)
4. [Troubleshooting](#troubleshooting)
5. [Best Practices](#best-practices)

---

## 🎯 Quick Start

### First Time Setup

1. **Configure GitHub Secrets** (⏰ 15 minutes)
   - Follow [GITHUB-SECRETS-SETUP.md](./GITHUB-SECRETS-SETUP.md)
   - Add all required secrets to GitHub repository

2. **Prepare AWS EC2 Server** (⏰ 30 minutes)
   ```bash
   # SSH into server
   ssh -i labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com

   # Install Node.js 18+
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   nvm use 18

   # Install PM2
   npm install -g pm2

   # Setup PM2 startup
   pm2 startup
   # Copy and run the command it outputs

   # Create directories
   mkdir -p ~/apps/production ~/apps/staging ~/backups ~/logs
   ```

3. **Install Nginx** (⏰ 15 minutes)
   ```bash
   sudo apt update
   sudo apt install nginx -y

   # Copy nginx config (you'll create this later)
   sudo systemctl enable nginx
   sudo systemctl start nginx
   ```

4. **Setup Database Triggers** (⏰ 10 minutes)
   - Use workflow: **05 - Database Migration**
   - Select: `install-triggers`
   - Environment: `production`

5. **Test Deployment to Staging**
   - Push to `develop` branch
   - Watch GitHub Actions run automatically

---

## 📊 Workflow Overview

### 1. **CI Tests (`01-ci-tests.yml`)**
**Trigger:** Automatic on push/PR to `main` or `develop`

**What it does:**
- Lints all services
- Runs tests
- Validates builds
- Security audit

**Duration:** ~3-5 minutes

**Usage:** Automatic - no manual action needed

---

### 2. **Deploy to Staging (`02-deploy-staging.yml`)**
**Trigger:** Automatic on push to `develop` branch

**What it does:**
1. Deploys backend services (sync, results-api, messaging-bot)
2. Builds and deploys frontend
3. Restarts PM2 processes
4. Runs health checks

**Duration:** ~10-15 minutes

**Usage:**
```bash
# Simply push to develop
git checkout develop
git pull origin develop
# Make your changes...
git add .
git commit -m "feat: new feature"
git push origin develop

# Watch deployment at:
# https://github.com/saqh5037/laboratorio-eg-system/actions
```

---

### 3. **Deploy to Production (`03-deploy-production.yml`)**
**Trigger:** Manual with confirmation

**What it does:**
1. Validates deployment request
2. Pre-deployment checks
3. Creates backup of current version
4. Deploys services in order:
   - Sync Service (FIRST)
   - Results API (SECOND)
   - Messaging Bot (THIRD)
   - Frontend (LAST)
5. Post-deployment verification
6. Monitors for 30 seconds

**Duration:** ~15-20 minutes

**Usage:**
1. Go to: https://github.com/saqh5037/laboratorio-eg-system/actions
2. Select: **03 - Deploy to Production**
3. Click: **Run workflow**
4. Fill in:
   - Confirmation: `DEPLOY`
   - Environment: `production`
5. Click: **Run workflow**
6. Monitor progress in real-time

**⚠️ Important:** Only deploy to production from `main` branch!

---

### 4. **Emergency Rollback (`04-rollback.yml`)**
**Trigger:** Manual emergency use only

**What it does:**
1. Lists available backups
2. Reverts code to previous commit
3. Restores PM2 configuration
4. Verifies services are healthy

**Duration:** ~5 minutes

**Usage:**
1. Go to: https://github.com/saqh5037/laboratorio-eg-system/actions
2. Select: **04 - Emergency Rollback**
3. Click: **Run workflow**
4. Fill in:
   - Backup timestamp: `latest` or specific timestamp like `20251028_143022`
   - Confirmation: `ROLLBACK`
   - Environment: `production` or `staging`
5. Click: **Run workflow**

**When to use:**
- Production deployment failed
- Critical bug discovered
- Service is down

---

### 5. **Database Migration (`05-database-migration.yml`)**
**Trigger:** Manual when needed

**Operations:**
- `install-triggers` - Install PostgreSQL triggers
- `verify-database` - Check database connection
- `manual-sync` - Force price synchronization

**Duration:** ~2-5 minutes

**Usage:**
1. Go to: https://github.com/saqh5037/laboratorio-eg-system/actions
2. Select: **05 - Database Migration**
3. Click: **Run workflow**
4. Fill in:
   - Environment: `staging` or `production`
   - Operation: Choose operation
   - Confirmation: `MIGRATE`
5. Click: **Run workflow**

---

## 🔄 Deployment Process Detailed

### Deploying to Production - Step by Step

#### Step 1: Prepare Release
```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Merge develop into main
git merge develop

# Run tests locally
npm test

# Push to main
git push origin main
```

#### Step 2: Trigger Deployment
1. Navigate to GitHub Actions
2. Select "03 - Deploy to Production"
3. **Important:** Double-check you're on `main` branch
4. Type `DEPLOY` to confirm
5. Click "Run workflow"

#### Step 3: Monitor Deployment
Watch each phase:
- ✅ Validate Input
- ✅ Pre-deploy Checks
- ✅ Backup Current
- ✅ Deploy Sync Service
- ✅ Deploy Results API
- ✅ Deploy Messaging Bot
- ✅ Deploy Frontend
- ✅ Post-deploy Verification

#### Step 4: Verify Deployment
After deployment completes:

```bash
# SSH into server
ssh -i labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com

# Check PM2 status
pm2 status

# Check logs
pm2 logs --lines 50

# Test health endpoints
curl http://localhost:3002/api/stats
curl http://localhost:3003/api/health
curl http://localhost:3004/api/health

# Test frontend
curl http://54.197.68.252
```

#### Step 5: Monitor for Issues
Monitor for 30 minutes:
- Check error logs
- Monitor PM2 dashboard
- Test key features manually
- Watch for error reports

---

## 🚨 Troubleshooting

### Deployment Failed at "Deploy Sync Service"

**Symptoms:**
- Workflow shows red X
- Error: "Health check failed"

**Solutions:**
1. Check PM2 logs:
   ```bash
   ssh dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com
   pm2 logs sync-service-prod --lines 100
   ```

2. Check database connection:
   ```bash
   cd /home/dynamtek/apps/production/apps/sync-service
   npm run verify-db
   ```

3. Manual restart:
   ```bash
   pm2 restart sync-service-prod
   pm2 logs sync-service-prod
   ```

---

### Health Check Timeout

**Symptoms:**
- "Health check failed after 30 attempts"

**Solutions:**
1. Check if service is running:
   ```bash
   pm2 status
   ps aux | grep node
   ```

2. Check if port is open:
   ```bash
   lsof -i :3003
   netstat -tlnp | grep 3003
   ```

3. Check firewall:
   ```bash
   sudo ufw status
   sudo iptables -L
   ```

---

### Frontend Not Updating

**Symptoms:**
- Old version still showing
- Changes not visible

**Solutions:**
1. Check rsync completed:
   ```bash
   ls -lh /var/www/laboratorio-eg/
   ```

2. Check Nginx serving correct directory:
   ```bash
   sudo nginx -t
   cat /etc/nginx/sites-enabled/laboratorio-eg
   ```

3. Clear browser cache:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

4. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

---

### PM2 Process Not Starting

**Symptoms:**
- PM2 shows "errored" status
- Service immediately crashes

**Solutions:**
1. Check error logs:
   ```bash
   pm2 logs <service-name> --err --lines 100
   ```

2. Check .env file exists:
   ```bash
   ls -la /home/dynamtek/apps/production/apps/*/. env
   ```

3. Check Node.js version:
   ```bash
   node --version  # Should be 18+
   ```

4. Try manual start:
   ```bash
   cd /home/dynamtek/apps/production/apps/<service>
   node src/index.js
   ```

---

### Database Connection Refused

**Symptoms:**
- "ECONNREFUSED"
- "connect ETIMEDOUT"

**Solutions:**
1. Check database server is running:
   ```bash
   ssh dynamtek@ec2-3-91-26-178.compute-1.amazonaws.com
   sudo systemctl status postgresql
   ```

2. Check Security Groups (AWS):
   - Allow port 5432 from app server IP
   - Check inbound rules

3. Check pg_hba.conf:
   ```bash
   sudo cat /etc/postgresql/14/main/pg_hba.conf
   # Should allow connection from app server
   ```

4. Test connection manually:
   ```bash
   PGPASSWORD=',U8x=]N02SX4' psql -h ec2-3-91-26-178.compute-1.amazonaws.com -U labsis -d labsisEG -c "SELECT 1;"
   ```

---

## ✅ Best Practices

### 1. Always Test in Staging First
```bash
# Test your changes
git checkout develop
git push origin develop
# Wait for staging deployment
# Test thoroughly
# Then merge to main
```

### 2. Deploy During Low Traffic Hours
- Best time: Early morning (2-6 AM local time)
- Avoid: Business hours, peak times
- Notify: Inform team before deployment

### 3. Monitor After Deployment
- Watch logs for 30 minutes
- Check error rates
- Monitor response times
- Test critical features

### 4. Keep Backups
- Automatic backups before each deployment
- Manual backups before major changes
- Test restore process regularly

### 5. Document Changes
```bash
# Good commit message
git commit -m "feat: add patient notification system

- Add email notifications for results
- Integrate with SendGrid API
- Add notification preferences UI

Closes #123"
```

### 6. Use Feature Flags
For risky features:
```javascript
// .env
FEATURE_NEW_DASHBOARD=false

// In code
if (process.env.FEATURE_NEW_DASHBOARD === 'true') {
  // New dashboard code
}
```

### 7. Gradual Rollout
1. Deploy to staging
2. Test thoroughly
3. Deploy to production
4. Monitor for issues
5. If issues: Rollback immediately
6. If stable: Continue monitoring

---

## 📈 Deployment Metrics

Track these metrics:
- **Deployment frequency:** How often you deploy
- **Lead time:** Time from commit to production
- **MTTR:** Mean time to recovery
- **Change failure rate:** % of deployments causing issues

**Goals:**
- Deploy at least once per week
- Lead time < 1 hour
- MTTR < 10 minutes
- Change failure rate < 15%

---

## 🆘 Emergency Contacts

**In case of critical issues:**

1. **Rollback immediately**
   - Use workflow: `04 - Emergency Rollback`
   - Select: `latest` backup
   - Confirm: `ROLLBACK`

2. **Check server health**
   ```bash
   ssh dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com
   pm2 monit
   ```

3. **Contact team**
   - Notify in Slack/Discord
   - Escalate if needed

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
**Maintained by:** DevOps Team
