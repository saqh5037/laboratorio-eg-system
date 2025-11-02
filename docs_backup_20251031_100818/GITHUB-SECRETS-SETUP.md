# 🔐 GitHub Secrets Configuration Guide

This document lists all the secrets required for GitHub Actions CI/CD workflows.

## 📋 How to Add Secrets

1. Go to your repository: https://github.com/saqh5037/laboratorio-eg-system
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the name and value
5. Click **Add secret**

---

## 🔑 Required Secrets

### SSH Access

#### `SSH_PRIVATE_KEY`
**Description:** Private SSH key for accessing AWS EC2 servers
**Value:** Contents of `/Users/samuelquiroz/Desktop/certificados/labsisapp.pem`
**How to get:**
```bash
cat /Users/samuelquiroz/Desktop/certificados/labsisapp.pem
# Copy the entire output including:
# -----BEGIN RSA PRIVATE KEY-----
# ...
# -----END RSA PRIVATE KEY-----
```

#### `SSH_USER`
**Description:** SSH username for EC2 servers
**Value:** `dynamtek`

#### `SSH_HOST_PRODUCTION`
**Description:** Production server hostname
**Value:** `ec2-54-197-68-252.compute-1.amazonaws.com`

#### `SSH_HOST_STAGING`
**Description:** Staging server hostname (can be same as production)
**Value:** `ec2-54-197-68-252.compute-1.amazonaws.com`

---

### Database Configuration - Production

#### `DB_HOST_PROD`
**Description:** Production database server hostname
**Value:** `ec2-3-91-26-178.compute-1.amazonaws.com`

#### `DB_PORT_PROD`
**Description:** PostgreSQL port
**Value:** `5432`

#### `DB_USER_PROD`
**Description:** Database username for production
**Value:** `labsis`

#### `DB_PASSWORD_PROD`
**Description:** Database password for production
**Value:** `,U8x=]N02SX4`
**⚠️ CRITICAL:** Never commit this password in code!

#### `DB_NAME_PROD`
**Description:** Production database name
**Value:** `labsisEG`

---

### Database Configuration - Staging

#### `DB_HOST_STAGING`
**Description:** Staging database server hostname
**Value:** `ec2-3-91-26-178.compute-1.amazonaws.com`

#### `DB_USER_STAGING`
**Description:** Database username for staging (read-only recommended)
**Value:** `labsis_readonly`
**Note:** You need to create this user first (see below)

#### `DB_PASSWORD_STAGING`
**Description:** Database password for staging
**Value:** Generate a new secure password
**How to generate:**
```bash
openssl rand -base64 32
```

---

### Telegram Bot Configuration

#### `TELEGRAM_BOT_TOKEN`
**Description:** Telegram bot token from BotFather
**Value:** Get from your `.env` file in messaging-bot-service
**Example:** `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

---

### Gemini AI Configuration

#### `GEMINI_API_KEY`
**Description:** Google Gemini API key
**Value:** Get from your `.env` file in messaging-bot-service
**Where to get:** https://makersuite.google.com/app/apikey

---

### JWT Configuration

#### `JWT_SECRET_PRODUCTION`
**Description:** JWT secret for production environment
**Value:** Generate a new random 64-character string
**How to generate:**
```bash
openssl rand -hex 32
```

#### `JWT_SECRET_STAGING`
**Description:** JWT secret for staging environment
**Value:** Generate a different random 64-character string
**How to generate:**
```bash
openssl rand -hex 32
```

---

### Optional: Notifications

#### `SLACK_WEBHOOK_URL` (Optional)
**Description:** Slack webhook for deployment notifications
**Value:** Get from Slack → Apps → Incoming Webhooks
**Example:** `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`

#### `DISCORD_WEBHOOK_URL` (Optional)
**Description:** Discord webhook for deployment notifications
**Value:** Get from Discord → Server Settings → Integrations → Webhooks
**Example:** `https://discord.com/api/webhooks/123456789/abcdefghijklmnop`

---

## 🗄️ Database Setup for Staging

Before using staging, create a read-only database user:

