import { defineStore } from 'pinia'
import billingApi from '@/services/billingApi'

export const useBillingStore = defineStore('billing', {
  state: () => ({
    // Nubefact configuration
    nubefactConfig: null,

    // Documents
    documents: [],
    currentDocument: null,

    // Pagination
    pagination: {
      total: 0,
      limit: 20,
      offset: 0
    },

    // Loading states
    isLoading: false,
    isSaving: false,
    isTesting: false,
    isEmitting: false,

    // Messages
    error: null,
    successMessage: null
  }),

  getters: {
    /**
     * Check if Nubefact is configured
     */
    isNubefactConfigured: (state) => {
      return state.nubefactConfig?.configured === true
    },

    /**
     * Get Nubefact credentials
     */
    nubefactCredentials: (state) => {
      return state.nubefactConfig?.credentials || null
    },

    /**
     * Check if billing is blocked
     */
    isBillingBlocked: (state) => {
      return state.nubefactConfig?.blocked === true
    }
  },

  actions: {
    /**
     * Fetch Nubefact configuration
     */
    async fetchNubefactConfig() {
      try {
        this.isLoading = true
        this.error = null

        const response = await billingApi.getNubefactConfig()

        if (response.success && response.data) {
          this.nubefactConfig = response.data
        } else {
          this.error = 'Error al cargar configuración de Nubefact'
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error de conexión'
        console.error('Error al cargar configuración de Nubefact:', err)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Save Nubefact credentials
     */
    async saveNubefactCredentials(data) {
      try {
        this.isSaving = true
        this.error = null
        this.successMessage = null

        const response = await billingApi.saveNubefactCredentials(data)

        if (response.success) {
          this.successMessage = 'Credenciales guardadas exitosamente'
          await this.fetchNubefactConfig()
          return { success: true }
        } else {
          this.error = response.message || 'Error al guardar credenciales'
          return { success: false, error: this.error }
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al guardar credenciales'
        console.error('Error al guardar credenciales de Nubefact:', err)
        return { success: false, error: this.error }
      } finally {
        this.isSaving = false
      }
    },

    /**
     * Update Nubefact credentials
     */
    async updateNubefactCredentials(data) {
      try {
        this.isSaving = true
        this.error = null
        this.successMessage = null

        const response = await billingApi.updateNubefactCredentials(data)

        if (response.success) {
          this.successMessage = 'Credenciales actualizadas exitosamente'
          await this.fetchNubefactConfig()
          return { success: true }
        } else {
          this.error = response.message || 'Error al actualizar credenciales'
          return { success: false, error: this.error }
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al actualizar credenciales'
        console.error('Error al actualizar credenciales de Nubefact:', err)
        return { success: false, error: this.error }
      } finally {
        this.isSaving = false
      }
    },

    /**
     * Delete Nubefact credentials
     */
    async deleteNubefactCredentials() {
      try {
        this.isSaving = true
        this.error = null
        this.successMessage = null

        const response = await billingApi.deleteNubefactCredentials()

        if (response.success) {
          this.successMessage = 'Credenciales eliminadas exitosamente'
          this.nubefactConfig = null
          return { success: true }
        } else {
          this.error = response.message || 'Error al eliminar credenciales'
          return { success: false, error: this.error }
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al eliminar credenciales'
        console.error('Error al eliminar credenciales de Nubefact:', err)
        return { success: false, error: this.error }
      } finally {
        this.isSaving = false
      }
    },

    /**
     * Test Nubefact connection
     */
    async testNubefactConnection() {
      try {
        this.isTesting = true
        this.error = null

        const response = await billingApi.testNubefactConnection()

        if (response.success && response.data) {
          return { success: true, data: response.data }
        } else {
          this.error = response.message || 'Error al probar conexión'
          return { success: false, error: this.error }
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al probar conexión'
        console.error('Error al probar conexión de Nubefact:', err)
        return { success: false, error: this.error }
      } finally {
        this.isTesting = false
      }
    },

    /**
     * Fetch billing documents
     */
    async fetchDocuments(limit = 20, offset = 0) {
      try {
        this.isLoading = true
        this.error = null

        const response = await billingApi.getDocuments(limit, offset)

        if (response.success && response.data) {
          this.documents = response.data
          if (response.pagination) {
            this.pagination = response.pagination
          }
        } else {
          this.error = 'Error al cargar documentos'
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error de conexión'
        console.error('Error al cargar documentos:', err)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch document detail
     */
    async fetchDocumentDetail(id) {
      try {
        this.isLoading = true
        this.error = null

        const response = await billingApi.getDocumentDetail(id)

        if (response.success && response.data) {
          this.currentDocument = response.data
        } else {
          this.error = 'Error al cargar detalle del documento'
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error de conexión'
        console.error('Error al cargar detalle del documento:', err)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Emit billing document
     */
    async emitDocument(data) {
      try {
        this.isEmitting = true
        this.error = null
        this.successMessage = null

        const response = await billingApi.emitDocument(data)

        if (response.success) {
          this.successMessage = 'Comprobante emitido exitosamente'
          return { success: true, data: response.data }
        } else {
          this.error = response.message || 'Error al emitir comprobante'
          return { success: false, error: this.error }
        }
      } catch (err) {
        console.error('Error al emitir comprobante:', err)
        console.error('Response data:', err.response?.data)

        // Try to extract more detailed error message
        const errorMsg = err.response?.data?.message
          || (typeof err.response?.data === 'string' ? err.response.data : null)
          || JSON.stringify(err.response?.data)
          || 'Error al emitir comprobante'

        this.error = errorMsg
        return { success: false, error: errorMsg }
      } finally {
        this.isEmitting = false
      }
    },

    /**
     * Clear messages
     */
    clearMessages() {
      this.error = null
      this.successMessage = null
    },

    /**
     * Clear current document
     */
    clearCurrentDocument() {
      this.currentDocument = null
    }
  }
})
