/**
 * Prueba con plantilla de verificación del sandbox
 */

require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function testVerificationTemplate() {
  console.log('\n🧪 ===== PRUEBA: VERIFICATION TEMPLATE =====\n');

  const phoneNumber = '+5215516867745';
  const contentSid = 'HXe0a71a0bec4b90f76a2085a5fcc1a831'; // verifications_2fa_template

  console.log(`📱 Número: ${phoneNumber}`);
  console.log(`📋 Template: verifications_2fa_template (WhatsApp Authentication)`);
  console.log(`🆔 Content SID: ${contentSid}\n`);

  try {
    const result = await client.messages.create({
      contentSid: contentSid,
      contentVariables: JSON.stringify({
        1: '697078' // Código de verificación
      }),
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${phoneNumber}`
    });

    console.log('✅ Mensaje enviado!');
    console.log(`   SID: ${result.sid}`);
    console.log(`   Status: ${result.status}\n`);

    // Esperar y verificar
    await new Promise(resolve => setTimeout(resolve, 3000));

    const status = await client.messages(result.sid).fetch();
    console.log(`📊 Estado: ${status.status}`);
    if (status.errorCode) {
      console.log(`❌ Error: ${status.errorCode} - ${status.errorMessage}`);
    } else {
      console.log('✅ Sin errores!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
  }
}

testVerificationTemplate()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
