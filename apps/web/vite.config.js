import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimizaciones de desarrollo
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  
  // Optimizaciones de construcción
  build: {
    // Targets modernos para mejor performance
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    
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
    },
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
  
  // Configuración de PWA (se expandirá con workbox si es necesario)
  worker: {
    format: 'es',
  },
})
