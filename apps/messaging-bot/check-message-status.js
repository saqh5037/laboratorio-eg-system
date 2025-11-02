/**
 * Script para verificar el estado de los mensajes enviados
 *
 * Uso: node check-message-status.js MM6226d8fc797f752faac9fd4a94b5c97c
 */

require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function checkMessageStatus(messageSid) {
  console.log(`\n🔍 Verificando estado del mensaje ${messageSid}...\n`);

  try {
    const message = await client.messages(messageSid).fetch();

    console.log('📋 Información del mensaje:\n');
    console.log(`Status: ${message.status}`);
    console.log(`Direction: ${message.direction}`);
    console.log(`From: ${message.from}`);
    console.log(`To: ${message.to}`);
    console.log(`Date Created: ${message.dateCreated}`);
    console.log(`Date Sent: ${message.dateSent}`);
    console.log(`Date Updated: ${message.dateUpdated}`);
    console.log(`Price: ${message.price} ${message.priceUnit}`);
    console.log(`Error Code: ${message.errorCode || 'None'}`);
    console.log(`Error Message: ${message.errorMessage || 'None'}`);
    console.log(`Num Segments: ${message.numSegments}`);
    console.log(`Body: ${message.body || 'N/A'}`);

    console.log('\n📊 Análisis:');

    switch(message.status) {
      case 'queued':
        console.log('⏳ El mensaje está en cola, esperando ser enviado.');
        break;
      case 'sending':
        console.log('📤 El mensaje se está enviando...');
        break;
      case 'sent':
        console.log('✅ El mensaje fue enviado exitosamente.');
        break;
      case 'delivered':
        console.log('✅ El mensaje fue entregado exitosamente.');
        break;
      case 'undelivered':
        console.log('❌ El mensaje NO fue entregado.');
        console.log('Revisa el Error Code y Error Message para más detalles.');
        break;
      case 'failed':
        console.log('❌ El envío del mensaje FALLÓ.');
        console.log('Revisa el Error Code y Error Message para más detalles.');
        break;
      default:
        console.log(`❓ Estado desconocido: ${message.status}`);
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 20404) {
      console.error('El mensaje SID no existe o es inválido.');
    }
  }
}

// Verificar los últimos 5 mensajes si no se proporciona SID
async function checkRecentMessages() {
  console.log('\n🔍 Verificando los últimos 5 mensajes enviados...\n');

  try {
    const messages = await client.messages.list({ limit: 5 });

    messages.forEach((message, index) => {
      console.log(`${index + 1}. SID: ${message.sid}`);
      console.log(`   Status: ${message.status}`);
      console.log(`   From: ${message.from}`);
      console.log(`   To: ${message.to}`);
      console.log(`   Date: ${message.dateCreated}`);
      console.log(`   Error: ${message.errorCode || 'None'} - ${message.errorMessage || 'None'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

const messageSid = process.argv[2];

if (!messageSid) {
  console.log('💡 No se proporcionó Message SID, verificando mensajes recientes...\n');
  checkRecentMessages().then(() => process.exit(0));
} else {
  checkMessageStatus(messageSid).then(() => process.exit(0));
}