```sql
-- Connect to database server
ssh -i labsisapp.pem dynamtek@ec2-3-91-26-178.compute-1.amazonaws.com

-- Switch to postgres user
sudo su - postgres

-- Create read-only user
psql labsisEG << 'EOF'
-- Create user with read-only access
CREATE USER labsis_readonly WITH PASSWORD 'YOUR_GENERATED_PASSWORD';

-- Grant connection
GRANT CONNECT ON DATABASE labsisEG TO labsis_readonly;

-- Grant usage on schema
GRANT USAGE ON SCHEMA laboratorio TO labsis_readonly;

-- Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA laboratorio TO labsis_readonly;

-- Grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA laboratorio
GRANT SELECT ON TABLES TO labsis_readonly;

-- Verify
\du labsis_readonly
EOF
```

---

## ✅ Secrets Checklist

Use this checklist to verify all secrets are configured:

### SSH & Servers
- [ ] `SSH_PRIVATE_KEY` - Private key content
- [ ] `SSH_USER` - dynamtek
- [ ] `SSH_HOST_PRODUCTION` - EC2 hostname
- [ ] `SSH_HOST_STAGING` - EC2 hostname

### Database Production
- [ ] `DB_HOST_PROD` - ec2-3-91-26-178.compute-1.amazonaws.com
- [ ] `DB_PORT_PROD` - 5432
- [ ] `DB_USER_PROD` - labsis
- [ ] `DB_PASSWORD_PROD` - ,U8x=]N02SX4
- [ ] `DB_NAME_PROD` - labsisEG

### Database Staging
- [ ] `DB_HOST_STAGING` - ec2-3-91-26-178.compute-1.amazonaws.com
- [ ] `DB_USER_STAGING` - labsis_readonly
- [ ] `DB_PASSWORD_STAGING` - (generated)

### Application Secrets
- [ ] `TELEGRAM_BOT_TOKEN` - From BotFather
- [ ] `GEMINI_API_KEY` - From Google AI Studio
- [ ] `JWT_SECRET_PRODUCTION` - Generated (64 chars)
- [ ] `JWT_SECRET_STAGING` - Generated (64 chars)

### Optional
- [ ] `SLACK_WEBHOOK_URL` - (if using Slack)
- [ ] `DISCORD_WEBHOOK_URL` - (if using Discord)

---

## 🔒 Security Best Practices

1. **Never commit secrets to Git**
   - Always use `.env` files (gitignored)
   - Use GitHub Secrets for CI/CD
   - Rotate secrets regularly

2. **Use different secrets per environment**
   - Production secrets ≠ Staging secrets
   - Different JWT secrets per environment
   - Different database users/passwords

3. **Least Privilege Principle**
   - Staging uses read-only database user
   - Production uses full access only when needed

4. **Regular Rotation**
   - Rotate JWT secrets every 90 days
   - Rotate database passwords every 180 days
   - Rotate SSH keys annually

5. **Audit Access**
   - Monitor who accesses secrets
   - Review GitHub Actions logs
   - Track deployment history

---

## 📝 Testing Secrets

After adding all secrets, test them:

```bash
# Test SSH access
ssh -i labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com "echo 'SSH works!'"

# Test database connection (production)
PGPASSWORD=',U8x=]N02SX4' psql -h ec2-3-91-26-178.compute-1.amazonaws.com -U labsis -d labsisEG -c "SELECT version();"

# Test database connection (staging)
PGPASSWORD='YOUR_STAGING_PASSWORD' psql -h ec2-3-91-26-178.compute-1.amazonaws.com -U labsis_readonly -d labsisEG -c "SELECT version();"
```

---

## 🆘 Troubleshooting

### "Permission denied (publickey)" error
- Check `SSH_PRIVATE_KEY` is complete (including header/footer)
- Verify key has correct permissions (600)
- Ensure key matches the one on EC2 server

### "Could not connect to database" error
- Verify database host is accessible
- Check Security Groups allow connection from GitHub IPs
- Verify credentials are correct
- Test connection manually first

### "Authentication failed" error
- Verify JWT secrets are at least 32 characters
- Check environment variables are correctly named
- Ensure no extra spaces in secret values

---

## 📚 Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [PostgreSQL User Management](https://www.postgresql.org/docs/current/user-manag.html)

---

**Last Updated:** 2025-10-28
**Maintained by:** DevOps Team
