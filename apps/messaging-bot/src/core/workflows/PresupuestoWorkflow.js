const StateManager = require('../../utils/StateManager');
const LabsisService = require('../services/LabsisService');
const PresupuestoService = require('../services/PresupuestoService');
const PreciosService = require('../services/PreciosService');
const logger = require('../../utils/logger');
const { formatUSD } = require('../../utils/formatters');

/**
 * PresupuestoWorkflow - Workflow conversacional para crear presupuestos
 *
 * Estados del workflow:
 * 1. AWAITING_CEDULA - Esperando cédula del paciente
 * 2. SELECTING_PATIENT - Seleccionar entre múltiples pacientes con misma cédula base
 * 3. AWAITING_APELLIDO - Esperando apellido para autenticar (paciente existente)
 * 4. AWAITING_BIRTH_MONTH - Esperando mes de nacimiento para autenticar
 * 5. AWAITING_NOMBRE - Esperando nombre completo (paciente nuevo)
 * 6. AWAITING_APELLIDO_NEW - Esperando apellido (paciente nuevo)
 * 7. AWAITING_FECHA_NACIMIENTO - Esperando fecha de nacimiento (paciente nuevo)
 * 8. AWAITING_SEXO - Esperando sexo (paciente nuevo)
 * 9. AWAITING_TELEFONO - Esperando teléfono (paciente nuevo)
 * 10. AWAITING_EMAIL - Esperando email (paciente nuevo)
 * 11. AUTHENTICATED - Paciente autenticado
 * 12. AWAITING_TESTS - Esperando lista de estudios
 * 13. SELECTING_STUDIES - Seleccionando estudios específicos de múltiples coincidencias
 * 14. BUILDING_CART - Construyendo carrito de estudios
 * 15. CONFIRMING - Esperando confirmación
 * 16. COMPLETED - Presupuesto creado
 */
class PresupuestoWorkflow {
  constructor() {
    this.workflowName = 'presupuesto';
    this.maxRetries = 3;
  }

  /**
   * Iniciar workflow de presupuesto
   * @param {UnifiedMessage} message
   * @param {object} adapter - Messaging adapter (TelegramAdapter, etc.)
   * @returns {Promise<void>}
   */
  async start(message, adapter) {
    const conversationId = message.conversationId;

    // Crear estado inicial
    StateManager.createState(conversationId, this.workflowName, 'AWAITING_CEDULA', {
      platform: message.platform,
      chatId: message.chatId,
      userId: message.userId,
      userName: message.getFullName()
    });

    await adapter.sendTextMessage(
      message.chatId,
      `💰 *Solicitud de Presupuesto*\n\nPor favor, indíqueme su número de cédula.\n\nEjemplo: V-17371453 o 17371453`
    );

    logger.info(`🔄 Presupuesto workflow started for ${conversationId}`);
  }

