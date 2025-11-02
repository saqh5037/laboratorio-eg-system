/**
 * Script de prueba para las 3 plantillas personalizadas
 *
 * Uso: node test-all-custom-templates.js +5215516867745
 */

require('dotenv').config();
const TwilioService = require('./src/core/services/TwilioService');

async function testAllTemplates(phoneNumber) {
  console.log('\n🧪 ===== PRUEBA DE PLANTILLAS PERSONALIZADAS =====\n');
  console.log(`📱 Número de prueba: ${phoneNumber}`);
  console.log('⚠️  Asegúrate de haber enviado "join upper-favorite" al sandbox primero\n');

  const results = [];
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // ===== TEST 1: Orden Creada =====
  console.log('─────────────────────────────────────────────────────');
  console.log('TEST 1: Orden Creada');
  console.log('─────────────────────────────────────────────────────');
  console.log('Plantilla: "Estimado {{1}}, se ha creado una orden con número {{2}}."');
  console.log('SID: HXad9a9865456fc4ee0350f75ce1f4da21');
  console.log('Variables: {{1}}=Carlos Estrada, {{2}}=2505150002\n');

  try {
    const result1 = await TwilioService.sendWhatsAppTemplate(
      phoneNumber,
      'HXad9a9865456fc4ee0350f75ce1f4da21',
      {
        '1': 'Carlos Estrada',
        '2': '2505150002'
      }
    );

    if (result1.success) {
      console.log('✅ Enviado exitosamente');
      console.log(`   Message SID: ${result1.messageId}`);
      console.log(`   Status: ${result1.status}`);
      results.push({ test: 'Orden Creada', status: 'SUCCESS', sid: result1.messageId });
    } else {
      console.log('❌ Error en el envío');
      console.log(`   Error: ${result1.error}`);
      console.log(`   Code: ${result1.code}`);
      results.push({ test: 'Orden Creada', status: 'FAILED', error: result1.error });
    }
  } catch (error) {
    console.log('❌ Excepción capturada:', error.message);
    results.push({ test: 'Orden Creada', status: 'ERROR', error: error.message });
  }

  console.log('\n');
  await delay(2000); // Esperar 2 segundos entre envíos

  // ===== TEST 2: Resultados Listos =====
  console.log('─────────────────────────────────────────────────────');
  console.log('TEST 2: Resultados Listos');
  console.log('─────────────────────────────────────────────────────');
  console.log('Plantilla: "Estimado {{1}}, sus resultados están listos. Consulte el portal: {{2}}"');
  console.log('SID: HX929898b77e9387d993918b3264fbdbad');
  console.log('Variables: {{1}}=Carlos Estrada, {{2}}=https://resultados.laboratoriog.com\n');

  try {
    const result2 = await TwilioService.sendWhatsAppTemplate(
      phoneNumber,
      'HX929898b77e9387d993918b3264fbdbad',
      {
        '1': 'Carlos Estrada',
        '2': 'https://resultados.laboratoriog.com'
      }
    );

    if (result2.success) {
      console.log('✅ Enviado exitosamente');
      console.log(`   Message SID: ${result2.messageId}`);
      console.log(`   Status: ${result2.status}`);
      results.push({ test: 'Resultados Listos', status: 'SUCCESS', sid: result2.messageId });
    } else {
      console.log('❌ Error en el envío');
      console.log(`   Error: ${result2.error}`);
      console.log(`   Code: ${result2.code}`);
      results.push({ test: 'Resultados Listos', status: 'FAILED', error: result2.error });
    }
  } catch (error) {
    console.log('❌ Excepción capturada:', error.message);
    results.push({ test: 'Resultados Listos', status: 'ERROR', error: error.message });
  }

  console.log('\n');
  await delay(2000); // Esperar 2 segundos entre envíos

  // ===== TEST 3: Cancelación de Cita =====
  console.log('─────────────────────────────────────────────────────');
  console.log('TEST 3: Cancelación de Cita');
  console.log('─────────────────────────────────────────────────────');
  console.log('Plantilla: "Estimado {{1}}, su cita ha sido cancelada por el laboratorio."');
  console.log('SID: HX699c0582563f7e3e8178792b96f366bb');
  console.log('Variables: {{1}}=Carlos Estrada\n');

  try {
    const result3 = await TwilioService.sendWhatsAppTemplate(
      phoneNumber,
      'HX699c0582563f7e3e8178792b96f366bb',
      {
        '1': 'Carlos Estrada'
      }
    );

    if (result3.success) {
      console.log('✅ Enviado exitosamente');
      console.log(`   Message SID: ${result3.messageId}`);
      console.log(`   Status: ${result3.status}`);
      results.push({ test: 'Cancelación de Cita', status: 'SUCCESS', sid: result3.messageId });
    } else {
      console.log('❌ Error en el envío');
      console.log(`   Error: ${result3.error}`);
      console.log(`   Code: ${result3.code}`);
      results.push({ test: 'Cancelación de Cita', status: 'FAILED', error: result3.error });
    }
  } catch (error) {
    console.log('❌ Excepción capturada:', error.message);
    results.push({ test: 'Cancelación de Cita', status: 'ERROR', error: error.message });
  }

  // ===== RESUMEN =====
  console.log('\n');
  console.log('═════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('═════════════════════════════════════════════════════\n');

  results.forEach((result, index) => {
    const icon = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${result.test}: ${result.status}`);
    if (result.sid) {
      console.log(`   SID: ${result.sid}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const totalCount = results.length;

  console.log('\n─────────────────────────────────────────────────────');
  console.log(`Total: ${successCount}/${totalCount} tests exitosos`);
  console.log('─────────────────────────────────────────────────────\n');

  if (successCount === totalCount) {
    console.log('🎉 ¡Todas las plantillas funcionan correctamente!\n');
    console.log('📱 Verifica tu WhatsApp para ver los 3 mensajes recibidos.\n');
    console.log('💡 Los mensajes deberían decir:');
    console.log('   1. "Estimado Carlos Estrada, se ha creado una orden con número 2505150002."');
    console.log('   2. "Estimado Carlos Estrada, sus resultados están listos. Consulte el portal: https://resultados.laboratoriog.com"');
    console.log('   3. "Estimado Carlos Estrada, su cita ha sido cancelada por el laboratorio."\n');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Verifica:');
    console.log('   1. Que hayas enviado "join upper-favorite" al sandbox');
    console.log('   2. Que las credenciales de Twilio sean correctas');
    console.log('   3. Que el número de teléfono esté en formato internacional');
    console.log('   4. Que las plantillas estén aprobadas en Twilio Console\n');
  }

  console.log('💡 Próximos pasos:');
  console.log('   - Revisa los mensajes en tu WhatsApp');
  console.log('   - Verifica los logs en Twilio Console: https://console.twilio.com/us1/monitor/logs/messages');
  console.log('   - Si todo funciona, las plantillas están listas para producción\n');
}

const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.error('\n❌ Error: Debes proporcionar un número de teléfono');
  console.error('\nUso: node test-all-custom-templates.js +5215516867745\n');
  process.exit(1);
}

testAllTemplates(phoneNumber)
  .then(() => {
    console.log('✅ Pruebas completadas\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
