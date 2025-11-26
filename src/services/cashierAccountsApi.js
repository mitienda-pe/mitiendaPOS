import apiClient from './axios';

export const cashierAccountsApi = {
  /**
   * Obtener todas las configuraciones de cuentas de caja
   * @param {number} branchId - Filtrar por sucursal (opcional)
   */
  async getAll(branchId = null) {
    const params = branchId ? { branch_id: branchId } : {};
    const response = await apiClient.get('/netsuite-cashier-accounts', { params });
    return response.data;
  },

  /**
   * Obtener una configuración específica por ID
   * @param {number} id
   */
  async getById(id) {
    const response = await apiClient.get(`/netsuite-cashier-accounts/${id}`);
    return response.data;
  },

  /**
   * Obtener configuración completa de una caja específica
   * @param {number} branchId
   * @param {number} cajaNumero
   */
  async getCashierConfig(branchId, cajaNumero) {
    const response = await apiClient.get(
      `/netsuite-cashier-accounts/branch/${branchId}/cashier/${cajaNumero}`
    );
    return response.data;
  },

  /**
   * Crear nueva configuración de cuenta de caja
   * @param {object} data
   */
  async create(data) {
    const response = await apiClient.post('/netsuite-cashier-accounts', data);
    return response.data;
  },

  /**
   * Actualizar configuración de cuenta de caja
   * @param {number} id
   * @param {object} data
   */
  async update(id, data) {
    const response = await apiClient.put(`/netsuite-cashier-accounts/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar (desactivar) configuración de cuenta de caja
   * @param {number} id
   */
  async delete(id) {
    const response = await apiClient.delete(`/netsuite-cashier-accounts/${id}`);
    return response.data;
  }
};
