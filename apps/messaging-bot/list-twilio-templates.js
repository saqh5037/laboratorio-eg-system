require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function listContentTemplates() {
  console.log('\n🔍 Listando todas las plantillas de contenido disponibles...\n');

  try {
    const contents = await client.content.v1.contents.list({ limit: 50 });

    console.log(`📋 Se encontraron ${contents.length} plantillas:\n`);

    contents.forEach((content, index) => {
      console.log(`${index + 1}. ${content.friendlyName}`);
      console.log(`   SID: ${content.sid}`);
      console.log(`   Language: ${content.language}`);
      console.log(`   Types: ${content.types ? JSON.stringify(Object.keys(content.types)) : 'N/A'}`);
      console.log('');
    });

    console.log('\n✅ Listado completo\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

listContentTemplates().then(() => process.exit(0));
