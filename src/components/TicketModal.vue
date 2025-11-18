<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <!-- Success Icon -->
              <div class="flex justify-center mb-4">
                <div class="rounded-full bg-green-100 p-3">
                  <svg class="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h3 class="text-xl leading-6 font-bold text-gray-900 mb-2 text-center">
                ¡Venta Completada!
              </h3>

              <div class="bg-gray-50 p-6 rounded-lg mb-4">
                <!-- Order Information -->
                <div class="space-y-3">
                  <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-sm font-medium text-gray-600">ID de Venta:</span>
                    <span class="text-base font-bold text-gray-900">#{{ orderId }}</span>
                  </div>

                  <div v-if="orderNumber" class="flex justify-between items-center border-b pb-2">
                    <span class="text-sm font-medium text-gray-600">Número de Orden:</span>
                    <span class="text-base font-semibold text-gray-900">{{ orderNumber }}</span>
                  </div>

                  <div v-if="billingDocument" class="flex justify-between items-center border-b pb-2">
                    <span class="text-sm font-medium text-gray-600">Comprobante:</span>
                    <span class="text-base font-semibold text-blue-600">
                      {{ billingDocument.serie }}-{{ billingDocument.correlative }}
                    </span>
                  </div>

                  <!-- Mostrar redondeo si existe -->
                  <div v-if="roundingAmount && roundingAmount !== 0" class="flex justify-between items-center border-b pb-2">
                    <span class="text-sm font-medium text-gray-600">Subtotal:</span>
                    <span class="text-base font-semibold text-gray-900">{{ formatCurrency(totalBeforeRounding) }}</span>
                  </div>

                  <div v-if="roundingAmount && roundingAmount !== 0" class="flex justify-between items-center border-b pb-2">
                    <span class="text-sm font-medium text-gray-600">Redondeo:</span>
                    <span class="text-base font-semibold" :class="roundingAmount < 0 ? 'text-red-600' : 'text-green-600'">
                      {{ formatCurrency(roundingAmount) }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center pt-2">
                    <span class="text-sm font-medium text-gray-600">Total:</span>
                    <span class="text-2xl font-bold text-green-600">{{ formatCurrency(totalAfterRoundingDisplay) }}</span>
                  </div>
                </div>

                <!-- Success Message -->
                <div class="mt-4 text-center">
                  <p class="text-sm text-gray-600">
                    El comprobante de pago ha sido emitido correctamente.
                  </p>
                  <p v-if="billingDocument?.files?.pdf" class="text-xs text-gray-500 mt-2">
                    Puedes descargar o imprimir el comprobante usando los botones de abajo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            @click="closeModal"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:w-auto sm:text-sm"
          >
            Cerrar
          </button>
          <button
            v-if="billingDocument?.files?.pdf"
            @click="openPDF"
            class="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button
            v-if="billingDocument?.files?.pdf"
            @click="downloadPDF"
            class="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:w-auto sm:text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const props = defineProps({
  modelValue: Boolean,
  customer: Object,
  items: Array,
  subtotal: Number,
  tax: Number,
  total: Number,
  roundingAmount: Number, // Monto del redondeo aplicado
  totalAfterRounding: Number, // Total después del redondeo
  payments: Array,
  orderId: [Number, String],
  orderNumber: String,
  billingDocument: Object // Información del comprobante emitido {serie, correlativo, pdf_url, etc}
});

const emit = defineEmits(['update:modelValue']);

const store = computed(() => authStore.selectedStore);

const totalPaid = computed(() => {
  if (!props.payments) return 0;
  return props.payments.reduce((sum, payment) => sum + payment.amount, 0);
});

// Calcular valores con redondeo
const totalBeforeRounding = computed(() => props.total);
const totalAfterRoundingDisplay = computed(() => {
  // Si se pasó explícitamente totalAfterRounding, usarlo
  if (props.totalAfterRounding !== undefined && props.totalAfterRounding !== null) {
    return props.totalAfterRounding;
  }
  // Si hay redondeo, calcularlo
  if (props.roundingAmount !== undefined && props.roundingAmount !== null && props.roundingAmount !== 0) {
    return props.total + props.roundingAmount;
  }
  // Si no hay redondeo, usar total normal
  return props.total;
});

const closeModal = () => {
  emit('update:modelValue', false);
};

const openPDF = () => {
  if (props.billingDocument?.files?.pdf) {
    // Abrir el PDF en una nueva ventana/pestaña
    window.open(props.billingDocument.files.pdf, '_blank');
  }
};

const downloadPDF = () => {
  if (props.billingDocument?.files?.pdf) {
    // Crear un enlace temporal y hacer clic para descargar
    const link = document.createElement('a');
    link.href = props.billingDocument.files.pdf;
    link.download = `${props.billingDocument.serie}-${props.billingDocument.correlative}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const formatCurrency = (value) => {
  return `S/ ${parseFloat(value).toFixed(2)}`;
};
</script>
