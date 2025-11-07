<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Documentos Emitidos</h1>
        <button
          @click="refreshDocuments"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white shadow rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <!-- Search -->
          <div class="lg:col-span-4">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                v-model="filters.search"
                type="text"
                placeholder="Serie, RUC/DNI, Orden, Cliente..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Document Type Filter -->
          <div class="lg:col-span-2">
            <label for="documentType" class="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="documentType"
              v-model="filters.documentType"
              class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
            >
              <option value="">Todos</option>
              <option value="Factura">Factura</option>
              <option value="Boleta">Boleta</option>
            </select>
          </div>

          <!-- Date From -->
          <div class="lg:col-span-2">
            <label for="dateFrom" class="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              id="dateFrom"
              v-model="filters.dateFrom"
              type="date"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
          </div>

          <!-- Date To -->
          <div class="lg:col-span-2">
            <label for="dateTo" class="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              id="dateTo"
              v-model="filters.dateTo"
              type="date"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
          </div>

          <!-- Clear Filters Button -->
          <div class="lg:col-span-2 flex items-end">
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          </div>
        </div>

        <!-- Active filters indicator -->
        <div v-if="hasActiveFilters" class="mt-4 flex items-center text-sm text-gray-600">
          <svg class="w-4 h-4 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
          </svg>
          Mostrando {{ documents.length }} de {{ allDocumentsCount }} documentos
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading && documents.length === 0" class="bg-white shadow overflow-hidden sm:rounded-lg p-12">
        <div class="flex flex-col items-center justify-center">
          <svg class="animate-spin h-12 w-12 text-amber-500 mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Cargando documentos...</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && documents.length === 0" class="bg-white shadow overflow-hidden sm:rounded-lg p-12">
        <div class="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-300 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <h2 class="text-xl font-medium text-gray-900 mb-2">
            {{ hasActiveFilters ? 'No se encontraron documentos' : 'No hay documentos emitidos' }}
          </h2>
          <p class="text-gray-600 text-center max-w-md">
            {{ hasActiveFilters ? 'Intenta ajustar los filtros de búsqueda.' : 'Los comprobantes electrónicos emitidos aparecerán aquí.' }}
          </p>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Documents table -->
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Archivos
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50">
                <!-- Document info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <div class="text-sm font-medium text-gray-900">
                      {{ doc.document_type }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ doc.serie }}-{{ doc.correlative }}
                    </div>
                  </div>
                </td>

                <!-- Customer -->
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <div class="text-sm text-gray-900">{{ doc.customer_name }}</div>
                    <div class="text-sm text-gray-500">{{ doc.customer_document }}</div>
                  </div>
                </td>

                <!-- Order code -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ doc.order_code }}</div>
                </td>

                <!-- Total -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    S/ {{ formatCurrency(doc.total) }}
                  </div>
                </td>

                <!-- Date -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">
                    {{ formatDate(doc.emission_date) }}
                  </div>
                </td>

                <!-- Download buttons -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex items-center justify-center space-x-2">
                    <!-- PDF -->
                    <button
                      v-if="doc.files?.pdf"
                      @click="downloadFile(doc.files.pdf, `${doc.serie}-${doc.correlative}.pdf`)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Descargar PDF"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>

                    <!-- XML -->
                    <button
                      v-if="doc.files?.xml"
                      @click="downloadFile(doc.files.xml, `${doc.serie}-${doc.correlative}.xml`)"
                      class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      title="Descargar XML"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      XML
                    </button>

                    <!-- CDR -->
                    <button
                      v-if="doc.files?.cdr"
                      @click="downloadFile(doc.files.cdr, `R-${doc.serie}-${doc.correlative}.zip`)"
                      class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      title="Descargar CDR"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      CDR
                    </button>

                    <!-- No files available -->
                    <span v-if="!doc.files?.pdf && !doc.files?.xml && !doc.files?.cdr" class="text-xs text-gray-400">
                      Sin archivos
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="previousPage"
              :disabled="pagination.offset === 0"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="nextPage"
              :disabled="pagination.offset + pagination.limit >= pagination.total"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando
                <span class="font-medium">{{ pagination.offset + 1 }}</span>
                a
                <span class="font-medium">{{ Math.min(pagination.offset + pagination.limit, pagination.total) }}</span>
                de
                <span class="font-medium">{{ pagination.total }}</span>
                documentos
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="previousPage"
                  :disabled="pagination.offset === 0"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Anterior</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  @click="nextPage"
                  :disabled="pagination.offset + pagination.limit >= pagination.total"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Siguiente</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useDocuments } from '../composables/useDocuments'

const {
  documents,
  loading,
  error,
  pagination,
  filters,
  hasActiveFilters,
  fetchDocuments,
  downloadFile,
  clearFilters
} = useDocuments()

// Computed property for total count before filtering
const allDocumentsCount = computed(() => pagination.value.total)

onMounted(() => {
  fetchDocuments()
})

const refreshDocuments = () => {
  fetchDocuments(pagination.value.limit, pagination.value.offset)
}

const previousPage = () => {
  const newOffset = Math.max(0, pagination.value.offset - pagination.value.limit)
  fetchDocuments(pagination.value.limit, newOffset)
}

const nextPage = () => {
  if (pagination.value.offset + pagination.value.limit < pagination.value.total) {
    const newOffset = pagination.value.offset + pagination.value.limit
    fetchDocuments(pagination.value.limit, newOffset)
  }
}

const formatCurrency = (value) => {
  return parseFloat(value || 0).toFixed(2)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'

  // Si viene en formato ISO con hora (YYYY-MM-DD HH:MM:SS o YYYY-MM-DDTHH:MM:SS)
  if (dateString.includes(' ') || dateString.includes('T')) {
    // Separar fecha y hora para evitar problemas de zona horaria
    const [datePart, timePart] = dateString.replace('T', ' ').split(' ')
    const [year, month, day] = datePart.split('-')

    if (timePart) {
      const [hours, minutes] = timePart.split(':')
      return `${day}/${month}/${year} ${hours}:${minutes}`
    }

    return `${day}/${month}/${year}`
  }

  // Si viene solo la fecha (YYYY-MM-DD)
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}
</script>
