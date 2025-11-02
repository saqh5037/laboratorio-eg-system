# Laboratorio EG - System Documentation

Complete documentation for deployment, troubleshooting, and maintenance of the Laboratorio EG system.

**Last Updated**: October 30, 2025
**Environment**: AWS Staging (Production Ready)
**Status**: ✅ Fully Operational

---

## 📚 Documentation Index

### 1. [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)
**Purpose**: Step-by-step guide for deploying to AWS staging environment

**Use this when**:
- Deploying new code to AWS staging
- Setting up a new staging environment
- Applying database migrations
- Troubleshooting deployment issues

**Key Sections**:
- Pre-deployment cleanup checklist
- Service deployment (messaging-bot, results-api, web-backend, frontend)
- Database migration procedures
- Post-deployment verification
- Rollback procedures

**Time to Deploy**: 30-45 minutes (excluding build time)

---

### 2. [ENVIRONMENT-SEPARATION.md](ENVIRONMENT-SEPARATION.md)
**Purpose**: Guidelines for maintaining separate development and staging environments

**Use this when**:
- Starting local development
- Switching between environments
- Debugging environment-specific issues
- Configuring .env files

**Critical Principles**:
- NEVER run local dev and AWS staging simultaneously
- Use separate Telegram bot tokens
- Build frontend for correct target environment
- No localhost URLs in AWS builds

**Key Sections**:
- Local vs AWS configuration
- Switching between environments
- Common mistakes to avoid
- Database separation strategy
- Telegram bot token management

---

### 3. [AWS-INFRASTRUCTURE.md](AWS-INFRASTRUCTURE.md)
**Purpose**: Complete AWS infrastructure documentation

**Use this when**:
- Understanding system architecture
- Configuring Security Groups
- Managing PM2 processes
- Setting up backups
- Planning capacity or scaling

**Key Sections**:
- EC2 instance details (app + database servers)
- Security Group configurations
- PM2 process management
- Network configuration
- Database connection pools
- Backup strategies
- Disaster recovery procedures
- Cost optimization

**Infrastructure**:
- Application Server: 54.197.68.252
- Database Server: ec2-3-91-26-178.compute-1.amazonaws.com

---

### 4. [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
**Purpose**: Comprehensive error reference with solutions

**Use this when**:
- Encountering errors during development or deployment
- Debugging authentication issues
- Resolving CORS errors
- Fixing Telegram bot conflicts
- Diagnosing service startup problems

**Categories**:
- Authentication Issues
- Database Errors
- CORS Errors
- Telegram Bot Issues (409 conflicts)
- Deployment Issues
- Service Startup Problems
- Network and Connection Issues
- Build and Configuration Issues

**Each error includes**:
- Symptom description
- Error message
- Root cause explanation
- Step-by-step solution
- Prevention tips

---

### 5. [DATABASE-SEPARATION-COMPLETE.md](../messaging-bot-service/docs/DATABASE-SEPARATION-COMPLETE.md)
**Purpose**: Documentation of dual-database architecture implementation

**Use this when**:
- Understanding the database architecture
- Determining which pool to use (botPool vs labsisPool)
- Understanding table ownership
- Planning database changes

**Key Sections**:
- Architecture overview (2 databases)
- Benefits of separation
- Connection pool usage
- Table migration history
- AWS staging deployment update

**Databases**:
- `lis_bot_comunicacion` - Bot communications (R/W)
- `labsisEG` - Legacy LABSIS system (Read-only from bot)

---

## 🚀 Quick Start Guides

### First Time Setup - Local Development

1. Clone repositories
2. Install dependencies: `npm install`
3. Create `.env.local` files with localhost configuration
4. Start PostgreSQL locally
5. Create databases: `lis_bot_comunicacion` and `labsisEG`
6. Run migrations
7. Start services: `npm run dev`

**Detailed Guide**: See [ENVIRONMENT-SEPARATION.md](ENVIRONMENT-SEPARATION.md#local-development-environment)

---

### Deploying to AWS Staging

1. Stop ALL local services
2. Build frontend: `npm run build:staging`
3. Verify build contains AWS URLs
4. Deploy services via rsync
5. Run `npm install` on server
6. Apply database migrations
7. Restart PM2 processes
8. Verify all services online

**Detailed Guide**: See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)

---

## 🔍 Common Tasks

### How to...

