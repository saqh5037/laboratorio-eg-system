/**
 * Prueba de mensaje directo (sin template)
 * Debería funcionar dentro de la ventana de 24h después de "join upper-favorite"
 */

require('dotenv').config();
const TwilioService = require('./src/core/services/TwilioService');

async function testDirectMessage(phoneNumber) {
  console.log('\n🧪 ===== PRUEBA DE MENSAJE DIRECTO (SIN TEMPLATE) =====\n');
  console.log(`📱 Número de prueba: ${phoneNumber}`);
  console.log('💡 Esto debería funcionar dentro de la ventana de 24h después de "join upper-favorite"\n');

  const message = '🔬 *Laboratorio Elizabeth Gutiérrez*\n\nEste es un mensaje de prueba directo (sin template).\n\nSi recibes esto, significa que la ventana de conversación está activa. ✅';

  console.log('─────────────────────────────────────────────────────');
  console.log('Enviando mensaje directo...');
  console.log('─────────────────────────────────────────────────────\n');

  try {
    const result = await TwilioService.sendWhatsApp(phoneNumber, message);

    if (result.success) {
      console.log('✅ Enviado exitosamente');
      console.log(`   Message SID: ${result.messageId}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Timestamp: ${result.timestamp}`);
    } else {
      console.log('❌ Error en el envío');
      console.log(`   Error: ${result.error}`);
      console.log(`   Code: ${result.code}`);

      if (result.code === 63016) {
        console.log('\n⚠️  Error 63016: Fuera de ventana de 24h');
        console.log('   Esto significa que necesitas usar templates.');
      } else if (result.code === 63015) {
        console.log('\n⚠️  Error 63015: Usuario no está en el sandbox');
        console.log('   Verifica que hayas enviado "join upper-favorite" correctamente.');
      }
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
  console.error('\nUso: node test-direct-message.js +5215516867745\n');
  process.exit(1);
}

testDirectMessage(phoneNumber)
  .then(() => {
    console.log('✅ Prueba completada\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
