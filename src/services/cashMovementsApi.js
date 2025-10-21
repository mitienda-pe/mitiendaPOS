import apiClient from './axios';

/**
 * API service for cash register movements
 */
export const cashMovementsApi = {
  /**
   * Register a cash movement
   * @param {Object} data Movement data
   * @param {number} data.turnocaja_id Shift ID
   * @param {string} data.tipo Type: 'venta', 'entrada', 'salida', 'ajuste'
   * @param {string} data.metodo_pago Payment method: 'efectivo', 'tarjeta', 'yape', 'plin', 'transferencia', 'qr'
   * @param {number} data.monto Amount
   * @param {string} data.concepto Concept/description
   * @param {string} [data.referencia] Reference (sale ID, receipt, etc.)
   * @param {string} [data.notas] Additional notes
   * @returns {Promise<Object>}
   */
  async registerMovement(data) {
    try {
      const response = await apiClient.post('/cash-register-shifts/movements', data);
      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error registering movement:', error);
      throw error;
    }
  },

  /**
   * Register a sale as a cash movement
   * @param {number} shiftId Shift ID
   * @param {string} paymentMethod Payment method
   * @param {number} amount Amount
   * @param {string} saleReference Sale reference/ID
   * @param {string} [customerName] Customer name for notes
   * @returns {Promise<Object>}
   */
  async registerSale(shiftId, paymentMethod, amount, saleReference, customerName = null) {
    const notes = customerName ? `Cliente: ${customerName}` : null;

    return await this.registerMovement({
      turnocaja_id: shiftId,
      tipo: 'venta',
      metodo_pago: paymentMethod,
      monto: amount,
      concepto: 'Venta POS',
      referencia: saleReference,
      notas: notes
    });
  },

  /**
   * Register cash income (manual entry)
   * @param {number} shiftId Shift ID
   * @param {number} amount Amount
   * @param {string} concept Concept/reason
   * @param {string} [notes] Additional notes
   * @returns {Promise<Object>}
   */
  async registerIncome(shiftId, amount, concept, notes = null) {
    return await this.registerMovement({
      turnocaja_id: shiftId,
      tipo: 'entrada',
      metodo_pago: 'efectivo',
      monto: amount,
      concepto: concept,
      notas: notes
    });
  },

  /**
   * Register cash withdrawal (manual exit)
   * @param {number} shiftId Shift ID
   * @param {number} amount Amount
   * @param {string} concept Concept/reason
   * @param {string} [notes] Additional notes
   * @returns {Promise<Object>}
   */
  async registerWithdrawal(shiftId, amount, concept, notes = null) {
    return await this.registerMovement({
      turnocaja_id: shiftId,
      tipo: 'salida',
      metodo_pago: 'efectivo',
      monto: amount,
      concepto: concept,
      notas: notes
    });
  },

  /**
   * Register cash adjustment
   * @param {number} shiftId Shift ID
   * @param {number} amount Amount (can be positive or negative)
   * @param {string} concept Concept/reason
   * @param {string} [notes] Additional notes
   * @returns {Promise<Object>}
   */
  async registerAdjustment(shiftId, amount, concept, notes = null) {
    return await this.registerMovement({
      turnocaja_id: shiftId,
      tipo: 'ajuste',
      metodo_pago: 'efectivo',
      monto: amount,
      concepto: concept,
      notas: notes
    });
  },

  /**
   * Get all movements for a shift
   * @param {number} shiftId Shift ID
   * @returns {Promise<Object>}
   */
  async getShiftMovements(shiftId) {
    try {
      const response = await apiClient.get(`/cash-register-shifts/${shiftId}/movements`);
      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching shift movements:', error);
      throw error;
    }
  },

  /**
   * Get movements summary for a shift
   * @param {number} shiftId Shift ID
   * @returns {Promise<Object>}
   */
  async getShiftMovementsSummary(shiftId) {
    try {
      const response = await apiClient.get(`/cash-register-shifts/${shiftId}/movements-summary`);
      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching shift movements summary:', error);
      throw error;
    }
  }
};
