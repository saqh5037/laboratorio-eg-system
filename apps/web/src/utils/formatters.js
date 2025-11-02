export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

export const formatDate = (date, format = 'full') => {
  const options = {
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
  };

  return new Intl.DateTimeFormat('es-MX', options[format] || options.full).format(
    new Date(date)
  );
};

export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }
  
  return phone;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Formatea un resultado completo según el formato de la prueba
 * Replica la lógica de pdfGeneratorLabsis.js para garantizar consistencia
 * entre PDF, pantalla y gráficas
 *
 * @param {Object} resultado - Objeto resultado con resultado_numerico o resultado_alpha
 * @param {string} formato - Formato de la prueba (ej: "#.#", "#.##", "0.00")
 * @returns {string} Valor formateado
 *
 * @example
 * formatearValorConFormato({ resultado_numerico: 100 }, "#.#")     -> "100"
 * formatearValorConFormato({ resultado_numerico: 100.5 }, "#.#")   -> "100.5"
 * formatearValorConFormato({ resultado_numerico: 100.52 }, "#.##") -> "100.52"
 * formatearValorConFormato({ resultado_numerico: 100 }, "0.00")    -> "100.00"
 */
export function formatearValorConFormato(resultado, formato = '#.##') {
  // Si es resultado alfanumérico, retornar directamente
  if (resultado.resultado_alpha) {
    return resultado.resultado_alpha;
  }

  // Si es resultado numérico
  if (resultado.resultado_numerico !== null && resultado.resultado_numerico !== undefined) {
    const num = parseFloat(resultado.resultado_numerico);

    // Parsear formato (ej: "0.##", "#.#", "0.00")
    if (formato && formato.includes('.')) {
      const decimales = (formato.split('.')[1].match(/#/g) || []).length;

      // Si no tiene decimales o es formato "0.00"
      if (decimales === 0 || formato.includes('0.00')) {
        return num.toFixed(formato.includes('0.00') ? 2 : 1);
      }

      // Para formato con # mostrar decimales solo si existen
      return num % 1 === 0 ? num.toString() : num.toFixed(decimales);
    }

    return num.toString();
  }

  return 'N/D';
}

/**
 * Formatea un número simple según el formato especificado
 * Útil para etiquetas en gráficas donde solo se tiene el valor numérico
 *
 * @param {number|string} value - Valor a formatear
 * @param {string} formato - Formato de la prueba (ej: "#.#", "#.##", "0.00")
 * @returns {string} Valor formateado
 *
 * @example
 * formatearNumero(100, "#.#")     -> "100"
 * formatearNumero(100.5, "#.#")   -> "100.5"
 * formatearNumero(100.52, "#.##") -> "100.52"
 * formatearNumero(100, "0.00")    -> "100.00"
 */
export function formatearNumero(value, formato = '#.##') {
  if (value === null || value === undefined || isNaN(value)) {
    return '';
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (formato && formato.includes('.')) {
    const decimales = (formato.split('.')[1].match(/#/g) || []).length;

    // Si no tiene decimales o es formato "0.00"
    if (decimales === 0 || formato.includes('0.00')) {
      return num.toFixed(formato.includes('0.00') ? 2 : 1);
    }

    // Para formato con # mostrar decimales solo si existen
    return num % 1 === 0 ? num.toString() : num.toFixed(decimales);
  }

  return num.toString();
}