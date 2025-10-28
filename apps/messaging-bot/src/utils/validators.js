/**
 * Utilidades de validación para el bot
 */

/**
 * Valida un número de teléfono venezolano
 * @param {string} phone - Número de teléfono
 * @returns {boolean}
 */
function isValidVenezuelanPhone(phone) {
  if (!phone) return false;

  // Remover espacios y caracteres especiales
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Formatos válidos:
  // +58 212 1234567 (internacional)
  // 0212 1234567 (nacional)
  // 04121234567 (móvil)
  const regex = /^(\+58|0)?((212|241|243|244|245|246|247|248|251|252|253|254|255|256|257|258|259|261|262|263|264|265|266|267|268|269|271|272|273|274|275|276|277|278|279|281|282|283|284|285|286|287|288|289|291|292|293|294|295)\d{7}|(412|414|424|416|426)\d{7})$/;

  return regex.test(cleaned);
}

/**
 * Valida un email
 * @param {string} email - Email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email) return false;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida una cédula venezolana
 * @param {string} cedula - Cédula (V-12345678 o E-12345678)
 * @returns {boolean}
 */
function isValidCedula(cedula) {
  if (!cedula) return false;

  // Formato: V-12345678 o E-12345678
  const regex = /^[VE]-\d{6,9}$/i;
  return regex.test(cedula);
}

/**
 * Valida una fecha en formato DD/MM/YYYY
 * @param {string} dateStr - Fecha
 * @returns {boolean}
 */
function isValidDate(dateStr) {
  if (!dateStr) return false;

  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateStr)) return false;

  const [day, month, year] = dateStr.split('/').map(Number);

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Valida que una fecha esté en el futuro
 * @param {string} dateStr - Fecha DD/MM/YYYY
 * @returns {boolean}
 */
function isFutureDate(dateStr) {
  if (!isValidDate(dateStr)) return false;

  const [day, month, year] = dateStr.split('/').map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDate >= today;
}

/**
 * Valida una hora en formato HH:MM
 * @param {string} timeStr - Hora
 * @returns {boolean}
 */
function isValidTime(timeStr) {
  if (!timeStr) return false;

  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeStr);
}

/**
 * Valida que una hora esté dentro del horario del laboratorio
 * @param {string} timeStr - Hora HH:MM
 * @param {string} dayOfWeek - Día de la semana (0=domingo, 6=sábado)
 * @returns {boolean}
 */
function isWithinLabHours(timeStr, dayOfWeek) {
  if (!isValidTime(timeStr)) return false;

  const [hours, minutes] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;

  // Domingo cerrado
  if (dayOfWeek === 0) return false;

  // Sábado: 8:00 - 12:00
  if (dayOfWeek === 6) {
    return totalMinutes >= 8 * 60 && totalMinutes < 12 * 60;
  }

  // Lun-Vie: 7:00 - 16:00
  return totalMinutes >= 7 * 60 && totalMinutes < 16 * 60;
}

/**
 * Valida que un texto no esté vacío
 * @param {string} text - Texto
 * @param {number} minLength - Longitud mínima
 * @returns {boolean}
 */
function isNotEmpty(text, minLength = 1) {
  return text && text.trim().length >= minLength;
}

/**
 * Valida que un número sea positivo
 * @param {number} num - Número
 * @returns {boolean}
 */
function isPositiveNumber(num) {
  return typeof num === 'number' && num > 0 && !isNaN(num);
}

/**
 * Sanitiza un string (remueve caracteres peligrosos)
 * @param {string} str - String
 * @returns {string}
 */
function sanitizeString(str) {
  if (!str) return '';

  return str
    .trim()
    .replace(/[<>]/g, '') // Remover < >
    .replace(/['"]/g, '') // Remover comillas
    .substring(0, 500); // Máximo 500 caracteres
}

/**
 * Normaliza un número de teléfono venezolano
 * @param {string} phone - Teléfono
 * @returns {string} - Teléfono normalizado (+58...)
 */
function normalizeVenezuelanPhone(phone) {
  if (!phone) return '';

  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Si ya tiene +58, retornar
  if (cleaned.startsWith('+58')) {
    return cleaned;
  }

  // Si empieza con 0, removerlo y agregar +58
  if (cleaned.startsWith('0')) {
    return `+58${cleaned.substring(1)}`;
  }

  // Si no tiene código de país, agregar +58
  return `+58${cleaned}`;
}

/**
 * Valida un número de orden/presupuesto/cita
 * @param {string} number - Número (PRE-2025-0001, CIT-2025-0001)
 * @returns {boolean}
 */
function isValidOrderNumber(number) {
  if (!number) return false;

  // Formato: PRE-YYYY-NNNN o CIT-YYYY-NNNN o WO-YYYY-NNNN o SR-YYYY-NNNN
  const regex = /^(PRE|CIT|WO|SR)-\d{4}-\d{4}$/;
  return regex.test(number);
}

module.exports = {
  isValidVenezuelanPhone,
  isValidEmail,
  isValidCedula,
  isValidDate,
  isFutureDate,
  isValidTime,
  isWithinLabHours,
  isNotEmpty,
  isPositiveNumber,
  sanitizeString,
  normalizeVenezuelanPhone,
  isValidOrderNumber
};
