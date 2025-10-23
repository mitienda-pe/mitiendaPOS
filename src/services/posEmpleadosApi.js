import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api2.mitienda.pe/api/v1';

// Obtener token del localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Configurar headers con autenticación
const getHeaders = () => {
  return {
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  };
};

export const posEmpleadosApi = {
  /**
   * Obtener todos los empleados POS de una tienda
   * @param {number} tiendaId
   */
  async getAll(tiendaId) {
    const response = await axios.get(`${API_URL}/pos-empleados`, {
      headers: getHeaders(),
      params: { tienda_id: tiendaId }
    });
    return response.data;
  },

  /**
   * Obtener un empleado por ID
   * @param {number} id
   */
  async getById(id) {
    const response = await axios.get(`${API_URL}/pos-empleados/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  /**
   * Crear nuevo empleado
   * @param {object} data
   */
  async create(data) {
    const response = await axios.post(`${API_URL}/pos-empleados`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  /**
   * Actualizar empleado
   * @param {number} id
   * @param {object} data
   */
  async update(id, data) {
    const response = await axios.put(`${API_URL}/pos-empleados/${id}`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  /**
   * Desactivar empleado
   * @param {number} id
   */
  async delete(id) {
    const response = await axios.delete(`${API_URL}/pos-empleados/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  /**
   * Validar PIN de empleado
   * @param {number} tiendaId
   * @param {string} pin - PIN de 4 dígitos
   */
  async validatePin(tiendaId, pin) {
    const response = await axios.post(`${API_URL}/pos-empleados/validate-pin`, {
      tienda_id: tiendaId,
      pin
    }, {
      headers: getHeaders()
    });
    return response.data;
  },

  /**
   * Asignar sucursal a empleado
   * @param {number} empleadoId
   * @param {number} sucursalId
   */
  async asignarSucursal(empleadoId, sucursalId) {
    const response = await axios.post(
      `${API_URL}/pos-empleados/${empleadoId}/sucursales`,
      { sucursal_id: sucursalId },
      { headers: getHeaders() }
    );
    return response.data;
  },

  /**
   * Desasignar sucursal de empleado
   * @param {number} empleadoId
   * @param {number} sucursalId
   */
  async desasignarSucursal(empleadoId, sucursalId) {
    const response = await axios.delete(
      `${API_URL}/pos-empleados/${empleadoId}/sucursales/${sucursalId}`,
      { headers: getHeaders() }
    );
    return response.data;
  }
};
