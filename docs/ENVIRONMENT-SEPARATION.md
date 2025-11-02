# Environment Separation Guide

## Critical Principle

**NEVER run local development and AWS staging environments simultaneously.**

Each environment must be completely independent with its own:
- Backend service instances
- Telegram bot tokens
- Database connections
- API URLs
- CORS configurations

## Why Environment Separation Matters

### Problems When Running Both Environments Simultaneously

1. **Telegram Bot Conflicts (409 Errors)**
   - Only ONE bot instance can run per token
   - Running local + AWS with same token = `409 Conflict: terminated by other getUpdates request`
   - Bot becomes unstable and stops responding

2. **CORS Confusion**
   - Frontend may try to call wrong backend
   - Mixed requests to localhost + AWS services
   - Authentication tokens sent to wrong server

3. **Database Conflicts**
   - Same records modified from multiple environments
   - Unclear which environment caused data changes
   - Test data mixing with staging data

4. **Debugging Nightmares**
   - Unclear which service is responding
   - Logs scattered across local + AWS
   - Port conflicts and connection issues

## Environment Configuration

### Local Development Environment

**Purpose**: Active development, testing new features, debugging

**Location**: Your local machine (localhost, 192.168.1.125)

**Configuration Files**:

#### `messaging-bot-service/.env.local`
```bash
PORT=3004
NODE_ENV=development

# Local databases
BOT_DATABASE_URL=postgresql://labsis:labsis@localhost:5432/lis_bot_comunicacion
LABSIS_DATABASE_URL=postgresql://labsis:labsis@localhost:5432/labsisEG

# Development Telegram bot token (DIFFERENT from staging)
TELEGRAM_BOT_TOKEN=7896307494:AAFZIGPFrWdC-4hfAp_1jNfJiojSvGKINuo

# Local CORS
CORS_ORIGIN=http://localhost:5173,http://192.168.1.125:5173
```

#### `results-service/.env.local`
```bash
DATABASE_URL=postgresql://labsis:labsis@localhost:5432/labsisEG
PORT=3003
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://192.168.1.125:5173
JWT_SECRET=messaging_bot_secret_laboratorio_eg_2025
```

#### `apps/web/.env.local`
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=labsisEG
DB_USER=labsis
DB_PASSWORD=labsis
API_PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://192.168.1.125:5173
```

#### `apps/web/.env.development` (Frontend)
```bash
# Local backend APIs
VITE_API_URL=http://localhost:3001/api
VITE_RESULTS_API_URL=http://localhost:3003/api
VITE_MESSAGING_BOT_API_URL=http://localhost:3004/api

VITE_APP_ENV=development
VITE_APP_NAME=Laboratorio EG - Development
VITE_MOCK_API=false
```

---

### AWS Staging Environment

**Purpose**: Pre-production testing, stakeholder demos, integration testing

**Location**: AWS EC2 (54.197.68.252)

**Configuration Files**:

#### `~/apps/staging/apps/messaging-bot/.env`
```bash
PORT=3004
NODE_ENV=staging

# AWS databases (remote DB server)
BOT_DATABASE_URL=postgresql://labsis:,U8x=]N02SX4@ec2-3-91-26-178.compute-1.amazonaws.com:5432/lis_bot_comunicacion
LABSIS_DATABASE_URL=postgresql://labsis:,U8x=]N02SX4@ec2-3-91-26-178.compute-1.amazonaws.com:5432/labsisEG

# Staging Telegram bot token (DIFFERENT from development)
TELEGRAM_BOT_TOKEN=7634568380:AAGmN24ESk-Fwnp1GgOM9G29xDZqnf-_TR4

# AWS CORS (both IP and hostname)
CORS_ORIGIN=http://54.197.68.252:5173,http://ec2-54-197-68-252.compute-1.amazonaws.com:5173
```

#### `~/apps/staging/apps/results-api/.env`
```bash
DATABASE_URL=postgresql://labsis:,U8x=]N02SX4@ec2-3-91-26-178.compute-1.amazonaws.com:5432/labsisEG
PORT=3003
NODE_ENV=staging
CORS_ORIGIN=http://54.197.68.252:5173,http://ec2-54-197-68-252.compute-1.amazonaws.com:5173
JWT_SECRET=messaging_bot_secret_laboratorio_eg_2025
```

#### `~/apps/staging/apps/web/.env`
```bash
DB_HOST=ec2-3-91-26-178.compute-1.amazonaws.com
DB_PORT=5432
DB_NAME=labsisEG
DB_USER=labsis
DB_PASSWORD=,U8x=]N02SX4
API_PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://54.197.68.252:5173,http://ec2-54-197-68-252.compute-1.amazonaws.com:5173
```

#### `apps/web/.env.staging` (Frontend)
```bash
# AWS backend APIs
VITE_API_URL=http://54.197.68.252:3001/api
VITE_RESULTS_API_URL=http://54.197.68.252:3003/api
VITE_MESSAGING_BOT_API_URL=http://54.197.68.252:3004/api

