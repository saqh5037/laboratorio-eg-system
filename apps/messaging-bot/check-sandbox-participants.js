/**
 * Script para verificar participantes del sandbox
 */

require('dotenv').config();
const { botPool } = require('./src/config/database');

async function checkSandboxParticipants() {
  console.log('\n🔍 Verificando usuarios registrados en WhatsApp Sandbox...\n');

  try {
    // Verificar en twilio_user_registry
    const result = await botPool.query(`
      SELECT
        id,
        phone_number,
        chat_id,
        first_authorized_at,
        last_active_at,
        is_active,
        created_at
      FROM twilio_user_registry
      ORDER BY created_at DESC
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      console.log('❌ No hay usuarios registrados en el sandbox.\n');
      console.log('Para registrarte:');
      console.log('1. Abre WhatsApp');
      console.log('2. Envía un mensaje a: +1 415 523 8886');
      console.log('3. Escribe exactamente: join upper-favorite');
      console.log('4. Espera la confirmación\n');
    } else {
      console.log(`✅ Se encontraron ${result.rows.length} usuarios registrados:\n`);

      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.phone_number}`);
        console.log(`   Chat ID: ${user.chat_id || 'N/A'}`);
        console.log(`   Primera autorización: ${user.first_authorized_at}`);
        console.log(`   Última actividad: ${user.last_active_at}`);
        console.log(`   Activo: ${user.is_active ? 'Sí' : 'No'}`);
        console.log(`   Creado: ${user.created_at}`);
        console.log('');
      });
    }

    // Verificar si el número específico está registrado
    const phoneToCheck = '+5215516867745';
    const userCheck = await botPool.query(
      'SELECT * FROM twilio_user_registry WHERE phone_number = $1',
      [phoneToCheck]
    );

    console.log('─────────────────────────────────────────────────────');
    console.log(`Verificación para ${phoneToCheck}:`);
    console.log('─────────────────────────────────────────────────────\n');

    if (userCheck.rows.length === 0) {
      console.log('❌ Este número NO está registrado en el sandbox.');
      console.log('\n⚠️  ACCIÓN REQUERIDA:');
      console.log('1. Abre WhatsApp en tu teléfono');
      console.log('2. Inicia una conversación con: +1 415 523 8886');
      console.log('3. Envía el mensaje: join upper-favorite');
      console.log('4. Espera la confirmación del bot\n');
    } else {
      const user = userCheck.rows[0];
      console.log('✅ Este número ESTÁ registrado en el sandbox.');
      console.log(`   Registrado desde: ${user.created_at}`);
      console.log(`   Última actividad: ${user.last_active_at}`);
      console.log(`   Estado: ${user.is_active ? 'Activo' : 'Inactivo'}\n`);

      if (!user.is_active) {
        console.log('⚠️  El usuario está inactivo. Puede que necesites:');
        console.log('   - Enviar "join upper-favorite" nuevamente');
        console.log('   - Verificar que no hayas enviado "stop"\n');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await botPool.end();
  }
}

checkSandboxParticipants();
