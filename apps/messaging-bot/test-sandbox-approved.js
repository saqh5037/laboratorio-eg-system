/**
 * Prueba con plantilla pre-aprobada del sandbox
 */

require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function testApprovedTemplate() {
  console.log('\n🧪 ===== PRUEBA CON PLANTILLA APROBADA DEL SANDBOX =====\n');

  const phoneNumber = '+5215516867745';

  // Plantilla de Appointment Reminders confirmada que funciona
  const contentSid = 'HXb5b62575e6e4ff6129ad7c8efe1f983e';

  console.log(`📱 Número: ${phoneNumber}`);
  console.log(`📋 Template: Appointment Reminders`);
  console.log(`🆔 Content SID: ${contentSid}`);
  console.log(`💬 Mensaje: "Your appointment is coming up on {{1}} at {{2}}"\n`);

  try {
    const result = await client.messages.create({
      contentSid: contentSid,
      contentVariables: JSON.stringify({
        1: 'Noviembre 5, 2025',
        2: '10:30 AM'
      }),
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${phoneNumber}`
    });

    console.log('✅ Mensaje enviado exitosamente!');
    console.log(`   SID: ${result.sid}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   To: ${result.to}`);
    console.log(`   Body: ${result.body}`);

    console.log('\n📱 Verifica tu WhatsApp, deberías recibir:');
    console.log('   "Your appointment is coming up on Noviembre 5, 2025 at 10:30 AM"\n');

    // Esperar 3 segundos y verificar estado
    await new Promise(resolve => setTimeout(resolve, 3000));

    const status = await client.messages(result.sid).fetch();
    console.log(`📊 Estado final: ${status.status}`);
    if (status.errorCode) {
      console.log(`❌ Error: ${status.errorCode} - ${status.errorMessage}`);
    } else {
      console.log('✅ Sin errores - el mensaje debería llegar!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
  }
}

testApprovedTemplate()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
