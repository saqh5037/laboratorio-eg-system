# AWS Infrastructure Documentation

## Overview

The Laboratorio EG system runs on AWS infrastructure with a separation between application and database servers for better security and performance.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │
         ┌───────────────▼─────────────────┐
         │   AWS Security Groups           │
         │   - Port 22 (SSH)               │
         │   - Port 5173 (Frontend)        │
         │   - Port 3001, 3003, 3004 (APIs)│
         └───────────────┬─────────────────┘
                         │
         ┌───────────────▼────────────────────────────┐
         │  EC2 Application Server                    │
         │  54.197.68.252                             │
         │  ec2-54-197-68-252.compute-1.amazonaws.com │
         │                                             │
         │  Services (PM2):                           │
         │  ├─ web-backend (port 3001)                │
         │  ├─ results-api (port 3003)                │
         │  ├─ messaging-bot (port 3004)              │
         │  └─ frontend (nginx on 5173)               │
         └──────────────┬─────────────────────────────┘
                        │
                        │ PostgreSQL Connection
                        │ (Private Network)
                        │
         ┌──────────────▼────────────────────────────┐
         │  EC2 Database Server                      │
         │  ec2-3-91-26-178.compute-1.amazonaws.com  │
         │                                            │
         │  PostgreSQL Databases:                    │
         │  ├─ labsisEG (legacy system)              │
         │  └─ lis_bot_comunicacion (messaging)      │
         └────────────────────────────────────────────┘
```

## EC2 Instances

### Application Server

**DNS**: `ec2-54-197-68-252.compute-1.amazonaws.com`
**IP**: `54.197.68.252`
**User**: `dynamtek` (sudo access) or `ubuntu`
**SSH Key**: `~/Desktop/certificados/labsisapp.pem`

**SSH Access**:
```bash
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@54.197.68.252
# or
ssh -i ~/Desktop/certificados/labsisapp.pem ubuntu@54.197.68.252
```

**Instance Details**:
- Instance Type: t2.medium (or similar)
- OS: Ubuntu 20.04/22.04 LTS
- vCPUs: 2
- RAM: 4GB
- Storage: 30GB SSD

**Installed Software**:
- Node.js v18.20.8 (via nvm)
- npm 10.x
- PM2 (process manager)
- Nginx (web server)
- Git
- PostgreSQL client tools

**Directory Structure**:
```
/home/dynamtek/
├── apps/
│   └── staging/
│       └── apps/
│           ├── messaging-bot/
│           │   ├── src/
│           │   ├── .env
│           │   ├── package.json
│           │   └── ecosystem.config.cjs
│           ├── results-api/
│           │   ├── src/
│           │   ├── .env
│           │   ├── package.json
│           │   └── ecosystem.config.cjs
│           └── web/
│               ├── server/
│               ├── dist/  (frontend build)
│               ├── .env
│               ├── package.json
│               └── ecosystem.config.cjs
├── logs/
│   ├── messaging-bot-staging.log
│   ├── results-api-staging.log
│   └── web-backend-staging.log
└── .nvm/
    └── versions/
        └── node/
            └── v18.20.8/
```

---

### Database Server

**DNS**: `ec2-3-91-26-178.compute-1.amazonaws.com`
**IP**: `3.91.26.178` (private to app server)
**User**: `ubuntu` (sudo access)
**SSH Key**: Same as application server

**SSH Access**:
```bash
ssh -i ~/Desktop/certificados/labsisapp.pem ubuntu@ec2-3-91-26-178.compute-1.amazonaws.com
```

**Instance Details**:
- Instance Type: t2.medium or larger
- OS: Ubuntu 20.04/22.04 LTS
- vCPUs: 2+
- RAM: 8GB+
- Storage: 100GB+ SSD

**PostgreSQL Configuration**:
- Version: PostgreSQL 12+
- Port: 5432
- Max Connections: 100+
- Shared Buffers: 2GB
- Effective Cache: 6GB

**Databases**:

1. **labsisEG** (Legacy LABSIS system)
   - User: `labsis`
   - Password: `,U8x=]N02SX4`
   - Tables: prueba, grupo_prueba, paciente, orden_trabajo, etc.
   - Access: Read-only from application

2. **lis_bot_comunicacion** (Messaging bot)
   - User: `labsis`
   - Password: `,U8x=]N02SX4`
   - Tables: telegram_user_registry, patient_sessions, auth_tokens, etc.
   - Access: Read/Write from messaging-bot service

**Connection from App Server**:
```bash
# From application server
PGPASSWORD=',U8x=]N02SX4' psql -h ec2-3-91-26-178.compute-1.amazonaws.com -U labsis -d labsisEG

