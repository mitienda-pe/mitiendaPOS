import apiClient from './axios';

/**
 * API service for managing NetSuite series configuration at store level
 */
export const storeSeriesApi = {
  /**
   * Get series configuration for a store
   * @param {number} tiendaId - Store ID
   * @returns {Promise} API response with boleta and factura NetSuite IDs
   */
  async getConfig(tiendaId) {
    const response = await apiClient.get(`/stores/${tiendaId}/series-config`);
    return response.data;
  },

  /**
   * Update series configuration for a store
   * @param {number} tiendaId - Store ID
   * @param {object} config - Configuration object
   * @param {string} config.boleta_netsuite_id - NetSuite ID for boleta series
   * @param {string} config.factura_netsuite_id - NetSuite ID for factura series
   * @returns {Promise} API response with updated configuration
   */
  async updateConfig(tiendaId, config) {
    const response = await apiClient.put(`/stores/${tiendaId}/series-config`, config);
    return response.data;
  }
};