VITE_APP_ENV=staging
VITE_APP_NAME=Laboratorio EG - Staging
VITE_MOCK_API=false
```

---

## Switching Between Environments

### Before Starting Development (Local)

**1. Stop ALL AWS Services (if running locally)**
```bash
# Kill any local messaging-bot instances
ps aux | grep "messaging-bot" | grep node | awk '{print $2}' | xargs kill -9

# Kill any local results-api instances
ps aux | grep "results-service" | grep node | awk '{print $2}' | xargs kill -9

# Kill any local web-backend instances
lsof -ti:3001 | xargs kill -9
```

**2. Verify AWS Services Are Running on Server**
```bash
ssh ubuntu@54.197.68.252
pm2 status

# Should show:
# messaging-bot-staging  | online
# results-api-staging    | online
# web-backend-staging    | online
```

**3. Start Local Development Services**
```bash
cd messaging-bot-service
npm run dev  # Uses .env.local, starts bot with dev token

cd results-service
npm run dev  # Port 3003 local

cd apps/web
npm run server  # Port 3001 local

cd apps/web
npm run dev  # Frontend on 5173, uses .env.development
```

**4. Verify Separation**
- Frontend at `http://localhost:5173` calls `http://localhost:3001/3003/3004`
- AWS frontend at `http://54.197.68.252:5173` calls AWS APIs
- No 409 Telegram errors (different tokens)
- No CORS errors

---

### Before Deploying to AWS Staging

**1. Stop ALL Local Development Services**
```bash
# Kill messaging-bot
ps aux | grep "messaging-bot" | grep node | awk '{print $2}' | xargs kill -9

# Kill results-api
ps aux | grep "results-service" | grep node | awk '{print $2}' | xargs kill -9

# Kill web-backend
lsof -ti:3001 | xargs kill -9

# Stop frontend dev server (Ctrl+C or kill vite process)
lsof -ti:5173 | xargs kill -9
```

**2. Verify No Local Services Running**
```bash
# Should return EMPTY
lsof -ti:3001
lsof -ti:3003
lsof -ti:3004
lsof -ti:5173

# Should return EMPTY
ps aux | grep "messaging-bot" | grep node
ps aux | grep "results-service" | grep node
```

**3. Build Frontend for AWS**
```bash
cd apps/web
npm run build:staging  # Uses .env.staging with AWS URLs
```

**4. Deploy to AWS** (see [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md))

**5. Verify AWS Services**
```bash
ssh ubuntu@54.197.68.252
pm2 status  # All services online
pm2 logs --lines 50  # No 409 errors
```

---

## Common Mistakes to Avoid

### ❌ MISTAKE 1: Building Frontend with Wrong Environment

**Problem**: Building with `.env.development` then deploying to AWS
```bash
# WRONG - builds with localhost URLs
npm run build
rsync dist/ ubuntu@54.197.68.252:~/apps/staging/apps/web/dist/
```

