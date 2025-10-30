import { ref, computed } from 'vue'
import billingApi from '../services/billingApi'

export function useDocuments() {
  const allDocuments = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    total: 0,
    limit: 20,
    offset: 0
  })

  // Filters
  const filters = ref({
    search: '',
    documentType: '', // 'Factura', 'Boleta', or ''
    dateFrom: '',
    dateTo: ''
  })

  /**
   * Fetch billing documents
   * @param {number} limit - Number of documents per page
   * @param {number} offset - Pagination offset
   */
  const fetchDocuments = async (limit = 20, offset = 0) => {
    loading.value = true
    error.value = null

    try {
      const response = await billingApi.getDocuments(limit, offset)
      allDocuments.value = response.data || []
      pagination.value = response.pagination || {
        total: 0,
        limit,
        offset
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
      error.value = err.message || 'Error al cargar los documentos'
      allDocuments.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Apply filters to documents
   */
  const documents = computed(() => {
    let filtered = [...allDocuments.value]

    // Search filter (serie-correlativo, customer document, order code)
    if (filters.value.search.trim()) {
      const searchLower = filters.value.search.toLowerCase().trim()
      filtered = filtered.filter(doc => {
        const serieCorrelativo = `${doc.serie}-${doc.correlative}`.toLowerCase()
        const customerDoc = (doc.customer_document || '').toLowerCase()
        const orderCode = (doc.order_code || '').toLowerCase()
        const customerName = (doc.customer_name || '').toLowerCase()

        return serieCorrelativo.includes(searchLower) ||
               customerDoc.includes(searchLower) ||
               orderCode.includes(searchLower) ||
               customerName.includes(searchLower)
      })
    }

    // Document type filter
    if (filters.value.documentType) {
      filtered = filtered.filter(doc => doc.document_type === filters.value.documentType)
    }

    // Date range filter
    if (filters.value.dateFrom) {
      const fromDate = new Date(filters.value.dateFrom)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.emission_date)
        return docDate >= fromDate
      })
    }

    if (filters.value.dateTo) {
      const toDate = new Date(filters.value.dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.emission_date)
        return docDate <= toDate
      })
    }

    return filtered
  })

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    filters.value = {
      search: '',
      documentType: '',
      dateFrom: '',
      dateTo: ''
    }
  }

  /**
   * Check if any filter is active
   */
  const hasActiveFilters = computed(() => {
    return !!(
      filters.value.search ||
      filters.value.documentType ||
      filters.value.dateFrom ||
      filters.value.dateTo
    )
  })

  /**
   * Get document detail
   * @param {number} id - Document ID
   */
  const fetchDocumentDetail = async (id) => {
    loading.value = true
    error.value = null

    try {
      const response = await billingApi.getDocumentDetail(id)
      return response.data
    } catch (err) {
      console.error('Error fetching document detail:', err)
      error.value = err.message || 'Error al cargar el detalle del documento'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Download file from URL
   * @param {string} url - File URL
   * @param {string} filename - Desired filename
   */
  const downloadFile = (url, filename) => {
    if (!url) {
      error.value = 'URL del archivo no disponible'
      return
    }

    // Open in new tab for download
    window.open(url, '_blank')
  }

  return {
    documents,
    loading,
    error,
    pagination,
    filters,
    hasActiveFilters,
    fetchDocuments,
    fetchDocumentDetail,
    downloadFile,
    clearFilters
  }
}