**...start local development?**
→ [ENVIRONMENT-SEPARATION.md - Before Starting Development](ENVIRONMENT-SEPARATION.md#before-starting-development-local)

**...deploy to AWS?**
→ [DEPLOYMENT-GUIDE.md - Step-by-Step Deployment](DEPLOYMENT-GUIDE.md#step-by-step-deployment-process)

**...fix CORS errors?**
→ [TROUBLESHOOTING.md - CORS Errors](TROUBLESHOOTING.md#cors-errors)

**...resolve Telegram bot 409 conflicts?**
→ [TROUBLESHOOTING.md - Telegram Bot Issues](TROUBLESHOOTING.md#error-409-conflict-terminated-by-other-getupdates-request---critical)

**...apply a database migration?**
→ [DEPLOYMENT-GUIDE.md - Database Migrations](DEPLOYMENT-GUIDE.md#step-4-database-migrations)

**...check if services are running?**
→ [TROUBLESHOOTING.md - Quick Diagnostic Commands](TROUBLESHOOTING.md#quick-diagnostic-commands)

**...understand which database pool to use?**
→ [DATABASE-SEPARATION-COMPLETE.md - Uso en Servicios](../messaging-bot-service/docs/DATABASE-SEPARATION-COMPLETE.md#uso-en-servicios)

**...configure PM2?**
→ [AWS-INFRASTRUCTURE.md - PM2 Process Management](AWS-INFRASTRUCTURE.md#pm2-process-management)

---

## ⚠️ Critical Information

### Must-Know Before Deploying

1. **NEVER run local and AWS simultaneously**
   - Telegram bot will have 409 conflicts
   - Confusing debugging with mixed logs
   - Risk of data corruption

2. **Always build frontend with correct environment**
   - Local: `npm run dev`
   - AWS: `npm run build:staging`
   - Verify: `grep -r "localhost" dist/` should return EMPTY for AWS builds

3. **CORS must be configured in ALL backends**
   - messaging-bot/src/index.js
   - results-service/src/index.js
   - apps/web/server/index.js
   - Must parse comma-separated origins

4. **Database migrations must be applied before code deployment**
   - Risk: New code expects schema changes
   - Always run migrations first
   - Verify structure before restart

5. **JWT tokens are ~345 characters**
   - VARCHAR(255) is insufficient
   - Use TEXT column type
   - Migration 004 fixes this

---

## 📊 System Overview

### Services Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     INTERNET                            │
└───────────────────────┬─────────────────────────────────┘
                        │
         ┌──────────────▼────────────────┐
         │   54.197.68.252              │
         │   AWS EC2 App Server         │
         │                               │
         │  ┌─────────────────────────┐ │
         │  │ Frontend (5173)         │ │
         │  │ - React + Vite          │ │
         │  └─────────────────────────┘ │
         │                               │
         │  ┌─────────────────────────┐ │
         │  │ Web Backend (3001)      │ │
         │  │ - Express + PostgreSQL  │ │
         │  └─────────────────────────┘ │
         │                               │
         │  ┌─────────────────────────┐ │
         │  │ Results API (3003)      │ │
         │  │ - Express + PostgreSQL  │ │
         │  └─────────────────────────┘ │
         │                               │
         │  ┌─────────────────────────┐ │
         │  │ Messaging Bot (3004)    │ │
         │  │ - Telegraf + PostgreSQL │ │
         │  └─────────────────────────┘ │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼────────────────┐
         │   ec2-3-91-26-178...          │
         │   AWS EC2 DB Server           │
         │                                │
         │  PostgreSQL 12+                │
         │  ├── labsisEG                 │
         │  └── lis_bot_comunicacion     │
         └────────────────────────────────┘
```

### Technology Stack

**Frontend**:
- React 18
- Vite
- React Router
- Framer Motion
- Fuse.js (search)

**Backend**:
- Node.js 18.20.8
- Express.js
- PostgreSQL 12+
- Telegraf (Telegram bot)
- JWT authentication

**Infrastructure**:
- AWS EC2 (Ubuntu)
- PM2 process manager
- PostgreSQL (dual-database)
- Nginx (optional)

---

## 📝 Recent Changes

### October 30, 2025 - AWS Staging Deployment ✅

**Major Changes**:
1. Deployed all services to AWS staging
2. Fixed critical CORS parsing bug
3. Fixed VARCHAR(255) token limit (migration 004)
4. Established environment separation principles
5. Created comprehensive documentation

**Issues Resolved**:
- Telegram bot 409 conflicts
- CORS errors on AWS
- Frontend built with wrong URLs
- PM2 ES module errors
- Database connection timeouts

**Files Modified**:
- messaging-bot-service/src/index.js (CORS fix)
- results-service/src/index.js (CORS fix)
- apps/web/server/index.js (CORS fix)
- All ecosystem.config.js → ecosystem.config.cjs
- Migration 004 applied to AWS database

**Documentation Created**:
- DEPLOYMENT-GUIDE.md (500+ lines)
- ENVIRONMENT-SEPARATION.md (600+ lines)
- AWS-INFRASTRUCTURE.md (700+ lines)
- TROUBLESHOOTING.md (800+ lines)
- This README.md

---

## 🎯 Success Metrics

### Deployment Success Indicators

✅ All PM2 processes showing "online"
✅ No errors in `pm2 logs --lines 100`
✅ Frontend accessible at both IP and hostname URLs
✅ No CORS errors in browser console
✅ Telegram bot responding to commands
✅ Authentication flow working end-to-end
✅ Database queries executing successfully
✅ No 409 Telegram conflicts

### Testing Checklist

- [ ] Frontend loads at http://54.197.68.252:5173
- [ ] Authentication by cédula works
- [ ] Telegram authorization generates deep link
- [ ] Bot responds to /start command with token
- [ ] Code verification succeeds
- [ ] JWT session created and stored
- [ ] Results page loads with authenticated data
- [ ] CORS working from both IP and hostname
- [ ] PM2 logs show no errors
- [ ] Database connections stable

---

## 🛠️ Maintenance

### Daily Tasks
- Monitor PM2 logs: `pm2 logs --lines 100`
- Check service status: `pm2 status`

### Weekly Tasks
- Review error logs
- Check database disk usage
- Verify backups running

### Monthly Tasks
- Update dependencies
- Review Security Group rules
- Optimize database queries
- Review PM2 resource usage

### As Needed
- Apply database migrations
- Deploy new features
- Troubleshoot issues
- Scale infrastructure

---

## 📞 Support and Contacts

### Documentation Locations

**Main Docs**: `/Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/docs/`

**Database Docs**: `/Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/messaging-bot-service/docs/`

### Key Files

**Environment Configuration**:
- Local: `.env.local` (each service)
- AWS: `.env` on server (~/apps/staging/apps/*/​.env)

**Deployment Scripts**:
- Frontend: `npm run build:staging` in apps/web
- Services: PM2 ecosystem.config.cjs files

**Database Migrations**:
- Location: messaging-bot-service/migrations/lis_bot_comunicacion/
- Apply: `psql -h HOST -U labsis -d lis_bot_comunicacion < migration.sql`

---

## 🎓 Learning Resources

### Understanding the System

**New to the project?** Start here:
1. Read [DATABASE-SEPARATION-COMPLETE.md](../messaging-bot-service/docs/DATABASE-SEPARATION-COMPLETE.md) - Understand dual-database architecture
2. Read [ENVIRONMENT-SEPARATION.md](ENVIRONMENT-SEPARATION.md) - Learn environment principles
3. Review [AWS-INFRASTRUCTURE.md](AWS-INFRASTRUCTURE.md) - Understand infrastructure

**Ready to deploy?**
1. Read [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) completely
2. Review pre-deployment checklist
3. Have [TROUBLESHOOTING.md](TROUBLESHOOTING.md) open while deploying

**Encountering errors?**
1. Search [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for error message
2. Check [Quick Diagnostic Commands](TROUBLESHOOTING.md#quick-diagnostic-commands)
3. Review environment configuration

---

## 🔮 Future Enhancements

### Short Term (Next 2 Weeks)
- [ ] Implement nginx reverse proxy
- [ ] Configure SSL/TLS with Let's Encrypt
- [ ] Set up automated backups
- [ ] Implement health check endpoints

### Medium Term (Next Month)
- [ ] CI/CD pipeline with GitHub Actions
- [ ] CloudWatch monitoring and alerts
- [ ] Database read replicas
- [ ] Redis caching layer

### Long Term (Next Quarter)
- [ ] WhatsApp bot integration
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

## 📜 Version History

### v2.0.0 - October 30, 2025
- ✅ AWS staging deployment complete
- ✅ Dual-database architecture in production
- ✅ Telegram authorization flow working
- ✅ Comprehensive documentation created

### v1.5.0 - October 29, 2025
- ✅ Database separation implemented locally
- ✅ Dual connection pools (botPool + labsisPool)
- ✅ All migrations created and applied

### v1.0.0 - Earlier
- Initial implementation
- Single database architecture
- Basic Telegram bot functionality

---

## 🤝 Contributing

### Before Making Changes

1. Understand the dual-database architecture
2. Know which pool to use (botPool vs labsisPool)
3. Test locally before deploying to AWS
4. Update documentation if changing architecture

### Deployment Process

1. Make changes in local development
2. Test thoroughly with local services
3. Stop all local services
4. Build for staging: `npm run build:staging`
5. Deploy following [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)
6. Verify on AWS staging
7. Update documentation if needed

---

## ⚡ Quick Links

**AWS Console**: https://console.aws.amazon.com/

**Frontend (Staging)**: http://54.197.68.252:5173

**APIs (Staging)**:
- Web Backend: http://54.197.68.252:3001/api
- Results API: http://54.197.68.252:3003/api
- Messaging Bot: http://54.197.68.252:3004/api

**SSH to App Server**:
```bash
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@54.197.68.252
```

**SSH to DB Server**:
```bash
ssh -i ~/Desktop/certificados/labsisapp.pem ubuntu@ec2-3-91-26-178.compute-1.amazonaws.com
```

**PM2 Dashboard**:
```bash
ssh ubuntu@54.197.68.252
pm2 monit
```

---

**Documentation Maintained By**: Claude (Anthropic)
**Last Full Review**: October 30, 2025
**Next Review Due**: November 30, 2025

---

*For questions or issues with this documentation, please create an issue in the project repository.*
