# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Laboratorio EG System** is a comprehensive medical laboratory management system for Laboratorio Elizabeth Gutiérrez (43+ years experience in Caracas, Venezuela). It's a **Turborepo monorepo** with 5 applications + 2 shared packages.

## Quick Reference

### Development Commands (from root)

```bash
npm install              # Install all dependencies
npm run dev              # Start all services in parallel (Turborepo)
npm run build            # Build all services
npm run lint             # Lint all services

# Individual services
npm run dev:web          # Frontend PWA only (port 5173)
npm run dev:api          # Results API only (port 3003)
npm run dev:sync         # Sync service only (port 3002)
npm run dev:bot          # Messaging bot only (port 3004)

# Alternative start/stop scripts
npm run start:all        # ./scripts/start-dev.sh
npm run stop:all         # ./scripts/stop-dev.sh
```

### Per-App Commands

**apps/web** (React PWA):
```bash
npm run dev              # Vite dev server
npm run server           # Backend API (port 3001)
npm run dev:all          # Both frontend + backend
npm run build            # Production build
npm run lint             # ESLint
npm run type-check       # TypeScript check
npm run db:test          # Test PostgreSQL connection
```

**apps/results-api** (Express):
```bash
npm run dev              # Dev mode with --watch
npm start                # Production mode
```

**apps/sync-service** (PostgreSQL LISTEN/NOTIFY):
```bash
npm run verify-db        # Verify DB connection and triggers
npm run install-triggers # Install PostgreSQL triggers
npm run dev              # Dev mode with --watch
npm run manual-sync      # Force sync
```

**apps/messaging-bot** (Telegram/WhatsApp):
```bash
npm run dev              # Dev mode with nodemon
npm run migrate          # Run database migrations
npm run lint             # ESLint
npm run format           # Prettier
```

**apps/config-api** (Configuration service):
```bash
npm run dev              # Dev mode with nodemon
npm start                # Production mode
```

## Architecture

### Monorepo Structure

```
laboratorio-eg-system/
├── apps/
│   ├── web/              # PWA Frontend (React 19 + Vite) - Port 5173
│   ├── results-api/      # Patient Results API (Express) - Port 3003
│   ├── sync-service/     # Price Sync (PostgreSQL LISTEN/NOTIFY) - Port 3002
│   ├── messaging-bot/    # Telegram/WhatsApp Bot + Gemini AI - Port 3004
│   └── config-api/       # Centralized Config API - Port 3005/3006
├── packages/
│   ├── database/         # Shared DB schemas and migrations
│   └── shared/           # Shared utilities (currently minimal)
├── docs/                 # Documentation (35+ files)
└── .github/workflows/    # CI/CD (7 workflows)
```

### Service Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    labsisEG (PostgreSQL)                         │
│    Laboratory Management System Database (511 medical studies)   │
└────────────────┬─────────────────────────────────────────────────┘
                 │ LISTEN/NOTIFY triggers
                 ▼
        ┌────────────────────┐
        │   sync-service     │ ← Real-time price sync
        │   Port 3002        │   Generates precios.json
        └────────┬───────────┘
                 │
    ┌────────────┼────────────┬────────────────┐
    ▼            ▼            ▼                ▼
┌─────────┐ ┌─────────┐ ┌───────────┐  ┌────────────┐
│ web     │ │results- │ │messaging- │  │ config-api │
│ :5173   │ │api:3003 │ │bot :3004  │  │ :3005/3006 │
│         │ │         │ │           │  │            │
│ React   │ │ Express │ │ Telegram  │  │ Express    │
│ PWA     │ │ JWT/PDF │ │ WhatsApp  │  │ WebSocket  │
└─────────┘ └─────────┘ │ Gemini AI │  │ Cache      │
                        └───────────┘  └────────────┘
```

### Data Flow for Price Updates

1. User changes price in labsisEG → PostgreSQL UPDATE
2. Database trigger fires → NOTIFY 'precio_cambio'
3. sync-service receives notification → debounce 2s
4. Queries 511 studies → generates JSON → copies to web app
5. Vite HMR detects change → updates UI without reload
6. **Total time: ~2-5 seconds**

### apps/web Key Architecture

**Tech Stack:** React 19, Vite 7.1.2, Tailwind CSS, React Router v7, PWA

**Critical Files:**
- `src/App.jsx` - Router with lazy loading + Error Boundaries
- `src/layouts/MainLayout.jsx` - Primary layout wrapper
- `src/contexts/ThemeContext.jsx` - Dark/light mode
- `src/contexts/UnifiedAppContext.jsx` - Global state (favorites, cart, filters)
- `src/services/api.js` - HTTP client with offline fallback
- `src/adapters/studyAdapter.js` - Backend ↔ Frontend data conversion
- `public/sw.js` - Service Worker (offline caching)

**Data Sources (priority order):**
1. Express API (port 3001) - Direct PostgreSQL
2. JSON from sync-service - Real-time via triggers
3. Static fallback (`src/data/`) - Offline support

### apps/messaging-bot Key Architecture

**Module Type:** CommonJS (NOT ES modules)
**Platforms:** Telegram (node-telegram-bot-api), WhatsApp (Twilio), AI (Gemini)

Uses Adapter pattern for multi-platform messaging abstraction.

## Databases

### labsisEG (Primary - Laboratory Data)
- **Connection:** localhost:5432, user: labsis
- **Schema:** `laboratorio`
- **Key Tables:** `listaspreciodetalle`, `estudios`, `categorias`, `grupos`
- **Price List ID 27:** "Ambulatorio_Abril_2025" (USD, 511 studies)

### lis_bot_comunicacion (Bot & Config)
- **Connection:** localhost:5432, user: labsis
- **Used by:** messaging-bot, config-api
- **Migrations:** `apps/config-api/migrations/` (13 SQL files)

## Environment Configuration

Each app has its own `.env`. Key variables:

```bash
# Database (all apps)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=labsisEG
DB_USER=labsis
DB_PASSWORD=labsis

