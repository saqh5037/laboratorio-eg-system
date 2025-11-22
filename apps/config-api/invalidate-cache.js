#!/usr/bin/env node
/**
 * Script para invalidar el cache de configuraciones manualmente
 * Uso: node invalidate-cache.js
 */

const CacheService = require('./src/services/CacheService');

console.log('🔄 Invalidando cache de configuraciones...');

// Invalidar TODO el cache de configuraciones
CacheService.invalidateAllConfig();

console.log('✅ Cache invalidado exitosamente');
console.log('');
console.log('📊 Estadísticas del cache:');
const stats = CacheService.getStats();
console.log(stats);

process.exit(0);
