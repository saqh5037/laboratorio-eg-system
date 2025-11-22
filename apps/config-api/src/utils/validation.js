/**
 * Validaciones para configuraciones
 */

/**
 * Convierte un valor de string según su tipo de dato
 * @param {string} value - Valor en texto
 * @param {string} dataType - Tipo de dato: string, number, boolean, json
 * @returns {*} - Valor convertido
 */
function parseValue(value, dataType) {
  if (value === null || value === undefined) {
    return null;
  }

  switch (dataType) {
    case 'boolean':
      return value === 'true' || value === '1' || value === 1 || value === true;

    case 'number':
      const num = parseFloat(value);
      if (isNaN(num)) {
        throw new Error(`Valor "${value}" no es un número válido`);
      }
      return num;

    case 'json':
      try {
        return typeof value === 'string' ? JSON.parse(value) : value;
      } catch (error) {
        throw new Error(`Valor "${value}" no es JSON válido: ${error.message}`);
      }

    case 'string':
    default:
      return String(value);
  }
}

/**
 * Valida que una key de configuración tenga formato correcto
 * @param {string} key - Key a validar
 * @returns {boolean}
 */
function isValidKey(key) {
  // Formato: category.subcategory.name
  // Ejemplo: ui.pages.resultados.enabled
  const keyPattern = /^[a-z_]+(\.[a-z_]+)+$/;
  return keyPattern.test(key);
}

/**
 * Valida que una categoría sea válida
 * @param {string} category
 * @returns {boolean}
 */
function isValidCategory(category) {
  const validCategories = ['ui', 'auth', 'features', 'integrations', 'security', 'system'];
  return validCategories.includes(category);
}

/**
 * Valida que un data_type sea válido
 * @param {string} dataType
 * @returns {boolean}
 */
function isValidDataType(dataType) {
  const validTypes = ['string', 'number', 'boolean', 'json'];
  return validTypes.includes(dataType);
}

/**
 * Sanitiza un valor para logging (oculta secretos)
 * @param {string} key
 * @param {*} value
 * @param {boolean} isSecret
 * @returns {*}
 */
function sanitizeForLogging(key, value, isSecret) {
  if (isSecret) {
    return '[REDACTED]';
  }

  // Detectar patterns de secretos en la key
  const secretPatterns = ['password', 'secret', 'token', 'api_key', 'private_key'];
  const lowerKey = key.toLowerCase();

  if (secretPatterns.some(pattern => lowerKey.includes(pattern))) {
    return '[REDACTED]';
  }

  return value;
}

module.exports = {
  parseValue,
  isValidKey,
  isValidCategory,
  isValidDataType,
  sanitizeForLogging
};
