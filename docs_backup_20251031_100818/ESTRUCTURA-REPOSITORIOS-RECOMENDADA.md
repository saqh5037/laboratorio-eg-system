# 🗂️ Estructura de Repositorios Recomendada - Laboratorio EG

**Fecha:** 24 de Octubre, 2025

---

## 📋 RESUMEN RÁPIDO

**Sistema actual:**
- 3 servicios independientes
- 733 MB de código total
- 150+ archivos de código
- PostgreSQL como base de datos compartida

**Recomendación:** **MONOREPO con Turborepo**

---

## 🎯 OPCIÓN RECOMENDADA: MONOREPO

### Nombre del Repositorio
```
laboratorio-eg-system
```

### Estructura Propuesta

```
laboratorio-eg-system/
│
├── README.md                         # Documentación principal
├── package.json                      # Root package
├── turbo.json                        # Configuración Turborepo
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Testing automatizado
│       ├── deploy-web.yml            # Deploy frontend
│       ├── deploy-results-api.yml    # Deploy API resultados
│       └── deploy-sync.yml           # Deploy sync service
│
├── apps/
│   │
│   ├── web/                          # Frontend PWA (439 MB)
│   │   ├── public/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── README.md
│   │
│   ├── results-api/                  # API de Resultados (148 MB)
│   │   ├── src/
│   │   ├── logs/
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── sync-service/                 # Sincronización (146 MB)
│       ├── src/
│       ├── database/triggers-labsis.sql
│       ├── scripts/
│       ├── output/
│       ├── logs/
│       ├── package.json
│       └── README.md
│
├── packages/
│   │
│   ├── database/                     # Esquemas y migraciones compartidos
│   │   ├── schemas/
│   │   │   ├── labsis/
│   │   │   └── sync/
│   │   ├── migrations/
│   │   └── README.md
│   │
│   ├── shared/                       # Código compartido
│   │   ├── src/
│   │   │   ├── types/               # TypeScript types
│   │   │   ├── utils/               # Utilidades compartidas
│   │   │   ├── constants/           # Constantes
│   │   │   └── config/              # Configuraciones
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── eslint-config/                # ESLint config compartida
│       ├── index.js
│       └── package.json
│
├── docs/                             # Documentación completa
│   ├── README.md
│   ├── ARQUITECTURA.md
│   ├── DEPLOYMENT.md
│   ├── SINCRONIZACION.md
│   ├── API.md
│   ├── diagrams/
│   │   └── arquitectura.excalidraw.json
│   └── screenshots/
│
└── scripts/                          # Scripts de automatización
    ├── setup.sh                      # Setup inicial
    ├── install-triggers.sh           # Instalar triggers DB
    ├── deploy-all.sh                 # Deploy completo
    └── backup-db.sh                  # Backup de DB
```

---

## 🔧 CONFIGURACIÓN TURBOREPO

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "deploy": {
      "dependsOn": ["build", "test", "lint"]
    }
  }
}
```

### Root `package.json`
```json
{
  "name": "laboratorio-eg-system",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "deploy:web": "turbo run deploy --filter=web",
    "deploy:api": "turbo run deploy --filter=results-api",
    "deploy:sync": "turbo run deploy --filter=sync-service",
    "deploy:all": "turbo run deploy"
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "latest",
    "eslint": "latest"
  }
}
```

---

## 🚀 VENTAJAS DEL MONOREPO

### ✅ Desarrollo
- **Refactors atómicos:** Cambiar código compartido en un solo commit
- **Type safety completo:** Types compartidos entre frontend y backend
- **Code sharing fácil:** Utils, constantes, configs en `packages/shared`
- **Testing integrado:** Probar todo el stack junto
- **Hot reload consistente:** Cambios se propagan automáticamente

### ✅ Deployment
- **Versioning unificado:** Un solo `git tag` para todo el sistema
- **Deploy coordinado:** Cambios relacionados se despliegan juntos
- **Rollback simple:** Volver a versión anterior del sistema completo
- **CI/CD simplificado:** Un solo pipeline para todo

### ✅ Mantenimiento
- **Historia completa:** Todo el proyecto en un solo timeline
- **Pull requests simples:** Cambios multi-servicio en un PR
- **Dependencies actualizadas:** `npm update` actualiza todo
- **Búsqueda global:** Buscar en todo el código fácilmente

---

## 📦 COMANDOS ÚTILES

### Desarrollo

```bash
# Instalar dependencias (root + todos los workspaces)
npm install

# Iniciar todo en dev mode
npm run dev

# Iniciar solo frontend
turbo run dev --filter=web

# Iniciar solo APIs
turbo run dev --filter=results-api --filter=sync-service

# Build de todo
npm run build

# Build solo de web
turbo run build --filter=web
```

### Testing

```bash
# Correr tests de todo
npm run test

# Tests solo de web
turbo run test --filter=web

# Lint de todo
npm run lint
```

### Deployment

```bash
# Deploy frontend
npm run deploy:web

# Deploy API de resultados
npm run deploy:api

# Deploy sync service
npm run deploy:sync

