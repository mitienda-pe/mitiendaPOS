import apiClient from './axios';

export const posEmpleadosApi = {
  /**
   * Obtener todos los empleados POS de una tienda
   * @param {number} tiendaId
   */
  async getAll(tiendaId) {
    const response = await apiClient.get('/pos-empleados', {
      params: { tienda_id: tiendaId }
    });
    return response.data;
  },

  /**
   * Obtener un empleado por ID
   * @param {number} id
   */
  async getById(id) {
    const response = await apiClient.get(`/pos-empleados/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo empleado
   * @param {object} data
   */
  async create(data) {
    const response = await apiClient.post('/pos-empleados', data);
    return response.data;
  },

  /**
   * Actualizar empleado
   * @param {number} id
   * @param {object} data
   */
  async update(id, data) {
    const response = await apiClient.put(`/pos-empleados/${id}`, data);
    return response.data;
  },

  /**
   * Desactivar empleado
   * @param {number} id
   */
  async delete(id) {
    const response = await apiClient.delete(`/pos-empleados/${id}`);
    return response.data;
  },

  /**
   * Validar PIN de empleado
   * @param {number} tiendaId
   * @param {string} pin - PIN de 4 dígitos
   */
  async validatePin(tiendaId, pin) {
    const response = await apiClient.post('/pos-empleados/validate-pin', {
      tienda_id: tiendaId,
      pin
    });
    return response.data;
  },

  /**
   * Asignar sucursal a empleado
   * @param {number} empleadoId
   * @param {number} sucursalId
   */
  async asignarSucursal(empleadoId, sucursalId) {
    const response = await apiClient.post(
      `/pos-empleados/${empleadoId}/sucursales`,
      { sucursal_id: sucursalId }
    );
    return response.data;
  },

  /**
   * Desasignar sucursal de empleado
   * @param {number} empleadoId
   * @param {number} sucursalId
   */
  async desasignarSucursal(empleadoId, sucursalId) {
    const response = await apiClient.delete(
      `/pos-empleados/${empleadoId}/sucursales/${sucursalId}`
    );
    return response.data;
  }
};
