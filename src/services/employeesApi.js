import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api2.mitienda.pe';

/**
 * Servicio para gestionar empleados/cajeros del POS
 */
class EmployeesApi {
  constructor() {
    this.baseURL = `${API_URL}/api/v1/employees`;
  }

  /**
   * Obtener token del localStorage
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Headers con autenticación
   * @returns {object}
   */
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Obtener lista de empleados de la tienda actual
   * @param {boolean} activeOnly - Solo empleados activos
   * @returns {Promise}
   */
  async getEmployees(activeOnly = true) {
    try {
      const response = await axios.get(this.baseURL, {
        headers: this.getHeaders(),
        params: { active_only: activeOnly ? '1' : '0' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  /**
   * Obtener empleado por ID
   * @param {number} employeeId
   * @returns {Promise}
   */
  async getEmployee(employeeId) {
    try {
      const response = await axios.get(`${this.baseURL}/${employeeId}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo empleado
   * @param {object} employeeData
   * @returns {Promise}
   */
  async createEmployee(employeeData) {
    try {
      const response = await axios.post(this.baseURL, employeeData, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Actualizar empleado
   * @param {number} employeeId
   * @param {object} employeeData
   * @returns {Promise}
   */
  async updateEmployee(employeeId, employeeData) {
    try {
      const response = await axios.put(`${this.baseURL}/${employeeId}`, employeeData, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  /**
   * Desactivar empleado
   * @param {number} employeeId
   * @returns {Promise}
   */
  async deleteEmployee(employeeId) {
    try {
      const response = await axios.delete(`${this.baseURL}/${employeeId}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  /**
   * Validar PIN de empleado
   * @param {string} pin - PIN de 6 dígitos
   * @returns {Promise}
   */
  async validatePin(pin) {
    try {
      console.log('🔐 [API] Validating PIN:', pin);
      const response = await axios.post(
        `${this.baseURL}/validate-pin`,
        { pin },
        { headers: this.getHeaders() }
      );
      console.log('🔐 [API] PIN validation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Error validating PIN:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Cambiar PIN de un empleado
   * @param {number} employeeId
   * @param {string} newPin
   * @returns {Promise}
   */
  async changePin(employeeId, newPin) {
    try {
      const response = await axios.put(
        `${this.baseURL}/${employeeId}/change-pin`,
        { new_pin: newPin },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error changing PIN:', error);
      throw error;
    }
  }
}

export const employeesApi = new EmployeesApi();