# sync-service specific
LABSIS_DB=labsisEG
LISTA_PRECIOS_ID=27
DEBOUNCE_MS=2000
AUTO_COPY_TO_WEB=true

# messaging-bot
TELEGRAM_BOT_TOKEN=...
TWILIO_ACCOUNT_SID=...
GEMINI_API_KEY=...

# JWT (results-api, config-api)
JWT_SECRET=...
JWT_EXPIRATION=24h
```

## Design System

**EG Brand Colors:**
- Primary Purple: `#7B68A6` (eg-purple)
- Secondary Pink: `#DDB5D5` / `#E8C4DD` (eg-pink)
- Gray: `#8B8C8E` / `#76767A`

**Medical Category Icons:** Hematología 🩸, Química 🧪, Microbiología 🦠, Inmunología 🛡️, Hormonas ⚗️

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| 01-ci-tests.yml | Push/PR | Tests, lint, build |
| 02-deploy-staging.yml | Push to `develop` | Auto-deploy staging |
| 03-deploy-production.yml | Manual | Production deploy |
| 04-rollback.yml | Manual | Rollback |
| 05-database-migration.yml | Manual | DB migrations |
| 06-create-release.yml | Push tag `v*.*.*` | Auto-create Release |
| 07-deploy-aws-production.yml | Manual | AWS EC2 deploy |

**Production:** AWS EC2 54.197.68.252:8080/labsis

## Key Patterns

### Data Adapter Pattern (apps/web)
```javascript
import { StudyAdapter } from '../adapters/studyAdapter';
const frontendStudy = StudyAdapter.fromBackend(backendData);
const cartItem = StudyAdapter.toCart(study);
```

### Offline Fallback (apps/web)
API service automatically tries backend, falls back to static JSON on error.

### Multi-Platform Messaging (apps/messaging-bot)
Uses Adapter pattern to abstract Telegram/WhatsApp/AI behind unified interface.

## Troubleshooting

### Database Connection
```bash
# Test connection
PGPASSWORD=labsis psql -h localhost -U labsis -d labsisEG -c "SELECT version();"

# Verify sync-service triggers
cd apps/sync-service && npm run verify-db
```

### Price Sync Not Working
1. Check sync-service running: `curl http://localhost:3002/health`
2. Verify triggers: `npm run verify-db`
3. Force sync: `curl -X POST http://localhost:3002/api/sync`
4. Check logs: `tail -f apps/sync-service/logs/combined-*.log`

### Port Conflicts
- web: 5173 (Vite), 3001 (backend API)
- results-api: 3003
- sync-service: 3002
- messaging-bot: 3004
- config-api: 3005 (HTTP), 3006 (WebSocket)

## Important Notes

- **Node.js 18+** required
- **PostgreSQL 14+** required
- apps/web and apps/results-api use **ES modules** (`"type": "module"`)
- apps/messaging-bot and apps/config-api use **CommonJS** (`"type": "commonjs"`)
- sync-service uses database `labsisEG` (production), NOT `labsis_dev`
- Price list ID 27 = current active list (USD)
- Favorites/cart persist in localStorage for offline access

## Multi-Laboratory Deployment

The system supports deploying independent instances for multiple laboratories from a single codebase.

### Architecture

```
                GitHub Repository (single codebase)
                            │
                            ▼
                    Docker Images (generic)
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
       Lab EG          Dimogen         Microtec
    (instance 1)     (instance 2)    (instance 3)
```

### Key Principles

1. **Single Codebase**: All customization happens at runtime via environment variables and database configuration
2. **Dynamic Branding**: Company name, logos, colors loaded from `config-api` (`company_info` table)
3. **Dynamic PWA Manifest**: Generated at runtime from `/api/pwa/manifest`
4. **Separate Databases**: Each instance has its own `labsisXX` + `lis_bot_comunicacionXX`

### Deployment Tools

```
deployment/
├── setup-new-instance.sh    # Interactive script to create new instance
├── templates/
│   ├── .env.template        # Environment variable template
│   └── docker-compose.template.yml  # Docker Compose template
└── instances/               # Generated configs (gitignored)
    ├── eg/
    ├── dimogen/
    └── microtec/
```

### Creating New Instance

```bash
cd deployment
./setup-new-instance.sh
# Follow prompts to configure: lab code, databases, URLs, tokens
```

### Docker Images

Built via GitHub Actions (`08-build-docker-images.yml`), published to `ghcr.io`:

| Image | Purpose |
|-------|---------|
| `lab-web` | Frontend PWA (Nginx) |
| `lab-config-api` | Configuration API |
| `lab-results-api` | Patient results |
| `lab-messaging-bot` | Telegram/WhatsApp |
| `lab-sync-service` | Price sync |

### Runtime Configuration

Each lab instance configures its branding via the admin panel:
- **Company Info**: Name, contact, social media (`/api/company`)
- **Theme**: Colors, fonts (`/api/theme`)
- **PWA**: App name, icons (auto-generated from company_info)

All hardcoded lab-specific values have been removed from the frontend code.
