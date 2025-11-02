const twilio = require('twilio');
const logger = require('../../utils/logger');
const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

/**
 * TwilioService
 * Servicio base para enviar SMS y WhatsApp usando Twilio
 * Soporta modo Test para desarrollo local
 */
class TwilioService {
    constructor() {
        this.enabled = process.env.TWILIO_ENABLED === 'true';
        this.testMode = process.env.TWILIO_TEST_MODE === 'true';

        if (this.enabled) {
            try {
                this.client = twilio(
                    process.env.TWILIO_ACCOUNT_SID,
                    process.env.TWILIO_AUTH_TOKEN
                );

                this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
                this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
                this.whatsappSandbox = process.env.TWILIO_WHATSAPP_SANDBOX === 'true';

                if (this.testMode) {
                    logger.info('🧪 TwilioService inicializado en MODO TEST');
                    logger.info('   - Solo números verificados en Twilio Console pueden recibir mensajes');
                    logger.info('   - Los mensajes incluirán prefijo "Sent from your Twilio trial account"');
                } else {
                    logger.info('✅ TwilioService inicializado en MODO PRODUCCIÓN');
                }

                logger.info(`   - SMS desde: ${this.phoneNumber}`);
                if (this.whatsappSandbox) {
                    logger.info(`   - WhatsApp Sandbox: ${this.whatsappNumber}`);
                }

            } catch (error) {
                logger.error(`❌ Error inicializando Twilio: ${error.message}`);
                this.enabled = false;
            }
        } else {
            logger.info('⚠️ TwilioService deshabilitado');
        }
    }