PGPASSWORD=',U8x=]N02SX4' psql -h ec2-3-91-26-178.compute-1.amazonaws.com -U labsis -d lis_bot_comunicacion
```

**Connection from Local Machine** (if Security Group allows):
```bash
PGPASSWORD=',U8x=]N02SX4' psql -h ec2-3-91-26-178.compute-1.amazonaws.com -U labsis -d labsisEG
```

---

## Security Groups

### Application Server Security Group

**Inbound Rules**:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| Custom TCP | TCP | 5173 | 0.0.0.0/0 | Frontend (public) |
| Custom TCP | TCP | 3001 | 0.0.0.0/0 | Web Backend API |
| Custom TCP | TCP | 3003 | 0.0.0.0/0 | Results API |
| Custom TCP | TCP | 3004 | 0.0.0.0/0 | Messaging Bot API |

**Outbound Rules**:
- All traffic allowed (default)

**Security Considerations**:
- Consider restricting API ports (3001, 3003, 3004) to specific IPs or using VPN
- Use nginx reverse proxy to expose only port 80/443 publicly
- Keep SSH access restricted to known IPs

---

### Database Server Security Group

**Inbound Rules**:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| PostgreSQL | TCP | 5432 | App Server SG | Database access |
| PostgreSQL | TCP | 5432 | Your IP (optional) | Remote admin access |

**Outbound Rules**:
- All traffic allowed (default)

**Security Considerations**:
- ONLY allow PostgreSQL access from application server security group
- Remove public PostgreSQL access in production
- Use SSH tunnel for remote database administration
- Enable PostgreSQL SSL connections

---

## PM2 Process Management

### PM2 Configuration

PM2 manages all Node.js services with automatic restarts and process monitoring.

**PM2 Location**:
```bash
# Find PM2 installation
which pm2
# Usually: /home/dynamtek/.nvm/versions/node/v18.20.8/bin/pm2
```

**PM2 Startup Script**:
```bash
# Enable PM2 to start on system boot
pm2 startup systemd -u dynamtek --hp /home/dynamtek

