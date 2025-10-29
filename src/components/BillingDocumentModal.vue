<template>
  <div v-if="modelValue" class="fixed z-50 inset-0 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="handleCancel"></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <!-- Header -->
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ isEmitting ? 'Emitiendo comprobante...' : 'Emitir Comprobante de Pago' }}
                </h3>
                <button @click="handleCancel" :disabled="isEmitting"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none disabled:opacity-50">
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Order Info -->
              <div class="mb-4 p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span class="font-semibold text-gray-900">{{ orderLabel }}</span>
                </div>
                <p class="text-sm text-gray-600">
                  Total: <span class="font-semibold text-gray-900">{{ formatCurrency(orderTotal) }}</span>
                </p>
                <p v-if="customer" class="text-sm text-gray-600 mt-1">
                  Cliente: <span class="font-semibold text-gray-900">{{ customer.name }}</span>
                </p>
              </div>

              <!-- Document Type Selection -->
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de Comprobante
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <!-- Factura -->
                  <button type="button" @click="selectDocumentType(1)" :disabled="isEmitting" :class="[
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                    selectedDocumentType === 1
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50',
                    isEmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  ]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      :class="selectedDocumentType === 1 ? 'text-blue-600' : 'text-gray-400'">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span class="font-medium" :class="selectedDocumentType === 1 ? 'text-blue-700' : 'text-gray-700'">
                      Factura
                    </span>
                  </button>

                  <!-- Boleta -->
                  <button type="button" @click="selectDocumentType(2)" :disabled="isEmitting" :class="[
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                    selectedDocumentType === 2
                      ? 'border-green-600 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50',
                    isEmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  ]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      :class="selectedDocumentType === 2 ? 'text-green-600' : 'text-gray-400'">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <span class="font-medium" :class="selectedDocumentType === 2 ? 'text-green-700' : 'text-gray-700'">
                      Boleta
                    </span>
                  </button>
                </div>
              </div>

              <!-- Customer Info Warning (for Factura) -->
              <div v-if="selectedDocumentType === 1" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <div class="text-sm text-blue-800">
                    <p class="font-medium mb-1">Requisitos para Factura</p>
                    <p>Asegúrese de que el cliente tenga RUC registrado y los datos fiscales completos.</p>
                  </div>
                </div>
              </div>

              <!-- PDF Format Selection -->
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Formato de impresión
                </label>
                <select v-model="pdfFormat" :disabled="isEmitting"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="TICKET">Ticket (80mm) - Impresora térmica</option>
                  <option value="A4">A4 (Estándar)</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  Seleccione el formato según su impresora
                </p>
              </div>

              <!-- Error Message -->
              <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600 flex-shrink-0" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <div class="text-sm text-red-800">
                    <p class="font-medium">Error al emitir comprobante</p>
                    <p class="mt-1">{{ errorMessage }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
          <button @click="handleEmit" :disabled="!selectedDocumentType || isEmitting" :class="[
            'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm',
            !selectedDocumentType || isEmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          ]">
            <svg v-if="isEmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ isEmitting ? 'Emitiendo...' : 'Emitir Comprobante' }}
          </button>
          <button @click="handleCancel" :disabled="isEmitting"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBillingStore } from '@/stores/billing'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  orderId: {
    type: [Number, null],
    required: false,
    default: null
  },
  orderLabel: {
    type: String,
    default: 'Nueva venta'
  },
  orderTotal: {
    type: Number,
    required: true
  },
  customer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'error'])

const billingStore = useBillingStore()

const selectedDocumentType = ref(null)
const pdfFormat = ref('TICKET') // Default to thermal printer format
const isEmitting = ref(false)
const errorMessage = ref(null)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value)
}

const selectDocumentType = (type) => {
  if (!isEmitting.value) {
    selectedDocumentType.value = type
    errorMessage.value = null
  }
}

const handleCancel = () => {
  if (!isEmitting.value) {
    selectedDocumentType.value = null
    errorMessage.value = null
    emit('update:modelValue', false)
  }
}

const handleEmit = async () => {
  if (!selectedDocumentType.value || isEmitting.value) return

  // Validar que tengamos un order_id válido
  if (!props.orderId) {
    errorMessage.value = 'No se pudo obtener el ID de la orden. Por favor, intente nuevamente.'
    return
  }

  try {
    isEmitting.value = true
    errorMessage.value = null

    const result = await billingStore.emitDocument({
      order_id: props.orderId,
      document_type: selectedDocumentType.value,
      pdf_format: pdfFormat.value
    })

    if (result.success) {
      // Close modal
      emit('update:modelValue', false)
      // Reset state
      selectedDocumentType.value = null
      // Emit success event
      emit('success', result.data)
    } else {
      errorMessage.value = result.error || 'Error al emitir el comprobante'
      emit('error', result.error)
    }
  } catch (error) {
    errorMessage.value = error.message || 'Error inesperado al emitir el comprobante'
    emit('error', error.message)
  } finally {
    isEmitting.value = false
  }
}
</script>
