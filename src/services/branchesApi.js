import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : 'https://api2.mitienda.pe/api/v1';

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

export const branchesApi = {
  /**
   * Obtener todas las sucursales de una tienda
   * @param {number} tiendaId
   * @param {boolean} conPOS - Filtrar solo sucursales con POS activo
   */
  async getAll(tiendaId, conPOS = false) {
    const params = { tienda_id: tiendaId };
    if (conPOS) params.con_pos = 1;

    const response = await axios.get(`${API_URL}/branches`, {
      headers: getHeaders(),
      params
    });
    return response.data;
  },

  /**
   * Obtener una sucursal por ID
   * @param {number} id
   */
  async getById(id) {
    const response = await axios.get(`${API_URL}/branches/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  /**
   * Crear nueva sucursal
   * @param {object} data
   */
  async create(data) {
    const response = await axios.post(`${API_URL}/branches`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  /**
   * Actualizar sucursal
   * @param {number} id
   * @param {object} data
   */
  async update(id, data) {
    const response = await axios.put(`${API_URL}/branches/${id}`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  /**
   * Desactivar sucursal
   * @param {number} id
   */
  async delete(id) {
    const response = await axios.delete(`${API_URL}/branches/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  /**
   * Obtener empleados asignados a una sucursal
   * @param {number} id
   */
  async getEmpleados(id) {
    const response = await axios.get(`${API_URL}/branches/${id}/empleados`, {
      headers: getHeaders()
    });
    return response.data;
  }
};
