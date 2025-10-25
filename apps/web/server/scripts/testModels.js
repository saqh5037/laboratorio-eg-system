// Script para probar los modelos actualizados con la estructura real de Labsis
import models from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const { Prueba, GrupoPrueba, ListaPrecios, Area, UnifiedSearch } = models;

async function testModels() {
  console.log('🧪 PROBANDO MODELOS ACTUALIZADOS CON ESTRUCTURA REAL\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // 1. TEST: Obtener pruebas
    console.log('📋 1. TEST: Obtener pruebas (primeras 5)');
    console.log('─────────────────────────────────────────────────────');
    
    const pruebas = await Prueba.findAll({ limit: 5 });
    console.log(`✅ Encontradas ${pruebas.length} pruebas`);
    
    if (pruebas.length > 0) {
      const primera = pruebas[0];
      console.log('\nEjemplo de prueba:');
      console.log(`  ID: ${primera.id}`);
      console.log(`  Nomenclatura: ${primera.nomenclatura || 'N/A'}`);
      console.log(`  Nombre: ${primera.nombre}`);
      console.log(`  Precio: $${primera.precio || 0}`);
      console.log(`  Área: ${primera.area_nombre || 'N/A'}`);
      console.log(`  Tipo muestra: ${primera.tipo_muestra_nombre || 'N/A'}`);
    }

    // 2. TEST: Buscar prueba por nomenclatura
    console.log('\n\n📋 2. TEST: Buscar prueba por nomenclatura');
    console.log('─────────────────────────────────────────────────────');
    
    if (pruebas.length > 0 && pruebas[0].nomenclatura) {
      const pruebaPorNomenclatura = await Prueba.findByNomenclatura(pruebas[0].nomenclatura);
      if (pruebaPorNomenclatura) {
        console.log(`✅ Prueba encontrada: ${pruebaPorNomenclatura.nombre}`);
      } else {
        console.log('❌ No se encontró la prueba por nomenclatura');
      }
    } else {
      console.log('⚠️ No hay nomenclatura disponible para probar');
    }

    // 3. TEST: Buscar pruebas con término de búsqueda
    console.log('\n\n📋 3. TEST: Búsqueda de pruebas (término: "hemoglobina")');
    console.log('─────────────────────────────────────────────────────');
    
    const resultadosBusqueda = await Prueba.search('hemoglobina', 10);
    console.log(`✅ Encontrados ${resultadosBusqueda.length} resultados`);
    
    if (resultadosBusqueda.length > 0) {
      console.log('\nPrimeros 3 resultados:');
      resultadosBusqueda.slice(0, 3).forEach(p => {
        console.log(`  • ${p.nombre} (${p.nomenclatura || 'Sin código'})`);
      });
    }

    // 4. TEST: Obtener grupos de pruebas
    console.log('\n\n📋 4. TEST: Obtener grupos de pruebas (primeros 5)');
    console.log('─────────────────────────────────────────────────────');
    
    const grupos = await GrupoPrueba.findAll({ limit: 5 });
    console.log(`✅ Encontrados ${grupos.length} grupos`);
    
    if (grupos.length > 0) {
      const primerGrupo = grupos[0];
      console.log('\nEjemplo de grupo:');
      console.log(`  ID: ${primerGrupo.id}`);
      console.log(`  Código: ${primerGrupo.codigo || 'N/A'}`);
      console.log(`  Nombre: ${primerGrupo.nombre}`);
      console.log(`  Precio: $${primerGrupo.precio || 0}`);
      console.log(`  Cantidad de pruebas: ${primerGrupo.cantidad_pruebas || 0}`);
    }

    // 5. TEST: Obtener grupo con sus pruebas
    console.log('\n\n📋 5. TEST: Obtener grupo con sus pruebas');
    console.log('─────────────────────────────────────────────────────');
    
    if (grupos.length > 0) {
      const grupoConPruebas = await GrupoPrueba.findByIdWithPruebas(grupos[0].id);
      if (grupoConPruebas) {
        console.log(`✅ Grupo: ${grupoConPruebas.nombre}`);
        console.log(`   Contiene ${grupoConPruebas.pruebas.length} pruebas:`);
        grupoConPruebas.pruebas.slice(0, 5).forEach(p => {
          console.log(`   • ${p.nombre} (${p.nomenclatura || 'N/A'})`);
        });
      }
    }

    // 6. TEST: Obtener áreas
    console.log('\n\n📋 6. TEST: Obtener áreas del laboratorio');
    console.log('─────────────────────────────────────────────────────');
    
    const areas = await Area.findAll();
    console.log(`✅ Encontradas ${areas.length} áreas`);
    
    if (areas.length > 0) {
      console.log('\nPrimeras 5 áreas:');
      areas.slice(0, 5).forEach(a => {
        console.log(`  • ${a.nombre} (${a.cantidad_pruebas || 0} pruebas)`);
      });
    }

    // 7. TEST: Obtener listas de precios
    console.log('\n\n📋 7. TEST: Obtener listas de precios');
    console.log('─────────────────────────────────────────────────────');
    
    const listas = await ListaPrecios.findAll();
    console.log(`✅ Encontradas ${listas.length} listas de precios`);
    
    if (listas.length > 0) {
      console.log('\nListas disponibles:');
      listas.forEach(l => {
        console.log(`  • ID ${l.id}: ${l.nombre || 'Sin nombre'}`);
      });
    }

    // 8. TEST: Búsqueda unificada
    console.log('\n\n📋 8. TEST: Búsqueda unificada (término: "glucosa")');
    console.log('─────────────────────────────────────────────────────');
    
    const busquedaUnificada = await UnifiedSearch.search('glucosa', { limit: 20 });
    console.log(`✅ Encontrados:`);
    console.log(`   ${busquedaUnificada.pruebas.length} pruebas`);
    console.log(`   ${busquedaUnificada.grupos.length} grupos`);
    
    if (busquedaUnificada.pruebas.length > 0) {
      console.log('\nPrimeras 3 pruebas:');
      busquedaUnificada.pruebas.slice(0, 3).forEach(p => {
        console.log(`  • ${p.nombre} - $${p.precio || 0}`);
      });
    }
    
    if (busquedaUnificada.grupos.length > 0) {
      console.log('\nPrimeros 3 grupos:');
      busquedaUnificada.grupos.slice(0, 3).forEach(g => {
        console.log(`  • ${g.nombre} - $${g.precio || 0} (${g.cantidad_pruebas} pruebas)`);
      });
    }

    // 9. TEST: Obtener estadísticas generales
    console.log('\n\n📋 9. TEST: Estadísticas generales del sistema');
    console.log('─────────────────────────────────────────────────────');
    
    const stats = await UnifiedSearch.getStatistics();
    console.log('✅ Estadísticas:');
    console.log(`   Total de pruebas activas: ${stats.total_pruebas}`);
    console.log(`   Total de grupos activos: ${stats.total_grupos}`);
    console.log(`   Total de áreas: ${stats.total_areas}`);
    console.log(`   Total de listas de precios: ${stats.total_listas_precios}`);
    console.log(`   Total de tipos de muestra: ${stats.total_tipos_muestra}`);

    // 10. TEST: Obtener precio de una prueba
    console.log('\n\n📋 10. TEST: Obtener precio de una prueba por lista');
    console.log('─────────────────────────────────────────────────────');
    
    if (pruebas.length > 0 && listas.length > 0) {
      const precio = await Prueba.getPrice(pruebas[0].id, listas[0].id);
      if (precio) {
        console.log(`✅ Precio de "${pruebas[0].nombre}" en lista "${precio.lista_nombre}": $${precio.precio}`);
        if (precio.descuento) {
          console.log(`   Descuento: ${precio.descuento}%`);
        }
      } else {
        console.log(`⚠️ No se encontró precio para la prueba en la lista`);
      }
    }

    console.log('\n\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════════════\n');

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
    
    if (error.hint) {
      console.error(`Sugerencia: ${error.hint}`);
    }
    
    console.error('\n💡 Posibles soluciones:');
    console.error('1. Verificar que el servidor de base de datos esté ejecutándose');
    console.error('2. Verificar las credenciales en el archivo .env');
    console.error('3. Verificar que las tablas existan en la base de datos');
    console.error('4. Revisar los nombres de columnas en los modelos');
    
    process.exit(1);
  }

  process.exit(0);
}

// Ejecutar las pruebas
testModels();