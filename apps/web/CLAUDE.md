# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Vite HMR
- `npm run build` - Build production bundle with PWA optimizations
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks

### Dependencies
- `npm install` - Install all dependencies

## Architecture

### Tech Stack
- **React 19** with Vite as build tool
- **Tailwind CSS** for styling with custom EG brand colors
- **React Router v7** for routing with lazy loading
- **Framer Motion** for animations
- **React Window** for virtualized lists
- **XLSX** for Excel file processing
- **PWA** features with Service Worker and Web App Manifest

### Project Structure
The application is a **Progressive Web App (PWA)** medical laboratory management system for Laboratorio EG with the following architecture:

**Core Application Flow:**
- `src/App.jsx` - Main router setup with lazy loading, Error Boundaries, and PWA components
- `src/layouts/MainLayout.jsx` - Primary layout wrapper with Header, Sidebar, and Footer
- `src/contexts/ThemeContext.jsx` - Dark/light mode theme management
- `src/main.jsx` - Application entry point with performance monitoring

**PWA Features:**
- **Service Worker** (`public/sw.js`) - Offline caching, background sync, and update management
- **Web App Manifest** (`public/manifest.json`) - Installation metadata and icons
- **PWA Manager** (`src/utils/pwa.js`) - Installation prompts, update notifications, and offline detection
- **PWA Components** (`src/components/PWAComponents.jsx`) - UI for installation, updates, and network status
- **Performance Monitoring** (`src/utils/performance.js`) - Core Web Vitals tracking and optimization

**Performance Optimizations:**
- **Code Splitting**: Lazy-loaded pages with React.lazy()
- **Image Optimization**: WebP support, lazy loading, and responsive images (`src/components/OptimizedImage.jsx`)
- **Bundle Optimization**: Strategic chunk splitting for vendor, UI, and utility libraries
- **Virtual Scrolling**: Performance-optimized list rendering for large datasets
- **Preloading**: Critical resource preloading and data prefetching

**Key Features:**
- **Lab Studies Management**: Components for browsing, searching, and displaying medical studies
- **Favorites System**: Complete favorites management with folders, notes, and export capabilities
- **Excel Data Processing**: Utilities to import and process laboratory data from Excel files
- **Advanced Search**: Fuzzy search implementation using Fuse.js
- **Tree View Navigation**: Hierarchical display of medical study categories
- **Offline Support**: Full offline functionality with elegant fallbacks

**Design System:**
- Custom Tailwind configuration with EG brand colors (purple #7B68A6, pink #E8C4DD)
- Component library: Button, Card, Loader, Modal, Error Boundary components
- Responsive design with mobile-first approach
- Medical iconography and professional styling

**Data Management:**
- Static study data with hierarchical structure
- localStorage persistence for favorites and preferences
- Custom hooks for data fetching and state management
- Excel file processing for dynamic data import
- Background synchronization for offline actions

**Routing Structure:**
- `/` - Home page
- `/estudios` - Studies listing with advanced search and filtering
- `/estudios/tree` - Tree view with hierarchical navigation
- `/favoritos` - Favorites management with folders and organization
- `/nosotros` - About page
- `/contacto` - Contact page
- Additional routes for future features (resultados, pacientes, reportes)

**PWA Installation:**
- Installable on mobile and desktop devices
- Custom installation prompts with laboratory branding
- Offline-first approach with intelligent caching strategies
- Background sync for data synchronization when connectivity returns
- Update notifications with seamless app updates

**Performance Metrics:**
- Core Web Vitals monitoring (LCP, FID, CLS, FCP)
- Performance budgets and optimization tracking
- Error boundary with detailed error reporting
- Resource loading optimization with preloading and prefetching

**Development Workflow:**
- Hot module replacement for fast development
- Error boundaries for graceful error handling
- Performance monitoring in development mode
- Optimized build process with modern browser targets