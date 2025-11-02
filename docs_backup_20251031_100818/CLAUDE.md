# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a comprehensive medical laboratory management system for **Laboratorio Elizabeth Gutiérrez**, a medical laboratory with 43+ years of experience in Caracas, Venezuela. The system consists of three main components:

1. **laboratorio-eg**: Full-featured PWA with backend (PostgreSQL + Express)
2. **sync-service**: Real-time price synchronization service (PostgreSQL LISTEN/NOTIFY → JSON)
3. **directorio-laboratorioeg**: Streamlined directory app (client-side only, legacy)

The system integrates with an existing **labsisEG** PostgreSQL database (the laboratory's management system) and provides a modern web interface for medical studies catalog, pricing, and budget generation.

## Development Commands

### laboratorio-eg (Main PWA - Primary Development Focus)

```bash
# Development
npm run dev              # Frontend only (port 5173)
npm run server           # Backend API only (port 3001)
npm run dev:all          # Both frontend + backend concurrently

# Build & Deploy
npm run build            # Production build with PWA optimizations
npm run preview          # Preview production build (port 4173)
npm run analyze          # Analyze bundle size with visualizer

# Code Quality
npm run lint             # Run ESLint checks
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking

# Database
npm run db:test          # Test PostgreSQL connection and view stats
```

### sync-service (Price Synchronization Service)

```bash
# Verification & Setup
npm run verify-db        # Verify labsisEG database connection and triggers
npm run install-triggers # Install PostgreSQL triggers for LISTEN/NOTIFY

# Development
npm run dev              # Start service with hot-reload (port 3001)
npm run start            # Production mode

# Manual Operations
npm run manual-sync      # Force one-time synchronization
```

### directorio-laboratorioeg (Directory App - Legacy)

```bash
npm run dev              # Development server (port 5173)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint checks
```

**Note**: Most new development should focus on `laboratorio-eg` as it now includes the best features from both applications.

## Architecture

### System Architecture Overview

The system uses a **three-tier architecture** with real-time data synchronization:

```
┌─────────────────────────────────────────────────────────────┐
│                    labsisEG (PostgreSQL)                    │
│         Laboratory Management System Database               │
│    • 511 medical studies (348 pruebas + 163 grupos)        │
│    • Price lists, categories, patient data                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ LISTEN/NOTIFY (PostgreSQL triggers)
                 │
        ┌────────▼─────────┐
        │  sync-service    │  ← Real-time price synchronization
        │  (Node.js)       │     (Port 3001)
        │  • Detects changes via NOTIFY
        │  • Generates precios.json (~160KB, 511 studies)
        │  • Auto-copies to laboratorio-eg/public/data/
        └────────┬─────────┘
                 │
    ┌────────────┴─────────────┐
    │                          │
    ▼                          ▼
┌───────────────┐      ┌──────────────────┐
│ laboratorio-eg│      │ laboratorio-eg   │
│ (Express API) │      │ (React PWA)      │
│ Port 3001     │      │ Port 5173        │
│               │      │                  │
│ • Direct DB   │      │ • Loads JSON     │
│   queries     │      │ • Offline mode   │
│ • Caching     │      │ • PWA features   │
└───────────────┘      └──────────────────┘
```

**Data Flow for Price Updates:**
1. User changes price in labsisEG → PostgreSQL UPDATE
2. Database trigger fires → NOTIFY 'precio_cambio'
3. sync-service receives notification → waits 2s (debounce)
4. Queries 511 studies → generates JSON → copies to React app
5. Vite HMR detects change → updates UI without reload
6. **Total time: ~2-5 seconds** from database update to UI refresh

### laboratorio-eg: Main PWA Application

**Full-stack Progressive Web Application** with PostgreSQL backend and comprehensive medical laboratory management features.

**Tech Stack:**
- React 19.1.1 + Vite 7.1.2
- PostgreSQL + Express server (port 3001)
- Tailwind CSS 3.4.17 with custom medical theme
- React Router v7 with lazy loading
- PWA with Service Worker and offline support
- Framer Motion for animations
- Fuse.js for fuzzy search
- XLSX for Excel data processing

**Key Components and Locations:**

```
laboratorio-eg/
├── src/
│   ├── components/
│   │   ├── PWAComponents.jsx           # Install prompts, update notifications
│   │   ├── ErrorBoundary.jsx           # App-wide error handling
│   │   ├── FavoritesList.jsx           # Drag & drop favorites management
│   │   ├── AdvancedSearchBox.jsx       # Fuzzy search with Fuse.js
│   │   ├── OptimizedImage.jsx          # WebP images with lazy loading
│   │   └── directorio/                 # Components migrated from directorio-laboratorioeg
│   │       ├── calculator/BudgetCalculator.jsx  # PDF generation & WhatsApp
│   │       ├── modals/StudyDetailModal.jsx      # Study details popup
│   │       └── navigation/             # Sidebar & bottom nav
│   │
│   ├── pages/                          # Lazy-loaded route components
│   │   ├── LandingPageModern.jsx       # Modern landing page
│   │   ├── Home.jsx                    # Main dashboard
│   │   ├── Estudios.jsx                # Studies catalog
│   │   ├── TreeViewDemo.jsx            # Hierarchical navigation
│   │   ├── SearchPage.jsx              # Advanced search (NEW from fusion)
│   │   ├── BudgetPage.jsx              # Budget calculator (NEW from fusion)
│   │   └── FavoritesPage.jsx           # Favorites management
│   │
│   ├── contexts/
│   │   ├── ThemeContext.jsx            # Light/dark mode
│   │   └── UnifiedAppContext.jsx       # Global state (from fusion)
│   │
│   ├── hooks/                          # 14+ custom hooks
│   │   ├── useFavorites.js
│   │   ├── useLabData.js
│   │   └── useAdvancedSearch.js
│   │
│   ├── utils/
│   │   ├── pwa.js                      # PWA manager (install, updates, offline)
│   │   ├── performance.js              # Core Web Vitals monitoring
│   │   └── excelProcessor.js           # Excel import/export
│   │
│   ├── services/
│   │   └── api.js                      # HTTP client with cache & offline fallback
│   │
│   ├── adapters/
│   │   └── studyAdapter.js             # Convert backend ↔ frontend data formats
│   │
│   └── data/                           # Static fallback data
│       ├── estudios.js                 # Studies database
│       ├── estudiosData.js             # Extended study descriptions
│       └── perfiles.js                 # Medical profiles
│
├── server/                             # Express backend
│   ├── index.js                        # Main server (Helmet, CORS, compression)
│   ├── config/
│   │   └── database.js                 # PostgreSQL pool with retry logic
│   ├── routes/
│   │   └── api.js                      # RESTful API endpoints
│   ├── middleware/
│   │   └── cache.js                    # Response caching with node-cache
│   └── data/fallback/                  # Auto-updated fallback JSON files
│
└── public/
    ├── manifest.json                   # PWA manifest (shortcuts, share target)
    └── sw.js                           # Service Worker (cache strategies)
```

**Critical Architecture Patterns:**

1. **Data Flow**: PostgreSQL → Express API → Service Layer → Adapter → React Context → Components
2. **Offline Strategy**: API calls auto-fallback to static data when DB unavailable
3. **State Management**: UnifiedAppContext provides favorites, cart, filters, search query
4. **Code Splitting**: Lazy-loaded routes with strategic vendor bundling (react, ui, utils chunks)
5. **Performance**: Virtual scrolling, optimized images (WebP), Core Web Vitals monitoring

### directorio-laboratorioeg: Directory Application (Legacy)

**Streamlined client-side app** for browsing studies and generating budget PDFs. Key components have been migrated to laboratorio-eg.

**Tech Stack:**
- React 19.1.1 + Vite 7.1.2
- Tailwind CSS 4.1.12
- HeadlessUI for accessible components
- jsPDF for PDF generation
- React Select for dropdowns
- React Hot Toast for notifications

**Notable Features Now in laboratorio-eg:**
- BudgetCalculator with PDF export and WhatsApp integration
- StudyDetailModal for rich study information
- Responsive navigation components (Sidebar, BottomNav)

### sync-service: Real-time Price Synchronization

**Local synchronization service** that monitors labsisEG database and generates JSON files for the React app.

**Tech Stack:**
- Node.js 22.16.0
- PostgreSQL driver (pg 8.16.3)
- Express 4.18.2 (HTTP API)
- Winston 3.17.0 (Logging)
- LISTEN/NOTIFY pattern for real-time updates

**Key Components:**

```
sync-service/
├── src/
│   ├── index.js                      # Service entry point
│   ├── config.js                     # Centralized configuration
│   │
│   ├── database/
│   │   ├── connection.js             # PostgreSQL connection pool
│   │   └── queries.js                # Parameterized queries for studies
│   │
│   ├── services/
│   │   ├── postgres-listener.js      # LISTEN/NOTIFY handler
│   │   ├── sync-service.js           # Core sync logic
│   │   └── data-transformer.js       # Transform DB → JSON format
│   │
│   ├── storage/
│   │   └── file-service.js           # Local file operations
│   │
│   ├── http/
│   │   ├── server.js                 # Express HTTP server
│   │   └── routes/api.js             # API endpoints
│   │
│   └── utils/
│       └── logger.js                 # Winston logger with rotation
│
├── database/
│   └── triggers-labsis.sql           # PostgreSQL triggers for NOTIFY
│
├── output/
│   └── precios.json                  # Generated JSON (160KB, 511 studies)
│
└── logs/                             # Rotating logs (14-day retention)
    ├── combined-YYYY-MM-DD.log
    ├── error-YYYY-MM-DD.log
    └── sync-YYYY-MM-DD.log
```

**HTTP API Endpoints (Port 3001):**
- `GET /health` - Service health check
- `GET /api/precios.json` - Full price list JSON
- `GET /api/stats` - Real-time sync statistics
- `POST /api/sync` - Force manual synchronization
- `GET /api/config` - Current configuration

**Synchronization Process:**
1. PostgreSQL trigger detects price change
2. NOTIFY sent on 'precio_cambio' channel
3. postgres-listener receives notification
4. Debounce wait (2 seconds) to batch multiple changes
5. Query 348 pruebas + 163 grupos in parallel
6. Transform to JSON format with metadata
7. Write to `output/precios.json`
8. Auto-copy to `laboratorio-eg/public/data/precios.json`
9. React app's Vite dev server detects file change (HMR)

**Configuration (.env):**
```bash
LABSIS_DB=labsisEG                    # Database name (NOT labsis_dev)
LABSIS_USER=labsis
LISTA_PRECIOS_ID=27                   # "Ambulatorio_Abril_2025"
DEBOUNCE_MS=2000                      # Wait time for batching changes
AUTO_COPY_TO_WEB=true                 # Auto-copy to React app
WEB_PROJECT_PATH=/path/to/laboratorio-eg/public/data
HTTP_PORT=3001
```

**Critical Notes:**
- Uses labsisEG database (production), NOT labsis_dev
- Price list ID 27 = "Ambulatorio_Abril_2025" (USD prices)
- Requires PostgreSQL triggers installed (`npm run install-triggers`)
- No AWS dependencies - fully local file system
- Logs rotate every 14 days automatically

## Database Configuration

### PostgreSQL Database: labsisEG

**Primary database used by both laboratorio-eg and sync-service.**

**Connection Details:**
- Host: `localhost` (or env `DB_HOST` / `LABSIS_HOST`)
- Port: `5432`
- Database: `labsisEG` (production database)
- User: `labsis` / `labsis_user`
- Schema: `laboratorio` (contains tables for estudios, precios, etc.)

**Database Schema:**
- 25 medical areas (categorías)
- 511+ active medical studies in price list 27
  - 348 individual tests (pruebas)
  - 163 study groups/profiles (grupos)
- 8 price lists (listas de precios)
  - ID 27 = "Ambulatorio_Abril_2025" (USD, current)

**Key Tables:**
- `laboratorio.listaspreciodetalle` - Price list details (monitored by sync-service)
- `laboratorio.estudios` - Medical studies catalog
- `laboratorio.categorias` - Study categories
- `laboratorio.grupos` - Study groups/profiles

### laboratorio-eg Database Setup

**Connection Configuration:**
```bash
# laboratorio-eg/.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=labsisEG
DB_USER=labsis
DB_PASSWORD=your_password
```

**Connection Pool:**
- Pool Size: 20 connections (dev), 50 connections (prod)
- Connection Timeout: 5 seconds
- Idle Timeout: 30 seconds
- Retry Logic: 5 attempts with exponential backoff (using p-retry)

**Test Connection:**
```bash
cd laboratorio-eg
npm run db:test
```

**Fallback System:**
- Automatic JSON file generation in `server/data/fallback/`
- Frontend auto-switches to static data if backend unavailable
- No user-facing errors when DB is down

### sync-service Database Setup

**Connection Configuration:**
```bash
# sync-service/.env
LABSIS_HOST=localhost
LABSIS_PORT=5432
LABSIS_DB=labsisEG
LABSIS_USER=labsis
LABSIS_PASSWORD=your_password
LISTA_PRECIOS_ID=27
```

**Test Connection & Verify Triggers:**
```bash
cd sync-service
npm run verify-db
```

**Install Database Triggers:**
```bash
cd sync-service
npm run install-triggers
# OR manually:
PGPASSWORD=labsis psql -h localhost -U labsis -d labsisEG -f database/triggers-labsis.sql
```

**Triggers Installed (4 total):**
1. `notify_precio_cambio()` - Fires on INSERT/UPDATE/DELETE in `listaspreciodetalle`
2. `trigger_precio_cambio` - AFTER trigger on price changes
3. Additional triggers for data integrity

## Data Integration: sync-service ↔ laboratorio-eg

### JSON Data Format

The sync-service generates `precios.json` consumed by the React app:

```json
{
  "estudios": [
    {
      "id": 1042,
      "codigo": "17 HIDROPROGEST",
      "nombre": "17 HIDROXIPROGESTERONA",
      "categoria": "Hormonas",
      "precio": 25,
      "descripcion": "",
      "requiereAyuno": false,
      "tiempoEntrega": 7,
      "activo": true,
      "fechaActualizacion": "2025-10-19T04:21:19.121Z"
    }
    // ... 510 more studies
  ],
  "metadata": {
    "totalEstudios": 511,
    "totalPruebas": 348,
    "totalGrupos": 163,
    "listaPreciosId": 27,
    "fechaSincronizacion": "2025-10-19T04:21:19.122Z",
    "version": "1.0",
    "moneda": "USD"
  }
}
```

### How React App Consumes the Data

**File Location:**
- Source: `sync-service/output/precios.json`
- Copied to: `laboratorio-eg/public/data/precios.json`
- Served at: `http://localhost:5173/data/precios.json`

**React Hook (useLabDataDB.js):**
```javascript
// Loads JSON and transforms to app format
const { estudios, loading, error } = useLabDataDB();

// Data available in components
estudios.forEach(estudio => {
  console.log(estudio.nombre, estudio.precio);
});
```

**Vite HMR Integration:**
- Vite watches `public/data/precios.json`
- When sync-service updates the file → Vite triggers HMR
- React components re-render with new prices
- **No full page reload needed**

### Data Sources Priority

laboratorio-eg can load data from multiple sources (in order of preference):

1. **Express API** (port 3001) - Direct PostgreSQL queries
   - Used when: `npm run dev:all` (backend + frontend)
   - Advantages: Real-time, no sync delay, advanced queries
   - File: `src/services/api.js`

2. **JSON from sync-service** (updated via LISTEN/NOTIFY)
   - Used when: sync-service running + frontend only
   - Advantages: Real-time via triggers, automatic updates
   - File: `public/data/precios.json`

3. **Static JSON fallback** (bundled with app)
   - Used when: No backend available
   - Advantages: Offline support, guaranteed availability
   - File: `src/data/estudios.js`

**Switching Logic:**
```javascript
// In src/services/api.js
try {
  // Try API first
  const response = await axios.get('http://localhost:3001/api/estudios');
  return response.data;
} catch (error) {
  // Fall back to JSON
  const response = await fetch('/data/precios.json');
  return response.json();
}
```

## Design System

Both applications share a consistent medical brand theme:

**Colors:**
- Primary Purple: `#7B68A6` (eg-purple)
- Secondary Pink: `#DDB5D5` / `#E8C4DD` (eg-pink)
- Gray: `#8B8C8E` / `#76767A` (eg-gray)
- Light Background: `#F5F5F5`
- Dark Text: `#231F20`

**Typography:**
- Primary Font: DIN Pro
- Fallbacks: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto

**Medical Categories & Icons:**
- Hematología 🩸
- Química 🧪
- Microbiología 🦠
- Inmunología 🛡️
- Orina 💧
- Hormonas ⚗️
- Alergias 🤧
- Perfiles 📋

## Performance Targets

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- FCP (First Contentful Paint): < 1.8s

**Bundle Size:**
- Main bundle: < 250KB gzipped
- Vendor bundle: < 150KB gzipped
- Total page load: < 500KB

**Optimization Strategies:**
- Lazy loading for all route components
- Strategic vendor chunking (react, ui, utils)
- Virtual scrolling for long lists (react-window)
- Image optimization with WebP format
- Service Worker caching for repeat visits

## PWA Features (laboratorio-eg)

**Service Worker Strategies:**
- **Cache-First**: Static assets (CSS, JS, images)
- **Network-First**: API calls (with offline fallback)
- **Stale-While-Revalidate**: Semi-dynamic resources

**Offline Capabilities:**
- Full navigation without internet
- Cached medical studies catalog
- Favorites accessible offline
- Background sync on reconnection
- Custom offline page with branding

**Installation:**
- Custom install prompts with branding
- App icons (72×72 to 512×512)
- Desktop and mobile installation
- Update notifications with reload button

## Key Routes

### laboratorio-eg
```
/                      → Landing page (LandingPageModern.jsx)
/home                  → Main dashboard (Home.jsx)
/estudios              → Studies catalog (Estudios.jsx)
/estudios/tree         → Hierarchical tree view (TreeViewDemo.jsx)
/estudios/:categoria   → Category-filtered studies
/buscar                → Advanced search (SearchPage.jsx) - NEW
/presupuesto           → Budget calculator (BudgetPage.jsx) - NEW
/favoritos             → Favorites management (FavoritesPage.jsx)
/nosotros              → About page
/contacto              → Contact information
```

### directorio-laboratorioeg
```
/                      → Home with category grid
/search                → Search results
/favoritos             → Saved studies
/contacto              → Lab contact info
```

## Important Configuration Files

### laboratorio-eg

**vite.config.js** - Complex build optimization:
- Manual chunk splitting (vendor, react, ui, utils)
- Production sourcemaps enabled
- Asset optimization
- Build output to `dist/`

**tailwind.config.js** - Custom medical theme:
- 93 lines of theme extensions
- Custom animations, shadows, gradients
- Dark mode support with 'class' strategy
- Medical category colors

**server/config/database.js** - PostgreSQL configuration:
- Connection pooling with retry logic
- p-retry for exponential backoff (5 attempts)
- Separate dev/prod configs
- SSL support for production

### directorio-laboratorioeg

**vite.config.js** - Minimal setup (7 lines)
**tailwind.config.js** - Basic color extensions (22 lines)

## Working with the Fusion Architecture

### Data Adapter Pattern

When working with API data, always use `studyAdapter.js`:

```javascript
import { StudyAdapter } from '../adapters/studyAdapter';

// Backend data → Frontend format
const frontendStudy = StudyAdapter.fromBackend(backendData);

// Static data → Frontend format
const frontendStudy = StudyAdapter.fromStatic(staticData);

// Study → Cart item
const cartItem = StudyAdapter.toCart(study);
```

### API Service with Fallback

The API service (`src/services/api.js`) automatically handles offline scenarios:

```javascript
import StudyService from '../services/api';

// Automatically tries backend, falls back to static data on error
const studies = await StudyService.getStudies(params);
```

### State Management

`UnifiedAppContext` provides centralized state:
- `favorites[]` - User's saved studies (persisted to localStorage)
- `cart[]` - Studies in budget calculator
- `studies[]` - Current studies from API or static
- `loading`, `isOnline` - Connection status
- `searchQuery`, `filters`, `selectedCategory` - Search state
- Methods: `addToCart()`, `toggleFavorite()`, `loadStudies()`, etc.

## Business Context

**Laboratorio Elizabeth Gutiérrez**
- Location: Av. Libertador, Edificio Majestic, Piso 1, Consultorio 18, Caracas, Venezuela
- Experience: 43+ years in clinical analysis
- WhatsApp: +584149019327
- RIF: J-40233378-1

**Services:**
- Medical studies catalog with 1000+ tests
- Budget calculations with volume discounts (3-5: 5%, 6-10: 10%, 11+: 15%)
- WhatsApp-based inquiry system
- PDF budget generation

## Development Workflow

### Starting Development (Full System)

**Recommended setup for full functionality with real-time price sync:**

```bash
# Terminal 1: Start sync-service (price synchronization)
cd sync-service
npm run dev

# Terminal 2: Start laboratorio-eg (backend + frontend)
cd laboratorio-eg
npm run dev:all
```

This starts:
- sync-service on port 3001 (HTTP API + LISTEN/NOTIFY)
- laboratorio-eg Express API on port 3001
- laboratorio-eg Vite dev server on port 5173

**Note:** Both sync-service and laboratorio-eg backend use port 3001. In development:
- Run sync-service for real-time price updates from labsisEG
- OR run laboratorio-eg backend for full API features
- Usually you run sync-service + laboratorio-eg frontend only

### Alternative Development Modes

1. **Frontend + Sync Service** (recommended for price testing):
   ```bash
   # Terminal 1
   cd sync-service
   npm run dev

   # Terminal 2
   cd laboratorio-eg
   npm run dev  # Frontend only, uses JSON from sync-service
   ```

2. **Full laboratorio-eg stack** (no real-time sync):
   ```bash
   cd laboratorio-eg
   npm run dev:all  # Backend (port 3001) + Frontend (port 5173)
   ```

3. **Frontend only** (no database, static data):
   ```bash
   cd laboratorio-eg
   npm run dev
   ```
   Static data fallback activates automatically.

### Testing Database Connection

**laboratorio-eg:**
```bash
cd laboratorio-eg
npm run db:test
```
Verifies PostgreSQL connectivity and displays database statistics.

**sync-service:**
```bash
cd sync-service
npm run verify-db
```
Verifies database connection, triggers installation, and price list data.

Expected output:
```
🔍 VERIFICACIÓN DE BASE DE DATOS LABSIS
✅ Conectado exitosamente
✅ Base de datos: labsisEG
✅ Tablas encontradas: 6/6
✅ Lista de precios ID 27 encontrada
📊 Total en lista: 511 estudios
✅ Triggers instalados: 4/4
✅ Verificación completada exitosamente
```

### Testing Price Synchronization

**Full workflow test (requires both services running):**

1. Start sync-service and laboratorio-eg:
   ```bash
   # Terminal 1
   cd sync-service && npm run dev

   # Terminal 2
   cd laboratorio-eg && npm run dev
   ```

2. Open React app in browser: `http://localhost:5173/estudios`

3. Find a study and note its price (e.g., "17 HIDROXIPROGESTERONA")

4. Change price in labsisEG database:
   ```bash
   PGPASSWORD=labsis psql -h localhost -U labsis -d labsisEG -c \
   "UPDATE laboratorio.listaspreciodetalle
    SET precio = 30
    WHERE nombre = '17 HIDROXIPROGESTERONA' AND lpid = 27;"
   ```

5. Watch sync-service console output:
   ```
   🔔 [LISTENER] Notificación recibida: precio_cambio
   ⏱️  Programando sincronización en 2000ms...
   🔄 Iniciando sincronización...
   ✅ 511 estudios sincronizados
   💾 JSON guardado: 160.62 KB
   ```

6. Browser automatically updates (via Vite HMR) - price changes from old → $30

**Manual sync test:**
```bash
# Force sync without database changes
curl -X POST http://localhost:3001/api/sync

# Check sync status
curl http://localhost:3001/api/stats
```

### Building for Production

```bash
cd laboratorio-eg
npm run build        # Creates optimized build in dist/
npm run preview      # Preview the build locally
```

### Analyzing Bundle Size

```bash
cd laboratorio-eg
npm run analyze
```

Opens an interactive treemap visualization of the bundle.

## Common Development Tasks

### Adding a New Medical Study Category

1. Update database schema (if using PostgreSQL)
2. Add category icon in `src/data/` or component
3. Update adapter if new fields are introduced
4. Test with both backend and static fallback data

### Modifying the Budget Calculator

Located at `src/components/directorio/calculator/BudgetCalculator.jsx`:
- PDF generation uses jsPDF
- WhatsApp integration uses URL encoding
- Discount logic is centralized in `calculateCartTotal()` method

### Updating Service Worker Cache

Edit `public/sw.js`:
- Update `CACHE_VERSION` to force cache invalidation
- Modify caching strategies if needed
- Test offline functionality thoroughly

### Adding New API Endpoints

1. Create route in `server/routes/api.js`
2. Update `src/services/api.js` to call new endpoint
3. Add fallback logic for offline scenario
4. Update adapter if data format differs

## Troubleshooting

### Database Connection Issues

**laboratorio-eg:**
- Verify PostgreSQL is running: `pg_isready`
- Check environment variables in `.env`
- Run `npm run db:test` to diagnose
- App will auto-fallback to static data if DB fails

**sync-service:**
- Run `npm run verify-db` to check connection and triggers
- Verify `.env` has correct `LABSIS_PASSWORD`
- Check PostgreSQL logs: `tail -f /usr/local/var/log/postgresql@14.log` (macOS)
- Test manual connection:
  ```bash
  PGPASSWORD=labsis psql -h localhost -U labsis -d labsisEG -c "SELECT version();"
  ```

### Price Synchronization Not Working

**Symptoms:** Price changes in labsisEG don't update in React app

**Diagnosis:**
1. Check sync-service is running:
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok",...}
   ```

2. Check listener is active:
   ```bash
   curl http://localhost:3001/api/stats | jq '.listener'
   # Should show: "isListening": true
   ```

3. Verify triggers are installed:
   ```bash
   cd sync-service && npm run verify-db
   # Should show: ✅ Triggers instalados: 4/4
   ```

4. Check JSON file exists and is recent:
   ```bash
   ls -lh sync-service/output/precios.json
   ls -lh laboratorio-eg/public/data/precios.json
   ```

5. Force manual sync to test:
   ```bash
   curl -X POST http://localhost:3001/api/sync
   ```

**Solutions:**
- Install triggers: `cd sync-service && npm run install-triggers`
- Check `AUTO_COPY_TO_WEB=true` in sync-service `.env`
- Verify `WEB_PROJECT_PATH` points to correct directory
- Restart both services
- Check sync-service logs: `tail -f sync-service/logs/combined-*.log`

### Port 3001 Already in Use

Both sync-service and laboratorio-eg backend use port 3001. Choose one:

**Option 1 - Use sync-service (recommended for price testing):**
```bash
cd sync-service && npm run dev
cd laboratorio-eg && npm run dev  # Frontend only
```

**Option 2 - Use laboratorio-eg backend:**
```bash
cd laboratorio-eg && npm run dev:all
```

**Option 3 - Change sync-service port:**
```bash
# In sync-service/.env
HTTP_PORT=3002
```

### PWA Installation Not Working

- Ensure HTTPS in production (required for PWA)
- Verify `manifest.json` is accessible
- Check Service Worker registration in DevTools
- Clear browser cache and re-register SW

### Bundle Size Too Large

- Run `npm run analyze` to identify large dependencies
- Review vite.config.js chunk splitting strategy
- Consider lazy loading more components
- Check for duplicate dependencies in package.json

### Offline Mode Not Activating

- Verify Service Worker is registered (DevTools → Application)
- Check cache status in DevTools
- Test with "Offline" mode in DevTools Network tab
- Review `sw.js` caching strategies

## Testing

### Manual Testing Checklist

**laboratorio-eg PWA:**
- [ ] Install app on mobile and desktop
- [ ] Test offline mode (disconnect internet)
- [ ] Add studies to favorites
- [ ] Generate budget PDF
- [ ] Share via WhatsApp
- [ ] Search with fuzzy matching
- [ ] Navigate hierarchical tree view
- [ ] Test dark/light theme switching
- [ ] Verify update notifications

**Performance:**
- [ ] Run Lighthouse audit (target: 90+ on all metrics)
- [ ] Check Core Web Vitals in DevTools
- [ ] Test on 3G throttled connection
- [ ] Verify bundle size < 250KB gzipped

### Lighthouse PWA Audit

```bash
npx lighthouse http://localhost:5173 --view
```

Target scores: Performance 90+, PWA 90+, Accessibility 90+

## Additional Notes

- Both applications use React 19 (latest) - be aware of breaking changes
- Vite 7.1.2 has faster HMR than previous versions
- PostgreSQL connection pool is aggressive (20-50 connections) - adjust if needed
- The fusion architecture allows gradual migration without breaking changes
- Favorites and cart data persist in localStorage for offline access
- Service Worker updates require user action (reload button) to avoid interrupting active sessions

### sync-service Specific Notes

- **Database:** Always uses `labsisEG` (production database), NOT `labsis_dev`
- **Price List:** ID 27 = "Ambulatorio_Abril_2025" (USD prices for ambulatory patients)
- **No AWS:** Fully local system, no cloud dependencies
- **Debounce:** 2-second wait groups multiple price changes into one sync
- **Idempotent:** Can run multiple syncs safely without data corruption
- **Triggers:** Non-blocking - won't interrupt database operations if sync fails
- **Logs:** Auto-rotate every 14 days to prevent disk space issues
- **JSON Size:** ~160KB for 511 studies - small enough for fast loading
- **Port Conflict:** sync-service and laboratorio-eg backend both use 3001 - choose one based on need

## Related Documentation

### Main Project Documentation
- [PROCESO_SINCRONIZACION.md](PROCESO_SINCRONIZACION.md) - Step-by-step price synchronization process
- [laboratorio-eg/README.md](laboratorio-eg/README.md) - Comprehensive PWA documentation
- [sync-service/README.md](sync-service/README.md) - Sync service complete documentation

### Architecture & Design
- [ARQUITECTURA_LABORATORIO_EG.excalidraw.json](ARQUITECTURA_LABORATORIO_EG.excalidraw.json) - Visual architecture diagram
- [docs/RESUMEN_SINCRONIZACION.md](docs/RESUMEN_SINCRONIZACION.md) - Synchronization architecture details
- [docs/arquitectura-sincronizacion.excalidraw](docs/arquitectura-sincronizacion.excalidraw) - Sync architecture diagram

### Database
- [database-schemas/](database-schemas/) - Database schema documentation
- [laboratorio-eg/DATABASE_SETUP.md](laboratorio-eg/DATABASE_SETUP.md) - Database setup guide
- [sync-service/database/triggers-labsis.sql](sync-service/database/triggers-labsis.sql) - PostgreSQL triggers

### Legacy & Migration
- [ANALISIS_FUSION_COMPLETO.md](ANALISIS_FUSION_COMPLETO.md) - Fusion analysis and architecture decisions
- [FUSION_STATUS.md](FUSION_STATUS.md) - Fusion status and completed migrations
- [directorio-laboratorioeg/README.md](directorio-laboratorioeg/README.md) - Legacy directory app docs