  /**
   * Procesar mensaje dentro del workflow
   * @param {UnifiedMessage} message
   * @param {object} adapter
   * @returns {Promise<void>}
   */
  async processMessage(message, adapter) {
    const conversationId = message.conversationId;
    const state = StateManager.getState(conversationId);

    if (!state) {
      logger.warn(`⚠️  No state found for ${conversationId}`);
      return;
    }

    const currentStep = state.currentStep;
    const userInput = message.getText().trim();

    logger.info(`📍 Processing step: ${currentStep} - Input: ${userInput.substring(0, 50)}`);

    try {
      switch (currentStep) {
        case 'AWAITING_CEDULA':
          await this.handleCedula(conversationId, userInput, adapter, message.chatId);
          break;

        case 'SELECTING_PATIENT':
          await this.handlePatientSelection(conversationId, userInput, adapter, message.chatId);
          break;

        case 'AWAITING_APELLIDO':
          await this.handleApellido(conversationId, userInput, adapter, message.chatId);
          break;

        case 'AWAITING_BIRTH_MONTH':
          await this.handleBirthMonth(conversationId, userInput, adapter, message.chatId);
          break;

        case 'AWAITING_NOMBRE':
          await this.handleNombreNew(conversationId, userInput, adapter, message.chatId);
          break;

        case 'AWAITING_APELLIDO_NEW':
          await this.handleApellidoNew(conversationId, userInput, adapter, message.chatId);
          break;

        case 'AWAITING_FECHA_NACIMIENTO':
          await this.handleFechaNacimiento(conversationId, userInput, adapter, message.chatId);
          break;

        case 'AWAITING_SEXO':
          await this.handleSexo(conversationId, userInput, adapter, message.chatId);
          break;

        case 'AWAITING_TELEFONO':
          await this.handleTelefono(conversationId, userInput, adapter, message.chatId);
          break;

        case 'AWAITING_EMAIL':
          await this.handleEmail(conversationId, userInput, adapter, message.chatId);
          break;

        case 'AWAITING_TESTS':
          await this.handleTests(conversationId, userInput, adapter, message.chatId);
          break;

        case 'SELECTING_STUDIES':
          await this.handleStudySelection(conversationId, userInput, adapter, message.chatId);
          break;

        case 'BUILDING_CART':
          await this.handleBuildingCart(conversationId, userInput, adapter, message.chatId);
          break;

        case 'CONFIRMING':
          await this.handleConfirmation(conversationId, userInput, adapter, message.chatId);
          break;

        default:
          logger.warn(`⚠️  Unknown step: ${currentStep}`);
      }

    } catch (error) {
      logger.error('Error in PresupuestoWorkflow.processMessage:', error);

      await adapter.sendTextMessage(
        message.chatId,
        'Disculpe, he tenido un problema procesando su solicitud. Por favor, intente nuevamente.'
      );
    }
  }

  /**
   * Manejar cédula ingresada
   */
  async handleCedula(conversationId, cedula, adapter, chatId) {
    // Validar formato
    if (!LabsisService.isValidCedula(cedula)) {
      await adapter.sendTextMessage(
        chatId,
        '❌ Formato de cédula inválido.\n\nPor favor ingrese una cédula válida.\n\nEjemplo: V-17371453 o 17371453'
      );
      return;
    }

    const normalizedCedula = LabsisService.normalizeCedula(cedula);

    // Guardar cédula
    StateManager.updateData(conversationId, { cedula: normalizedCedula });

    await adapter.sendTypingIndicator(chatId);

    // Buscar paciente(s) en Labsis
    const patients = await LabsisService.searchPatientByCedula(normalizedCedula);

    if (patients.length === 0) {
      // No existe - iniciar registro
      StateManager.updateStep(conversationId, 'AWAITING_NOMBRE');

      await adapter.sendTextMessage(
        chatId,
        `No encontré su cédula en nuestro sistema.\n\nVamos a registrarle como nuevo paciente.\n\n¿Cuál es su nombre completo?`
      );

    } else if (patients.length === 1) {
      // Un solo paciente - iniciar autenticación
      StateManager.updateData(conversationId, {
        labsisPatient: patients[0],
        verificationAttempts: 0
      });

      StateManager.updateStep(conversationId, 'AWAITING_APELLIDO');

      await adapter.sendTextMessage(
        chatId,
        `Hola *${patients[0].nombre}*,\n\nPara verificar su identidad, por favor indíqueme su apellido.`
      );

    } else {
      // Múltiples pacientes - pedir selección
      StateManager.updateData(conversationId, {
        matchingPatients: patients
      });

      StateManager.updateStep(conversationId, 'SELECTING_PATIENT');

      // Formatear lista de pacientes
      let message = `Encontré ${patients.length} registros con la cédula ${normalizedCedula}:\n\n`;

      patients.forEach((p, index) => {
        message += `${index + 1}. *${p.nombre} ${p.apellido}*\n   Cédula: ${p.ci_paciente}\n\n`;
      });

      message += `Por favor, responda con el número (1-${patients.length}) del registro que le corresponde.`;

      await adapter.sendTextMessage(chatId, message);
    }
  }

