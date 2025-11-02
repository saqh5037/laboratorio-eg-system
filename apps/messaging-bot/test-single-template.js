/**
 * Script de prueba para una sola plantilla
 *
 * Uso: node test-single-template.js +5215516867745
 */

require('dotenv').config();
const TwilioService = require('./src/core/services/TwilioService');

async function testTemplate(phoneNumber) {
  console.log('\n🧪 ===== PRUEBA DE PLANTILLA PERSONALIZADA =====\n');
  console.log(`📱 Número de prueba: ${phoneNumber}\n`);

  // Test con plantilla orden_creada
  console.log('─────────────────────────────────────────────────────');
  console.log('TEST: Orden Creada');
  console.log('─────────────────────────────────────────────────────');
  console.log('Plantilla: "Estimado {{1}}, se ha creado una orden con número {{2}}."');
  console.log('SID: HXad9a9865456fc4ee0350f75ce1f4da21');
  console.log('Variables: {{1}}=Carlos Estrada, {{2}}=2505150002\n');

  try {
    const result = await TwilioService.sendWhatsAppTemplate(
      phoneNumber,
      'HXad9a9865456fc4ee0350f75ce1f4da21',
      {
        '1': 'Carlos Estrada',
        '2': '2505150002'
      }
    );

    if (result.success) {
      console.log('✅ Enviado exitosamente');
      console.log(`   Message SID: ${result.messageId}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Timestamp: ${result.timestamp}`);
    } else {
      console.log('❌ Error en el envío');
      console.log(`   Error: ${result.error}`);
      console.log(`   Code: ${result.code}`);
    }
  } catch (error) {
    console.log('❌ Excepción capturada:', error.message);
    console.error(error.stack);
  }

  console.log('\n═════════════════════════════════════════════════════\n');
}

const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.error('\n❌ Error: Debes proporcionar un número de teléfono');
  console.error('\nUso: node test-single-template.js +5215516867745\n');
  process.exit(1);
}

testTemplate(phoneNumber)
  .then(() => {
    console.log('✅ Prueba completada\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
