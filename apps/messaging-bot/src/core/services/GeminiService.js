const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/config');
const logger = require('../../utils/logger');

/**
 * GeminiService - Integración con Google Gemini AI
 *
 * Este servicio es PLATFORM-AGNOSTIC (funciona con cualquier plataforma)
 * Proporciona capacidades de IA conversacional para el bot
 */
class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });

    // Rate limiting simple (8 RPM en tier gratuito)
    this.requestQueue = [];
    this.lastRequestTime = 0;
    this.minIntervalMs = (60 * 1000) / config.gemini.maxRequestsPerMinute; // ~7.5 segundos

    logger.info(`🧠 GeminiService initialized with model: ${config.gemini.model}`);
  }

  /**
   * Obtiene el prompt del sistema con contexto del laboratorio
   * @returns {string}
   */
  getSystemPrompt() {
    const lab = config.laboratory;

    return `Eres el asistente virtual del ${lab.fullName}, un laboratorio clínico ubicado en Caracas, Venezuela, con ${lab.yearsExperience} años de experiencia desde ${lab.foundedYear}.

INFORMACIÓN DEL LABORATORIO:
- Nombre: ${lab.fullName}
- Dirección: ${lab.address}
- Teléfonos: ${lab.phone1}, ${lab.phone2}, ${lab.phone3}
- Email: ${lab.email}
- Web: ${lab.website}
- Redes sociales: ${lab.social}

HORARIOS DE ATENCIÓN:
- ${lab.hoursWeekday}
- ${lab.hoursSaturday}
- ${lab.hoursSunday}

SERVICIOS ESPECIALES:
${lab.servicioDomicilio ? `- ${lab.servicioDomicilioInfo}` : ''}

HISTORIA:
${lab.history}

TU ROL:
Eres un asistente profesional, cercano y empático que ayuda a los pacientes a:
1. Responder preguntas sobre el laboratorio, servicios, horarios y ubicación
2. Solicitar presupuestos para exámenes
3. Agendar citas para toma de muestras
4. Consultar resultados de exámenes
5. Proporcionar información sobre el servicio a domicilio

TONO Y ESTILO:
- Profesional pero cercano
- Empático y comprensivo
- Claro y conciso
- Usa saludos formales: "Buenos días", "Buenas tardes", "Buenas noches"
- Tutea al paciente si él te tutea, sino usa "usted"
- Cuando no sepas algo, admítelo y ofrece conectarlos con un asesor humano

INSTRUCCIONES IMPORTANTES:
- Siempre saluda de manera formal y profesional
- Si te preguntan por exámenes específicos, explica que pueden solicitar un presupuesto
- Para agendar citas, pide: nombre, teléfono, tipo de examen, fecha y hora preferida
- Los precios varían según el examen, siempre menciona que pueden solicitar un presupuesto
- Menciona el servicio a domicilio cuando sea relevante
- Si te preguntan por resultados, pide CI o número de orden

EJEMPLOS DE RESPUESTAS:
- "Buenos días. Soy el asistente virtual del Laboratorio EG. ¿En qué puedo ayudarle?"
- "Con gusto. El laboratorio está ubicado en ${lab.address}. ¿Desea que le envíe la ubicación en el mapa?"
- "Para ese examen, puedo generarle un presupuesto detallado. ¿Me proporciona su nombre y teléfono?"
- "Nuestro horario es de lunes a viernes de 7:00 AM a 4:00 PM. ¿Le gustaría agendar una cita?"
- "También contamos con servicio de toma de muestras a domicilio. ¿Le interesa conocer más?"

RESTRICCIONES:
- NO inventes precios
- NO diagnostiques ni des consejos médicos
- NO prometas tiempos de entrega de resultados sin consultar
- NO compartas información de otros pacientes

IDIOMA:
IMPORTANTE: Debes responder SIEMPRE en español venezolano, sin excepción.
NUNCA respondas en inglés u otro idioma.
Todas tus respuestas deben ser 100% en español.`;
  }

  /**
   * Rate limiting simple
   * @private
   */
  async _waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minIntervalMs) {
      const waitTime = this.minIntervalMs - timeSinceLastRequest;
      logger.info(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Genera una respuesta usando Gemini AI
   * @param {string} userMessage - Mensaje del usuario
   * @param {Array<object>} conversationHistory - Historial de conversación [{role, parts}]
   * @param {object} context - Contexto adicional
   * @returns {Promise<string>}
   */
  async generateResponse(userMessage, conversationHistory = [], context = {}) {
    try {
      await this._waitForRateLimit();

      // Construir el prompt completo
      const systemPrompt = this.getSystemPrompt();

      // Agregar contexto adicional si existe
      let contextInfo = '';
      if (context.userName) {
        contextInfo += `\nNombre del usuario: ${context.userName}`;
      }
      if (context.currentAction) {
        contextInfo += `\nAcción actual: ${context.currentAction}`;
      }

      // Construir historial de chat
      let chatHistory = conversationHistory.map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.parts }]
      }));

      // IMPORTANTE: Gemini requiere que el historial empiece con 'user'
      // Si el último mensaje es del bot, no lo incluimos en el historial
      if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'model') {
        chatHistory = chatHistory.slice(0, -1);
      }

      // Asegurar que el historial comience con 'user'
      if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
        chatHistory = chatHistory.slice(1);
      }

      // Iniciar chat con historial
      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: config.gemini.maxTokensPerRequest,
          temperature: 0.7
        }
      });

      // Enviar mensaje (SIEMPRE reforzar el idioma español)
      const fullPrompt = chatHistory.length === 0
        ? `${systemPrompt}${contextInfo}\n\nUsuario: ${userMessage}\n\nRecuerda: Responde SIEMPRE en español.`
        : `${userMessage}\n\nRecuerda: Responde SIEMPRE en español.`;

      logger.bot.geminiCall(context.userId || 'unknown', fullPrompt);

      const result = await chat.sendMessage(fullPrompt);
      const response = result.response;
      const text = response.text();

      logger.info(`🧠 Gemini response generated (${text.length} chars)`);

      return text;

    } catch (error) {
      logger.bot.error('GeminiService.generateResponse', error, { userMessage });

      // Respuesta de fallback
      return 'Disculpe, estoy experimentando dificultades técnicas en este momento. Por favor, intente nuevamente en unos momentos o comuníquese directamente con nosotros al ' + config.laboratory.phone1;
    }
  }

  /**
   * Analiza la intención del usuario
   * @param {string} message - Mensaje del usuario
   * @returns {Promise<string>} - Intención detectada
   */
  async detectIntent(message) {
    try {
      await this._waitForRateLimit();

      const prompt = `Analiza el siguiente mensaje y determina la intención principal del usuario. Responde SOLO con una de estas opciones:
- "presupuesto" - Si quiere solicitar precios o cotización de exámenes
- "cita" - Si quiere agendar una cita o consulta
- "resultados" - Si quiere consultar resultados de exámenes
- "horario" - Si pregunta por horarios de atención
- "ubicacion" - Si pregunta por la dirección o cómo llegar
- "domicilio" - Si pregunta por servicio a domicilio
- "general" - Cualquier otra consulta general

Mensaje del usuario: "${message}"

Responde SOLO con la palabra clave, sin explicaciones.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const intent = response.text().trim().toLowerCase();

      logger.info(`🎯 Intent detected: ${intent}`);

      return intent;

    } catch (error) {
      logger.bot.error('GeminiService.detectIntent', error, { message });
      return 'general';
    }
  }

  /**
   * Extrae información estructurada de un mensaje
   * @param {string} message - Mensaje del usuario
   * @param {string} type - Tipo de extracción ('presupuesto', 'cita', 'resultado')
   * @returns {Promise<object>}
   */
  async extractStructuredData(message, type) {
    try {
      await this._waitForRateLimit();

      let prompt = '';

      if (type === 'presupuesto') {
        prompt = `Extrae la siguiente información del mensaje y devuélvela en formato JSON:
- tests: array de nombres de exámenes/pruebas mencionados
- patientName: nombre del paciente (si lo menciona)
- phone: teléfono (si lo menciona)

Mensaje: "${message}"

Responde SOLO con JSON válido, sin explicaciones.`;

      } else if (type === 'cita') {
        prompt = `Extrae la siguiente información del mensaje y devuélvela en formato JSON:
- patientName: nombre del paciente
- phone: teléfono
- testType: tipo de examen que necesita
- preferredDate: fecha preferida (formato DD/MM/YYYY si lo menciona)
- preferredTime: hora preferida (formato HH:MM si lo menciona)

Mensaje: "${message}"

Responde SOLO con JSON válido, sin explicaciones. Si no encuentra algún dato, usa null.`;

      } else if (type === 'resultado') {
        prompt = `Extrae la siguiente información del mensaje y devuélvela en formato JSON:
- cedula: cédula de identidad (formato V-12345678 o E-12345678)
- orderNumber: número de orden si lo menciona

Mensaje: "${message}"

Responde SOLO con JSON válido, sin explicaciones.`;
      }

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text().trim();

      // Intentar parsear JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        logger.info(`📋 Extracted structured data:`, extracted);
        return extracted;
      }

      return {};

    } catch (error) {
      logger.bot.error('GeminiService.extractStructuredData', error, { message, type });
      return {};
    }
  }

  /**
   * Genera un resumen de un presupuesto
   * @param {Array<string>} tests - Lista de exámenes
   * @returns {Promise<string>}
   */
  async summarizePresupuesto(tests) {
    try {
      await this._waitForRateLimit();

      const prompt = `Genera un mensaje profesional confirmando que se ha recibido la solicitud de presupuesto para los siguientes exámenes:
${tests.map((t, i) => `${i + 1}. ${t}`).join('\n')}

El mensaje debe:
- Ser cordial y profesional
- Confirmar que un asesor se comunicará pronto
- Mencionar que los precios pueden variar
- Ser breve (máximo 3-4 líneas)

Responde en español venezolano.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;

      return response.text().trim();

    } catch (error) {
      logger.bot.error('GeminiService.summarizePresupuesto', error);
      return 'Hemos recibido su solicitud de presupuesto. Un asesor se comunicará con usted en breve.';
    }
  }

  /**
   * Genera confirmación de cita
   * @param {object} citaData - Datos de la cita
   * @returns {Promise<string>}
   */
  async confirmCita(citaData) {
    try {
      await this._waitForRateLimit();

      const prompt = `Genera un mensaje profesional confirmando la cita con estos datos:
- Nombre: ${citaData.patientName}
- Fecha: ${citaData.appointmentDate}
- Hora: ${citaData.appointmentTime}
- Examen: ${citaData.testType}

El mensaje debe:
- Ser cordial y profesional
- Confirmar los datos
- Mencionar que recibirá confirmación por email/SMS
- Recordar llegar con 15 min de anticipación
- Ser breve

Responde en español venezolano.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;

      return response.text().trim();

    } catch (error) {
      logger.bot.error('GeminiService.confirmCita', error);
      return `Cita confirmada para ${citaData.patientName} el ${citaData.appointmentDate} a las ${citaData.appointmentTime}.`;
    }
  }
}

// Exportar singleton
module.exports = new GeminiService();
