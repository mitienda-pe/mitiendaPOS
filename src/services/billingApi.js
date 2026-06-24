import apiClient from './axios'

/**
 * Billing API Service
 * Handles all billing-related API calls
 */

const billingApi = {
  // ========== Nubefact Configuration ==========

  /**
   * Get Nubefact configuration for current store
   * @returns {Promise<Object>}
   */
  async getNubefactConfig() {
    const response = await apiClient.get('/billing/nubefact')
    return response.data
  },

  /**
   * Save Nubefact credentials
   * @param {Object} data - Credentials data
   * @returns {Promise<Object>}
   */
  async saveNubefactCredentials(data) {
    const response = await apiClient.post('/billing/nubefact', data)
    return response.data
  },

  /**
   * Update Nubefact credentials
   * @param {Object} data - Credentials data
   * @returns {Promise<Object>}
   */
  async updateNubefactCredentials(data) {
    const response = await apiClient.put('/billing/nubefact', data)
    return response.data
  },

  /**
   * Delete Nubefact credentials
   * @returns {Promise<Object>}
   */
  async deleteNubefactCredentials() {
    const response = await apiClient.delete('/billing/nubefact')
    return response.data
  },

  /**
   * Test Nubefact API connection
   * @returns {Promise<Object>}
   */
  async testNubefactConnection() {
    const response = await apiClient.post('/billing/nubefact/test')
    return response.data
  },

  // ========== Bizlinks Configuration ==========

  /** Get Bizlinks configuration for current store */
  async getBizlinksConfig() {
    const response = await apiClient.get('/billing/bizlinks')
    return response.data
  },

  /** Save Bizlinks credentials */
  async saveBizlinksCredentials(data) {
    const response = await apiClient.post('/billing/bizlinks', data)
    return response.data
  },

  /** Update Bizlinks credentials */
  async updateBizlinksCredentials(data) {
    const response = await apiClient.put('/billing/bizlinks', data)
    return response.data
  },

  /** Delete Bizlinks credentials */
  async deleteBizlinksCredentials() {
    const response = await apiClient.delete('/billing/bizlinks')
    return response.data
  },

  /** Test Bizlinks connection (solo modo credenciales propias) */
  async testBizlinksConnection() {
    const response = await apiClient.post('/billing/bizlinks/test')
    return response.data
  },

  // ========== Billing Documents ==========

  /**
   * Get the store's electronic billing mode (auto/manual/delegated).
   * Used by the POS to decide the state of the "Emitir comprobante" button.
   * @returns {Promise<Object>} { provider_configured, provider_id, provider_name, auto_emission, delegated }
   */
  async getStatus() {
    const response = await apiClient.get('/billing/status')
    return response.data
  },

  /**
   * Get list of emitted billing documents
   * @param {number} limit - Number of documents to retrieve
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Object>}
   */
  async getDocuments(limit = 20, offset = 0) {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())

    const response = await apiClient.get(`/billing/documents?${params.toString()}`)
    return response.data
  },

  /**
   * Get billing document detail
   * @param {number} id - Document ID
   * @returns {Promise<Object>}
   */
  async getDocumentDetail(id) {
    const response = await apiClient.get(`/billing/documents/${id}`)
    return response.data
  },

  /**
   * Emit billing document for an order
   * @param {Object} data - Emission data
   * @param {number} data.order_id - Order ID
   * @param {number} data.document_type - Document type (1=Factura, 2=Boleta)
   * @param {string} [data.pdf_format] - PDF format (A4, TICKET, 80MM)
   * @returns {Promise<Object>}
   */
  async emitDocument(data) {
    const response = await apiClient.post('/billing/documents/emit', data)
    return response.data
  }
}

export default billingApi
