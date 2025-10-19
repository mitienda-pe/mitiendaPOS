import apiClient from './axios';

export const customersApi = {
  /**
   * Get all customers with optional filters
   * @param {Object} filters - { page, limit, search, verified, blocked, date_from, date_to }
   */
  async getCustomers(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.search) params.append('search', filters.search);
      if (filters.verified !== undefined) params.append('verified', filters.verified ? '1' : '0');
      if (filters.blocked !== undefined) params.append('blocked', filters.blocked ? '1' : '0');
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const queryString = params.toString();
      const url = queryString ? `/customers?${queryString}` : '/customers';

      const response = await apiClient.get(url);

      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || null
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error fetching customers'
      };
    }
  },

  /**
   * Get customer by ID
   * @param {number} id - Customer ID
   */
  async getCustomer(id) {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching customer:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error fetching customer'
      };
    }
  },

  /**
   * Search customer by document number
   * @param {string} documentNumber - Document number (DNI or RUC)
   * @param {string} documentType - '1' for DNI, '6' for RUC (optional)
   */
  async searchByDocument(documentNumber, documentType = null) {
    try {
      const params = new URLSearchParams();
      params.append('document_number', documentNumber);
      if (documentType) {
        params.append('document_type', documentType);
      }

      const response = await apiClient.get(`/customers/search-by-document?${params.toString()}`);
      console.log('searchByDocument backend response:', response.data);

      return {
        success: response.data.success,
        found: response.data.found,
        data: response.data.data || null
      };
    } catch (error) {
      console.error('Error searching customer by document:', error);
      return {
        success: false,
        found: false,
        error: error.response?.data?.message || error.message || 'Error searching customer'
      };
    }
  },

  /**
   * Lookup DNI/RUC using Decolecta API (through backend)
   * @param {string} documentNumber - Document number
   * @param {string} type - 'dni' or 'ruc'
   */
  async lookupDocument(documentNumber, type = 'dni') {
    try {
      console.log(`Calling Decolecta API: /customers/lookup/${documentNumber}?type=${type.toLowerCase()}`);
      const response = await apiClient.get(`/customers/lookup/${documentNumber}?type=${type.toLowerCase()}`);
      console.log('Decolecta API response:', response.data);

      return {
        success: response.data.success,
        type: response.data.type,
        documentNumber: response.data.document_number,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error looking up document:', error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error looking up document'
      };
    }
  },

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   */
  async createCustomer(customerData) {
    try {
      // Map frontend format to backend format
      const backendData = {
        tiendacliente_nombres: customerData.nombres || customerData.firstName || '',
        tiendacliente_apellidos: customerData.apellidos || customerData.lastName || '',
        tiendacliente_correo_electronico: customerData.email || customerData.correoElectronico || '',
        tiendacliente_telefono: customerData.telefono || customerData.phone || '',
        tiendacliente_numerodocumento: customerData.numeroDocumento || customerData.documentNumber || '',
        documento_id: customerData.tipoDocumento || customerData.documentType || '1', // 1=DNI, 6=RUC
        password: customerData.password || Math.random().toString(36).slice(-12) // Generate random password if not provided
      };

      // Add razon social for RUC
      if (customerData.razonSocial) {
        backendData.tiendacliente_nombres = customerData.razonSocial;
        backendData.tiendacliente_apellidos = '';
      }

      const response = await apiClient.post('/customers', backendData);
      console.log('Backend response:', response.data);

      const customerData = response.data.data || response.data;
      console.log('Extracted customer data:', customerData);

      return {
        success: true,
        data: customerData
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error creating customer'
      };
    }
  },

  /**
   * Update customer
   * @param {number} id - Customer ID
   * @param {Object} customerData - Customer data to update
   */
  async updateCustomer(id, customerData) {
    try {
      const response = await apiClient.put(`/customers/${id}`, customerData);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error updating customer:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error updating customer'
      };
    }
  },

  /**
   * Delete customer
   * @param {number} id - Customer ID
   */
  async deleteCustomer(id) {
    try {
      const response = await apiClient.delete(`/customers/${id}`);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error deleting customer'
      };
    }
  }
};
