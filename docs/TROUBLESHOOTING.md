# Troubleshooting Guide

Complete reference for all errors encountered during development and deployment of the Laboratorio EG system.

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Database Errors](#database-errors)
3. [CORS Errors](#cors-errors)
4. [Telegram Bot Issues](#telegram-bot-issues)
5. [Deployment Issues](#deployment-issues)
6. [Service Startup Problems](#service-startup-problems)
7. [Network and Connection Issues](#network-and-connection-issues)
8. [Build and Configuration Issues](#build-and-configuration-issues)

---

## Authentication Issues

### Error: "useTelegramAuth debe usarse dentro de TelegramAuthProvider"

**Symptom**: React context error when trying to use `useTelegramAuth()` hook

**Error Message**:
```
Error: useTelegramAuth debe usarse dentro de TelegramAuthProvider
    at useTelegramAuth (TelegramAuthContext.jsx:14)
    at ResultadosAuth (ResultadosAuth.jsx:14)
```

**Cause**: Component is using the `useTelegramAuth()` hook but is not wrapped in `TelegramAuthProvider` context.

**Solution**:

Option A - Wrap component with provider:
```jsx
// ResultadosAuth.jsx
<TelegramAuthProvider>
  <TelegramAuthModal
    isOpen={showTelegramModal}
    onClose={() => setShowTelegramModal(false)}
    onSuccess={handleTelegramAuthSuccess}
  />
</TelegramAuthProvider>
```

Option B - Remove hook usage if not needed:
```jsx
// Remove this line if you don't need the hook
const { login } = useTelegramAuth();

// And remove any dependent calls
// login(authData);  // Remove this too
```

**Files Modified**: [ResultadosAuth.jsx](../apps/web/src/components/resultados/ResultadosAuth.jsx)

---

### Error: requiresAuthorization Not Detected (403 Response)

**Symptom**: User gets 403 Forbidden but authorization modal doesn't appear

**Error Message**:
```
POST http://localhost:3004/api/auth/verify-code 403 (Forbidden)
Response: {success: false, error: "Usuario no encontrado...", requiresAuthorization: true}
```

**Cause**: `MessagingBotApiError` was not preserving the `requiresAuthorization` flag from response data.

**Solution**:

Update `MessagingBotApiError` class to accept and store response data:

```javascript
// messagingBotApi.js
class MessagingBotApiError extends Error {
  constructor(message, code, status, data = {}) {
    super(message);
    this.name = 'MessagingBotApiError';
    this.code = code;
    this.status = status;
    this.data = data; // NEW: Store complete response data
  }
}

// In fetchApi function
if (!response.ok) {
  throw new MessagingBotApiError(
    data.error || 'Error en la petición',
    data.code,
    response.status,
    data // NEW: Pass complete data object
  );
}

// In error handler
catch (error) {
  if (error.data && error.data.requiresAuthorization) {
    // Show authorization modal
    setShowAuthorizationModal(true);
  }
}
```

**Files Modified**: [messagingBotApi.js](../apps/web/src/services/messagingBotApi.js)

---

### Error: "Código de verificación expirado o inválido"

**Symptom**: User receives code via Telegram, enters it, but gets "expired or invalid" error

**Common Causes**:

1. **Token already used**
   - Check database: `SELECT * FROM patient_sessions WHERE token = '...'`
   - Each token can only be used once

2. **Code expired (10 minutes timeout)**
   - Check: `SELECT code, created_at, NOW() - created_at as age FROM verification_codes WHERE phone = '...'`
   - If age > 10 minutes, code is expired

3. **Wrong phone number format**
   - Code generated for `+58412-1234567` but user entered `0412-1234567`
   - Ensure consistent phone formatting

**Solution**:
- Request new code (invalidates previous one)
- Ensure phone format consistency between request and verification
- Check server time is synchronized (NTP)

---

## Database Errors

### Error: "value too long for type character varying(255)" - CRITICAL

**Symptom**: Authentication fails when trying to create session

**Error Message**:
```
error: value too long for type character varying(255)
    at SessionService.js:63
    at internal/process/task_queues.js:95:5
```

**Cause**: JWT tokens are ~345 characters but database column was `VARCHAR(255)`

**Initial Wrong Assumption**: Thought it was `userAgent` field causing the issue

**Actual Cause**: Token field exceeded limit

**Debug Process**:

Added logging to identify long fields:
```javascript
// SessionService.js
logger.info(`📏 Longitudes de campos antes de INSERT:
  - token: ${token?.length || 0} caracteres  // 345 chars!
  - ipAddress: ${ipAddress?.length || 0} caracteres
  - userAgent: ${truncatedUserAgent?.length || 0} caracteres
  - deviceInfo (JSON): ${deviceInfoStr?.length || 0} caracteres
`);
```

**Solution**:

Migration SQL:
```sql
-- Migration 004: Fix token VARCHAR(255) limit
ALTER TABLE patient_sessions
ALTER COLUMN token TYPE TEXT;

-- Verify
DO $
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'patient_sessions'
    AND column_name = 'token'
    AND data_type = 'text'
  ) THEN
    RAISE NOTICE '✅ Migration successful: token column is now TEXT';
  ELSE
    RAISE EXCEPTION '❌ Migration failed: token column is not TEXT';
  END IF;
END $;
```

**Apply to All Environments**:

Local:
```bash
PGPASSWORD='labsis' psql -h localhost -U labsis -d lis_bot_comunicacion < migrations/lis_bot_comunicacion/004_fix_token_varchar_limit.sql
```

AWS Staging:
```bash
PGPASSWORD=',U8x=]N02SX4' psql -h ec2-3-91-26-178.compute-1.amazonaws.com -U labsis -d lis_bot_comunicacion < migrations/lis_bot_comunicacion/004_fix_token_varchar_limit.sql
```

**Files Modified**:
- [004_fix_token_varchar_limit.sql](../messaging-bot-service/migrations/lis_bot_comunicacion/004_fix_token_varchar_limit.sql)
- [SessionService.js](../messaging-bot-service/src/core/services/SessionService.js)

---

### Error: "relation 'paciente' does not exist"

**Symptom**: Cannot create session, database query fails

**Error Message**:
```
error: relation "paciente" does not exist
    at SessionService.js:28
```

**Cause**: Using `botPool` (connects to `lis_bot_comunicacion`) instead of `labsisPool` (connects to `labsisEG`) to query the `paciente` table.

**Why This Happens**:
- `paciente` table exists in `labsisEG` database (legacy system)
- `lis_bot_comunicacion` database only has bot-specific tables

**Solution**:

```javascript
// SessionService.js - Line 28

// WRONG - botPool connects to lis_bot_comunicacion
const pacienteResult = await botPool.query(
  'SELECT * FROM paciente WHERE cedula = $1',
  [cedulaPaciente]
);

// CORRECT - labsisPool connects to labsisEG
const pacienteResult = await labsisPool.query(
  'SELECT * FROM paciente WHERE cedula = $1',
  [cedulaPaciente]
);
```

**Rule of Thumb**:
- Use `labsisPool` for: paciente, orden_trabajo, prueba, resultado
- Use `botPool` for: telegram_user_registry, patient_sessions, auth_tokens

**Files Modified**: [SessionService.js:28](../messaging-bot-service/src/core/services/SessionService.js#L28)

---

### Error: "column 'last_activity' does not exist"

**Symptom**: Token validation fails when updating session activity

**Error Message**:
```
error: column "last_activity" of relation "patient_sessions" does not exist
    at SessionService.js:172
```

**Cause**: Code tried to update `last_activity` but column is actually named `last_used_at`

**Solution**:

```sql
-- WRONG
UPDATE patient_sessions
SET last_activity = NOW()
WHERE token = $1

-- CORRECT
UPDATE patient_sessions
SET last_used_at = NOW()
WHERE token = $1
```

**Files Modified**: [SessionService.js:172](../messaging-bot-service/src/core/services/SessionService.js#L172)

---

## CORS Errors

### Error: "Access-Control-Allow-Origin" - CRITICAL BUG

**Symptom**: Frontend on AWS cannot access backend APIs, CORS errors in browser console

**Error Message**:
```
Access to XMLHttpRequest at 'http://54.197.68.252:3001/api/areas'
from origin 'http://ec2-54-197-68-252.compute-1.amazonaws.com:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

**Cause**: CORS configuration was treating comma-separated origins as a single string instead of parsing them

**Environment Variable**:
```bash
# This was being treated as ONE origin (wrong)
CORS_ORIGIN=http://54.197.68.252:5173,http://ec2-54-197-68-252.compute-1.amazonaws.com:5173
```

**Wrong Code**:
```javascript
// web-backend server/index.js
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CORS_ORIGIN  // Treats entire string as one origin!
];
```

**Solution**:

Parse comma-separated origins correctly:

```javascript
// CORRECT Implementation
const corsOriginEnv = process.env.CORS_ORIGIN || '';
const corsOriginsList = corsOriginEnv
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.125:5173',
  ...corsOriginsList  // Spread array of parsed origins
].filter(Boolean);

// In CORS callback
if (!origin || allowedOrigins.includes(origin)) {
  callback(null, true);
} else {
  callback(new Error('Not allowed by CORS'));
}
```

**Apply to ALL Backend Services**:

1. **messaging-bot-service/src/index.js**
2. **results-service/src/index.js**
3. **apps/web/server/index.js**

**Verification**:
```bash
# Check if origins are parsed correctly
console.log('Allowed origins:', allowedOrigins);
// Should show: ['http://localhost:5173', 'http://54.197.68.252:5173', 'http://ec2-...']
```

**Files Modified**:
- [messaging-bot-service/src/index.js](../messaging-bot-service/src/index.js)
- [results-service/src/index.js](../results-service/src/index.js)
- [apps/web/server/index.js](../apps/web/server/index.js)

---

### Error: CORS Working Locally but Not on AWS

**Symptom**: CORS works when testing from `localhost:5173` but fails from AWS URL

**Cause**: AWS URL not included in CORS_ORIGIN environment variable

**Solution**:

Update `.env` on AWS to include BOTH IP and hostname:

```bash
# Before (incomplete)
CORS_ORIGIN=http://54.197.68.252:5173

# After (complete)
CORS_ORIGIN=http://54.197.68.252:5173,http://ec2-54-197-68-252.compute-1.amazonaws.com:5173
```

Then restart services:
```bash
pm2 restart messaging-bot-staging
pm2 restart results-api-staging
pm2 restart web-backend-staging
```

---

## Telegram Bot Issues

### Error: "409 Conflict: terminated by other getUpdates request" - CRITICAL

**Symptom**: Bot stops responding, constant 409 errors in logs

**Error Message**:
```
Error: 409: Conflict: terminated by other getUpdates request;
make sure that only one bot instance is running
```

**Cause**: Multiple bot instances running with the SAME Telegram bot token

**Common Scenarios**:

1. **Running Local + AWS with Same Token**
   - Local dev bot using staging token
   - AWS staging bot using same token
   - Both compete for updates → 409 errors

2. **Duplicate Local Processes**
   - Multiple `npm run dev` instances
   - Old nodemon processes not killed
   - PM2 + manual node process

**Identification**:

Check all running bot instances:
```bash
# Local machine
ps aux | grep messaging-bot
# Output shows multiple processes:
# user 56346 ... node src/index.js
# user 56832 ... node src/index.js
# user 57219 ... nodemon src/index.js

# AWS
ssh ubuntu@54.197.68.252
pm2 logs messaging-bot-staging | grep 409
```

**Solution**:

Kill ALL instances except one:

```bash
# On local machine - kill ALL bot processes
ps aux | grep "messaging-bot" | grep node | awk '{print $2}' | xargs kill -9

# Verify none running
ps aux | grep messaging-bot
# Should return empty (only grep itself)

# On AWS - ensure only PM2 process running
ssh ubuntu@54.197.68.252
pm2 restart messaging-bot-staging
pm2 logs messaging-bot-staging --lines 50
```

**Wait for Telegram to Release Lock**:
- After killing processes, wait 2-3 minutes
- Telegram needs time to release the webhook lock
- 409 errors should stop appearing in logs

**Prevention**:

1. Use DIFFERENT bot tokens for dev vs staging
2. Never run local bot when testing AWS
3. Always kill local processes before deploying
4. Add process cleanup to deployment script

**Environment Separation**:
```bash
# Local .env
TELEGRAM_BOT_TOKEN=7896307494:AAFZIGPFrWdC-4hfAp_1jNfJiojSvGKINuo

# AWS .env
TELEGRAM_BOT_TOKEN=7634568380:AAGmN24ESk-Fwnp1GgOM9G29xDZqnf-_TR4
```

---

### Error: Bot Not Responding to /start Command

**Symptom**: User clicks deep link, bot opens, but /start command does nothing

**Common Causes**:

1. **Bot crashed but PM2 didn't restart**
   ```bash
   pm2 logs messaging-bot-staging
   # Look for uncaught exceptions
   ```

2. **Database connection lost**
   ```bash
   pm2 logs messaging-bot-staging | grep "database"
   ```

3. **Token authorization table missing**
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables
     WHERE table_name = 'telegram_auth_tokens'
   );
   ```

**Debug Steps**:

```bash
# 1. Check if bot is running
pm2 status messaging-bot-staging

# 2. Check recent logs
pm2 logs messaging-bot-staging --lines 100

# 3. Check database connectivity
PGPASSWORD=',U8x=]N02SX4' psql -h ec2-3-91-26-178.compute-1.amazonaws.com -U labsis -d lis_bot_comunicacion -c "SELECT NOW()"

# 4. Restart bot
pm2 restart messaging-bot-staging

# 5. Test with /start command
# Send: /start test123
# Should see log entry showing token processing
```

---

## Deployment Issues

### Error: Frontend Built with Localhost URLs

**Symptom**: Deployed frontend on AWS but network tab shows requests to `localhost:3001`

**Error Message**:
```
GET http://localhost:3001/api/areas net::ERR_CONNECTION_REFUSED
```

**Cause**: Built frontend with wrong environment file

**Wrong Process**:
```bash
# Built with .env.development (localhost URLs)
npm run build

# Then deployed to AWS
rsync dist/ ubuntu@54.197.68.252:~/apps/staging/apps/web/dist/
```

**Correct Process**:
```bash
# Build with .env.staging (AWS URLs)
npm run build:staging

# Verify build contains AWS URLs
grep -r "54.197.68.252" dist/assets
# Should find matches

# Then deploy
rsync -avz --delete dist/ ubuntu@54.197.68.252:~/apps/staging/apps/web/dist/
```

**package.json Scripts**:
```json
{
  "scripts": {
    "build": "vite build",  // Uses .env.production
    "build:staging": "vite build --mode staging"  // Uses .env.staging
  }
}
```

**Verification After Deploy**:
```bash
# SSH to AWS
ssh ubuntu@54.197.68.252

# Check built files
cd ~/apps/staging/apps/web/dist/assets
grep -r "VITE_API_URL" *.js | head -5
# Should show AWS URLs, not localhost
```

---

### Error: PM2 ES Module Error

**Symptom**: PM2 fails to start service with module error

**Error Message**:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module
/home/dynamtek/apps/staging/apps/messaging-bot/ecosystem.config.js
not supported
```

**Cause**: `package.json` has `"type": "module"` but PM2 uses CommonJS `require()`

**Solution**:

Rename ecosystem file to use `.cjs` extension:

```bash
# On AWS server
cd ~/apps/staging/apps/messaging-bot
mv ecosystem.config.js ecosystem.config.cjs

# Update PM2
pm2 delete messaging-bot-staging
pm2 start ecosystem.config.cjs

# Save configuration
pm2 save
```

**Apply to All Services**:
- messaging-bot/ecosystem.config.cjs
- results-api/ecosystem.config.cjs
- web/ecosystem.config.cjs

---

### Error: Services Not Accessible from Internet

**Symptom**: Services running but cannot access from browser

**Verification**:
```bash
# On AWS server
lsof -i :5173  # Should show node process
lsof -i :3001
lsof -i :3003
lsof -i :3004

# All should return process info
```

**Cause**: AWS Security Group not allowing inbound traffic on those ports

**Solution**:

1. Go to AWS Console → EC2 → Security Groups
2. Find security group attached to instance
3. Add inbound rules:
   - Port 5173 (Frontend) - Source: 0.0.0.0/0
   - Port 3001 (Web API) - Source: 0.0.0.0/0
   - Port 3003 (Results API) - Source: 0.0.0.0/0
   - Port 3004 (Messaging Bot API) - Source: 0.0.0.0/0

**Alternative via AWS CLI**:
```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 5173 \
  --cidr 0.0.0.0/0
```

**Verification**:
```bash
# From local machine
curl -I http://54.197.68.252:5173
# Should return 200 OK

curl http://54.197.68.252:3001/api/health
# Should return JSON response
```

---

## Service Startup Problems

### Error: "EADDRINUSE: address already in use"

**Symptom**: Cannot start service, port already in use

**Error Message**:
```
Error: listen EADDRINUSE: address already in use :::3004
```

**Cause**: Another process is already using that port

**Solution**:

Find and kill the process:
```bash
# Find process using port
lsof -i :3004

# Kill it
lsof -ti:3004 | xargs kill -9

# Verify port is free
lsof -i :3004
# Should return empty

# Start service
pm2 start ecosystem.config.cjs
```

---

### Error: Database Connection Timeout

**Symptom**: Service starts but immediately crashes with database timeout

**Error Message**:
```
Error: connect ETIMEDOUT
    at Connection._handleConnectTimeout
Error: Failed to connect to database after retries
```

**Causes**:

1. **Wrong database host**
   ```bash
   # Check .env
   cat .env | grep DATABASE_URL
   ```

2. **PostgreSQL not running**
   ```bash
   ssh ubuntu@ec2-3-91-26-178.compute-1.amazonaws.com
   sudo systemctl status postgresql
   ```

3. **Security Group blocking port 5432**
   - Check database server Security Group
   - Ensure port 5432 allows traffic from app server

4. **Wrong credentials**
   ```bash
   # Test connection manually
   PGPASSWORD='password' psql -h host -U user -d database
   ```

**Solution**:

```bash
# 1. Verify database is reachable
telnet ec2-3-91-26-178.compute-1.amazonaws.com 5432
# Should connect (Ctrl+] then quit to exit)

# 2. Test PostgreSQL connection
PGPASSWORD=',U8x=]N02SX4' psql \
  -h ec2-3-91-26-178.compute-1.amazonaws.com \
  -U labsis \
  -d lis_bot_comunicacion \
  -c "SELECT NOW()"

# 3. If connection works, check application .env file
cd ~/apps/staging/apps/messaging-bot
cat .env

# 4. Restart service
pm2 restart messaging-bot-staging
pm2 logs messaging-bot-staging
```

---

## Network and Connection Issues

### Error: "net::ERR_CONNECTION_REFUSED" (Port 3001, 3003, 3004)

**Symptom**: Frontend loads but API calls fail with connection refused

**Cause**: Backend service not running

**Solution**:

```bash
# Local Development
cd apps/web
npm run server  # Starts port 3001

cd results-service
npm run dev  # Starts port 3003

cd messaging-bot-service
npm run dev  # Starts port 3004

# AWS Staging
ssh ubuntu@54.197.68.252
pm2 status
# Ensure all services show "online"

# If not online
pm2 restart <service-name>
```

---

### Error: "net::ERR_CONNECTION_TIMED_OUT"

**Symptom**: Request hangs for 30+ seconds then times out

**Cause**: Service is listening on wrong network interface

**Check**:
```javascript
// WRONG - only localhost
app.listen(3004, 'localhost')

// CORRECT - all interfaces
app.listen(3004, '0.0.0.0')
```

**Solution**:

Update server configuration:
```javascript
// messaging-bot-service/src/index.js
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3004;

bot.launch({
  webhook: {
    domain: process.env.WEBHOOK_DOMAIN,
    port: PORT,
    host: HOST  // Listen on all interfaces
  }
});
```

---

## Build and Configuration Issues

### Error: Environment Variables Not Loading

**Symptom**: `import.meta.env.VITE_API_URL` is undefined

**Causes**:

1. **Wrong file name**
   ```bash
   # Should be .env.staging, not .env.aws
   ls -la | grep env
   ```

2. **Variables not prefixed with VITE_**
   ```bash
   # WRONG
   API_URL=http://...

   # CORRECT
   VITE_API_URL=http://...
   ```

3. **Not using --mode flag**
   ```bash
   # WRONG
   npm run build

   # CORRECT
   npm run build:staging
   # which runs: vite build --mode staging
   ```

**Solution**:

```bash
# 1. Verify file exists
ls -la apps/web/.env.staging

# 2. Verify contents
cat apps/web/.env.staging
# Should show VITE_* variables

# 3. Build with correct mode
npm run build:staging

# 4. Verify built assets include values
grep -r "VITE_API_URL" dist/assets
# Should NOT find literal "VITE_API_URL"
# Should find actual URL values like "http://54.197.68.252:3001"
```

---

### Error: "Cannot find module" After Deployment

**Symptom**: PM2 shows service as "errored", logs show module not found

**Error Message**:
```
Error: Cannot find module 'express'
    at Function.Module._resolveFilename
```

**Cause**: Deployed code without running `npm install` on server

**Solution**:

```bash
# After rsync, always run npm install
ssh ubuntu@54.197.68.252

cd ~/apps/staging/apps/messaging-bot
npm install

cd ~/apps/staging/apps/results-api
npm install

cd ~/apps/staging/apps/web
npm install

# Then restart services
pm2 restart all
```

**Add to Deployment Script**:
```bash
# deploy-to-staging.sh
rsync -avz --exclude node_modules ...
ssh ubuntu@54.197.68.252 '
  cd ~/apps/staging/apps/messaging-bot && npm install
  cd ~/apps/staging/apps/results-api && npm install
  cd ~/apps/staging/apps/web && npm install
  pm2 restart all
'
```

---

## Quick Diagnostic Commands

### Check All Services Status

**Local**:
```bash
# Web backend
lsof -i :3001

# Results API
lsof -i :3003

# Messaging bot
lsof -i :3004
ps aux | grep messaging-bot

# Frontend dev server
lsof -i :5173
```

**AWS**:
```bash
ssh ubuntu@54.197.68.252
pm2 status
pm2 logs --lines 50
```

---

### Check Database Connectivity

```bash
# Local
PGPASSWORD='labsis' psql -h localhost -U labsis -d lis_bot_comunicacion -c "SELECT NOW()"

# AWS
PGPASSWORD=',U8x=]N02SX4' psql \
  -h ec2-3-91-26-178.compute-1.amazonaws.com \
  -U labsis \
  -d lis_bot_comunicacion \
  -c "SELECT NOW()"
```

---

### Check Network Accessibility

```bash
# Test if port is open
telnet 54.197.68.252 5173
telnet 54.197.68.252 3001

# Test HTTP endpoint
curl -I http://54.197.68.252:5173
curl http://54.197.68.252:3001/api/health
curl http://54.197.68.252:3003/api/health
curl http://54.197.68.252:3004/api/health
```

---

### Check CORS Configuration

```bash
# Test CORS with origin header
curl -H "Origin: http://ec2-54-197-68-252.compute-1.amazonaws.com:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://54.197.68.252:3004/api/auth/request-code \
  -v

# Should see:
# Access-Control-Allow-Origin: http://ec2-54-197-68-252.compute-1.amazonaws.com:5173
# Access-Control-Allow-Methods: POST, ...
```

---

### Check Telegram Bot Status

```bash
# Get bot info via Telegram API
curl https://api.telegram.org/bot7634568380:AAGmN24ESk-Fwnp1GgOM9G29xDZqnf-_TR4/getMe

# Check webhook status
curl https://api.telegram.org/bot7634568380:AAGmN24ESk-Fwnp1GgOM9G29xDZqnf-_TR4/getWebhookInfo
```

---

## Prevention Checklist

Before each deployment, verify:

- [ ] All local services stopped (no 409 bot conflicts)
- [ ] Correct .env files in place (AWS credentials, not local)
- [ ] Frontend built with correct mode (`npm run build:staging`)
- [ ] CORS_ORIGIN includes all frontend URLs
- [ ] Database migrations applied
- [ ] Security Group ports open (5173, 3001, 3003, 3004)
- [ ] `npm install` run after rsync
- [ ] PM2 processes restarted
- [ ] Logs checked for errors
- [ ] End-to-end testing performed

---

**Last Updated**: 2025-10-30
**Related Docs**: [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md), [ENVIRONMENT-SEPARATION.md](ENVIRONMENT-SEPARATION.md)
