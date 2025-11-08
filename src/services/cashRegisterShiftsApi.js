import apiClient from './axios';

/**
 * API service for cash register shifts
 */
const cashRegisterShiftsApi = {
  /**
   * Get active shift for current store/cashier
   * @param {string} cajaNumero - Optional cash register number
   * @returns {Promise}
   */
  getActiveShift(cajaNumero = null) {
    const params = cajaNumero ? { caja_numero: cajaNumero } : {};
    return apiClient.get('/cash-register-shifts/active', { params });
  },

  /**
   * Open a new shift
   * @param {Object} data - Shift data
   * @param {string} data.caja_numero - Cash register number
   * @param {number} data.monto_inicial - Initial amount
   * @param {string} data.notas_apertura - Opening notes
   * @param {number} data.empleado_id - Employee ID (cashier)
   * @returns {Promise}
   */
  openShift(data) {
    return apiClient.post('/cash-register-shifts/open', data);
  },

  /**
   * Close an existing shift
   * @param {number} shiftId - Shift ID
   * @param {Object} data - Closing data
   * @param {number} data.monto_real - Real cash amount counted
   * @param {string} data.notas_cierre - Closing notes
   * @param {Object} data.desglose_billetes - Cash breakdown
   * @returns {Promise}
   */
  closeShift(shiftId, data) {
    return apiClient.post(`/cash-register-shifts/close/${shiftId}`, data);
  },

  /**
   * Get shift history with pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise}
   */
  getShifts(params = {}) {
    const defaultParams = { page: 1, limit: 20 };
    return apiClient.get('/cash-register-shifts', {
      params: { ...defaultParams, ...params }
    });
  },

  /**
   * Get shift detail by ID
   * @param {number} shiftId - Shift ID
   * @returns {Promise}
   */
  getShift(shiftId) {
    return apiClient.get(`/cash-register-shifts/${shiftId}`);
  },

  /**
   * Get shift movements (cash register transactions)
   * @param {number} shiftId - Shift ID
   * @returns {Promise}
   */
  getShiftMovements(shiftId) {
    return apiClient.get(`/cash-register-shifts/${shiftId}/movements`);
  },

  /**
   * Register a cash movement (entry/withdrawal)
   * @param {Object} data - Movement data
   * @param {number} data.turnocaja_id - Shift ID
   * @param {string} data.tipo - Movement type: 'entrada' or 'salida'
   * @param {number} data.monto - Amount
   * @param {string} data.concepto - Concept/reason
   * @param {string} data.notas - Additional notes
   * @returns {Promise}
   */
  registerMovement(data) {
    return apiClient.post('/turnocaja-movimientos', data);
  }
};

export default cashRegisterShiftsApi;
