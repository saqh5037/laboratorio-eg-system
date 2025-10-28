const { query } = require('../../db/pool');
const logger = require('../../utils/logger');

class CitaService {
  async create(data) {
    try {
      const citaNumber = await this.generateNumber();

      const result = await query(`
        INSERT INTO bot_citas (
          cita_number, conversation_id, platform, user_id,
          patient_name, patient_phone, patient_email, patient_cedula,
          test_type, appointment_date, appointment_time, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        citaNumber,
        data.conversationId,
        data.platform,
        data.userId,
        data.patientName,
        data.patientPhone,
        data.patientEmail || null,
        data.patientCedula || null,
        data.testType,
        data.appointmentDate,
        data.appointmentTime,
        data.notes || null
      ]);

      logger.bot.citaCreated(citaNumber, data.userId);

      return result.rows[0];
    } catch (error) {
      logger.bot.error('CitaService.create', error);
      throw error;
    }
  }

  async generateNumber() {
    const result = await query('SELECT generate_cita_number() as number');
    return result.rows[0].number;
  }

  async getByNumber(number) {
    const result = await query(
      'SELECT * FROM bot_citas WHERE cita_number = $1',
      [number]
    );
    return result.rows[0] || null;
  }

  async getUpcoming() {
    const result = await query(
      "SELECT * FROM bot_citas WHERE status = 'pending' AND appointment_date >= CURRENT_DATE ORDER BY appointment_date, appointment_time LIMIT 10"
    );
    return result.rows;
  }
}

module.exports = new CitaService();