    /**
     * Enviar SMS
     * @param {string} to - Número de teléfono destino
     * @param {string} message - Mensaje a enviar
     * @param {object} options - Opciones adicionales de Twilio
     * @returns {Promise<object>} Resultado del envío
     */
    async sendSMS(to, message, options = {}) {
        if (!this.enabled) {
            logger.warn('Twilio deshabilitado, SMS no enviado');
            return { success: false, reason: 'disabled' };
        }

        try {
            const phoneNumber = this.formatPhoneNumber(to);

            // Validar número de teléfono
            if (!this.isValidPhone(phoneNumber)) {
                logger.error(`Número de teléfono inválido: ${phoneNumber}`);
                return {
                    success: false,
                    error: 'Número de teléfono inválido'
                };
            }

            logger.info(`📱 Enviando SMS a ${phoneNumber}`);

            if (this.testMode) {
                logger.warn('   ⚠️ Modo TEST: Asegúrate de que el número está verificado en Twilio Console');
            }

            const result = await this.client.messages.create({
                body: message,
                from: this.phoneNumber,
                to: phoneNumber,
                ...options
            });

            logger.info(`✅ SMS enviado exitosamente`);
            logger.info(`   - SID: ${result.sid}`);
            logger.info(`   - Status: ${result.status}`);
            logger.info(`   - To: ${phoneNumber}`);

            return {
                success: true,
                messageId: result.sid,
                to: phoneNumber,
                channel: 'sms',
                status: result.status,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logger.error(`❌ Error enviando SMS: ${error.message}`);

            // Errores comunes en modo test
            if (error.code === 21608) {
                logger.error('   → El número no está verificado en Twilio Console');
                logger.error('   → Ir a: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
            } else if (error.code === 21211) {
                logger.error('   → Número de teléfono inválido');
            } else if (error.code === 21606) {
                logger.error('   → El número no puede recibir SMS');
            }

            return {
                success: false,
                error: error.message,
                code: error.code
            };
        }
    }

    /**
     * Enviar WhatsApp usando Content Template (post-abril 2025)
     * @param {string} to - Número de teléfono destino
     * @param {string} contentSid - SID de la plantilla aprobada
     * @param {object} contentVariables - Variables de la plantilla
     * @returns {Promise<object>} Resultado del envío
     */
    async sendWhatsAppTemplate(to, contentSid, contentVariables = {}) {
        if (!this.enabled) {
            logger.warn('Twilio deshabilitado, WhatsApp no enviado');
            return { success: false, reason: 'disabled' };
        }

        try {
            const phoneNumber = this.formatPhoneNumber(to);

            if (!this.isValidPhone(phoneNumber)) {
                logger.error(`Número de teléfono inválido: ${phoneNumber}`);
                return {
                    success: false,
                    error: 'Número de teléfono inválido'
                };
            }

            logger.info(`💬 Enviando WhatsApp Template a ${phoneNumber}`);
            logger.info(`   - Content SID: ${contentSid}`);

            // Convertir keys de string a number si es necesario
            // Twilio espera keys numéricas sin comillas: {1: "value", 2: "value"}
            const variables = {};
            Object.keys(contentVariables).forEach(key => {
                const numKey = isNaN(key) ? key : parseInt(key);
                variables[numKey] = contentVariables[key];
            });

            const result = await this.client.messages.create({
                contentSid: contentSid,
                contentVariables: JSON.stringify(variables),
                from: this.whatsappNumber,
                to: `whatsapp:${phoneNumber}`
            });

            logger.info(`✅ WhatsApp Template enviado exitosamente`);
            logger.info(`   - SID: ${result.sid}`);
            logger.info(`   - Status: ${result.status}`);

            return {
                success: true,
                messageId: result.sid,
                to: phoneNumber,
                channel: 'whatsapp',
                status: result.status,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logger.error(`❌ Error enviando WhatsApp Template: ${error.message}`);
            logger.error(`   Code: ${error.code}`);

            return {
                success: false,
                error: error.message,
                code: error.code
            };
        }
    }

    /**
     * Enviar WhatsApp (método legacy - solo funciona dentro de ventana de 24h)
     * @param {string} to - Número de teléfono destino
     * @param {string} message - Mensaje a enviar
     * @param {object} options - Opciones adicionales
     * @returns {Promise<object>} Resultado del envío
     */
    async sendWhatsApp(to, message, options = {}) {
        if (!this.enabled) {
            logger.warn('Twilio deshabilitado, WhatsApp no enviado');
            return { success: false, reason: 'disabled' };
        }

        try {
            const phoneNumber = this.formatPhoneNumber(to);

            // Validar número
            if (!this.isValidPhone(phoneNumber)) {
                logger.error(`Número de teléfono inválido: ${phoneNumber}`);
                return {
                    success: false,
                    error: 'Número de teléfono inválido'
                };
            }

            logger.info(`💬 Enviando WhatsApp a ${phoneNumber}`);

            if (this.whatsappSandbox) {
                logger.warn('   ⚠️ Modo Sandbox: El usuario debe unirse al sandbox primero');
                logger.warn('   → Enviar mensaje a WhatsApp: "join <sandbox-code>"');
            }

            const result = await this.client.messages.create({
                body: message,
                from: this.whatsappNumber,
                to: `whatsapp:${phoneNumber}`,
                ...options
            });

            logger.info(`✅ WhatsApp enviado exitosamente`);
            logger.info(`   - SID: ${result.sid}`);
            logger.info(`   - Status: ${result.status}`);
            logger.info(`   - To: whatsapp:${phoneNumber}`);

            return {
                success: true,
                messageId: result.sid,
                to: phoneNumber,
                channel: 'whatsapp',
                status: result.status,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logger.error(`❌ Error enviando WhatsApp: ${error.message}`);

            // Errores comunes
            if (error.code === 63007) {
                logger.error('   → El usuario no se ha unido al sandbox de WhatsApp');
                logger.error('   → El usuario debe enviar "join <code>" al número de sandbox');
            } else if (error.code === 63016) {
                logger.error('   → Error 63016: Fuera de ventana de 24h - se requiere Content Template');
                logger.error('   → Debes usar sendWhatsAppTemplate() con una plantilla aprobada');
            } else if (error.code === 21408) {
                logger.error('   → Permisos insuficientes para WhatsApp');
            }

            return {
                success: false,
                error: error.message,
                code: error.code
            };
        }
    }

    /**
     * Formatear número de teléfono
     * Soporta números mexicanos (+52) y venezolanos (+58)
     * @param {string} phone - Número sin formato
     * @returns {string} Número en formato E.164 (+XXXXXXXXXXXX)
     */
    formatPhoneNumber(phone) {
        if (!phone) return null;

        try {
            // Eliminar caracteres no numéricos excepto +
            let cleaned = phone.replace(/[^\d+]/g, '');

            // Si ya tiene +, verificar si es número mexicano que necesita "1"
            if (cleaned.startsWith('+52') && cleaned.length === 13 && cleaned.charAt(3) !== '1') {
                // Es +525516867745 (sin el 1) → convertir a +5215516867745
                cleaned = '+521' + cleaned.substring(3);
                return cleaned;
            } else if (cleaned.startsWith('+')) {
                // Si tiene + y es válido, retornar
                if (isValidPhoneNumber(cleaned)) {
                    return cleaned;
                }
            }

            // Remover + si existe para procesamiento
            cleaned = cleaned.replace('+', '');

            // Si empieza con 0, removerlo (formato local)
            if (cleaned.startsWith('0')) {
                cleaned = cleaned.substring(1);
            }

            // Detectar país y agregar código si falta
            if (cleaned.length === 10) {
                // Probablemente México (10 dígitos sin código)
                // Números móviles mexicanos requieren "1" después del código país
                cleaned = '521' + cleaned;
            } else if (cleaned.length === 12 && cleaned.startsWith('52')) {
                // 12 dígitos empezando con 52
                // Verificar si ya tiene el "1" para móviles
                if (cleaned.charAt(2) !== '1') {
                    // Formato: 525516867745 → 5215516867745
                    cleaned = '521' + cleaned.substring(2);
                }
                // Si ya tiene el 1 (5215516867745), no hacer nada
            } else if (cleaned.length === 11 && cleaned.startsWith('52')) {
                // 11 dígitos empezando con 52, agregar el "1"
                cleaned = '521' + cleaned.substring(2);
            } else if (cleaned.length === 13 && cleaned.startsWith('521')) {
                // Ya tiene el formato correcto con "1" para móviles (5215516867745)
                // No hacer nada
            } else if (cleaned.length === 11 && cleaned.startsWith('58')) {
                // Ya tiene código de Venezuela pero sin +
                // No hacer nada
            } else if (!cleaned.startsWith('52') && !cleaned.startsWith('58')) {
                // Si no tiene código de país, asumir México móvil
                cleaned = '521' + cleaned;
            }

            // Agregar + al inicio
            const formatted = '+' + cleaned;

            // Validar con libphonenumber (pero permitir números mexicanos con "1")
            if (isValidPhoneNumber(formatted)) {
                return formatted;
            } else if (formatted.startsWith('+521') && formatted.length === 14) {
                // Números móviles mexicanos con "1": +5215516867745 (14 caracteres)
                // Son válidos para Twilio WhatsApp aunque libphonenumber no los reconozca
                logger.info(`Número móvil mexicano detectado: ${formatted}`);
                return formatted;
            }

            logger.warn(`Número posiblemente inválido: ${formatted}`);
            return formatted;

        } catch (error) {
            logger.error(`Error formateando número ${phone}: ${error.message}`);
            // Intentar devolver lo mejor que podamos
            if (phone.startsWith('+')) return phone;
            return '+' + phone.replace(/[^\d]/g, '');
        }
    }

    /**
     * Validar si un número de teléfono es válido
     * @param {string} phone - Número en formato E.164
     * @returns {boolean} true si es válido
     */
    isValidPhone(phone) {
        try {
            // Validar con libphonenumber
            if (isValidPhoneNumber(phone)) {
                return true;
            }
            // Permitir números móviles mexicanos con "1"
            if (phone.startsWith('+521') && phone.length === 14) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Parsear número de teléfono y extraer información
     * @param {string} phone - Número de teléfono
     * @returns {object|null} Información del número
     */
    parsePhone(phone) {
        try {
            const phoneNumber = parsePhoneNumber(phone);

            return {
                country: phoneNumber.country,
                countryCode: phoneNumber.countryCallingCode,
                nationalNumber: phoneNumber.nationalNumber,
                formatted: phoneNumber.formatInternational(),
                e164: phoneNumber.number,
                valid: phoneNumber.isValid(),
                type: phoneNumber.getType() // 'MOBILE', 'FIXED_LINE', etc.
            };
        } catch (error) {
            logger.error(`Error parseando teléfono ${phone}: ${error.message}`);
            return null;
        }
    }

    /**
     * Verificar si un número tiene capacidad para WhatsApp
     * En modo test siempre retorna true para móviles
     * @param {string} phone - Número de teléfono
     * @returns {Promise<boolean>} true si puede recibir WhatsApp
     */
    async checkWhatsAppCapability(phone) {
        try {
            const phoneNumber = this.formatPhoneNumber(phone);

            // En sandbox siempre retornar true si es móvil
            if (this.whatsappSandbox || this.testMode) {
                const parsed = this.parsePhone(phoneNumber);
                return parsed && parsed.type === 'MOBILE';
            }

            // En producción, usar Twilio Lookup API
            const lookup = await this.client.lookups.v1
                .phoneNumbers(phoneNumber)
                .fetch({ type: ['carrier'] });

            return lookup.carrier?.type === 'mobile';

        } catch (error) {
            logger.error(`Error verificando WhatsApp capability: ${error.message}`);
            return false;
        }
    }

    /**
     * Obtener información de un mensaje enviado
     * @param {string} messageSid - SID del mensaje de Twilio
     * @returns {Promise<object>} Información del mensaje
     */
    async getMessageStatus(messageSid) {
        try {
            const message = await this.client.messages(messageSid).fetch();

            return {
                sid: message.sid,
                status: message.status,
                to: message.to,
                from: message.from,
                body: message.body,
                errorCode: message.errorCode,
                errorMessage: message.errorMessage,
                dateCreated: message.dateCreated,
                dateUpdated: message.dateUpdated,
                dateSent: message.dateSent
            };

        } catch (error) {
            logger.error(`Error obteniendo status del mensaje: ${error.message}`);
            return null;
        }
    }

    /**
     * Verificar si el servicio está configurado correctamente
     * @returns {Promise<boolean>} true si está configurado
     */
    async testConnection() {
        if (!this.enabled) {
            logger.warn('Twilio deshabilitado');
            return false;
        }

        try {
            // Obtener información de la cuenta
            const account = await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();

            logger.info('✅ Conexión a Twilio exitosa');
            logger.info(`   - Account: ${account.friendlyName}`);
            logger.info(`   - Status: ${account.status}`);
            logger.info(`   - Type: ${account.type}`);

            return true;

        } catch (error) {
            logger.error(`❌ Error conectando a Twilio: ${error.message}`);
            return false;
        }
    }
}

// Exportar instancia singleton
module.exports = new TwilioService();
