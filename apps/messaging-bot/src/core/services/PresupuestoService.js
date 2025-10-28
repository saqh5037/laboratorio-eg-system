const { query } = require('../../db/pool');
const logger = require('../../utils/logger');
const LabsisService = require('./LabsisService');

class PresupuestoService {
  async create(data) {
    try {
      const presupuestoNumber = await this.generateNumber();

      // Crear presupuesto en bot_presupuestos
      const result = await query(`
        INSERT INTO bot_presupuestos (
          presupuesto_number, conversation_id, platform, user_id,
          patient_name, patient_phone, patient_email, patient_cedula,
          tests_requested, estimated_total, notes, labsis_patient_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        presupuestoNumber,
        data.conversationId,
        data.platform,
        data.userId,
        data.patientName,
        data.patientPhone,
        data.patientEmail || null,
        data.patientCedula || null,
        JSON.stringify(data.testsRequested),
        data.estimatedTotal || 0,
        data.notes || null,
        data.labsisPatientId || null
      ]);

      logger.bot.presupuestoCreated(presupuestoNumber, data.userId);

      // Si hay paciente de LABSIS y estudios, crear también en LABSIS
      if (data.labsisPatientId && data.testsRequested && data.testsRequested.length > 0) {
        try {
          const labsisResult = await LabsisService.createPresupuestoInLabsis({
            pacienteId: data.labsisPatientId,
            montoTotal: data.estimatedTotal || 0,
            estudios: data.testsRequested, // Debe incluir { id, nombre, precio }
            observaciones: `Presupuesto Bot ${presupuestoNumber} - ${data.platform}`
          });

          logger.info(`🎉 Presupuesto creado en LABSIS: ${labsisResult.numero}`);

          // Actualizar bot_presupuestos con referencia a LABSIS
          await query(
            'UPDATE bot_presupuestos SET notes = $1 WHERE id = $2',
            [`Presupuesto LABSIS: ${labsisResult.numero}`, result.rows[0].id]
          );

        } catch (labsisError) {
          // No fallar si LABSIS falla, pero loguear el error
          logger.error('⚠️  Error creando presupuesto en LABSIS (bot presupuesto creado):', labsisError);
        }
      }

      return result.rows[0];
    } catch (error) {
      logger.bot.error('PresupuestoService.create', error);
      throw error;
    }
  }

  async generateNumber() {
    const result = await query('SELECT generate_presupuesto_number() as number');
    return result.rows[0].number;
  }

  async getByNumber(number) {
    const result = await query(
      'SELECT * FROM bot_presupuestos WHERE presupuesto_number = $1',
      [number]
    );
    return result.rows[0] || null;
  }

  async getPending() {
    const result = await query(
      "SELECT * FROM bot_presupuestos WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10"
    );
    return result.rows;
  }
}

module.exports = new PresupuestoService();
