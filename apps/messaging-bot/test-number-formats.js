/**
 * Prueba diferentes formatos de número para WhatsApp sandbox
 */

require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function testDifferentFormats() {
  console.log('\n🧪 ===== PRUEBA DE FORMATOS DE NÚMERO =====\n');

  const baseNumber = '5516867745'; // Sin código de país
  const formats = [
    `+52${baseNumber}`,      // Formato estándar mexicano
    `+521${baseNumber}`,     // Con 1 adicional (móvil México)
    `whatsapp:+52${baseNumber}`,
    `whatsapp:+521${baseNumber}`
  ];

  const message = '🧪 Prueba de formato de número';

  for (const format of formats) {
    console.log(`─────────────────────────────────────────────────────`);
    console.log(`Probando formato: ${format}`);
    console.log(`─────────────────────────────────────────────────────\n`);

    try {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: format.startsWith('whatsapp:') ? format : `whatsapp:${format}`
      });

      console.log(`✅ Enviado con formato: ${format}`);
      console.log(`   Message SID: ${result.sid}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   To: ${result.to}\n`);

      // Esperar 3 segundos
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verificar estado
      const status = await client.messages(result.sid).fetch();
      console.log(`   Estado final: ${status.status}`);
      if (status.errorCode) {
        console.log(`   Error: ${status.errorCode} - ${status.errorMessage || 'None'}`);
      }
      console.log('\n');

    } catch (error) {
      console.log(`❌ Error con formato: ${format}`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}\n`);
    }
  }

  console.log('═════════════════════════════════════════════════════');
  console.log('Prueba completada');
  console.log('═════════════════════════════════════════════════════\n');
}

testDifferentFormats()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
