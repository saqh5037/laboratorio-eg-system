const logger = require('../../utils/logger');

/**
 * MessageTemplateService - Plantillas de mensajes para notificaciones Telegram
 *
 * Maneja la creación de mensajes formateados con:
 * - Markdown formatting
 * - Botones inline
 * - Emojis y estructura visual profesional
 */
class MessageTemplateService {
  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.labPhone = '+58 212 762 0561';
    this.labEmail = 'info@laboratorioeg.com';
  }

  /**
   * Template: Orden Creada
   * @param {object} data - { numero, paciente, estudios, fecha }
   * @returns {object} { message, buttons }
   */
  ordenCreada(data) {
    const { numero, paciente, estudios, fecha } = data;

    const estudiosTexto = estudios && estudios.length > 0
      ? estudios.map(e => `  • ${e}`).join('\n')
      : '  • Información no disponible';

    const message = `📋 *¡Nueva Orden de Trabajo Creada!*

Estimado(a) *${paciente}*,

Se ha creado la orden de trabajo *#${numero}* el ${fecha}.

📋 *Estudios solicitados:*
${estudiosTexto}

ℹ️ *Próximos pasos:*
1. Realizar el pago de la orden
2. Entrega de muestras (si aplica)
3. Procesamiento en laboratorio

Le mantendremos informado del progreso de su orden.

━━━━━━━━━━━━━━━━━━
_Laboratorio EG - Desde 1982_
📞 ${this.labPhone}`;

    const buttons = [
      [
        { text: '🌐 Portal Web', url: this.baseUrl },
      ]
    ];

    return { message, buttons };
  }

  /**
   * Template: Orden Pagada
   * @param {object} data - { numero, paciente, estudios, fechaEstimada }
   * @returns {object} { message, buttons }
   */
  ordenPagada(data) {
    const { numero, paciente, estudios, fechaEstimada } = data;

    const estudiosTexto = estudios.length > 0
      ? estudios.map(e => `  • ${e}`).join('\n')
      : '  • Información no disponible';

    const message = `🎉 *¡Orden de Trabajo Registrada!*

Estimado(a) *${paciente}*,

Su orden de trabajo *#${numero}* ha sido registrada exitosamente y está siendo procesada.

📋 *Estudios solicitados:*
${estudiosTexto}

📅 *Fecha estimada de resultados:*
${fechaEstimada}

Le notificaremos automáticamente cuando sus resultados estén listos para consultar.

━━━━━━━━━━━━━━━━━━
_Laboratorio EG - Desde 1982_
📞 ${this.labPhone}`;

    const buttons = [
      [
        { text: '🌐 Portal Web', url: this.baseUrl },
      ]
    ];

    return { message, buttons };
  }

  /**
   * Template: Resultados Listos
   * @param {object} data - { numero, paciente, fechaValidado }
   * @returns {object} { message, buttons }
   */
  resultadosListos(data) {
    const { numero, paciente, fechaValidado } = data;

    // URL directa al portal de resultados
    const portalUrl = `${this.baseUrl}/resultados`;

    const message = `✅ *¡Sus Resultados Están Listos!*

Estimado(a) *${paciente}*,

Sus resultados de la orden *#${numero}* ya están disponibles para consultar en nuestro portal web.

🌐 *Pasos para ver sus resultados:*
1. Ingrese al portal web (botón abajo)
2. Seleccione método "Telegram" o "Cédula"
3. Complete la autenticación
4. Visualice y descargue sus resultados

⏰ Sus resultados están disponibles 24/7

━━━━━━━━━━━━━━━━━━
_Laboratorio EG - Desde 1982_
📞 ${this.labPhone}`;

    const buttons = [
      [
        { text: '🌐 Ir al Portal de Resultados', url: portalUrl },
      ]
    ];

    return { message, buttons };
  }

  /**
   * Template: Orden en Proceso
   * @param {object} data - { numero, paciente, estudios, etapaActual }
   * @returns {object} { message, buttons }
   */
  ordenEnProceso(data) {
    const { numero, paciente, estudios, etapaActual } = data;

    const estudiosTexto = estudios.length > 0
      ? estudios.map(e => `  • ${e.nombre}`).join('\n')
      : '  • Información no disponible';

    const etapas = {
      'recepcion': '📥 Recepción de muestras',
      'analisis': '🔬 Análisis en laboratorio',
      'validacion': '✓ Validación de resultados',
      'listo': '✅ Resultados listos'
    };

    const etapaTexto = etapas[etapaActual] || '⏳ En proceso';

    const message = `⏳ *Orden en Proceso*

Estimado(a) *${paciente}*,

Su orden *#${numero}* está siendo procesada actualmente.

📋 *Estudios:*
${estudiosTexto}

📍 *Etapa actual:*
${etapaTexto}

Le notificaremos cuando sus resultados estén listos.

━━━━━━━━━━━━━━━━━━
_Laboratorio EG - Desde 1982_
📞 ${this.labPhone}`;

    const buttons = [
      [
        { text: '🌐 Portal Web', url: this.baseUrl },
      ]
    ];

    return { message, buttons };
  }

  /**
   * Template: Resultados Críticos (Urgente)
   * @param {object} data - { numero, paciente, estudiosUrgentes, resultsUrl }
   * @returns {object} { message, buttons }
   */
  resultadosCriticos(data) {
    const { numero, paciente, estudiosUrgentes, resultsUrl } = data;

    const estudiosTexto = estudiosUrgentes.length > 0
      ? estudiosUrgentes.map(e => `  • ${e.nombre}`).join('\n')
      : '  • Información no disponible';

    const message = `🚨 *RESULTADOS URGENTES - ATENCIÓN REQUERIDA*

Estimado(a) *${paciente}*,

Los resultados de su orden *#${numero}* contienen valores que requieren atención médica inmediata.

⚠️ *Estudios con valores críticos:*
${estudiosTexto}

*IMPORTANTE:* Por favor, consulte estos resultados con su médico tratante a la brevedad posible.

━━━━━━━━━━━━━━━━━━
_Laboratorio EG - Desde 1982_
📞 ${this.labPhone}`;

    const buttons = [
      [
        { text: '📄 Ver Resultados URGENTE', url: resultsUrl },
      ]
    ];

    return { message, buttons };
  }

  /**
   * Template: Recordatorio de Retiro
   * @param {object} data - { numero, paciente, diasDisponible, direccion }
   * @returns {object} { message, buttons }
   */
  recordatorioRetiro(data) {
    const { numero, paciente, diasDisponible, direccion } = data;

    const message = `📋 *Recordatorio: Retiro de Resultados*

Estimado(a) *${paciente}*,

Le recordamos que los resultados físicos de su orden *#${numero}* están disponibles para retiro en nuestras instalaciones.

📍 *Dirección:*
${direccion || 'Av. Principal, Torre EG, Piso 3'}

⏰ *Horario de atención:*
Lunes a Viernes: 7:00 AM - 5:00 PM
Sábados: 8:00 AM - 12:00 PM

📅 *Disponible por:* ${diasDisponible} días más

También puede consultar sus resultados en línea desde nuestro portal web.

━━━━━━━━━━━━━━━━━━
_Laboratorio EG - Desde 1982_
📞 ${this.labPhone}`;

    const buttons = [
      [
        { text: '🗺️ Cómo Llegar', url: 'https://maps.google.com/?q=Laboratorio+EG' },
      ],
      [
        { text: '🌐 Ver en Web', url: this.baseUrl },
      ]
    ];

    return { message, buttons };
  }

  /**
   * Template: Bienvenida al paciente autenticado
   * @param {object} data - { paciente }
   * @returns {object} { message, buttons }
   */
  bienvenidaAutenticado(data) {
    const { paciente } = data;

    const message = `👋 *¡Bienvenido(a), ${paciente}!*

Gracias por autenticarte con Laboratorio EG.

Ahora recibirás notificaciones automáticas sobre:
✓ Estado de tus órdenes
✓ Resultados listos para consultar
✓ Recordatorios importantes

Puedes gestionar tus preferencias de notificaciones desde nuestro portal web.

━━━━━━━━━━━━━━━━━━
_Laboratorio EG - Desde 1982_
📞 ${this.labPhone}`;

    const buttons = [
      [
        { text: '⚙️ Configurar Notificaciones', url: `${this.baseUrl}/perfil/notificaciones` },
      ],
      [
        { text: '🌐 Ir al Portal', url: this.baseUrl },
      ]
    ];

    return { message, buttons };
  }

  /**
   * Template: Confirmación de preferencias actualizadas
   * @param {object} data - { paciente, preferencias }
   * @returns {object} { message, buttons }
   */
  preferenciasActualizadas(data) {
    const { paciente, preferencias } = data;

    const estados = {
      orden_pagada: preferencias.orden_pagada ? '✅' : '❌',
      resultados_listos: preferencias.resultados_listos ? '✅' : '❌',
      orden_en_proceso: preferencias.orden_en_proceso ? '✅' : '❌',
      recordatorio_retiro: preferencias.recordatorio_retiro ? '✅' : '❌',
      resultados_criticos: '✅ (Siempre activo por seguridad)'
    };

    const message = `⚙️ *Preferencias de Notificaciones Actualizadas*

Estimado(a) *${paciente}*,

Sus preferencias de notificaciones han sido actualizadas:

${estados.orden_pagada} Orden pagada
${estados.resultados_listos} Resultados listos
${estados.orden_en_proceso} Orden en proceso
${estados.recordatorio_retiro} Recordatorio de retiro
${estados.resultados_criticos}

Puede modificarlas en cualquier momento desde el portal web.

━━━━━━━━━━━━━━━━━━
_Laboratorio EG - Desde 1982_`;

    const buttons = [
      [
        { text: '⚙️ Modificar Preferencias', url: `${this.baseUrl}/perfil/notificaciones` },
      ]
    ];

    return { message, buttons };
  }

  /**
   * Formatear mensaje para envío
   * @param {string} templateName - Nombre del template
   * @param {object} data - Datos para el template
   * @returns {object} { message, buttons } o null si el template no existe
   */
  format(templateName, data) {
    const templates = {
      orden_creada: this.ordenCreada.bind(this),
      orden_pagada: this.ordenPagada.bind(this),
      resultados_listos: this.resultadosListos.bind(this),
      orden_en_proceso: this.ordenEnProceso.bind(this),
      resultados_criticos: this.resultadosCriticos.bind(this),
      recordatorio_retiro: this.recordatorioRetiro.bind(this),
      bienvenida_autenticado: this.bienvenidaAutenticado.bind(this),
      preferencias_actualizadas: this.preferenciasActualizadas.bind(this),
    };

    if (!templates[templateName]) {
      logger.warn(`Template no encontrado: ${templateName}`);
      return null;
    }

    return templates[templateName](data);
  }
}

// Exportar singleton
module.exports = new MessageTemplateService();
