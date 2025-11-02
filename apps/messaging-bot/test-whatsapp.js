require('dotenv').config();
const TwilioService = require('./src/core/services/TwilioService');

async function testWhatsApp() {
  console.log('📱 Testing WhatsApp notification...\n');

  const testMessage = `🔬 *Laboratorio EG - Test de WhatsApp*

¡Hola! Este es un mensaje de prueba del sistema de notificaciones multi-canal.

✅ WhatsApp Adapter funcionando correctamente
✅ TwilioService configurado
✅ Migración de base de datos completada

📋 *Sistema listo para:*
1. Notificaciones de órdenes creadas
2. Notificaciones de órdenes pagadas
3. Notificaciones de resultados listos

💬 Responde a este mensaje para probar comunicación bidireccional.`;

  const phoneNumber = '+5215516867745';

  try {
    console.log(`Enviando mensaje a ${phoneNumber}...\n`);

    const result = await TwilioService.sendWhatsApp(phoneNumber, testMessage);

    if (result.success) {
      console.log('✅ ¡Mensaje enviado exitosamente!');
      console.log(`   - Message SID: ${result.messageId}`);
      console.log(`   - Status: ${result.status}`);
      console.log(`   - Channel: ${result.channel}`);
      console.log(`   - Timestamp: ${result.timestamp}`);
    } else {
      console.log('❌ Error enviando mensaje:');
      console.log(`   - Error: ${result.error}`);
      console.log(`   - Code: ${result.code}`);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testWhatsApp();
