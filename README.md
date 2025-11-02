# 🏥 Sistema Laboratorio Elizabeth Gutiérrez

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.18-blue.svg)](https://www.postgresql.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-red.svg)](https://turbo.build/)

[![CI Tests](https://github.com/saqh5037/laboratorio-eg-system/actions/workflows/01-ci-tests.yml/badge.svg)](https://github.com/saqh5037/laboratorio-eg-system/actions/workflows/01-ci-tests.yml)
[![Deploy Staging](https://github.com/saqh5037/laboratorio-eg-system/actions/workflows/02-deploy-staging.yml/badge.svg)](https://github.com/saqh5037/laboratorio-eg-system/actions/workflows/02-deploy-staging.yml)
[![Deploy Production](https://github.com/saqh5037/laboratorio-eg-system/actions/workflows/03-deploy-production.yml/badge.svg)](https://github.com/saqh5037/laboratorio-eg-system/actions/workflows/03-deploy-production.yml)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./docs/PR-TEMPLATE.md)
[![Deployment Status](https://img.shields.io/badge/Deployment-Professional-success.svg)](./docs/DEPLOYMENT-SUMMARY.md)

Sistema completo de gestión para laboratorio clínico con PWA, portal de resultados y sincronización automática.

## 📦 Servicios

Este monorepo contiene 4 servicios principales:

### 🌐 [apps/web](./apps/web) - Progressive Web App
- **Stack:** React 19 + Vite + Tailwind CSS
- **Puerto:** 5173
- **Funcionalidades:**
  - ✅ Catálogo de 513 estudios médicos
  - ✅ Búsqueda avanzada con fuzzy search
  - ✅ PWA instalable (offline-first)
  - ✅ Dashboard de salud con gráficas
  - ✅ Sistema de favoritos
  - ✅ Optimización móvil completa

### 🔐 [apps/results-api](./apps/results-api) - API de Resultados
- **Stack:** Node.js + Express + PostgreSQL
- **Puerto:** 3003
- **Funcionalidades:**
  - ✅ Autenticación segura (JWT)
  - ✅ Portal de resultados para pacientes
  - ✅ Generación de PDFs
  - ✅ Histórico de análisis
  - ✅ Interpretación automática (normal/alto/bajo)

### 🔄 [apps/sync-service](./apps/sync-service) - Sincronización Automática
- **Stack:** Node.js + PostgreSQL LISTEN/NOTIFY
- **Puerto:** 3002 (internal)
- **Funcionalidades:**
  - ✅ Sincronización automática de precios
  - ✅ Debounce inteligente (2 segundos)
  - ✅ Triggers en PostgreSQL
  - ✅ Propagación en tiempo real

### 🤖 [apps/messaging-bot](./apps/messaging-bot) - Bot Multi-Plataforma
- **Stack:** Node.js + Telegram API + Gemini AI
- **Puerto:** 3004
- **Funcionalidades:**
  - ✅ Bot de Telegram integrado
  - ✅ IA conversacional con Gemini
  - ✅ Gestión de presupuestos y citas
  - ✅ Notificaciones automáticas
  - ✅ Detección de cambios en órdenes

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/saqh5037/laboratorio-eg-system.git
cd laboratorio-eg-system

# Instalar todas las dependencias (monorepo)
npm install

# Configurar variables de entorno
cp apps/web/.env.example apps/web/.env
cp apps/results-api/.env.example apps/results-api/.env
cp apps/sync-service/.env.example apps/sync-service/.env
# Editar los archivos .env con tus credenciales
```

### Desarrollo

```bash
# Iniciar todos los servicios en paralelo
npm run dev

# O iniciar servicios individualmente
npm run dev:web         # Solo frontend
npm run dev:api         # Solo API de resultados
npm run dev:sync        # Solo servicio de sincronización
npm run dev:bot         # Solo bot de mensajería
```

Servicios disponibles en:
- **Frontend:** http://localhost:5173
- **Results API:** http://localhost:3003
- **Sync Service:** Puerto 3002 (listener interno)
- **Messaging Bot:** http://localhost:3004

### Build de Producción

```bash
# Build de todos los servicios
npm run build

# Lint
npm run lint

# Tests
npm run test
```

## 📁 Estructura del Monorepo

```
laboratorio-eg-system/
│
├── apps/
│   ├── web/              # Frontend PWA (React + Vite)
│   ├── results-api/      # API de resultados (Node + Express)
│   ├── sync-service/     # Servicio de sincronización
│   └── messaging-bot/    # Bot de Telegram/WhatsApp con IA
│
├── packages/
│   ├── database/         # Esquemas y migraciones de PostgreSQL
│   └── shared/           # Código compartido entre servicios
│
├── docs/                 # Documentación completa
│   ├── RESUMEN-PROYECTO-COMPLETO.md
│   ├── DEPLOYMENT_PRODUCTION.md
│   ├── SINCRONIZACION-AUTOMATICA.md
│   └── ...
│
├── .github/
│   └── workflows/        # CI/CD con GitHub Actions
│
├── package.json          # Root package con workspaces
├── turbo.json            # Configuración de Turborepo
└── README.md             # Este archivo
```

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Framework UI
- **Vite 7** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animaciones
- **Recharts** - Gráficas interactivas
- **Fuse.js** - Búsqueda fuzzy

### Backend
- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **PostgreSQL 14.18** - Base de datos
- **JWT** - Autenticación
- **Winston** - Logging
- **Puppeteer** - Generación de PDFs

### DevOps
- **Turborepo** - Gestión de monorepo
- **GitHub Actions** - CI/CD
- **PM2** - Process manager (producción)

## 📚 Documentación

La documentación completa está disponible en la carpeta [`docs/`](./docs):

### Documentación General
- **[Resumen del Proyecto](./docs/RESUMEN-PROYECTO-COMPLETO.md)** - Inventario completo
- **[Arquitectura](./docs/ARQUITECTURA_LABORATORIO_EG.excalidraw.json)** - Diagrama visual
- **[Inicio Rápido](./docs/README-INICIO-RAPIDO.md)** - Quick start guide
- **[Sincronización](./docs/SINCRONIZACION-AUTOMATICA.md)** - Sistema de sync

### Deployment y DevOps
- **[🚀 Deployment Summary](./docs/DEPLOYMENT-SUMMARY.md)** - Workflow completo de deployment profesional
- **[Branch Protection Setup](./docs/GITHUB-BRANCH-PROTECTION-SETUP.md)** - Configuración de branch protection
- **[Monitoring Setup](./docs/MONITORING-SETUP.md)** - Configuración de UptimeRobot
- **[Pull Request Template](./docs/PR-TEMPLATE.md)** - Template para PRs
- **[Deployment Production](./docs/DEPLOYMENT_PRODUCTION.md)** - Guía legacy de producción

## 🎯 Funcionalidades Destacadas

### PWA (Progressive Web App)
- ✅ Instalable en móviles y desktop
- ✅ Funciona offline
- ✅ Actualizaciones automáticas
- ✅ Service Worker activo

### Portal de Resultados
- ✅ Autenticación segura
- ✅ Visualización de análisis
- ✅ Descarga de PDFs
- ✅ Histórico completo
- ✅ Gráficas de tendencias

### Dashboard de Salud
- ✅ Análisis histórico por prueba
- ✅ Comparación de grupos
- ✅ Heat Map de evolución
- ✅ Alertas de valores críticos
- ✅ Interpretación automática

### Sincronización Automática
- ✅ PostgreSQL LISTEN/NOTIFY
- ✅ Propagación en ~2 segundos
- ✅ Debounce inteligente
- ✅ Sin intervención manual

## 📊 Métricas

- **Código:** ~150 archivos
- **Componentes React:** 51
- **Endpoints API:** 15+
- **Estudios:** 513 (348 pruebas + 165 grupos)
- **Tamaño:** 733 MB

## 🧪 Testing

```bash
# Tests unitarios (por implementar)
npm run test

# Tests E2E con Playwright (por implementar)
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚀 Deployment

Este proyecto utiliza un **workflow profesional de deployment** con GitFlow y GitHub Actions.

### Workflow Rápido

```bash
# 1. Desarrollar en rama feature
git checkout -b feature/nueva-funcionalidad

# 2. Commit y push
git add .
git commit -m "feat: descripción"
git push origin feature/nueva-funcionalidad

# 3. Crear PR → develop (CI Tests corren automáticamente)
# 4. Merge → Auto-deploy a Staging

# 5. Testing en staging OK? → Crear PR: develop → main
# 6. Merge a main → Crear tag de versión
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 7. GitHub Release se crea automáticamente
# 8. Deploy manual a producción via GitHub Actions
```

### GitHub Actions Workflows

| Workflow | Trigger | Propósito |
|----------|---------|-----------|
| **01-CI Tests** | Push/PR | Tests, linting, build validation |
| **02-Deploy Staging** | Push a `develop` | Auto-deploy a staging |
| **03-Deploy Production** | Manual | Deploy a producción (requiere confirmación) |
| **04-Rollback** | Manual | Rollback a versión anterior |
| **05-Database Migration** | Manual | Ejecutar migraciones de DB |
| **06-Create Release** | Push tag `v*.*.*` | Auto-crear GitHub Release |
| **07-Deploy AWS Production** | Manual | Deploy a AWS EC2 (requiere confirmación "DEPLOY") |

### Deployment a AWS

**Servidor:** AWS EC2 54.197.68.252
**URL:** http://54.197.68.252:8080/labsis

#### Opción 1: GitHub Actions (Recomendado)

1. Ve a [GitHub Actions](https://github.com/saqh5037/laboratorio-eg-system/actions)
2. Selecciona **"07 - Deploy to AWS Production"**
3. Click **"Run workflow"**
4. Branch: `main`
5. Confirmation: Escribe `DEPLOY`
6. Click **"Run workflow"**

#### Opción 2: Script Manual

```bash
./scripts/deploy-aws.sh
```

**📖 Documentación completa:**
- [AWS Deployment Guide](./docs/AWS-DEPLOYMENT-GUIDE.md) - Guía paso a paso
- [Deployment Summary](./docs/DEPLOYMENT-SUMMARY.md) - Workflow profesional

## 🤝 Contribuir

Este proyecto utiliza **Branch Protection** en `main` y un workflow profesional de Pull Requests.

### Proceso de Contribución

1. **Fork** el repositorio
2. **Crea una rama** desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Desarrolla** tu funcionalidad
4. **Commit** siguiendo [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m 'feat: agregar nueva funcionalidad'
   ```
5. **Push** tu rama:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
6. **Abre un Pull Request** usando el [template de PR](./docs/PR-TEMPLATE.md)
7. **Espera review** y aprobación (CI Tests deben pasar)
8. **Merge** después de aprobación

### Requisitos para Merge

- ✅ CI Tests pasando (linting, type-check, build)
- ✅ Al menos 1 aprobación de reviewer
- ✅ Todos los comentarios resueltos
- ✅ Branch actualizada con develop/main

Ver [Branch Protection Setup](./docs/GITHUB-BRANCH-PROTECTION-SETUP.md) para más detalles.

## 📄 Licencia

MIT © Laboratorio Elizabeth Gutiérrez

## 📞 Contacto

**Desarrollador:** Samuel Quiroz
**GitHub:** [@saqh5037](https://github.com/saqh5037)

---

**⭐ Si este proyecto te es útil, considera darle una estrella!**
