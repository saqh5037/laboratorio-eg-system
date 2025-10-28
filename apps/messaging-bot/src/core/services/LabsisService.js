const { Pool } = require('pg');
const config = require('../../config/config');
const logger = require('../../utils/logger');

/**
 * LabsisService - Integración con la base de datos de Labsis
 *
 * Permite consultar y crear datos en el sistema principal del laboratorio
 */
class LabsisService {
  constructor() {
    // Pool de conexiones a Labsis (misma DB pero servicio separado conceptualmente)
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl,
      min: 1,
      max: 5
    });

    logger.info('🔗 LabsisService initialized');
  }

  /**
   * Buscar paciente(s) por cédula en Labsis
   * IMPORTANTE: Retorna TODOS los pacientes con esa cédula base (17063454, 17063454-1, 17063454-2, etc.)
   * @param {string} cedula - Cédula a buscar (puede venir sin formato)
   * @returns {Promise<Array>} - Array de pacientes encontrados (puede estar vacío)
   */
  async searchPatientByCedula(cedula) {
    try {
      const normalized = this.normalizeCedula(cedula);
      const cleanNumbers = cedula.replace(/[^0-9]/g, '');

      logger.info(`🔍 Buscando pacientes en Labsis con cédula base: ${cleanNumbers}`);

      // Buscar TODOS los pacientes con esa cédula base
      // Esto incluye: 17063454, 17063454-1, V-17063454, V-17063454-1, etc.
      const result = await this.pool.query(
        `SELECT id, nombre, apellido, fecha_nacimiento, sexo,
                telefono, email, ci_paciente, direccion
         FROM paciente
         WHERE ci_paciente LIKE $1
            OR ci_paciente LIKE $2
            OR ci_paciente = $3
            OR ci_paciente LIKE $4
         ORDER BY ci_paciente ASC`,
        [`%${cleanNumbers}%`, `%${normalized}%`, normalized, `${cleanNumbers}-%`]
      );

      if (result.rows.length > 0) {
        logger.info(`✅ Encontrados ${result.rows.length} paciente(s):`);
        result.rows.forEach(p => {
          logger.info(`   - ${p.ci_paciente}: ${p.nombre} ${p.apellido} (ID: ${p.id})`);
        });
        return result.rows;
      }

      logger.info('❌ No se encontraron pacientes en Labsis');
      return [];

    } catch (error) {
      logger.error('Error buscando paciente en Labsis:', error);
      return [];
    }
  }

  /**
   * Validar apellido del paciente
   * @param {object} labsisPatient - Paciente de Labsis
   * @param {string} inputApellido - Apellido ingresado por usuario
   * @returns {boolean}
   */
  validateApellido(labsisPatient, inputApellido) {
    if (!labsisPatient || !inputApellido) return false;

    const stored = labsisPatient.apellido.toLowerCase().trim();
    const input = inputApellido.toLowerCase().trim();

    // Validar igualdad exacta o que el apellido almacenado contenga el input
    return stored === input || stored.includes(input) || input.includes(stored);
  }

  /**
   * Validar mes de nacimiento
   * @param {object} labsisPatient - Paciente de Labsis
   * @param {string} inputMonth - Mes ingresado (nombre o número)
   * @returns {boolean}
   */
  validateBirthMonth(labsisPatient, inputMonth) {
    if (!labsisPatient || !labsisPatient.fecha_nacimiento || !inputMonth) return false;

    const birthDate = new Date(labsisPatient.fecha_nacimiento);
    const monthNumber = birthDate.getMonth() + 1; // 0-11 → 1-12

    const monthNames = {
      'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
      'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
      'septiembre': 9, 'setiembre': 9, 'octubre': 10,
      'noviembre': 11, 'diciembre': 12,
      // Abreviaciones
      'ene': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'may': 5, 'jun': 6,
      'jul': 7, 'ago': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dic': 12
    };

    const inputLower = inputMonth.toLowerCase().trim();
    const inputMonthNumber = monthNames[inputLower] || parseInt(inputMonth);

    return monthNumber === inputMonthNumber;
  }

  /**
   * Crear nuevo paciente en Labsis
   * @param {object} patientData - Datos del paciente
   * @returns {Promise<number>} - ID del paciente creado
   */
  async createPatient(patientData) {
    try {
      const {
        cedula,
        nombre,
        apellido,
        fechaNacimiento,
        sexo,
        telefono,
        email,
        direccion
      } = patientData;

      logger.info(`📝 Creando nuevo paciente en Labsis: ${nombre} ${apellido}`);

      const result = await this.pool.query(
        `INSERT INTO paciente
         (ci_paciente, nombre, apellido, fecha_nacimiento, sexo, telefono, email, direccion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          this.normalizeCedula(cedula),
          nombre,
          apellido,
          fechaNacimiento,
          sexo.toUpperCase(),
          telefono,
          email || null,
          direccion || null
        ]
      );

      const patientId = result.rows[0].id;
      logger.info(`✅ Paciente creado en Labsis con ID: ${patientId}`);

      return patientId;

    } catch (error) {
      logger.error('Error creando paciente en Labsis:', error);
      throw error;
    }
  }

  /**
   * Obtener precios de estudios
   * @param {Array<string>} studyNames - Nombres de estudios a buscar
   * @returns {Promise<Array<object>>} - Lista de estudios con precios
   */
  async getStudiesPrices(studyNames) {
    try {
      if (!studyNames || studyNames.length === 0) return [];

      logger.info(`💰 Buscando precios para: ${studyNames.join(', ')}`);

      // Lista de precios ID 27 = Ambulatorio_Abril_2025 (activo)
      const listaPreciosId = 27;

      const result = await this.pool.query(
        `SELECT p.id, p.nombre, lpp.precio
         FROM prueba p
         JOIN lista_precios_has_prueba lpp ON p.id = lpp.prueba_id
         WHERE lpp.lista_precios_id = $1
           AND (${studyNames.map((_, i) => `p.nombre ILIKE $${i + 2}`).join(' OR ')})
         ORDER BY p.nombre`,
        [listaPreciosId, ...studyNames.map(name => `%${name}%`)]
      );

      logger.info(`✅ Encontrados ${result.rows.length} estudios con precios`);

      return result.rows;

    } catch (error) {
      logger.error('Error obteniendo precios de estudios:', error);
      return [];
    }
  }

  /**
   * Buscar estudios por nombre (fuzzy search)
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array<object>>} - Lista de estudios encontrados
   */
  async searchStudies(searchTerm, limit = 10) {
    try {
      const result = await this.pool.query(
        `SELECT p.id, p.nombre, lpp.precio
         FROM prueba p
         JOIN lista_precios_has_prueba lpp ON p.id = lpp.prueba_id
         WHERE lpp.lista_precios_id = 27
           AND p.nombre ILIKE $1
         ORDER BY
           CASE
             WHEN p.nombre ILIKE $2 THEN 1
             WHEN p.nombre ILIKE $3 THEN 2
             ELSE 3
           END,
           p.nombre
         LIMIT $4`,
        [
          `%${searchTerm}%`,
          `${searchTerm}%`, // Empieza con
          `% ${searchTerm}%`, // Palabra completa
          limit
        ]
      );

      return result.rows;

    } catch (error) {
      logger.error('Error buscando estudios:', error);
      return [];
    }
  }

  /**
   * Normalizar cédula al formato estándar (V-12345678)
   * @param {string} cedula - Cédula sin formato
   * @returns {string} - Cédula formateada
   */
  normalizeCedula(cedula) {
    if (!cedula) return '';

    // Remover todo excepto letras y números
    const cleaned = cedula.replace(/[^0-9A-Za-z]/g, '');

    // Extraer letra (V, E, J, G) o usar V por defecto
    const letter = cleaned.match(/[VEJGvejg]/)?.[0]?.toUpperCase() || 'V';

    // Extraer números
    const numbers = cleaned.replace(/[^0-9]/g, '');

    if (!numbers) return cedula;

    return `${letter}-${numbers}`;
  }

  /**
   * Validar formato de cédula venezolana
   * @param {string} cedula - Cédula a validar
   * @returns {boolean}
   */
  isValidCedula(cedula) {
    if (!cedula) return false;

    const normalized = this.normalizeCedula(cedula);
    const regex = /^[VEJG]-\d{6,9}$/;

    return regex.test(normalized);
  }

  /**
   * Obtener tasa de cambio vigente (USD a Bolívares)
   * Similar a ConversionMonedaHome.getConversionMoneda() en LABSIS Java
   * @returns {Promise<object|null>} - { cambio, cambioInverso } o null si no hay tasa vigente
   */
  async getExchangeRate() {
    try {
      const result = await this.pool.query(
        `SELECT cambio, cambio_inverso
         FROM conversion_moneda
         WHERE moneda = 1
           AND divisa = 2
           AND NOW() BETWEEN fecha_inicio AND fecha_fin
         ORDER BY fecha_inicio DESC
         LIMIT 1`
      );

      if (result.rows.length === 0) {
        logger.warn('⚠️  NO HAY TASA DE CAMBIO VIGENTE en conversion_moneda');
        return null;
      }

      const tasa = result.rows[0];
      logger.info(`💱 Tasa de cambio vigente: 1 USD = ${tasa.cambio} Bs`);

      return {
        cambio: parseFloat(tasa.cambio), // USD → Bs
        cambioInverso: parseFloat(tasa.cambio_inverso) // Bs → USD
      };

    } catch (error) {
      logger.error('Error obteniendo tasa de cambio:', error);
      return null;
    }
  }

  /**
   * Convertir monto de USD a Bolívares
   * Similar a ConversionMonedaBean.convertirMonto() en LABSIS Java
   * @param {number} montoUSD - Monto en dólares
   * @param {number} tasaCambio - Tasa de cambio (1 USD = X Bs)
   * @returns {number} - Monto en bolívares
   */
  convertUSDtoBs(montoUSD, tasaCambio) {
    return montoUSD * tasaCambio;
  }

  /**
   * Crear presupuesto en LABSIS
   * @param {object} presupuestoData - Datos del presupuesto
   * @returns {Promise<object>} - { id, numero } del presupuesto creado
   */
  async createPresupuestoInLabsis(presupuestoData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const {
        pacienteId,
        montoTotal,
        estudios, // Array de { id: prueba_id, nombre, precio }
        observaciones = 'Presupuesto generado desde Bot Telegram'
      } = presupuestoData;

      logger.info(`📋 Creando presupuesto en LABSIS para paciente ${pacienteId}`);

      // PASO 1: Obtener tasa de cambio vigente
      const tasaCambio = await this.getExchangeRate();

      if (!tasaCambio) {
        throw new Error('No hay tasa de cambio vigente en el sistema. Configure una tasa en conversion_moneda.');
      }

      // PASO 2: Convertir montos de USD a Bolívares
      const montoTotalBs = this.convertUSDtoBs(montoTotal, tasaCambio.cambio);

      logger.info(`💱 Conversión: $${montoTotal.toFixed(2)} USD × ${tasaCambio.cambio} = ${montoTotalBs.toFixed(2)} Bs`);

      // PASO 3: Insertar en tabla presupuesto (en Bolívares)
      const presupuestoResult = await client.query(
        `INSERT INTO presupuesto (
          paciente_id,
          monto_total,
          descuento,
          base_imponible,
          iva,
          total_factura,
          servicio_id,
          procedencia_id,
          departamento_laboratorio_id,
          observaciones,
          fecha,
          moneda_id
        ) VALUES ($1, $2, 0.00, 0.00, 0.00, $2, 47, 78, 1, $3, NOW(), 2)
        RETURNING id, numero`,
        [pacienteId, montoTotalBs, observaciones]
      );

      const { id: presupuestoId, numero } = presupuestoResult.rows[0];

      logger.info(`✅ Presupuesto creado en LABSIS: ID=${presupuestoId}, Número=${numero}`);

      // PASO 4: Insertar estudios en prueba_presupuesto (convertidos a Bs)
      for (const estudio of estudios) {
        const precioBs = this.convertUSDtoBs(estudio.precio, tasaCambio.cambio);

        await client.query(
          `INSERT INTO prueba_presupuesto (
            prueba_id,
            presupuesto_id,
            precio,
            cantidad,
            descuento_porcentaje
          ) VALUES ($1, $2, $3, 1, 0.00)`,
          [estudio.id, presupuestoId, precioBs]
        );

        logger.info(`   ✅ ${estudio.nombre}: $${estudio.precio} USD → ${precioBs.toFixed(2)} Bs`);
      }

      await client.query('COMMIT');

      logger.info(`🎉 Presupuesto ${numero} creado en LABSIS con ${estudios.length} estudios (Total: ${montoTotalBs.toFixed(2)} Bs)`);

      return {
        id: presupuestoId,
        numero,
        montoUSD: montoTotal,
        montoBs: montoTotalBs,
        tasaCambio: tasaCambio.cambio
      };

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('❌ Error creando presupuesto en LABSIS:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Test de conexión a Labsis
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const result = await this.pool.query('SELECT NOW() as time, COUNT(*) as pacientes FROM paciente');
      logger.info(`✅ Labsis connection OK - ${result.rows[0].pacientes} pacientes en sistema`);
      return true;
    } catch (error) {
      logger.error('❌ Error conectando a Labsis:', error);
      return false;
    }
  }

  /**
   * Cerrar conexiones
   */
  async close() {
    await this.pool.end();
    logger.info('🔗 LabsisService conexiones cerradas');
  }
}

// Exportar singleton
module.exports = new LabsisService();