  /**
   * Manejar selección de paciente cuando hay múltiples matches
   */
  async handlePatientSelection(conversationId, selection, adapter, chatId) {
    const matchingPatients = StateManager.getData(conversationId, 'matchingPatients');

    if (!matchingPatients || matchingPatients.length === 0) {
      await adapter.sendTextMessage(chatId, '❌ Error: No hay pacientes para seleccionar.');
      StateManager.deleteState(conversationId);
      return;
    }

    // Validar que sea un número válido
    const selectedNumber = parseInt(selection.trim());

    if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > matchingPatients.length) {
      await adapter.sendTextMessage(
        chatId,
        `❌ Selección inválida.\n\nPor favor, responda con un número entre 1 y ${matchingPatients.length}.`
      );
      return;
    }

    // Obtener el paciente seleccionado (índice 0-based)
    const selectedPatient = matchingPatients[selectedNumber - 1];

    // Guardar paciente seleccionado
    StateManager.updateData(conversationId, {
      labsisPatient: selectedPatient,
      verificationAttempts: 0
    });

    // Limpiar lista de pacientes
    StateManager.updateData(conversationId, { matchingPatients: null });

    // Continuar con autenticación
    StateManager.updateStep(conversationId, 'AWAITING_APELLIDO');

    await adapter.sendTextMessage(
      chatId,
      `✅ Seleccionó: *${selectedPatient.nombre} ${selectedPatient.apellido}*\nCédula: ${selectedPatient.ci_paciente}\n\nPara verificar su identidad, por favor indíqueme su apellido.`
    );
  }

  /**
   * Manejar apellido para autenticación
   */
  async handleApellido(conversationId, apellido, adapter, chatId) {
    const labsisPatient = StateManager.getData(conversationId, 'labsisPatient');
    const attempts = StateManager.getData(conversationId, 'verificationAttempts') || 0;

    // Validar apellido
    if (LabsisService.validateApellido(labsisPatient, apellido)) {
      // Apellido correcto - pedir mes de nacimiento
      StateManager.updateStep(conversationId, 'AWAITING_BIRTH_MONTH');

      await adapter.sendTextMessage(
        chatId,
        '✅ Apellido correcto.\n\n¿En qué mes nació?\n\nEjemplo: Febrero, Feb, o 2'
      );

    } else {
      // Apellido incorrecto
      StateManager.incrementCounter(conversationId, 'verificationAttempts');

      if (attempts + 1 >= this.maxRetries) {
        // Máximo de intentos alcanzado
        StateManager.deleteState(conversationId);

        await adapter.sendTextMessage(
          chatId,
          '❌ Ha excedido el número máximo de intentos de verificación.\n\nPor favor, contacte al laboratorio directamente:\n📞 +58 212 762.0561'
        );

      } else {
        await adapter.sendTextMessage(
          chatId,
          `❌ Apellido incorrecto.\n\nIntento ${attempts + 1} de ${this.maxRetries}.\n\nPor favor, intente nuevamente.`
        );
      }
    }
  }

  /**
   * Manejar mes de nacimiento para autenticación
   */
  async handleBirthMonth(conversationId, month, adapter, chatId) {
    const labsisPatient = StateManager.getData(conversationId, 'labsisPatient');
    const attempts = StateManager.getData(conversationId, 'verificationAttempts') || 0;

    // Validar mes
    if (LabsisService.validateBirthMonth(labsisPatient, month)) {
      // Autenticación exitosa
      StateManager.updateStep(conversationId, 'AWAITING_TESTS');

      await adapter.sendTextMessage(
        chatId,
        `✅ Verificación exitosa.\n\nBienvenido/a de nuevo, *${labsisPatient.nombre} ${labsisPatient.apellido}*.\n\n¿Qué exámenes necesita realizarse?\n\nPuede indicar uno o varios estudios.`
      );

    } else {
      // Mes incorrecto
      StateManager.incrementCounter(conversationId, 'verificationAttempts');

      if (attempts + 1 >= this.maxRetries) {
        // Máximo de intentos
        StateManager.deleteState(conversationId);

        await adapter.sendTextMessage(
          chatId,
          '❌ Ha excedido el número máximo de intentos de verificación.\n\nPor favor, contacte al laboratorio directamente:\n📞 +58 212 762.0561'
        );

      } else {
        await adapter.sendTextMessage(
          chatId,
          `❌ Mes de nacimiento incorrecto.\n\nIntento ${attempts + 1} de ${this.maxRetries}.\n\nPor favor, intente nuevamente.`
        );
      }
    }
  }

  /**
   * Manejar nombre completo (paciente nuevo)
   */
  async handleNombreNew(conversationId, nombre, adapter, chatId) {
    if (nombre.length < 2) {
      await adapter.sendTextMessage(chatId, '❌ Por favor ingrese un nombre válido.');
      return;
    }

    StateManager.updateData(conversationId, { nombre });
    StateManager.updateStep(conversationId, 'AWAITING_APELLIDO_NEW');

    await adapter.sendTextMessage(chatId, '¿Cuál es su apellido completo?');
  }

  /**
   * Manejar apellido (paciente nuevo)
   */
  async handleApellidoNew(conversationId, apellido, adapter, chatId) {
    if (apellido.length < 2) {
      await adapter.sendTextMessage(chatId, '❌ Por favor ingrese un apellido válido.');
      return;
    }

    StateManager.updateData(conversationId, { apellido });
    StateManager.updateStep(conversationId, 'AWAITING_FECHA_NACIMIENTO');

    await adapter.sendTextMessage(
      chatId,
      '¿Cuál es su fecha de nacimiento?\n\nFormato: DD/MM/AAAA\nEjemplo: 15/02/1990'
    );
  }

  /**
   * Manejar fecha de nacimiento (paciente nuevo)
   */
  async handleFechaNacimiento(conversationId, fecha, adapter, chatId) {
    // Validar formato DD/MM/YYYY
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = fecha.match(dateRegex);

    if (!match) {
      await adapter.sendTextMessage(
        chatId,
        '❌ Formato de fecha inválido.\n\nPor favor use el formato DD/MM/AAAA\nEjemplo: 15/02/1990'
      );
      return;
    }

    const [, day, month, year] = match;
    const fechaNacimiento = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    StateManager.updateData(conversationId, { fechaNacimiento });
    StateManager.updateStep(conversationId, 'AWAITING_SEXO');

    await adapter.sendTextMessage(
      chatId,
      '¿Cuál es su sexo?\n\nEscriba: M (Masculino) o F (Femenino)'
    );
  }

  /**
   * Manejar sexo (paciente nuevo)
   */
  async handleSexo(conversationId, sexo, adapter, chatId) {
    const sexoNormalized = sexo.toUpperCase().trim();

    if (!['M', 'F', 'MASCULINO', 'FEMENINO'].includes(sexoNormalized)) {
      await adapter.sendTextMessage(
        chatId,
        '❌ Por favor indique M (Masculino) o F (Femenino)'
      );
      return;
    }

    const sexoFinal = sexoNormalized.startsWith('M') ? 'M' : 'F';

    StateManager.updateData(conversationId, { sexo: sexoFinal });
    StateManager.updateStep(conversationId, 'AWAITING_TELEFONO');

    await adapter.sendTextMessage(
      chatId,
      '¿Cuál es su teléfono de contacto?\n\nEjemplo: +58 412 1234567 o 04121234567'
    );
  }

  /**
   * Manejar teléfono (paciente nuevo)
   */
  async handleTelefono(conversationId, telefono, adapter, chatId) {
    // Normalizar teléfono venezolano
    const cleanPhone = telefono.replace(/[^0-9]/g, '');

    if (cleanPhone.length < 10) {
      await adapter.sendTextMessage(
        chatId,
        '❌ Número de teléfono inválido.\n\nEjemplo: +58 412 1234567 o 04121234567'
      );
      return;
    }

    StateManager.updateData(conversationId, { telefono });
    StateManager.updateStep(conversationId, 'AWAITING_EMAIL');

    await adapter.sendTextMessage(
      chatId,
      '¿Cuál es su correo electrónico? (Opcional)\n\nSi no tiene correo, escriba "No" o "Ninguno".'
    );
  }

  /**
   * Manejar email (paciente nuevo)
   */
  async handleEmail(conversationId, email, adapter, chatId) {
    const emailLower = email.toLowerCase().trim();
    const emailFinal = ['no', 'ninguno', 'n/a', 'na'].includes(emailLower) ? null : email;

    StateManager.updateData(conversationId, { email: emailFinal });

    await adapter.sendTypingIndicator(chatId);

    // Crear paciente en Labsis
    try {
      const data = StateManager.getAllData(conversationId);

      const patientId = await LabsisService.createPatient({
        cedula: data.cedula,
        nombre: data.nombre,
        apellido: data.apellido,
        fechaNacimiento: data.fechaNacimiento,
        sexo: data.sexo,
        telefono: data.telefono,
        email: emailFinal,
        direccion: null
      });

      // Guardar paciente creado
      StateManager.updateData(conversationId, {
        labsisPatientId: patientId,
        labsisPatient: {
          id: patientId,
          nombre: data.nombre,
          apellido: data.apellido,
          ci_paciente: data.cedula
        }
      });

      StateManager.updateStep(conversationId, 'AWAITING_TESTS');

      await adapter.sendTextMessage(
        chatId,
        `✅ Registro exitoso.\n\nBienvenido/a *${data.nombre} ${data.apellido}*.\n\n¿Qué exámenes necesita realizarse?\n\nPuede indicar uno o varios estudios.`
      );

    } catch (error) {
      logger.error('Error creando paciente en Labsis:', error);

      await adapter.sendTextMessage(
        chatId,
        '❌ Error al registrar paciente. Por favor, contacte al laboratorio:\n📞 +58 212 762.0561'
      );

      StateManager.deleteState(conversationId);
    }
  }

  /**
   * Manejar lista de estudios solicitados
   */
  async handleTests(conversationId, tests, adapter, chatId) {
    await adapter.sendTypingIndicator(chatId);

    // Separar tests por comas o saltos de línea
    const testList = tests.split(/[,\n]/).map(t => t.trim()).filter(t => t.length > 0);

    if (testList.length === 0) {
      await adapter.sendTextMessage(
        chatId,
        '❌ No se especificaron estudios.\n\nPor favor, indique los exámenes que necesita.'
      );
      return;
    }

    logger.info(`💰 Buscando precios para: ${testList.join(', ')}`);

    // Buscar precios usando PreciosService (lee precios.json con fuzzy search)
    const allResults = await PreciosService.searchStudies(testList);

    // FILTRAR SOLO RESULTADOS CON SCORE ALTO (>= 70)
    // Esto evita mostrar estudios con coincidencias muy bajas/irrelevantes
    const MIN_SCORE = 70;
    const studiesWithPrices = allResults.filter(study => study.matchScore >= MIN_SCORE);

    logger.info(`🔍 Filtrado: ${allResults.length} resultados → ${studiesWithPrices.length} con score >= ${MIN_SCORE}`);

    if (studiesWithPrices.length === 0) {
      // Si no hay resultados con score alto, mostrar sugerencias
      const suggestions = allResults.slice(0, 5)
        .map(s => `• ${s.nombre} (coincidencia: ${s.matchScore.toFixed(0)}%)`)
        .join('\n');

      const message = suggestions.length > 0
        ? `No encontré coincidencias exactas para: "${testList.join(', ')}"\n\n¿Quiso decir alguno de estos?\n${suggestions}\n\nPor favor, reformule su solicitud con el nombre correcto.`
        : `No pude encontrar precios para los estudios solicitados.\n\nPor favor, contacte al laboratorio para más información:\n📞 +58 212 762.0561\n📧 info@laboratorioeg.com`;

      await adapter.sendTextMessage(chatId, message);
      return;
    }

    // DECISIÓN: ¿Es una coincidencia exacta (1 estudio) o múltiples opciones?
    if (studiesWithPrices.length === 1) {
      // Solo 1 resultado → Agregarlo directamente al carrito
      const cart = StateManager.getData(conversationId, 'cart') || [];
      cart.push(studiesWithPrices[0]);

      StateManager.updateData(conversationId, { cart });

      await adapter.sendTextMessage(
        chatId,
        `✅ Agregado: *${studiesWithPrices[0].nombre}* - $${studiesWithPrices[0].precio} USD\n\n¿Desea agregar más estudios?\n\nResponda con el nombre del estudio o escriba "Listo" para ver el presupuesto final.`
      );

      StateManager.updateStep(conversationId, 'BUILDING_CART');

    } else {
      // Múltiples resultados → Pedir al usuario que seleccione
      StateManager.updateData(conversationId, {
        pendingStudies: studiesWithPrices,
        originalSearchTerm: testList.join(', ')
      });

      StateManager.updateStep(conversationId, 'SELECTING_STUDIES');

      // Mostrar opciones numeradas
      const optionsText = studiesWithPrices
        .slice(0, 10) // Limitar a 10 para no saturar
        .map((study, i) => `${i + 1}. ${study.nombre} - $${study.precio} USD`)
        .join('\n');

      const moreText = studiesWithPrices.length > 10
        ? `\n\n(Mostrando 10 de ${studiesWithPrices.length} resultados)`
        : '';

      await adapter.sendTextMessage(
        chatId,
        `🔍 Encontré ${studiesWithPrices.length} estudios para "${testList.join(', ')}":\n\n${optionsText}${moreText}\n\n*¿Cuál necesita?*\n\nResponda con el número (ej: 1) o escriba "Todos" para agregarlos todos.`
      );
    }
  }

  /**
   * Manejar selección de estudio cuando hay múltiples coincidencias
   */
  async handleStudySelection(conversationId, selection, adapter, chatId) {
    const pendingStudies = StateManager.getData(conversationId, 'pendingStudies');
    const selectionLower = selection.toLowerCase().trim();

    // Opción 1: Usuario quiere agregar TODOS
    if (['todos', 'all', 'todo'].includes(selectionLower)) {
      const cart = StateManager.getData(conversationId, 'cart') || [];
      cart.push(...pendingStudies);

      StateManager.updateData(conversationId, { cart, pendingStudies: null });
      StateManager.updateStep(conversationId, 'BUILDING_CART');

      await adapter.sendTextMessage(
        chatId,
        `✅ Agregados ${pendingStudies.length} estudios al presupuesto.\n\n¿Desea agregar más estudios?\n\nResponda con el nombre del estudio o escriba "Listo" para ver el presupuesto final.`
      );
      return;
    }

    // Opción 2: Usuario seleccionó un número
    const selectedNumber = parseInt(selection.trim());

    if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > Math.min(pendingStudies.length, 10)) {
      await adapter.sendTextMessage(
        chatId,
        `❌ Selección inválida.\n\nPor favor, responda con un número entre 1 y ${Math.min(pendingStudies.length, 10)}, o escriba "Todos" para agregarlos todos.`
      );
      return;
    }

    const selectedStudy = pendingStudies[selectedNumber - 1];
    const cart = StateManager.getData(conversationId, 'cart') || [];
    cart.push(selectedStudy);

    StateManager.updateData(conversationId, { cart, pendingStudies: null });
    StateManager.updateStep(conversationId, 'BUILDING_CART');

    await adapter.sendTextMessage(
      chatId,
      `✅ Agregado: *${selectedStudy.nombre}* - $${selectedStudy.precio} USD\n\n¿Desea agregar más estudios?\n\nResponda con el nombre del estudio o escriba "Listo" para ver el presupuesto final.`
    );
  }

  /**
   * Manejar construcción del carrito (agregar más estudios)
   */
  async handleBuildingCart(conversationId, userInput, adapter, chatId) {
    const inputLower = userInput.toLowerCase().trim();

    // Usuario terminó de agregar estudios
    if (['listo', 'finalizar', 'terminar', 'ok', 'fin', 'ya'].includes(inputLower)) {
      const cart = StateManager.getData(conversationId, 'cart') || [];

      if (cart.length === 0) {
        await adapter.sendTextMessage(
          chatId,
          '❌ No hay estudios en el carrito.\n\nPor favor, indique los exámenes que necesita.'
        );
        StateManager.updateStep(conversationId, 'AWAITING_TESTS');
        return;
      }

      // Mostrar presupuesto final
      const total = cart.reduce((sum, study) => sum + parseFloat(study.precio), 0);

      StateManager.updateData(conversationId, {
        testsRequested: cart,
        estimatedTotal: total
      });

      StateManager.updateStep(conversationId, 'CONFIRMING');

      const studiesText = cart
        .map(study => `• ${study.nombre} - $${study.precio} USD`)
        .join('\n');

      await adapter.sendTextMessage(
        chatId,
        `💰 *Presupuesto Estimado*\n\n${studiesText}\n\n*Total estimado: $${total.toFixed(2)} USD*\n\n¿Confirma este presupuesto?\n\nResponda "Sí" para confirmar o "No" para cancelar.`
      );
      return;
    }

    // Usuario quiere agregar más estudios → volver a buscar
    await this.handleTests(conversationId, userInput, adapter, chatId);
  }

  /**
   * Manejar confirmación final
   */
  async handleConfirmation(conversationId, confirmation, adapter, chatId) {
    const confirmLower = confirmation.toLowerCase().trim();

    if (['si', 'sí', 'yes', 'confirmar', 'confirmo', 'ok'].includes(confirmLower)) {
      // Confirmar presupuesto
      await this.createPresupuesto(conversationId, adapter, chatId);

    } else if (['no', 'cancelar', 'cancel'].includes(confirmLower)) {
      // Cancelar
      StateManager.deleteState(conversationId);

      await adapter.sendTextMessage(
        chatId,
        '❌ Presupuesto cancelado.\n\nSi necesita ayuda, use /menu para ver las opciones disponibles.'
      );

    } else {
      await adapter.sendTextMessage(
        chatId,
        'Por favor, responda "Sí" para confirmar o "No" para cancelar.'
      );
    }
  }

  /**
   * Crear presupuesto en la base de datos
   */
  async createPresupuesto(conversationId, adapter, chatId) {
    const data = StateManager.getAllData(conversationId);

    try {
      await adapter.sendTypingIndicator(chatId);

      const presupuesto = await PresupuestoService.create({
        conversationId,
        platform: data.platform,
        userId: data.userId,
        patientName: `${data.labsisPatient.nombre} ${data.labsisPatient.apellido}`,
        patientPhone: data.telefono || data.labsisPatient.telefono,
        patientEmail: data.email || data.labsisPatient.email,
        patientCedula: data.cedula,
        testsRequested: data.testsRequested,
        estimatedTotal: data.estimatedTotal,
        notes: `Creado vía ${data.platform}`,
        labsisPatientId: data.labsisPatient.id
      });

      StateManager.updateStep(conversationId, 'COMPLETED');

      // Formatear estudios
      const studiesText = data.testsRequested
        .map(study => `• ${study.nombre} - ${formatUSD(study.precio)}`)
        .join('\n');

      await adapter.sendTextMessage(
        chatId,
        `✅ *Presupuesto Creado Exitosamente*\n\n*Número:* ${presupuesto.presupuesto_number}\n*Paciente:* ${presupuesto.patient_name}\n*Cédula:* ${data.cedula}\n\n*Estudios solicitados:*\n${studiesText}\n\n*Total estimado:* ${formatUSD(data.estimatedTotal)}\n\nNos pondremos en contacto con usted pronto.\n\n📞 +58 212 762.0561\n📧 info@laboratorioeg.com`
      );

      // Limpiar estado
      StateManager.deleteState(conversationId);

      logger.info(`✅ Presupuesto ${presupuesto.presupuesto_number} creado para ${conversationId}`);

    } catch (error) {
      logger.error('Error creando presupuesto:', error);

      await adapter.sendTextMessage(
        chatId,
        '❌ Error al crear presupuesto. Por favor, contacte al laboratorio:\n📞 +58 212 762.0561'
      );

      StateManager.deleteState(conversationId);
    }
  }

  /**
   * Verificar si hay un workflow activo
   */
  isActive(conversationId) {
    return StateManager.hasState(conversationId) &&
           StateManager.getWorkflow(conversationId) === this.workflowName;
  }

  /**
   * Cancelar workflow
   */
  cancel(conversationId) {
    StateManager.deleteState(conversationId);
    logger.info(`❌ Presupuesto workflow cancelled for ${conversationId}`);
  }
}

// Exportar singleton
module.exports = new PresupuestoWorkflow();
