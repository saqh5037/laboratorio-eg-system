/**
 * Script de prueba para las nuevas notificaciones con templates y botones inline
 *
 * Uso: node test-new-templates.js
 */

const NotificationService = require('./src/core/services/NotificationService');
const TelegramAdapter = require('./src/adapters/telegram/TelegramAdapter');
const MessageTemplateService = require('./src/core/services/MessageTemplateService');
const NotificationPreferencesService = require('./src/core/services/NotificationPreferencesService');

async function testNotifications() {
  console.log('🧪 Iniciando pruebas de notificaciones mejoradas...\n');

  try {
    // 1. Inicializar Telegram adapter
    console.log('1️⃣ Inicializando Telegram bot...');
    const telegramAdapter = new TelegramAdapter();
    await telegramAdapter.initialize();
    NotificationService.initialize(telegramAdapter);
    console.log('✅ Telegram bot inicializado\n');

    // 2. Obtener preferencias del paciente de prueba (tu paciente ID: 15224)
    const pacienteId = 15224;
    console.log(`2️⃣ Obteniendo preferencias del paciente ${pacienteId}...`);
    const preferences = await NotificationPreferencesService.getPreferences(pacienteId);
    console.log('✅ Preferencias:', JSON.stringify(preferences, null, 2));
    console.log('');

    // 3. Probar template de orden pagada
    console.log('3️⃣ Probando template de "Orden Pagada"...');
    const ordenPagadaData = {
      numero: 'OT-2025-TEST-001',
      paciente: 'Samuel Quiroz',
      estudios: [
        { nombre: 'Hemograma Completo' },
        { nombre: 'Glicemia en Ayunas' },
        { nombre: 'Perfil Lipídico' }
      ],
      fechaEstimada: 'Martes 29 de Octubre'
    };

    const ordenPagadaTemplate = MessageTemplateService.format('orden_pagada', ordenPagadaData);
    console.log('📄 Mensaje generado:');
    console.log(ordenPagadaTemplate.message);
    console.log('\n🔘 Botones:');
    console.log(JSON.stringify(ordenPagadaTemplate.buttons, null, 2));
    console.log('');

    // 4. Probar template de resultados listos
    console.log('4️⃣ Probando template de "Resultados Listos"...');
    const resultadosListosData = {
      numero: 'OT-2025-TEST-001',
      paciente: 'Samuel Quiroz',
      resultsUrl: 'http://localhost:5173/resultados?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    };

    const resultadosListosTemplate = MessageTemplateService.format('resultados_listos', resultadosListosData);
    console.log('📄 Mensaje generado:');
    console.log(resultadosListosTemplate.message);
    console.log('\n🔘 Botones:');
    console.log(JSON.stringify(resultadosListosTemplate.buttons, null, 2));
    console.log('');

    // 5. Probar template de resultados críticos
    console.log('5️⃣ Probando template de "Resultados Críticos"...');
    const resultadosCriticosData = {
      numero: 'OT-2025-TEST-001',
      paciente: 'Samuel Quiroz',
      estudiosUrgentes: [
        { nombre: 'Glicemia: 320 mg/dL (Alto)' },
        { nombre: 'Hemoglobina: 8.5 g/dL (Bajo)' }
      ],
      resultsUrl: 'http://localhost:5173/resultados?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    };

    const resultadosCriticosTemplate = MessageTemplateService.format('resultados_criticos', resultadosCriticosData);
    console.log('📄 Mensaje generado:');
    console.log(resultadosCriticosTemplate.message);
    console.log('\n🔘 Botones:');
    console.log(JSON.stringify(resultadosCriticosTemplate.buttons, null, 2));
    console.log('');

    // 6. Preguntar si enviar notificación real
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 ¿Deseas enviar una notificación REAL de prueba a Telegram?');
    console.log('   Esta notificación se enviará a tu chat de Telegram.');
    console.log('');
    console.log('   Para enviar, ejecuta:');
    console.log(`   node test-new-templates.js send ${pacienteId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Si se pasa "send" como argumento, enviar notificación real
    if (process.argv[2] === 'send') {
      const pacienteIdArg = process.argv[3] || pacienteId;
      console.log(`\n📤 Enviando notificación de prueba a paciente ${pacienteIdArg}...`);

      // Simular orden de trabajo
      const ordenTrabajo = {
        id: 999999,
        numero: 'OT-2025-TEST-001',
        paciente_id: parseInt(pacienteIdArg),
        fecha: new Date()
      };

      const success = await NotificationService.notifyOrdenPagada(ordenTrabajo);

      if (success) {
        console.log('✅ ¡Notificación enviada exitosamente!');
        console.log('   Revisa tu chat de Telegram para ver el mensaje con botones inline.');
      } else {
        console.log('❌ Error al enviar notificación.');
        console.log('   Verifica que el paciente tenga un chat_id de Telegram asociado.');
      }
    }

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  } finally {
    // Cerrar conexiones
    console.log('\n✨ Prueba completada');
    process.exit(0);
  }
}

// Ejecutar pruebas
testNotifications();
