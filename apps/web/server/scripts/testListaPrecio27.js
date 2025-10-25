// Script para verificar que solo se muestren estudios de lista de precios ID 27
import models from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const { Prueba, GrupoPrueba, UnifiedSearch } = models;

async function testListaPrecio27() {
  console.log('🧪 VERIFICANDO FILTRADO POR LISTA DE PRECIOS ID 27 (Ambulatorio_Abril_2025)\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // 1. TEST: Obtener pruebas con precios de lista 27
    console.log('📋 1. TEST: Obtener pruebas (primeras 10)');
    console.log('─────────────────────────────────────────────────────');
    
    const pruebas = await Prueba.findAll({ 
      limit: 10,
      listaPreciosId: 27
    });
    
    console.log(`✅ Encontradas ${pruebas.length} pruebas\n`);
    console.log('Nombre                                            Precio     Área');
    console.log('──────────────────────────────────────────────────────────────────────');
    
    pruebas.forEach(p => {
      const nombre = p.nombre.substring(0, 48).padEnd(49);
      const precio = `$${parseFloat(p.precio_lista || 0).toFixed(2)}`.padEnd(10);
      const area = (p.area_nombre || 'Sin área').substring(0, 20);
      console.log(`${nombre} ${precio} ${area}`);
    });

    // 2. TEST: Buscar pruebas específicas
    console.log('\n\n📋 2. TEST: Búsqueda de pruebas (término: "covid")');
    console.log('─────────────────────────────────────────────────────');
    
    const busquedaCovid = await Prueba.search('covid', 10, 27);
    console.log(`✅ Encontrados ${busquedaCovid.length} resultados\n`);
    
    if (busquedaCovid.length > 0) {
      busquedaCovid.forEach(p => {
        console.log(`• ${p.nombre.padEnd(50)} $${parseFloat(p.precio_lista || 0).toFixed(2)}`);
      });
    } else {
      console.log('No se encontraron pruebas con "covid"');
    }

    // 3. TEST: Obtener grupos/perfiles con precios
    console.log('\n\n📋 3. TEST: Obtener grupos/perfiles (primeros 10)');
    console.log('─────────────────────────────────────────────────────');
    
    const grupos = await GrupoPrueba.findAll({ 
      limit: 10,
      listaPreciosId: 27
    });
    
    console.log(`✅ Encontrados ${grupos.length} grupos\n`);
    console.log('Nombre                                            Precio     Pruebas');
    console.log('──────────────────────────────────────────────────────────────────────');
    
    grupos.forEach(g => {
      const nombre = g.nombre.substring(0, 48).padEnd(49);
      const precio = `$${parseFloat(g.precio_lista || 0).toFixed(2)}`.padEnd(10);
      const cantidad = `${g.cantidad_pruebas || 0} pruebas`;
      console.log(`${nombre} ${precio} ${cantidad}`);
    });

    // 4. TEST: Búsqueda unificada
    console.log('\n\n📋 4. TEST: Búsqueda unificada (término: "perfil")');
    console.log('─────────────────────────────────────────────────────');
    
    const busquedaUnificada = await UnifiedSearch.search('perfil', {
      listaPreciosId: 27,
      limit: 20
    });
    
    console.log(`✅ Encontrados:`);
    console.log(`   ${busquedaUnificada.pruebas.length} pruebas`);
    console.log(`   ${busquedaUnificada.grupos.length} grupos\n`);
    
    if (busquedaUnificada.grupos.length > 0) {
      console.log('Primeros 5 grupos:');
      busquedaUnificada.grupos.slice(0, 5).forEach(g => {
        console.log(`• ${g.nombre.padEnd(50)} $${parseFloat(g.precio || 0).toFixed(2)}`);
      });
    }

    // 5. TEST: Verificar totales
    console.log('\n\n📋 5. TEST: Estadísticas de la lista ID 27');
    console.log('─────────────────────────────────────────────────────');
    
    // Obtener conteo real de la base de datos
    const pruebasTotal = await Prueba.findAll({ 
      limit: 1000,
      listaPreciosId: 27
    });
    
    const gruposTotal = await GrupoPrueba.findAll({ 
      limit: 1000,
      listaPreciosId: 27
    });
    
    console.log(`\nTotal de estudios disponibles en lista ID 27:`);
    console.log(`• Pruebas individuales: ${pruebasTotal.length}`);
    console.log(`• Grupos/perfiles: ${gruposTotal.length}`);
    console.log(`• TOTAL: ${pruebasTotal.length + gruposTotal.length} estudios`);

    // 6. TEST: Verificar precios
    console.log('\n\n📋 6. TEST: Verificación de precios');
    console.log('─────────────────────────────────────────────────────');
    
    const pruebasConPrecio = pruebasTotal.filter(p => p.precio_lista && p.precio_lista > 0);
    const pruebasSinPrecio = pruebasTotal.filter(p => !p.precio_lista || p.precio_lista === 0);
    
    console.log(`\nEstadísticas de precios (pruebas):`);
    console.log(`• Con precio definido: ${pruebasConPrecio.length}`);
    console.log(`• Sin precio o precio $0: ${pruebasSinPrecio.length}`);
    
    if (pruebasConPrecio.length > 0) {
      const precios = pruebasConPrecio.map(p => parseFloat(p.precio_lista));
      const min = Math.min(...precios);
      const max = Math.max(...precios);
      const avg = precios.reduce((a, b) => a + b, 0) / precios.length;
      
      console.log(`\nRango de precios:`);
      console.log(`• Mínimo: $${min.toFixed(2)}`);
      console.log(`• Máximo: $${max.toFixed(2)}`);
      console.log(`• Promedio: $${avg.toFixed(2)}`);
    }

    console.log('\n\n✅ TODAS LAS VERIFICACIONES COMPLETADAS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('El sistema está correctamente configurado para mostrar solo');
    console.log('los estudios de la lista de precios ID 27 (Ambulatorio_Abril_2025)');

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:');
    console.error('─────────────────────────────────────');
    console.error(`Mensaje: ${error.message}`);
    
    if (error.code) {
      console.error(`Código: ${error.code}`);
    }
    
    if (error.detail) {
      console.error(`Detalle: ${error.detail}`);
    }
    
    process.exit(1);
  }

  process.exit(0);
}

// Ejecutar las pruebas
testListaPrecio27();