import apiClient from './axios';

export const shiftsApi = {
  /**
   * Get active shift for current store
   */
  async getActiveShift() {
    try {
      const response = await apiClient.get('/cash-register-shifts/active');
      return {
        success: response.data.success,
        active: response.data.active,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching active shift:', error);
      return {
        success: false,
        active: false,
        error: error.response?.data?.message || error.message || 'Error fetching active shift'
      };
    }
  },

  /**
   * Open a new shift
   * @param {number} montoInicial - Initial cash amount
   * @param {string} notasApertura - Opening notes
   * @param {string|null} cajaNumero - Cash register identifier (optional)
   * @param {number|null} empleadoId - POS employee ID (optional)
   */
  async openShift(montoInicial, notasApertura = '', cajaNumero = null, empleadoId = null) {
    try {
      const payload = {
        monto_inicial: montoInicial,
        notas_apertura: notasApertura
      };

      if (cajaNumero) {
        payload.caja_numero = cajaNumero;
      }

      if (empleadoId) {
        payload.empleado_id = empleadoId;
      }

      const response = await apiClient.post('/cash-register-shifts/open', payload);

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error opening shift:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error opening shift'
      };
    }
  },

  /**
   * Close a shift
   * @param {number} shiftId - Shift ID
   * @param {number} montoReal - Real cash amount counted
   * @param {string} notasCierre - Closing notes
   */
  async closeShift(shiftId, montoReal, notasCierre = '') {
    try {
      const response = await apiClient.post(`/cash-register-shifts/close/${shiftId}`, {
        monto_real: montoReal,
        notas_cierre: notasCierre
      });

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error closing shift:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error closing shift'
      };
    }
  },

  /**
   * Get shift history
   * @param {Object} params - { page, limit }
   */
  async getShifts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = queryParams.toString()
        ? `/cash-register-shifts?${queryParams.toString()}`
        : '/cash-register-shifts';

      const response = await apiClient.get(url);

      return {
        success: response.data.success,
        data: response.data.data || [],
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching shifts:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error fetching shifts'
      };
    }
  },

  /**
   * Get shift detail
   * @param {number} shiftId - Shift ID
   */
  async getShift(shiftId) {
    try {
      const response = await apiClient.get(`/cash-register-shifts/${shiftId}`);

      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching shift:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error fetching shift'
      };
    }
  }
};
