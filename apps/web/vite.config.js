import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Legacy support para iOS 11+, Android 6+, Safari 11+
    legacy({
      targets: [
        'iOS >= 11',           // iPhone 7+ (2016)
        'Safari >= 11',        // macOS High Sierra+
        'Chrome >= 64',        // Android 6+
        'Firefox >= 67',       // Desktop moderno
        'Samsung >= 8.2',      // Samsung Browser
        'Android >= 6.0',      // Android Marshmallow+
        'not dead'
      ],
      modernTargets: [
        'iOS >= 13.4',         // Bundle moderno para iOS recientes
        'Safari >= 13.1',
        'Chrome >= 87',
        'Firefox >= 78',
        'Edge >= 88'
      ],
      modernPolyfills: true,
      renderLegacyChunks: true,
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      polyfills: [
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.iterator',
        'es.object.assign',
        'es.promise',
        'es.string.includes',
        'es.array.find',
        'es.array.find-index'
      ]
    }),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', '**/*.{png,jpg,jpeg,svg,ico,woff,woff2}'],

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // CRÍTICO: Network-first para JavaScript para evitar cache de versiones antiguas
        // IMPORTANTE: Usar patrones dinámicos que funcionen en cualquier host (localhost o IP)
        runtimeCaching: [
          {
            // Cualquier archivo JS del mismo origen
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.endsWith('.js'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'js-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Archivos JS en /assets del mismo origen
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.includes('/assets/') && url.pathname.endsWith('.js'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'assets-js-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
            },
          },
          {
            // Archivos CSS en /assets del mismo origen
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.includes('/assets/') && url.pathname.endsWith('.css'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'css-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
              },
            },
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
            },
          },
          {
            urlPattern: /\.(woff|woff2|ttf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
            },
          },
          {
            // API calls a puertos 3001 y 3005 (cualquier host)
            urlPattern: ({ url }) => {
              const port = url.port || (url.protocol === 'https:' ? '443' : '80');
              return (port === '3001' || port === '3005') && url.pathname.startsWith('/api/');
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutos
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],

        // Limpiar cache antiguo
        cleanupOutdatedCaches: true,

        // Skip waiting para activar nuevo SW inmediatamente
        skipWaiting: true,
        clientsClaim: true,
      },

      manifest: {
        name: 'Sistema de Laboratorio Clínico',
        short_name: 'Lab System',
        description: 'Sistema de gestión de estudios clínicos y análisis de laboratorio',
        theme_color: '#7B68A6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/LogoEG.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/Logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },

      devOptions: {
        enabled: false, // Deshabilitado en desarrollo - solo producción
        type: 'module',
      },
    }),
  ],
  
  // Optimizaciones de desarrollo
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  
  // Optimizaciones de construcción
  build: {
    // Target ES2015 para máxima compatibilidad (iOS 11+, Android 6+)
    // El plugin legacy generará bundles optimizados para navegadores modernos
    target: 'es2015',
    
    // Optimizar chunks
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Code splitting estratégico
        manualChunks: {
          // Vendor chunk para librerías grandes
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // UI chunk para componentes y animaciones
          ui: ['framer-motion', 'react-icons'],
          
          // Utils chunk para utilidades
          utils: ['fuse.js'],
        },
        
        // Nombres de archivos optimizados
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${extType}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${extType}`;
          }
          if (/\.css$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${extType}`;
          }
          
          return `assets/[name]-[hash].${extType}`;
        },
      },
    },
    
    // Configuraciones de tamaño
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096, // 4kb
    
    // Sourcemaps para producción (opcional)
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Optimizaciones adicionales
    cssCodeSplit: true,
    cssMinify: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
    },
  },
  
  // Optimizaciones de resolución
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@contexts': resolve(__dirname, 'src/contexts'),
      '@layouts': resolve(__dirname, 'src/layouts'),
      '@assets': resolve(__dirname, 'src/assets'),
      // Fix para React 19 en monorepo: Forzar resolución desde root
      'react': resolve(__dirname, '../../node_modules/react'),
      'react-dom': resolve(__dirname, '../../node_modules/react-dom'),
    },
    // CRÍTICO para monorepos: Asegura una sola instancia de React
    dedupe: ['react', 'react-dom'],
  },
  
  // Optimizaciones de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-icons/fa',
    ],
    exclude: [],
  },
  
  // Configuración de assets
  assetsInclude: ['**/*.woff2', '**/*.woff', '**/*.ttf'],
  
  // Variables de entorno
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // CSS configuración
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Si usas SCSS/SASS en el futuro
      scss: {
        additionalData: `$injectedColor: orange;`
      }
    }
  },
  
  // Preview configuración
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },
})
