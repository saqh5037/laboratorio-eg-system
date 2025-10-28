/**
 * Script para verificar que el token JWT incluye ci_paciente
 *
 * Este script simula el flujo completo de autenticación y decodifica el token
 * para verificar que incluye todos los campos necesarios para el results-service
 */

const jwt = require('jsonwebtoken');
const SessionService = require('./src/core/services/SessionService');
const AuthService = require('./src/core/services/AuthService');

async function testTokenPayload() {
  console.log('🧪 Verificando payload del token JWT\n');

  try {
    // 1. Verificar código existente
    console.log('1️⃣ Verificando código de autenticación 684296...');
    const verification = await AuthService.verifyCode('+525516867745', '684296');

    if (!verification.valid) {
      console.log('❌ Código inválido o expirado');
      console.log('   Genera un nuevo código con:');
      console.log('   curl -X POST http://localhost:3004/api/auth/request-code -H "Content-Type: application/json" -d \'{"phone": "+525516867745"}\'');
      process.exit(1);
    }

    console.log(`✅ Código válido para paciente ${verification.pacienteId}\n`);

    // 2. Crear sesión (esto genera el token)
    console.log('2️⃣ Creando sesión con token JWT...');
    const session = await SessionService.createSession({
      pacienteId: verification.pacienteId,
      telegramChatId: null,
      deviceInfo: {
        platform: 'test',
        source: 'test-script'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent'
    });

    console.log(`✅ Sesión creada: ${session.sessionId}\n`);

    // 3. Decodificar token y mostrar payload
    console.log('3️⃣ Decodificando token JWT...');
    const decoded = jwt.decode(session.token);

    console.log('\n📦 PAYLOAD DEL TOKEN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(decoded, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 4. Verificar campos requeridos
    console.log('4️⃣ Verificando campos requeridos por results-service...\n');

    const requiredFields = {
      'paciente_id': decoded.paciente_id,
      'ci_paciente': decoded.ci_paciente,
      'nombre': decoded.nombre
    };

    let allFieldsPresent = true;

    for (const [field, value] of Object.entries(requiredFields)) {
      if (value !== undefined && value !== null) {
        console.log(`   ✅ ${field}: "${value}"`);
      } else {
        console.log(`   ❌ ${field}: FALTANTE`);
        allFieldsPresent = false;
      }
    }

    console.log('');

    if (allFieldsPresent) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ SUCCESS: El token incluye todos los campos necesarios');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('🎯 PRÓXIMO PASO:');
      console.log('   1. Abre http://localhost:5173/resultados en tu navegador');
      console.log('   2. Haz clic en "Autenticar con Telegram"');
      console.log('   3. Ingresa tu teléfono: +525516867745');
      console.log('   4. Solicita un nuevo código (ya que este fue usado)');
      console.log('   5. Ingresa el código de 6 dígitos');
      console.log('   6. Deberías ver tus órdenes de laboratorio\n');

      console.log('📋 Token de prueba generado (válido por 30 días):');
      console.log(session.token);
      console.log('');

    } else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ ERROR: Faltan campos en el token');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('   Revisa SessionService.createSession() en:');
      console.log('   src/core/services/SessionService.js:40-46\n');
    }

    // 5. Revocar sesión de prueba
    await SessionService.revokeSession(session.sessionId, 'Test completado');
    console.log('🧹 Sesión de prueba revocada\n');

  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar prueba
testTokenPayload();
