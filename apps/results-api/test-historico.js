/**
 * Script de prueba para endpoint de histórico
 *
 * Uso: node test-historico.js
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3003/api';

// Datos del paciente de prueba
const PACIENTE_TEST = {
  codigo_lealtad: '17063454',
  fecha_nacimiento: '1985-11-21'  // Ajustar si es necesario
};

// ID de prueba (HEMOGLOBINA u otra)
const PRUEBA_ID = 12; // Ajustar según la base de datos

async function testHistorico() {
  try {
    console.log('🧪 Iniciando test del endpoint de histórico...\n');

    // Paso 1: Autenticar y obtener token
    console.log('📝 Paso 1: Autenticando paciente...');
    const authResponse = await axios.post(`${BASE_URL}/auth/verify`, PACIENTE_TEST);

    if (!authResponse.data.success) {
      console.error('❌ Error en autenticación:', authResponse.data.error);
      return;
    }

    const token = authResponse.data.data.token;
    const ci_paciente = authResponse.data.data.paciente.ci_paciente;

    console.log('✅ Autenticación exitosa');
    console.log(`   Paciente: ${authResponse.data.data.paciente.nombre}`);
    console.log(`   CI: ${ci_paciente}`);
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // Paso 2: Obtener histórico
    console.log(`📊 Paso 2: Obteniendo histórico de prueba ${PRUEBA_ID}...`);
    const historicoResponse = await axios.get(
      `${BASE_URL}/resultados/historico/${PRUEBA_ID}/${ci_paciente}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          limit: 10
        }
      }
    );

    if (!historicoResponse.data.success) {
      console.error('❌ Error al obtener histórico:', historicoResponse.data.error);
      return;
    }

    const historico = historicoResponse.data.data;

    console.log('✅ Histórico obtenido exitosamente\n');
    console.log('📋 Información de la prueba:');
    console.log(`   Nombre: ${historico.prueba.nombre}`);
    console.log(`   Nomenclatura: ${historico.prueba.nomenclatura || 'N/A'}`);
    console.log(`   Unidad: ${historico.prueba.unidad || 'N/A'}`);
    console.log(`   Total de resultados: ${historico.total}\n`);

    if (historico.historico.length > 0) {
      console.log('📈 Últimos resultados:');
      historico.historico.forEach((resultado, index) => {
        console.log(`\n   ${index + 1}. Orden: ${resultado.numeroOrden}`);
        console.log(`      Fecha: ${new Date(resultado.fecha).toLocaleDateString('es-ES')}`);
        console.log(`      Valor: ${resultado.valor} ${resultado.unidad || ''}`);
        console.log(`      Estado: ${resultado.estado.toUpperCase()} ${resultado.esCritico ? '⚡ CRÍTICO' : ''}`);
        if (resultado.valorDesde && resultado.valorHasta) {
          console.log(`      Rango: ${resultado.valorDesde} - ${resultado.valorHasta}`);
        }
        console.log(`      Validado por: ${resultado.validadoPor || 'N/A'}`);
      });
    } else {
      console.log('   ⚠️  No hay resultados históricos para esta prueba');
    }

    console.log('\n✨ Test completado exitosamente!\n');

  } catch (error) {
    console.error('\n❌ Error en el test:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${error.response.data.error || error.response.statusText}`);
    } else {
      console.error(`   ${error.message}`);
    }
  }
}

// Ejecutar test
testHistorico();
