require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function inspectTemplate(sid) {
  console.log(`\n🔍 Inspeccionando plantilla ${sid}...\n`);

  try {
    const content = await client.content.v1.contents(sid).fetch();

    console.log(`📋 Información de la plantilla:\n`);
    console.log(`Friendly Name: ${content.friendlyName}`);
    console.log(`SID: ${content.sid}`);
    console.log(`Language: ${content.language}`);
    console.log(`Date Created: ${content.dateCreated}`);
    console.log(`Date Updated: ${content.dateUpdated}`);
    console.log(`\nTypes: ${JSON.stringify(content.types, null, 2)}`);

    console.log('\n✅ Inspección completa\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

const sid = process.argv[2];
if (!sid) {
  console.error('\n❌ Debes proporcionar un Content SID');
  console.error('\nUso: node inspect-template.js HXxxxxx\n');
  process.exit(1);
}

inspectTemplate(sid).then(() => process.exit(0));
