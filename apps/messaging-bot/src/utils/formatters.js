/**
 * Utilidades de formateo para el bot
 */

/**
 * Formatea una fecha para Venezuela (DD/MM/YYYY)
 * @param {Date|string} date - Fecha
 * @returns {string}
 */
function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formatea una hora (HH:MM AM/PM)
 * @param {Date|string} date - Fecha/Hora
 * @returns {string}
 */
function formatTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date;

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Formatea fecha y hora completa
 * @param {Date|string} date - Fecha/Hora
 * @returns {string}
 */
function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Formatea un número de teléfono venezolano
 * @param {string} phone - Teléfono
 * @returns {string}
 */
function formatPhone(phone) {
  if (!phone) return '';

  // Remover todo excepto dígitos y +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // +58 212 1234567 → +58 212-123-4567
  if (cleaned.startsWith('+58')) {
    const areaCode = cleaned.substring(3, 6);
    const firstPart = cleaned.substring(6, 9);
    const secondPart = cleaned.substring(9);
    return `+58 ${areaCode}-${firstPart}-${secondPart}`;
  }

  return phone;
}

/**
 * Formatea un monto en bolívares
 * @param {number} amount - Monto
 * @returns {string}
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number') return 'Bs. 0,00';

  return `Bs. ${amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Formatea un monto en dólares
 * @param {number} amount - Monto
 * @returns {string}
 */
function formatUSD(amount) {
  if (typeof amount !== 'number') return '$0.00';

  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Trunca un texto largo
 * @param {string} text - Texto
 * @param {number} maxLength - Longitud máxima
 * @returns {string}
 */
function truncate(text, maxLength = 100) {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  return `${text.substring(0, maxLength)}...`;
}

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} text - Texto
 * @returns {string}
 */
function capitalizeWords(text) {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formatea una lista de items como bullet points
 * @param {Array<string>} items - Lista de items
 * @returns {string}
 */
function formatList(items) {
  if (!items || items.length === 0) return '';

  return items.map(item => `• ${item}`).join('\n');
}

/**
 * Formatea información del laboratorio para mensajes
 * @returns {string}
 */
function formatLabInfo() {
  const config = require('../config/config');
  const lab = config.laboratory;

  return `
📍 *${lab.fullName}*

📌 Dirección:
${lab.address}

📞 Teléfonos:
${formatPhone(lab.phone1)}
${formatPhone(lab.phone2)}
${formatPhone(lab.phone3)}

📧 Email: ${lab.email}
🌐 Web: ${lab.website}
📱 Redes: ${lab.social}

⏰ Horarios:
${lab.hoursWeekday}
${lab.hoursSaturday}
${lab.hoursSunday}

${lab.servicioDomicilio ? `🏠 ${lab.servicioDomicilioInfo}` : ''}

📅 Desde ${lab.foundedYear} - ${lab.yearsExperience} años de experiencia
`.trim();
}

/**
 * Formatea la información de una cita
 * @param {object} cita - Objeto de cita
 * @returns {string}
 */
function formatCitaInfo(cita) {
  return `
📅 *Cita Agendada*

🔢 Número: ${cita.cita_number}
👤 Paciente: ${cita.patient_name}
📞 Teléfono: ${formatPhone(cita.patient_phone)}
📧 Email: ${cita.patient_email || 'No proporcionado'}
📝 Tipo: ${cita.test_type}
📅 Fecha: ${formatDate(cita.appointment_date)}
⏰ Hora: ${cita.appointment_time}
📊 Estado: ${getStatusEmoji(cita.status)} ${capitalizeWords(cita.status)}

Recibirá una confirmación por correo electrónico.
`.trim();
}

/**
 * Formatea la información de un presupuesto
 * @param {object} presupuesto - Objeto de presupuesto
 * @returns {string}
 */
function formatPresupuestoInfo(presupuesto) {
  const tests = JSON.parse(presupuesto.tests_requested || '[]');

  return `
💰 *Presupuesto Generado*

🔢 Número: ${presupuesto.presupuesto_number}
👤 Paciente: ${presupuesto.patient_name}
📞 Teléfono: ${formatPhone(presupuesto.patient_phone)}
📧 Email: ${presupuesto.patient_email || 'No proporcionado'}

📝 Pruebas solicitadas:
${formatList(tests.map(t => typeof t === 'string' ? t : t.name))}

💵 Total estimado: ${formatCurrency(presupuesto.estimated_total || 0)}
📊 Estado: ${getStatusEmoji(presupuesto.status)} ${capitalizeWords(presupuesto.status)}

Un asesor se pondrá en contacto con usted en breve.
`.trim();
}

/**
 * Obtiene emoji según el estado
 * @param {string} status - Estado
 * @returns {string}
 */
function getStatusEmoji(status) {
  const emojis = {
    pending: '⏳',
    confirmed: '✅',
    completed: '✔️',
    cancelled: '❌',
    sent: '📤',
    approved: '👍',
    rejected: '👎',
    ordered: '📦',
    received: '✅'
  };

  return emojis[status] || '📊';
}

/**
 * Formatea un tiempo relativo (hace X minutos/horas/días)
 * @param {Date|string} date - Fecha
 * @returns {string}
 */
function formatRelativeTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins === 1) return 'Hace 1 minuto';
  if (diffMins < 60) return `Hace ${diffMins} minutos`;
  if (diffHours === 1) return 'Hace 1 hora';
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays === 1) return 'Hace 1 día';
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return formatDate(d);
}

module.exports = {
  formatDate,
  formatTime,
  formatDateTime,
  formatPhone,
  formatCurrency,
  formatUSD,
  truncate,
  capitalizeWords,
  formatList,
  formatLabInfo,
  formatCitaInfo,
  formatPresupuestoInfo,
  getStatusEmoji,
  formatRelativeTime
};
