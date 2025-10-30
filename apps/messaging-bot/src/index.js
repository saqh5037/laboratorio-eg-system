const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/config');
const logger = require('./utils/logger');
const { testConnection, closePool } = require('./db/pool');
const TelegramAdapter = require('./adapters/telegram/TelegramAdapter');
const ConversationService = require('./core/services/ConversationService');
const GeminiService = require('./core/services/GeminiService');
const PresupuestoService = require('./core/services/PresupuestoService');
const CitaService = require('./core/services/CitaService');
const PresupuestoWorkflow = require('./core/workflows/PresupuestoWorkflow');
const StateManager = require('./utils/StateManager');
const { formatLabInfo, formatPresupuestoInfo, formatCitaInfo } = require('./utils/formatters');
const NotificationService = require('./core/services/NotificationService');
const ChangeDetectorService = require('./core/services/ChangeDetectorService');
const TelegramUserRegistryService = require('./core/services/TelegramUserRegistryService');
const AuthService = require('./core/services/AuthService');

/**
 * Messaging Bot Service - Entry Point
 * Platform-agnostic bot service with Telegram adapter
 */
class MessagingBotService {
  constructor() {
    this.app = express();
    this.telegramAdapter = null;
  }

  /**
   * Initialize Express server
   */
  setupExpress() {
    // Middleware
    this.app.use(helmet());
    this.app.use(cors({ origin: config.security.corsOrigin }));
    this.app.use(express.json());

    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        service: 'messaging-bot-service',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        platforms: {
          telegram: config.telegram.enabled ? 'enabled' : 'disabled'
        }
      });
    });

    // Dashboard stats
    this.app.get('/api/dashboard', async (req, res) => {
      try {
        const presupuestos = await PresupuestoService.getPending();
        const citas = await CitaService.getUpcoming();

        res.json({
          success: true,
          metrics: {
            pendingPresupuestos: presupuestos.length,
            upcomingCitas: citas.length
          },
          presupuestos,
          citas
        });
      } catch (error) {
        logger.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Authentication routes
    const authRoutes = require('./routes/auth');
    this.app.use('/api/auth', authRoutes);

    // Notification preferences routes
    const preferencesRoutes = require('./api/routes/preferences.routes');
    this.app.use('/api/preferences', preferencesRoutes);

    // Notifications testing routes
    const notificationsRoutes = require('./routes/notifications.routes');
    this.app.use('/api/notifications', notificationsRoutes);

    logger.info(`🌐 Express server configured on port ${config.port}`);
  }

  /**
   * Initialize Telegram bot
   */
  async setupTelegramBot() {
    if (!config.telegram.enabled) {
      logger.info('⏸️  Telegram bot disabled');
      return;
    }

    this.telegramAdapter = new TelegramAdapter();
    await this.telegramAdapter.initialize();

    // Setup handlers
    this.telegramAdapter.setupHandlers(
      this.handleMessage.bind(this),
      this.handleCallback.bind(this)
    );

    // Setup commands
    this.setupTelegramCommands();

    logger.info('✅ Telegram bot ready');
  }

  /**
   * Setup Telegram commands
   */
  setupTelegramCommands() {
    const bot = this.telegramAdapter.bot;

    // /start command - Con o sin token de autorización
    bot.onText(/\/start(.*)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const username = msg.from.username;
      const firstName = msg.from.first_name;
      const lastName = msg.from.last_name;
      const token = match && match[1] ? match[1].trim() : null;

      // Si viene con token, procesar autorización
      if (token) {
        try {
          const AuthorizationTokenService = require('./core/services/AuthorizationTokenService');

          // Validar token
          const validation = await AuthorizationTokenService.validateToken(token);

          if (!validation.valid) {
            // Token inválido o expirado
            let errorMessage = '';
            if (validation.reason === 'TOKEN_EXPIRED') {
              errorMessage = `❌ *Este enlace de autorización ha expirado.*\n\nPor favor solicita uno nuevo desde la aplicación web del laboratorio.`;
            } else if (validation.reason === 'TOKEN_ALREADY_USED') {
              errorMessage = `✅ *Ya estás registrado*\n\nYa has autorizado la comunicación anteriormente. Puedes recibir notificaciones en este chat.`;
            } else {
              errorMessage = `❌ *Enlace inválido*\n\nEste enlace de autorización no es válido. Por favor solicita uno nuevo desde la aplicación web del laboratorio.`;
            }
            await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown' });
            return;
          }

          // Token válido - Registrar usuario con paciente_id
          await TelegramUserRegistryService.registerUser({
            telegramChatId: chatId.toString(),
            username,
            firstName,
            lastName,
            phone: validation.phone,
            pacienteId: validation.pacienteId
          });

          // Marcar token como usado
          await AuthorizationTokenService.markTokenAsUsed(token);

          logger.info(`✅ Autorización exitosa: paciente ${validation.pacienteId} -> chat_id ${chatId}`);

          // Mensaje de confirmación
          const confirmMessage = `✅ *¡Perfecto! Has autorizado la comunicación con éxito.*

Ahora podrás recibir:
📱 Códigos de autenticación
📋 Notificaciones de resultados
💰 Presupuestos

*Regresa a la aplicación web para continuar.*`;

          await bot.sendMessage(chatId, confirmMessage, { parse_mode: 'Markdown' });
          return;

        } catch (error) {
          logger.error('Error procesando autorización de Telegram:', error);
          await bot.sendMessage(chatId, `❌ Hubo un error al procesar tu autorización. Por favor intenta nuevamente o contacta al laboratorio.`);
          return;
        }
      }

      // Comando /start sin token - Flujo normal de bienvenida
      // Registrar o actualizar usuario automáticamente
      try {
        await TelegramUserRegistryService.registerUser({
          telegramChatId: chatId.toString(),
          username,
          firstName,
          lastName,
          phone: null, // Se actualizará cuando usuario se registre
          pacienteId: null
        });

        logger.info(`📱 Usuario registrado automáticamente: @${username} (chat_id: ${chatId})`);
      } catch (error) {
        logger.error('Error al registrar usuario en /start:', error);
      }

      const welcomeMessage = `Buenos días, bienvenido al *${config.laboratory.fullName}*.

Soy su asistente virtual. ¿En qué puedo ayudarle hoy?

*Comandos disponibles:*
/registrar - Vincular su teléfono para recibir notificaciones
/menu - Ver menú principal
/presupuesto - Solicitar presupuesto
/cita - Agendar una cita
/horario - Ver horarios de atención
/ubicacion - Ver ubicación
/ayuda - Ver ayuda

O simplemente escríbame su consulta y con gusto le atenderé.`;

      await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    });

    // /registrar command - Vincular teléfono del paciente
    bot.onText(/\/registrar(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const phone = match && match[1] ? match[1].trim() : null;

      if (!phone) {
        await bot.sendMessage(chatId, `📱 *Registro de Teléfono*

Para recibir notificaciones de sus resultados de laboratorio, necesito vincular su número de teléfono.

Por favor envíe:
\`/registrar +52-555-123-4567\`

O con el formato de su país, por ejemplo:
\`/registrar +58-412-1234567\` (Venezuela)
\`/registrar +52-555-1234567\` (México)

⚠️ *Importante:* Use el mismo número que tiene registrado en el laboratorio.`, { parse_mode: 'Markdown' });
        return;
      }

      try {
        // Validar y formatear teléfono
        const phoneValidation = AuthService.validateVenezuelanPhone(phone);

        if (!phoneValidation.valid) {
          await bot.sendMessage(chatId, `❌ El formato del teléfono no es válido.

Por favor use formato internacional: +52-555-123-4567

Error: ${phoneValidation.error}`, { parse_mode: 'Markdown' });
          return;
        }

        // Buscar paciente por teléfono
        const paciente = await AuthService.findPatientByPhone(phoneValidation.formatted);

        if (!paciente) {
          await bot.sendMessage(chatId, `❌ No se encontró ningún paciente con el teléfono ${phoneValidation.formatted}

Por favor verifique:
1. Que el número esté correcto
2. Que esté registrado en nuestro sistema
3. Use el formato internacional (+52-555...)

Si el problema persiste, contacte al laboratorio.`, { parse_mode: 'Markdown' });
          return;
        }

        // Registrar/actualizar usuario con paciente_id
        await TelegramUserRegistryService.registerUser({
          telegramChatId: chatId.toString(),
          username: msg.from.username,
          firstName: msg.from.first_name,
          lastName: msg.from.last_name,
          phone: phoneValidation.formatted,
          pacienteId: paciente.id
        });

        logger.info(`✅ Usuario vinculado: ${paciente.nombre} ${paciente.apellido} (${phoneValidation.formatted}) -> chat_id: ${chatId}`);

        await bot.sendMessage(chatId, `✅ *¡Registro Exitoso!*

Su teléfono ha sido vinculado correctamente.

*Paciente:* ${paciente.nombre} ${paciente.apellido}
*Teléfono:* ${phoneValidation.formatted}

Ahora recibirá notificaciones cuando:
• Sus resultados estén listos
• Su orden haya sido pagada

También puede autenticarse en nuestro portal web usando su teléfono.`, { parse_mode: 'Markdown' });

      } catch (error) {
        logger.error('Error en /registrar:', error);
        await bot.sendMessage(chatId, `❌ Hubo un error al procesar su registro. Por favor intente nuevamente o contacte al laboratorio.`);
      }
    });

    // /menu command
    bot.onText(/\/menu/, async (msg) => {
      const chatId = msg.chat.id;

      await this.telegramAdapter.sendInteractiveMessage(
        chatId,
        '¿Qué desea hacer?',
        [
          { text: '💰 Solicitar Presupuesto', callbackData: 'action_presupuesto' },
          { text: '📅 Agendar Cita', callbackData: 'action_cita' },
          { text: '🏥 Información del Lab', callbackData: 'action_info' },
          { text: '⏰ Horarios', callbackData: 'action_horario' },
          { text: '📍 Ubicación', callbackData: 'action_ubicacion' }
        ]
      );
    });

    // /presupuesto command
    bot.onText(/\/presupuesto/, async (msg) => {
      const chatId = msg.chat.id;
      const conversationId = `telegram_${chatId}`;

      // Iniciar workflow de presupuesto
      const unifiedMsg = this.telegramAdapter.normalizeIncomingMessage(msg);
      await PresupuestoWorkflow.start(unifiedMsg, this.telegramAdapter);
    });

    // /cita command
    bot.onText(/\/cita/, async (msg) => {
      const chatId = msg.chat.id;

      await bot.sendMessage(chatId, `📅 *Agendar Cita*

Por favor, indíqueme:
1. Su nombre completo
2. Teléfono de contacto
3. Tipo de examen
4. Fecha preferida (DD/MM/YYYY)
5. Hora preferida

Ejemplo: "Soy María González, teléfono 0424-9876543, necesito hacerme un Perfil Lipídico el 15/01/2025 a las 8:00 AM"`, {
        parse_mode: 'Markdown'
      });
    });

    // /horario command
    bot.onText(/\/horario/, async (msg) => {
      const chatId = msg.chat.id;

      const horarioMsg = `⏰ *Horarios de Atención*

${config.laboratory.hoursWeekday}
${config.laboratory.hoursSaturday}
${config.laboratory.hoursSunday}

${config.laboratory.servicioDomicilio ? `🏠 ${config.laboratory.servicioDomicilioInfo}` : ''}`;

      await bot.sendMessage(chatId, horarioMsg, { parse_mode: 'Markdown' });
    });

    // /ubicacion command
    bot.onText(/\/ubicacion/, async (msg) => {
      const chatId = msg.chat.id;

      await bot.sendMessage(chatId, formatLabInfo(), { parse_mode: 'Markdown' });

      // Send location
      await this.telegramAdapter.sendLocation(
        chatId,
        config.laboratory.gpsLat,
        config.laboratory.gpsLon
      );
    });

    // /ayuda command
    bot.onText(/\/ayuda/, async (msg) => {
      const chatId = msg.chat.id;

      const helpMsg = `📖 *Ayuda*

*Comandos disponibles:*
/start - Iniciar conversación
/registrar - Vincular su teléfono (recibir notificaciones)
/menu - Menú principal
/presupuesto - Solicitar presupuesto
/cita - Agendar cita
/horario - Ver horarios
/ubicacion - Ver ubicación y contacto
/ayuda - Esta ayuda

*También puede:*
- Hacer preguntas directamente
- Solicitar información sobre exámenes
- Consultar sobre servicios

*📱 Notificaciones:*
Use \`/registrar +52-555-1234567\` para vincular su teléfono y recibir notificaciones cuando sus resultados estén listos.

¿En qué más puedo ayudarle?`;

      await bot.sendMessage(chatId, helpMsg, { parse_mode: 'Markdown' });
    });

    logger.info('📋 Telegram commands configured');
  }

  /**
   * Handle incoming messages (from any platform)
   * @param {UnifiedMessage} message
   */
  async handleMessage(message) {
    try {
      // Guardar conversación
      await ConversationService.upsertConversation({
        conversationId: message.conversationId,
        platform: message.platform,
        chatId: message.chatId,
        userId: message.userId,
        userInfo: message.userInfo,
        state: 'active'
      });

      // Guardar mensaje
      await ConversationService.saveMessage(message);

      // Si es un comando, ya lo manejamos arriba
      if (message.getText()?.startsWith('/')) {
        return;
      }

      // PRIORIDAD 1: Verificar si hay un workflow activo
      if (PresupuestoWorkflow.isActive(message.conversationId)) {
        await PresupuestoWorkflow.processMessage(message, this.telegramAdapter);
        return;
      }

      // PRIORIDAD 2: Si no hay workflow, usar Gemini para respuesta conversacional
      // Enviar indicador de "escribiendo..."
      await this.telegramAdapter.sendTypingIndicator(message.chatId);

      // Detectar intención
      const intent = await GeminiService.detectIntent(message.getText());

      // Si la intención es solicitar presupuesto, iniciar workflow
      if (intent === 'presupuesto' || intent === 'cotizacion' || intent === 'precio') {
        await PresupuestoWorkflow.start(message, this.telegramAdapter);
        return;
      }

      // Obtener historial
      const history = await ConversationService.getHistory(message.conversationId, 5);

      // Generar respuesta con IA
      const response = await GeminiService.generateResponse(
        message.getText(),
        history.map(h => {
          // El content puede venir como string JSON o como objeto (JSONB)
          const content = typeof h.content === 'string' ? JSON.parse(h.content) : h.content;
          return {
            role: h.direction === 'inbound' ? 'user' : 'bot',
            parts: content.text || ''
          };
        }),
        {
          userId: message.userId,
          userName: message.getFullName(),
          currentIntent: intent
        }
      );

      // Enviar respuesta
      await this.telegramAdapter.sendTextMessage(message.chatId, response);

      // Guardar respuesta
      const botMessage = message.createReply(response);
      await ConversationService.saveMessage(botMessage);

    } catch (error) {
      logger.bot.error('handleMessage', error, { message: message.toString() });

      // Respuesta de error
      await this.telegramAdapter.sendTextMessage(
        message.chatId,
        'Disculpe, he tenido un problema procesando su mensaje. Por favor, intente nuevamente.'
      );
    }
  }

  /**
   * Handle callback queries (button presses)
   * @param {UnifiedMessage} message
   */
  async handleCallback(message) {
    try {
      const callbackData = message.getCallbackData();

      if (callbackData === 'action_presupuesto') {
        // Iniciar workflow de presupuesto
        await PresupuestoWorkflow.start(message, this.telegramAdapter);

      } else if (callbackData === 'action_cita') {
        await this.telegramAdapter.bot.sendMessage(message.chatId, `📅 *Agendar Cita*

Por favor, indíqueme su nombre, teléfono, tipo de examen y fecha/hora preferida.`, { parse_mode: 'Markdown' });

      } else if (callbackData === 'action_info') {
        await this.telegramAdapter.bot.sendMessage(message.chatId, formatLabInfo(), { parse_mode: 'Markdown' });

      } else if (callbackData === 'action_horario') {
        await this.telegramAdapter.bot.sendMessage(message.chatId, `⏰ *Horarios*

${config.laboratory.hoursWeekday}
${config.laboratory.hoursSaturday}
${config.laboratory.hoursSunday}`, { parse_mode: 'Markdown' });

      } else if (callbackData === 'action_ubicacion') {
        await this.telegramAdapter.bot.sendMessage(message.chatId, formatLabInfo(), { parse_mode: 'Markdown' });
        await this.telegramAdapter.sendLocation(message.chatId, config.laboratory.gpsLat, config.laboratory.gpsLon);
      }

    } catch (error) {
      logger.bot.error('handleCallback', error, { callbackData: message.getCallbackData() });
    }
  }

  /**
   * Start the service
   */
  async start() {
    try {
      logger.info('🚀 Starting Messaging Bot Service...');

      // Test database
      await testConnection();

      // Setup Express
      this.setupExpress();

      // Setup Telegram bot
      await this.setupTelegramBot();

      // Initialize NotificationService with Telegram adapter
      if (this.telegramAdapter) {
        NotificationService.initialize(this.telegramAdapter);
      }

      // Start ChangeDetector for automatic notifications
      ChangeDetectorService.start();

      // Start Express server
      this.app.listen(config.port, () => {
        logger.info(`✅ Server running on port ${config.port}`);
        logger.info(`📡 Ready to receive messages`);
      });

    } catch (error) {
      logger.error('❌ Failed to start service:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.info('🛑 Shutting down...');

    // Stop change detector
    ChangeDetectorService.stop();

    if (this.telegramAdapter) {
      await this.telegramAdapter.stop();
    }

    await closePool();

    process.exit(0);
  }
}

// Create and start service
const service = new MessagingBotService();

// Handle shutdown signals
process.on('SIGINT', () => service.shutdown());
process.on('SIGTERM', () => service.shutdown());

// Start
service.start();

module.exports = service;
