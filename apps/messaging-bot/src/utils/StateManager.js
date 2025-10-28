const logger = require('./logger');

/**
 * StateManager - Gestiona el estado de las conversaciones en memoria
 *
 * Permite rastrear conversaciones multi-paso con datos temporales
 * hasta que se completen los workflows de presupuesto, citas, etc.
 */
class StateManager {
  constructor() {
    // Estructura: { "conversationId": { workflow, currentStep, data, createdAt, lastActivity } }
    this.states = new Map();

    // Limpiar estados antiguos cada 30 minutos
    this.cleanupInterval = setInterval(() => this.cleanup(), 30 * 60 * 1000);

    logger.info('🧠 StateManager initialized');
  }

  /**
   * Crear nuevo estado para una conversación
   * @param {string} conversationId - ID único de la conversación (platform_chatId)
   * @param {string} workflow - Tipo de workflow ('presupuesto', 'cita', etc.)
   * @param {string} initialStep - Paso inicial del workflow
   * @param {object} initialData - Datos iniciales (opcional)
   */
  createState(conversationId, workflow, initialStep, initialData = {}) {
    const state = {
      workflow,
      currentStep: initialStep,
      data: initialData,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    this.states.set(conversationId, state);

    logger.info(`🆕 State created: ${conversationId} → ${workflow} (${initialStep})`);

    return state;
  }

  /**
   * Obtener estado actual de una conversación
   * @param {string} conversationId
   * @returns {object|null}
   */
  getState(conversationId) {
    const state = this.states.get(conversationId);

    if (state) {
      // Actualizar última actividad
      state.lastActivity = new Date().toISOString();
    }

    return state || null;
  }

  /**
   * Verificar si existe un estado activo
   * @param {string} conversationId
   * @returns {boolean}
   */
  hasState(conversationId) {
    return this.states.has(conversationId);
  }

  /**
   * Actualizar el paso actual del workflow
   * @param {string} conversationId
   * @param {string} newStep
   * @returns {boolean} - true si se actualizó, false si no existe
   */
  updateStep(conversationId, newStep) {
    const state = this.states.get(conversationId);

    if (!state) {
      logger.warn(`⚠️  Cannot update step: state not found for ${conversationId}`);
      return false;
    }

    const oldStep = state.currentStep;
    state.currentStep = newStep;
    state.lastActivity = new Date().toISOString();

    logger.info(`🔄 Step updated: ${conversationId} → ${oldStep} → ${newStep}`);

    return true;
  }

  /**
   * Actualizar datos del estado
   * @param {string} conversationId
   * @param {object} newData - Datos a agregar/actualizar (merge)
   * @returns {boolean}
   */
  updateData(conversationId, newData) {
    const state = this.states.get(conversationId);

    if (!state) {
      logger.warn(`⚠️  Cannot update data: state not found for ${conversationId}`);
      return false;
    }

    state.data = { ...state.data, ...newData };
    state.lastActivity = new Date().toISOString();

    logger.info(`💾 Data updated for ${conversationId}:`, Object.keys(newData));

    return true;
  }

  /**
   * Obtener datos específicos del estado
   * @param {string} conversationId
   * @param {string} key - Clave del dato a obtener
   * @returns {any|null}
   */
  getData(conversationId, key) {
    const state = this.states.get(conversationId);

    if (!state) return null;

    return state.data[key] || null;
  }

  /**
   * Obtener todos los datos del estado
   * @param {string} conversationId
   * @returns {object|null}
   */
  getAllData(conversationId) {
    const state = this.states.get(conversationId);

    if (!state) return null;

    return state.data;
  }

  /**
   * Obtener el paso actual
   * @param {string} conversationId
   * @returns {string|null}
   */
  getCurrentStep(conversationId) {
    const state = this.states.get(conversationId);

    if (!state) return null;

    return state.currentStep;
  }

  /**
   * Obtener el workflow actual
   * @param {string} conversationId
   * @returns {string|null}
   */
  getWorkflow(conversationId) {
    const state = this.states.get(conversationId);

    if (!state) return null;

    return state.workflow;
  }

  /**
   * Incrementar contador (útil para reintentos)
   * @param {string} conversationId
   * @param {string} counterKey - Nombre del contador
   * @param {number} increment - Cantidad a incrementar (default: 1)
   * @returns {number|null} - Valor actual del contador
   */
  incrementCounter(conversationId, counterKey, increment = 1) {
    const state = this.states.get(conversationId);

    if (!state) return null;

    if (!state.data[counterKey]) {
      state.data[counterKey] = 0;
    }

    state.data[counterKey] += increment;
    state.lastActivity = new Date().toISOString();

    return state.data[counterKey];
  }

  /**
   * Eliminar estado de una conversación
   * @param {string} conversationId
   * @returns {boolean}
   */
  deleteState(conversationId) {
    const existed = this.states.has(conversationId);

    if (existed) {
      this.states.delete(conversationId);
      logger.info(`🗑️  State deleted: ${conversationId}`);
    }

    return existed;
  }

  /**
   * Resetear estado (eliminar y crear uno nuevo)
   * @param {string} conversationId
   * @param {string} workflow
   * @param {string} initialStep
   * @param {object} initialData
   * @returns {object}
   */
  resetState(conversationId, workflow, initialStep, initialData = {}) {
    this.deleteState(conversationId);
    return this.createState(conversationId, workflow, initialStep, initialData);
  }

  /**
   * Limpiar estados inactivos (más de 1 hora sin actividad)
   * @returns {number} - Cantidad de estados eliminados
   */
  cleanup() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    let deletedCount = 0;

    for (const [conversationId, state] of this.states.entries()) {
      if (state.lastActivity < oneHourAgo) {
        this.states.delete(conversationId);
        deletedCount++;
        logger.info(`🧹 Cleaned up inactive state: ${conversationId}`);
      }
    }

    if (deletedCount > 0) {
      logger.info(`🧹 Cleanup completed: ${deletedCount} inactive states removed`);
    }

    return deletedCount;
  }

  /**
   * Obtener estadísticas del StateManager
   * @returns {object}
   */
  getStats() {
    const workflowCounts = {};
    const stepCounts = {};

    for (const state of this.states.values()) {
      // Contar por workflow
      if (!workflowCounts[state.workflow]) {
        workflowCounts[state.workflow] = 0;
      }
      workflowCounts[state.workflow]++;

      // Contar por paso
      if (!stepCounts[state.currentStep]) {
        stepCounts[state.currentStep] = 0;
      }
      stepCounts[state.currentStep]++;
    }

    return {
      totalStates: this.states.size,
      workflowCounts,
      stepCounts
    };
  }

  /**
   * Obtener todos los estados (para debugging)
   * @returns {Array<object>}
   */
  getAllStates() {
    const states = [];

    for (const [conversationId, state] of this.states.entries()) {
      states.push({
        conversationId,
        ...state
      });
    }

    return states;
  }

  /**
   * Destruir StateManager (limpiar interval)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.states.clear();
    logger.info('🛑 StateManager destroyed');
  }
}

// Exportar singleton
module.exports = new StateManager();