# Deploy todo
npm run deploy:all
```

---

## 🔀 ALTERNATIVA: MULTI-REPO

Si prefieres repositorios separados:

### Repositorios

1. **`laboratorio-eg-web`**
   - URL: `github.com/[org]/laboratorio-eg-web`
   - Frontend PWA
   - Deploy: Vercel/Netlify

2. **`laboratorio-eg-results-api`**
   - URL: `github.com/[org]/laboratorio-eg-results-api`
   - API de resultados
   - Deploy: AWS EC2/VPS

3. **`laboratorio-eg-sync-service`**
   - URL: `github.com/[org]/laboratorio-eg-sync-service`
   - Servicio sincronización
   - Deploy: Servidor on-premise

4. **`laboratorio-eg-database`**
   - URL: `github.com/[org]/laboratorio-eg-database`
   - Solo esquemas y migraciones
   - Se importa como git submodule

5. **`laboratorio-eg-shared`** (opcional)
   - URL: `github.com/[org]/laboratorio-eg-shared`
   - Código compartido como npm package privado
   - Se instala vía `npm install @labeg/shared`

### Desventajas Multi-Repo
- ❌ Refactors multi-servicio requieren múltiples PRs
- ❌ Versionado complicado (¿qué versión de API va con qué versión de web?)
- ❌ Types duplicados entre repos
- ❌ Código compartido difícil de sincronizar
- ❌ CI/CD más complejo (un workflow por repo)
- ❌ Historia fragmentada

---

## 🎯 COMPARACIÓN

| Aspecto | Monorepo | Multi-Repo |
|---------|----------|------------|
| **Setup inicial** | ⚡ Rápido (1 repo) | 🐌 Lento (5 repos) |
| **Refactors** | ✅ Fácil (1 commit) | ❌ Difícil (5 PRs) |
| **Code sharing** | ✅ Trivial | ❌ Complicado |
| **Versionado** | ✅ Simple (1 tag) | ❌ Complejo (5 tags) |
| **CI/CD** | ✅ 1 pipeline | ❌ 5 pipelines |
| **Deploy** | ✅ Coordinado | ⚠️ Manual |
| **Testing** | ✅ Integración fácil | ❌ Integración difícil |
| **Búsqueda** | ✅ Global | ❌ Por repo |
| **Historia** | ✅ Completa | ❌ Fragmentada |
| **Learning curve** | ⚠️ Requiere Turborepo | ✅ Familiar |
| **Tamaño repo** | ❌ Grande (~733MB) | ✅ Pequeños |
| **Equipos separados** | ⚠️ Menos aislamiento | ✅ Más aislamiento |

---

## 🏆 DECISIÓN FINAL: **MONOREPO**

### Razones

1. **Proyecto pequeño-mediano** - 3 servicios relacionados
2. **Equipo único** - No necesitas aislamiento de equipos
3. **Dependencias fuertes** - Los servicios están altamente acoplados
4. **Refactors frecuentes** - Cambios cross-servicio son comunes
5. **Simplicidad de CI/CD** - Un solo pipeline es más fácil
6. **Type safety** - Types compartidos entre servicios
7. **Historia coherente** - Ver evolución completa del sistema

### Pasos de Implementación

#### 1. Crear estructura inicial
```bash
mkdir laboratorio-eg-system
cd laboratorio-eg-system
npm init -y
npm install -D turbo
```

#### 2. Crear directorios
```bash
mkdir -p apps/web apps/results-api apps/sync-service
mkdir -p packages/database packages/shared packages/eslint-config
mkdir -p docs scripts
```

#### 3. Mover código existente
```bash
# Copiar servicios existentes
cp -r /path/to/laboratorio-eg apps/web
cp -r /path/to/results-service apps/results-api
cp -r /path/to/sync-service apps/sync-service
```

#### 4. Configurar Turborepo
```bash
# Crear turbo.json (ver arriba)
# Configurar workspaces en package.json
```

#### 5. Configurar Git
```bash
git init
git add .
git commit -m "feat: initial monorepo structure"
```

#### 6. Crear repositorio en GitHub
```bash
gh repo create laboratorio-eg-system --public
git remote add origin git@github.com:[org]/laboratorio-eg-system.git
git push -u origin main
```

#### 7. Configurar CI/CD
- Crear workflows en `.github/workflows/`
- Configurar secrets en GitHub
- Setup de Vercel/AWS para deploys

---

## 📚 RECURSOS

- **Turborepo:** https://turbo.build/repo
- **Monorepo.tools:** https://monorepo.tools
- **Lerna (alternativa):** https://lerna.js.org
- **Nx (alternativa):** https://nx.dev

---

## ✅ CHECKLIST DE MIGRACIÓN

- [ ] Crear estructura de monorepo
- [ ] Mover código de laboratorio-eg a `apps/web`
- [ ] Mover código de results-service a `apps/results-api`
- [ ] Mover código de sync-service a `apps/sync-service`
- [ ] Crear package `@labeg/database` con esquemas
- [ ] Crear package `@labeg/shared` con código compartido
- [ ] Configurar Turborepo
- [ ] Migrar documentación a `docs/`
- [ ] Configurar ESLint compartido
- [ ] Configurar TypeScript (si aplica)
- [ ] Setup de CI/CD en GitHub Actions
- [ ] Probar `npm run dev`
- [ ] Probar `npm run build`
- [ ] Probar `npm run test`
- [ ] Primer commit y push a GitHub
- [ ] Configurar branch protection rules
- [ ] Documentar proceso en README.md

---

**Recomendación Final:** Usa el **MONOREPO** para este proyecto. Es la solución más práctica, eficiente y mantenible para un sistema de 3 servicios relacionados.

---

**Fecha:** 24 de Octubre, 2025
**Versión:** 1.0
