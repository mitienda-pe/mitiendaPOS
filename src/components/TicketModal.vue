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

                  <div v-if="currentDocument" class="flex justify-between items-center border-b pb-2">
                    <span class="text-sm font-medium text-gray-600">Comprobante:</span>
                    <span class="text-base font-semibold text-primary-600">
                      {{ currentDocument.serie }}-{{ currentDocument.correlative }}
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
                  <p v-if="currentDocument" class="text-sm text-gray-600">
                    El comprobante de pago ha sido emitido correctamente.
                  </p>
                  <p v-else-if="canEmitManually" class="text-sm text-gray-600">
                    La venta se registró. Emite el comprobante cuando estés listo.
                  </p>
                  <p v-else class="text-sm text-gray-600">
                    La venta se registró correctamente.
                  </p>
                  <p v-if="currentDocument?.files?.pdf" class="text-xs text-gray-500 mt-2">
                    Puedes descargar o imprimir el comprobante usando los botones de abajo.
                  </p>
                </div>

                <!-- Error de emisión manual -->
                <div v-if="emitError" class="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded text-left">
                  <p class="text-sm text-red-700">{{ emitError }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            @click="closeModal"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:w-auto sm:text-sm"
          >
            Cerrar
          </button>
          <!-- Emitir comprobante (modo manual). Deshabilitado + tooltip cuando
               está delegado al ERP o no hay proveedor configurado. -->
          <button
            v-if="showEmitButton"
            @click="handleEmitDocument"
            :disabled="!canEmitManually || emitting"
            :title="emitDisabledReason"
            class="mt-3 sm:mt-0 w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="emitting" class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ emitting ? 'Emitiendo...' : 'Emitir comprobante' }}
          </button>
          <button
            v-if="currentDocument?.files?.pdf"
            @click="openPDF"
            class="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button
            v-if="currentDocument?.files?.pdf"
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
import { computed, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useBillingStore } from '../stores/billing';

const authStore = useAuthStore();
const billingStore = useBillingStore();

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

// Comprobante a mostrar: el emitido manualmente en este modal (si lo hubo)
// tiene prioridad sobre el que vino por props (auto-emisión).
const emittedDocument = ref(null);
const currentDocument = computed(() => emittedDocument.value || props.billingDocument);

// Estado del botón "Emitir comprobante" según el modo de facturación.
const canEmitManually = computed(() => authStore.isBillingManual && !currentDocument.value);
const billingDelegated = computed(() => authStore.isBillingDelegated);
const billingProviderMissing = computed(() => !authStore.hasBillingProvider && !authStore.isBillingDelegated);
const emitDisabledReason = computed(() => {
  if (billingDelegated.value) return 'La facturación está delegada al ERP; el comprobante se emite automáticamente.';
  if (billingProviderMissing.value) return 'Configura un proveedor de facturación electrónica para emitir comprobantes.';
  return '';
});
// Mostrar el botón cuando aún no hay comprobante y la tienda tiene algo que ver
// con facturación (manual, delegada o sin proveedor → deshabilitado + tooltip).
const showEmitButton = computed(() =>
  !currentDocument.value && (authStore.isBillingManual || billingDelegated.value || billingProviderMissing.value)
);

const emitError = ref(null);
const emitting = computed(() => billingStore.isEmitting);

const handleEmitDocument = async () => {
  if (!canEmitManually.value || !props.orderId) return;
  emitError.value = null;

  // El tipo de comprobante (boleta/factura) lo deriva el backend del
  // documento_id_facturacion de la orden; aquí solo pedimos la emisión.
  const result = await billingStore.emitDocument({
    order_id: Number(props.orderId),
    pdf_format: 'TICKET',
  });

  if (result.success) {
    emittedDocument.value = result.data;
  } else {
    emitError.value = result.error || 'No se pudo emitir el comprobante';
  }
};

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
  if (currentDocument.value?.files?.pdf) {
    // Abrir el PDF en una nueva ventana/pestaña
    window.open(currentDocument.value.files.pdf, '_blank');
  }
};

const downloadPDF = () => {
  if (currentDocument.value?.files?.pdf) {
    // Crear un enlace temporal y hacer clic para descargar
    const link = document.createElement('a');
    link.href = currentDocument.value.files.pdf;
    link.download = `${currentDocument.value.serie}-${currentDocument.value.correlative}.pdf`;
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
