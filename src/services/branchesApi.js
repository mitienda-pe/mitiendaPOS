import apiClient from './axios';

export const branchesApi = {
  /**
   * Obtener todas las sucursales de una tienda
   * @param {number} tiendaId
   * @param {boolean} conPOS - Filtrar solo sucursales con POS activo
   */
  async getAll(tiendaId, conPOS = false) {
    const params = { tienda_id: tiendaId };
    if (conPOS) params.con_pos = 1;

    const response = await apiClient.get('/api/v1/branches', { params });
    return response.data;
  },

  /**
   * Obtener una sucursal por ID
   * @param {number} id
   */
  async getById(id) {
    const response = await apiClient.get(`/api/v1/branches/${id}`);
    return response.data;
  },

  /**
   * Crear nueva sucursal
   * @param {object} data
   */
  async create(data) {
    const response = await apiClient.post('/api/v1/branches', data);
    return response.data;
  },

  /**
   * Actualizar sucursal
   * @param {number} id
   * @param {object} data
   */
  async update(id, data) {
    const response = await apiClient.put(`/api/v1/branches/${id}`, data);
    return response.data;
  },

  /**
   * Desactivar sucursal
   * @param {number} id
   */
  async delete(id) {
    const response = await apiClient.delete(`/api/v1/branches/${id}`);
    return response.data;
  },

  /**
   * Obtener empleados asignados a una sucursal
   * @param {number} id
   */
  async getEmpleados(id) {
    const response = await apiClient.get(`/api/v1/branches/${id}/empleados`);
    return response.data;
  }
};