# Save current process list
pm2 save
```

---

### Service Configurations

#### Messaging Bot - ecosystem.config.cjs

Location: `~/apps/staging/apps/messaging-bot/ecosystem.config.cjs`

```javascript
module.exports = {
  apps: [{
    name: 'messaging-bot-staging',
    script: 'src/index.js',
    cwd: '/home/dynamtek/apps/staging/apps/messaging-bot',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'staging',
      PORT: 3004
    },
    error_file: '/home/dynamtek/logs/messaging-bot-error.log',
    out_file: '/home/dynamtek/logs/messaging-bot-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
};
```

**Start/Stop**:
```bash
cd ~/apps/staging/apps/messaging-bot
pm2 start ecosystem.config.cjs
pm2 stop messaging-bot-staging
pm2 restart messaging-bot-staging
pm2 delete messaging-bot-staging
```

---

#### Results API - ecosystem.config.cjs

Location: `~/apps/staging/apps/results-api/ecosystem.config.cjs`

```javascript
module.exports = {
  apps: [{
    name: 'results-api-staging',
    script: 'src/index.js',
    cwd: '/home/dynamtek/apps/staging/apps/results-api',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'staging',
      PORT: 3003
    },
    error_file: '/home/dynamtek/logs/results-api-error.log',
    out_file: '/home/dynamtek/logs/results-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

---

#### Web Backend - ecosystem.config.cjs

Location: `~/apps/staging/apps/web/ecosystem.config.cjs`

```javascript
module.exports = {
  apps: [{
    name: 'web-backend-staging',
    script: 'server/index.js',
    cwd: '/home/dynamtek/apps/staging/apps/web',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      API_PORT: 3001
    },
    error_file: '/home/dynamtek/logs/web-backend-error.log',
    out_file: '/home/dynamtek/logs/web-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

---

### PM2 Commands Reference

**Process Management**:
```bash
pm2 list                    # List all processes
pm2 status                  # Same as list
pm2 start <name>            # Start a process
pm2 stop <name>             # Stop a process
pm2 restart <name>          # Restart a process
pm2 delete <name>           # Remove process from PM2
pm2 restart all             # Restart all processes
pm2 stop all                # Stop all processes
```

**Logs**:
```bash
pm2 logs                    # Show all logs in real-time
pm2 logs <name>             # Show logs for specific process
pm2 logs --lines 100        # Show last 100 lines
pm2 logs --err              # Show only error logs
pm2 flush                   # Clear all logs
```

**Monitoring**:
```bash
pm2 monit                   # Real-time monitoring dashboard
pm2 info <name>             # Detailed process information
pm2 describe <name>         # Same as info
```

**Startup**:
```bash
pm2 startup                 # Generate startup script
pm2 save                    # Save current process list
pm2 resurrect               # Restore saved processes
pm2 unstartup               # Disable startup script
```

---

## Nginx Configuration (Optional)

For production, consider using Nginx as reverse proxy to:
- Serve frontend on port 80/443
- Proxy API requests to backend services
- Enable SSL/TLS
- Add rate limiting and security headers

**Example nginx.conf**:

```nginx
# Frontend server
server {
    listen 80;
    server_name labeg.example.com;

    # Frontend static files
    location / {
        root /home/dynamtek/apps/staging/apps/web/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # API proxies
    location /api/resultados/ {
        proxy_pass http://localhost:3003/api/resultados/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/auth/ {
        proxy_pass http://localhost:3004/api/auth/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Benefits**:
- Single entry point (port 80/443)
- Simpler Security Group rules
- Easy SSL termination with Let's Encrypt
- Better security (backend services not exposed)

---

## Network Configuration

### Current Setup (Direct Ports)

Frontend and APIs exposed directly on their respective ports:
- Frontend: `http://54.197.68.252:5173`
- Web API: `http://54.197.68.252:3001/api`
- Results API: `http://54.197.68.252:3003/api`
- Messaging Bot API: `http://54.197.68.252:3004/api`

**CORS Configuration Required**: All backends must include frontend URLs in CORS_ORIGIN

---

### Recommended Setup (Nginx Reverse Proxy)

Single entry point with path-based routing:
- Frontend: `http://labeg.example.com/`
- All APIs: `http://labeg.example.com/api/*`

**Benefits**:
- No CORS issues (same origin)
- Only port 80/443 exposed
- Easier SSL setup
- Better security

---

## Database Connection Pools

### Application Connection Configuration

All services connect to PostgreSQL using connection pooling for efficiency.

**messaging-bot-service pools**:
```javascript
// botPool - for lis_bot_comunicacion (R/W)
const botPool = new Pool({
  host: 'ec2-3-91-26-178.compute-1.amazonaws.com',
  port: 5432,
  database: 'lis_bot_comunicacion',
  user: 'labsis',
  password: ',U8x=]N02SX4',
  max: 20,                      // max connections
  idleTimeoutMillis: 30000,     // 30 seconds
  connectionTimeoutMillis: 5000  // 5 seconds
});

// labsisPool - for labsisEG (Read-only)
const labsisPool = new Pool({
  host: 'ec2-3-91-26-178.compute-1.amazonaws.com',
  port: 5432,
  database: 'labsisEG',
  user: 'labsis',
  password: ',U8x=]N02SX4',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});
```

**Connection Limits**:
- PostgreSQL max_connections: 100
- messaging-bot pools: 20 + 20 = 40
- results-api pool: 20
- web-backend pool: 20
- Total: ~80 connections (leaves headroom)

**Monitoring Connections**:
```sql
-- See active connections
SELECT datname, count(*)
FROM pg_stat_activity
GROUP BY datname;

-- See connection details
SELECT datname, usename, application_name, client_addr, state
FROM pg_stat_activity
WHERE datname IN ('labsisEG', 'lis_bot_comunicacion');
```

---

## Backup Strategy

### Database Backups

**Automated Daily Backups** (recommended):
```bash
# Create backup script
cat > /home/ubuntu/backup-databases.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/home/ubuntu/backups
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup labsisEG
PGPASSWORD=',U8x=]N02SX4' pg_dump -h localhost -U labsis labsisEG \
  | gzip > $BACKUP_DIR/labsisEG_$DATE.sql.gz

# Backup lis_bot_comunicacion
PGPASSWORD=',U8x=]N02SX4' pg_dump -h localhost -U labsis lis_bot_comunicacion \
  | gzip > $BACKUP_DIR/lis_bot_comunicacion_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /home/ubuntu/backup-databases.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /home/ubuntu/backup-databases.sh >> /home/ubuntu/backups/backup.log 2>&1
```

**Manual Backup**:
```bash
# On database server
PGPASSWORD=',U8x=]N02SX4' pg_dump -h localhost -U labsis labsisEG > labsisEG_backup.sql
PGPASSWORD=',U8x=]N02SX4' pg_dump -h localhost -U labsis lis_bot_comunicacion > bot_backup.sql

# Download to local machine
scp -i ~/Desktop/certificados/labsisapp.pem \
  ubuntu@ec2-3-91-26-178.compute-1.amazonaws.com:~/*.sql \
  ~/backups/
```

**Restore from Backup**:
```bash
# On database server
PGPASSWORD=',U8x=]N02SX4' psql -h localhost -U labsis -d labsisEG < labsisEG_backup.sql
```

---

### Application Code Backups

**Version Control** (primary backup):
- All code in Git repositories
- Regular commits and pushes to remote
- Tags for each deployment

**Server Snapshots**:
- Use AWS EC2 snapshots for complete server backups
- Create snapshot before major deployments
- Retention: Keep last 3 snapshots

---

## Monitoring and Alerts

### Service Health Checks

**PM2 Built-in Monitoring**:
```bash
pm2 monit  # Real-time dashboard
```

**Custom Health Endpoints**:

Add to each service:
```javascript
// /health endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseConnection();
  res.json({
    status: dbHealth ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    service: 'messaging-bot-staging',
    uptime: process.uptime()
  });
});
```

**External Monitoring** (recommended):
- Use UptimeRobot or similar
- Monitor health endpoints every 5 minutes
- Alert on downtime via email/SMS

---

### Log Monitoring

**Centralized Logging**:
```bash
# View all logs together
pm2 logs --lines 100

# Search for errors
pm2 logs | grep -i error

# Follow specific service
pm2 logs messaging-bot-staging -f
```

**Log Rotation**:
```bash
# Install PM2 log rotate module
pm2 install pm2-logrotate

# Configure rotation
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## Disaster Recovery

### Service Recovery

**If a service crashes**:
```bash
# Check status
pm2 status

# View logs for error details
pm2 logs <service-name> --lines 100 --err

# Restart service
pm2 restart <service-name>

# If restart fails, delete and recreate
pm2 delete <service-name>
cd ~/apps/staging/apps/<service-dir>
pm2 start ecosystem.config.cjs
```

**If all services are down**:
```bash
pm2 resurrect  # Restore saved process list
# or
pm2 start ~/apps/staging/apps/*/ecosystem.config.cjs
```

---

### Database Recovery

**If database is corrupted**:
```bash
# Restore from latest backup
PGPASSWORD=',U8x=]N02SX4' psql -h localhost -U labsis -d labsisEG < latest_backup.sql
```

**If database connection fails**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connections
PGPASSWORD=',U8x=]N02SX4' psql -h localhost -U labsis -d labsisEG -c "SELECT 1"
```

---

### Server Recovery

**If server becomes unresponsive**:
1. Reboot from AWS Console
2. SSH in and check PM2: `pm2 status`
3. Check system resources: `top`, `df -h`, `free -m`
4. Review system logs: `sudo journalctl -xe`

**If server is compromised**:
1. Take immediate snapshot
2. Launch new EC2 instance from snapshot
3. Update Security Groups
4. Update DNS records
5. Investigate compromise on old instance

---

## Performance Optimization

### Application Level

**Node.js Tuning**:
```bash
# Set max memory for Node.js
export NODE_OPTIONS="--max-old-space-size=2048"
```

**Database Query Optimization**:
- Add indexes on frequently queried columns
- Use connection pooling (already implemented)
- Cache frequently accessed data (Redis/Memcached)

---

### Infrastructure Level

**Vertical Scaling** (upgrade instance):
- Upgrade to t2.large (4GB RAM, 2 vCPUs)
- Or t3.medium (4GB RAM, 2 vCPUs, better performance)

**Horizontal Scaling** (multiple instances):
- Use PM2 cluster mode for CPU-intensive tasks
- Add load balancer (ALB) for multiple app servers
- Database read replicas for read-heavy workloads

**Caching**:
- Add ElastiCache Redis for session storage
- Cache frequent database queries
- Use CloudFront for static asset delivery

---

## Cost Optimization

### Current Monthly Costs (Estimated)

- EC2 Application Server (t2.medium): ~$33/month
- EC2 Database Server (t2.medium): ~$33/month
- Data Transfer: ~$10/month
- **Total**: ~$76/month

### Optimization Strategies

1. **Reserved Instances**: Save 30-60% by committing 1-3 years
2. **Auto Stop/Start**: Stop non-production instances during off-hours
3. **Right-Sizing**: Monitor usage and downgrade if over-provisioned
4. **Spot Instances**: Use for dev/test environments (up to 90% savings)

---

## Security Best Practices

### Current Security Measures

- ✅ SSH key-based authentication
- ✅ Security Groups restrict access
- ✅ PostgreSQL not publicly accessible
- ✅ Application-level authentication (JWT)
- ✅ HTTPS for Telegram webhook (required)

### Recommended Improvements

- [ ] Enable SSL/TLS for all API endpoints
- [ ] Use AWS Secrets Manager for credentials
- [ ] Enable AWS CloudWatch for monitoring
- [ ] Set up AWS CloudTrail for audit logging
- [ ] Enable MFA for AWS console access
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Implement rate limiting on APIs
- [ ] Add WAF (Web Application Firewall)
- [ ] Use AWS Parameter Store for .env files
- [ ] Enable VPC Flow Logs

---

## Useful AWS CLI Commands

**EC2 Management**:
```bash
# List instances
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,PublicDnsName,State.Name]' --output table

# Start instance
aws ec2 start-instances --instance-ids i-1234567890abcdef0

# Stop instance
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Reboot instance
aws ec2 reboot-instances --instance-ids i-1234567890abcdef0

# Create snapshot
aws ec2 create-snapshot --volume-id vol-1234567890abcdef0 --description "Pre-deployment snapshot"
```

**Security Group Management**:
```bash
# List security groups
aws ec2 describe-security-groups --output table

# Add inbound rule
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 3004 \
  --cidr 0.0.0.0/0
```

---

## Quick Reference

### Service URLs

| Service | Local Dev | AWS Staging |
|---------|-----------|-------------|
| Frontend | http://localhost:5173 | http://54.197.68.252:5173 |
| Web API | http://localhost:3001/api | http://54.197.68.252:3001/api |
| Results API | http://localhost:3003/api | http://54.197.68.252:3003/api |
| Messaging Bot API | http://localhost:3004/api | http://54.197.68.252:3004/api |

### Database URLs

| Database | Host | Port | User | Password |
|----------|------|------|------|----------|
| labsisEG | ec2-3-91-26-178.compute-1.amazonaws.com | 5432 | labsis | ,U8x=]N02SX4 |
| lis_bot_comunicacion | ec2-3-91-26-178.compute-1.amazonaws.com | 5432 | labsis | ,U8x=]N02SX4 |

### SSH Connections

```bash
# Application server
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@54.197.68.252

# Database server
ssh -i ~/Desktop/certificados/labsisapp.pem ubuntu@ec2-3-91-26-178.compute-1.amazonaws.com
```

---

**Last Updated**: 2025-10-30
**Related Docs**: [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md), [ENVIRONMENT-SEPARATION.md](ENVIRONMENT-SEPARATION.md)
