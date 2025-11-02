/**
 * Script de Prueba - WhatsApp Sandbox Templates
 *
 * Prueba las 3 plantillas pre-aprobadas del Twilio Sandbox:
 * 1. Verification Codes - "Your {{1}} code is {{2}}"
 * 2. Appointment Reminders - "Your appointment is coming up on {{1}} at {{2}}"
 * 3. Order Notifications - "Your {{1}} order of {{2}} has shipped and should be delivered on {{3}}. Details: {{4}}"
 *
 * Uso:
 * node test-whatsapp-sandbox-templates.js +5215516867745
 */

require('dotenv').config();
const TwilioService = require('./src/core/services/TwilioService');

// Content SIDs de las plantillas pre-aprobadas del Sandbox
const SANDBOX_TEMPLATES = {
  verificationCode: 'HXb6e20ed8ab5b23ab3c6cdcc8e6b6302d', // "Your {{1}} code is {{2}}"
  appointmentReminder: 'HX229f5a04fd0510ce1b071852155d7e41', // "Your appointment is coming up on {{1}} at {{2}}"
  orderNotification: 'HXdcf1b15c0b7bc63d48129c2c88b08726' // "Your {{1}} order of {{2}} has shipped and should be delivered on {{3}}. Details: {{4}}"
};

async function testSandboxTemplates(phoneNumber) {
  console.log('\n🧪 ===== PRUEBA DE PLANTILLAS SANDBOX DE TWILIO =====\n');
  console.log(`📱 Número de prueba: ${phoneNumber}`);
  console.log('⚠️  Asegúrate de haber enviado "join upper-favorite" al sandbox primero\n');

  const results = [];

  // ===== TEST 1: Verification Code Template =====
  console.log('─────────────────────────────────────────────────────');
  console.log('TEST 1: Verification Code');
  console.log('─────────────────────────────────────────────────────');
  console.log('Plantilla: "Your {{1}} code is {{2}}"');
  console.log('Variables: {{1}}=Laboratorio EG, {{2}}=697078\n');

  try {
    const result1 = await TwilioService.sendWhatsAppTemplate(
      phoneNumber,
      SANDBOX_TEMPLATES.verificationCode,
      {
        '1': 'Laboratorio EG',
        '2': '697078'
      }
    );

    if (result1.success) {
      console.log('✅ Enviado exitosamente');
      console.log(`   Message SID: ${result1.messageId}`);
      console.log(`   Status: ${result1.status}`);
      results.push({ test: 'Verification Code', status: 'SUCCESS', sid: result1.messageId });
    } else {
      console.log('❌ Error en el envío');
      console.log(`   Error: ${result1.error}`);
      console.log(`   Code: ${result1.code}`);
      results.push({ test: 'Verification Code', status: 'FAILED', error: result1.error });
    }
  } catch (error) {
    console.log('❌ Excepción capturada:', error.message);
    results.push({ test: 'Verification Code', status: 'ERROR', error: error.message });
  }

  console.log('\n');

  // ===== TEST 2: Appointment Reminder Template =====
  console.log('─────────────────────────────────────────────────────');
  console.log('TEST 2: Appointment Reminder');
  console.log('─────────────────────────────────────────────────────');
  console.log('Plantilla: "Your appointment is coming up on {{1}} at {{2}}"');
  console.log('Variables: {{1}}=15 de Noviembre 2025, {{2}}=10:30 AM\n');

  try {
    const result2 = await TwilioService.sendWhatsAppTemplate(
      phoneNumber,
      SANDBOX_TEMPLATES.appointmentReminder,
      {
        '1': '15 de Noviembre 2025',
        '2': '10:30 AM'
      }
    );

    if (result2.success) {
      console.log('✅ Enviado exitosamente');
      console.log(`   Message SID: ${result2.messageId}`);
      console.log(`   Status: ${result2.status}`);
      results.push({ test: 'Appointment Reminder', status: 'SUCCESS', sid: result2.messageId });
    } else {
      console.log('❌ Error en el envío');
      console.log(`   Error: ${result2.error}`);
      console.log(`   Code: ${result2.code}`);
      results.push({ test: 'Appointment Reminder', status: 'FAILED', error: result2.error });
    }
  } catch (error) {
    console.log('❌ Excepción capturada:', error.message);
    results.push({ test: 'Appointment Reminder', status: 'ERROR', error: error.message });
  }

  console.log('\n');

  // ===== TEST 3: Order Notification Template =====
  console.log('─────────────────────────────────────────────────────');
  console.log('TEST 3: Order Notification');
  console.log('─────────────────────────────────────────────────────');
  console.log('Plantilla: "Your {{1}} order of {{2}} has shipped and should be delivered on {{3}}. Details: {{4}}"');
  console.log('Variables: {{1}}=Laboratorio EG, {{2}}=Orden #2505150002, {{3}}=Hoy, {{4}}=Resultados disponibles\n');

  try {
    const result3 = await TwilioService.sendWhatsAppTemplate(
      phoneNumber,
      SANDBOX_TEMPLATES.orderNotification,
      {
        '1': 'Laboratorio EG',
        '2': 'Orden #2505150002',
        '3': 'Hoy',
        '4': 'Resultados disponibles en el portal'
      }
    );

    if (result3.success) {
      console.log('✅ Enviado exitosamente');
      console.log(`   Message SID: ${result3.messageId}`);
      console.log(`   Status: ${result3.status}`);
      results.push({ test: 'Order Notification', status: 'SUCCESS', sid: result3.messageId });
    } else {
      console.log('❌ Error en el envío');
      console.log(`   Error: ${result3.error}`);
      console.log(`   Code: ${result3.code}`);
      results.push({ test: 'Order Notification', status: 'FAILED', error: result3.error });
    }
  } catch (error) {
    console.log('❌ Excepción capturada:', error.message);
    results.push({ test: 'Order Notification', status: 'ERROR', error: error.message });
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
    console.log('📱 Verifica tu WhatsApp para ver los mensajes recibidos.\n');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Verifica:');
    console.log('   1. Que hayas enviado "join upper-favorite" al sandbox');
    console.log('   2. Que las credenciales de Twilio sean correctas');
    console.log('   3. Que el número de teléfono esté en formato internacional\n');
  }

  console.log('💡 Próximos pasos:');
  console.log('   - Revisa los mensajes en tu WhatsApp');
  console.log('   - Verifica los logs en Twilio Console: https://console.twilio.com/us1/monitor/logs/messages');
  console.log('   - Si todo funciona, adapta estas plantillas para tu lógica de negocio\n');
}

// Ejecutar pruebas
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.error('\n❌ Error: Debes proporcionar un número de teléfono');
  console.error('\nUso: node test-whatsapp-sandbox-templates.js +5215516867745\n');
  process.exit(1);
}

testSandboxTemplates(phoneNumber)
  .then(() => {
    console.log('✅ Pruebas completadas\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