**Result**: Frontend on AWS tries to call `http://localhost:3001` (doesn't exist)

**Solution**: Always build with correct environment
```bash
# CORRECT - builds with AWS URLs
npm run build:staging
rsync dist/ ubuntu@54.197.68.252:~/apps/staging/apps/web/dist/
```

---

### ❌ MISTAKE 2: Running Bot Locally While Testing AWS

**Problem**: Testing AWS frontend, but local bot still running with same token

**Symptoms**:
- 409 Conflict errors in AWS logs
- Bot stops responding
- Messages not delivered

**Solution**: Kill ALL local bot instances before testing AWS
```bash
ps aux | grep "messaging-bot" | grep node | awk '{print $2}' | xargs kill -9
```

---

### ❌ MISTAKE 3: Forgetting to Update CORS After Adding Origins

**Problem**: Adding new frontend URL but not updating backend CORS

**Example**: Frontend now accessible via `http://ec2-54-197-68-252.compute-1.amazonaws.com:5173`

**Fix Required in ALL backend services**:
```bash
# messaging-bot/.env
CORS_ORIGIN=http://54.197.68.252:5173,http://ec2-54-197-68-252.compute-1.amazonaws.com:5173

# results-api/.env
CORS_ORIGIN=http://54.197.68.252:5173,http://ec2-54-197-68-252.compute-1.amazonaws.com:5173

# web-backend/.env
CORS_ORIGIN=http://54.197.68.252:5173,http://ec2-54-197-68-252.compute-1.amazonaws.com:5173
```

Then restart services:
```bash
pm2 restart messaging-bot-staging
pm2 restart results-api-staging
pm2 restart web-backend-staging
```

---

### ❌ MISTAKE 4: Not Parsing Comma-Separated CORS Origins

**Problem**: Setting `CORS_ORIGIN=url1,url2,url3` but code treats it as single string

**Symptom**: CORS errors even though origins are configured

**Fix in Code** (already applied):
```javascript
// WRONG - treats as single string
const allowedOrigins = [process.env.CORS_ORIGIN];

// CORRECT - parses comma-separated list
const corsOriginEnv = process.env.CORS_ORIGIN || '';
const corsOriginsList = corsOriginEnv.split(',').map(o => o.trim()).filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
  ...corsOriginsList
].filter(Boolean);
```

---

### ❌ MISTAKE 5: Connecting Local Frontend to AWS Backend

**Problem**: Running frontend locally but pointing to AWS APIs

**Why Bad**:
- Debugging confusion (logs on remote server)
- Slower development (network latency)
- Can't use debugger on backend
- Risk of corrupting staging data

**Solution**: Use local backend during development
```bash
# .env.development (local)
VITE_API_URL=http://localhost:3001/api
VITE_RESULTS_API_URL=http://localhost:3003/api
VITE_MESSAGING_BOT_API_URL=http://localhost:3004/api
```

---

## Database Separation Strategy

### Local Development Database

**Host**: `localhost:5432`
**Databases**:
- `lis_bot_comunicacion` (local copy)
- `labsisEG` (local copy)

**Data Strategy**:
- Anonymized production data snapshots
- Synthetic test data for new features
- Safe to reset/truncate tables

**Refresh Process**:
```bash
# On AWS DB server
pg_dump -h localhost -U labsis labsisEG > labsisEG_snapshot.sql
pg_dump -h localhost -U labsis lis_bot_comunicacion > bot_snapshot.sql

# Copy to local machine
scp ubuntu@ec2-3-91-26-178.compute-1.amazonaws.com:~/*.sql .

# Restore locally
psql -U labsis -d labsisEG < labsisEG_snapshot.sql
psql -U labsis -d lis_bot_comunicacion < bot_snapshot.sql
```

---

### AWS Staging Database

**Host**: `ec2-3-91-26-178.compute-1.amazonaws.com:5432`
**Databases**:
- `lis_bot_comunicacion` (staging)
- `labsisEG` (shared with production - READ-ONLY recommended)

**Data Strategy**:
- Real or near-real data for integration testing
- DO NOT delete or modify critical records
- Test with specific test patient records

**Access**:
```bash
# From local machine
PGPASSWORD=',U8x=]N02SX4' psql -h ec2-3-91-26-178.compute-1.amazonaws.com -U labsis -d lis_bot_comunicacion

# From AWS app server
PGPASSWORD=',U8x=]N02SX4' psql -h ec2-3-91-26-178.compute-1.amazonaws.com -U labsis -d lis_bot_comunicacion
```

---

## Telegram Bot Token Management

### Development Token

**Token**: `7896307494:AAFZIGPFrWdC-4hfAp_1jNfJiojSvGKINuo`
**Bot Username**: `@LabEGDevBot` (or similar)
**Usage**: Local development only
**Location**: `messaging-bot-service/.env.local`

### Staging Token

**Token**: `7634568380:AAGmN24ESk-Fwnp1GgOM9G29xDZqnf-_TR4`
**Bot Username**: `@LabEGBot` (or similar)
**Usage**: AWS staging environment only
**Location**: AWS `~/apps/staging/apps/messaging-bot/.env`

### Rules

1. **NEVER** use the same token in both environments
2. **NEVER** commit tokens to git (use .env files, add to .gitignore)
3. Only ONE instance per token can run globally
4. Use separate bot usernames for clarity (@DevBot vs @StagingBot)

---

## Quick Reference: Which Environment Am I In?

### Check Running Services

**Local**:
```bash
# Should show node processes on ports 3001, 3003, 3004
lsof -i :3001
lsof -i :3003
lsof -i :3004

# Should show messaging-bot process
ps aux | grep messaging-bot
```

**AWS**:
```bash
ssh ubuntu@54.197.68.252
pm2 status

# Should show:
# messaging-bot-staging
# results-api-staging
# web-backend-staging
```

---

### Check Frontend Build

**Development Build** (local URLs):
```bash
cd apps/web/dist/assets
grep -r "localhost:3001" .  # Should find matches
```

**Staging Build** (AWS URLs):
```bash
cd apps/web/dist/assets
grep -r "54.197.68.252" .  # Should find matches
```

---

### Check Which Bot Token Is Running

**Local**:
```bash
cd messaging-bot-service
cat .env.local | grep TELEGRAM_BOT_TOKEN
# Should show: 7896307494:AAFZIGPFrWdC-4hfAp_1jNfJiojSvGKINuo
```

**AWS**:
```bash
ssh ubuntu@54.197.68.252
cat ~/apps/staging/apps/messaging-bot/.env | grep TELEGRAM_BOT_TOKEN
# Should show: 7634568380:AAGmN24ESk-Fwnp1GgOM9G29xDZqnf-_TR4
```

---

## Deployment Checklist

Before deploying to AWS staging, verify:

- [ ] All local development services are STOPPED
- [ ] No local messaging-bot processes running
- [ ] No local node processes on ports 3001, 3003, 3004, 5173
- [ ] Frontend built with `npm run build:staging`
- [ ] Built assets contain AWS URLs (not localhost)
- [ ] .env files on AWS have correct AWS configuration
- [ ] CORS_ORIGIN includes all frontend URLs
- [ ] Database migrations applied to AWS database
- [ ] PM2 ecosystem files updated if needed
- [ ] Services deployed via rsync (excluding node_modules)
- [ ] `npm install` run on AWS after file sync
- [ ] PM2 services restarted: `pm2 restart all`
- [ ] PM2 logs checked for errors: `pm2 logs --lines 50`
- [ ] Frontend accessible at `http://54.197.68.252:5173`
- [ ] No 409 Telegram bot errors in logs
- [ ] Authentication flow tested end-to-end
- [ ] Results loading correctly from AWS backend

---

## Troubleshooting Environment Issues

### "I'm getting CORS errors"

**Check**:
1. Is frontend built for correct environment?
2. Are ALL backend services updated with correct CORS_ORIGIN?
3. Did you restart services after changing CORS config?

**Fix**:
```bash
# Update CORS in all 3 services
# messaging-bot/.env, results-api/.env, web/.env

# Restart all
pm2 restart all

# Verify
pm2 logs messaging-bot-staging --lines 20
```

---

### "Telegram bot has 409 conflicts"

**Cause**: Multiple bot instances with same token

**Check**:
```bash
# Local
ps aux | grep messaging-bot

# AWS
ssh ubuntu@54.197.68.252
pm2 logs messaging-bot-staging --lines 50 | grep 409
```

**Fix**:
```bash
# Kill ALL local instances
ps aux | grep "messaging-bot" | grep node | awk '{print $2}' | xargs kill -9

# Wait 2 minutes for Telegram to release lock
# Check AWS logs - 409 errors should stop
```

---

### "Frontend shows localhost URLs in network tab"

**Cause**: Built with wrong environment

**Check**:
```bash
cd apps/web/dist/assets
grep -r "localhost" .
```

**Fix**:
```bash
# Rebuild with staging config
npm run build:staging

# Verify
grep -r "54.197.68.252" dist/assets

# Redeploy
rsync -avz --delete dist/ ubuntu@54.197.68.252:~/apps/staging/apps/web/dist/
```

---

## Summary: Key Principles

1. **One Environment At A Time**: Never run local + AWS simultaneously
2. **Separate Bot Tokens**: Development and staging MUST use different tokens
3. **Build For Target**: Always build frontend for the environment you're deploying to
4. **Clean Shutdown**: Stop ALL local services before deploying to AWS
5. **Verify Separation**: Check logs, processes, and network requests to confirm isolation
6. **Document Changes**: Update this guide when adding new environments or services

---

**Last Updated**: 2025-10-30
**Related Docs**: [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md), [AWS-INFRASTRUCTURE.md](AWS-INFRASTRUCTURE.md)
