<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end sm:items-center justify-center min-h-screen pt-4 px-0 sm:px-4 pb-0 sm:pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="handleCancel">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-white px-4 pt-4 pb-3 sm:p-6 sm:pb-4">
          <h3 class="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-1">
            Emitir comprobante
          </h3>
          <p v-if="orderCode" class="text-xs text-gray-500 mb-4">Venta {{ orderCode }}</p>

          <!-- Éxito -->
          <div v-if="emitted" class="text-center py-4">
            <svg class="h-12 w-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-base font-medium text-gray-900">
              {{ docTypeLabel }} {{ emitted.serie }}-{{ emitted.correlative }}
            </p>
            <p class="text-sm text-gray-600 mt-1">El comprobante se emitió correctamente.</p>
          </div>

          <template v-else>
            <!-- Tipo de comprobante -->
            <div class="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                @click="setDocType('boleta')"
                :class="[
                  'rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  docType === 'boleta'
                    ? 'border-primary-500 bg-primary-50 text-primary-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]">
                Boleta
              </button>
              <button
                type="button"
                @click="setDocType('factura')"
                :class="[
                  'rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  docType === 'factura'
                    ? 'border-primary-500 bg-primary-50 text-primary-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]">
                Factura
              </button>
            </div>

            <!-- Documento del cliente -->
            <div class="mb-4">
              <label for="emit-doc" class="block text-sm font-medium text-gray-700 mb-2">
                {{ docKind }} del cliente
                <span v-if="docType === 'factura'" class="text-red-500">*</span>
                <span v-else class="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div class="flex gap-2">
                <input
                  id="emit-doc"
                  ref="docInput"
                  v-model="documentNumber"
                  type="text"
                  inputmode="numeric"
                  :maxlength="docKind === 'RUC' ? 11 : 8"
                  class="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  :placeholder="docKind === 'RUC' ? '20123456789' : '12345678'"
                  @input="onDocumentInput"
                  @keyup.enter="searchDocument"
                />
                <button
                  type="button"
                  @click="searchDocument"
                  :disabled="searching || !documentNumber"
                  class="px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ searching ? 'Buscando...' : 'Buscar' }}
                </button>
              </div>
              <p v-if="lookupError" class="text-sm text-red-600 mt-1">{{ lookupError }}</p>
            </div>

            <!-- Cliente resuelto -->
            <div v-if="resolvedCustomer" class="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
              <p class="text-xs font-medium text-primary-700 mb-0.5">Se emitirá a nombre de</p>
              <p class="text-sm font-semibold text-primary-900">{{ resolvedName }}</p>
              <p class="text-xs text-primary-700 mt-0.5">
                {{ docKind }} {{ resolvedCustomer.document_number }}
                <span v-if="lookupSource === 'sunat'"> · datos de {{ docKind === 'RUC' ? 'SUNAT' : 'RENIEC' }}</span>
                <span v-else-if="lookupSource === 'db'"> · cliente registrado</span>
              </p>
            </div>

            <div v-else-if="docType === 'boleta'" class="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <p class="text-sm text-gray-600">
                Sin documento se emite una boleta a consumidor final.
              </p>
            </div>

            <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </template>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            @click="handleCancel"
            :disabled="processing"
            class="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2.5 sm:py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-50">
            {{ emitted ? 'Cerrar' : 'Cancelar' }}
          </button>
          <button
            v-if="!emitted"
            @click="handleEmit"
            :disabled="processing || !canEmit"
            class="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2.5 sm:py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
            <svg v-if="processing" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ processing ? 'Emitiendo...' : `Emitir ${docTypeLabel.toLowerCase()}` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useDocumentLookup } from '../composables/useDocumentLookup';
import { ordersApi } from '../services/ordersApi';
import { useBillingStore } from '../stores/billing';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  orderId: { type: [Number, String], default: null },
  // Código legible de la venta, solo para mostrar en el encabezado
  orderCode: { type: String, default: '' },
  // Tipo con el que abre el modal; el cajero puede cambiarlo
  initialDocumentType: { type: String, default: 'boleta' },
  // Documento que ya trae la venta, si lo hay
  initialDocumentNumber: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'emitted']);

const billingStore = useBillingStore();
const { searching, error: lookupError, lookupDocument } = useDocumentLookup();

const docType = ref('boleta');
const documentNumber = ref('');
const resolvedCustomer = ref(null);
const resolvedName = ref('');
const lookupSource = ref(null);
const processing = ref(false);
const error = ref(null);
const emitted = ref(null);
const docInput = ref(null);

const docKind = computed(() => (docType.value === 'factura' ? 'RUC' : 'DNI'));
const docTypeLabel = computed(() => (docType.value === 'factura' ? 'Factura' : 'Boleta'));

// Una factura no sale sin RUC resuelto. Una boleta sí: sin documento es
// consumidor final, que es el caso más común en mostrador.
const canEmit = computed(() => {
  if (docType.value === 'factura') return !!resolvedCustomer.value;
  return true;
});

const setDocType = (value) => {
  if (docType.value === value) return;
  docType.value = value;
  // El documento cambia de forma (8 vs 11 dígitos), así que se descarta lo resuelto
  clearResolved();
  documentNumber.value = '';
  error.value = null;
  nextTick(() => docInput.value?.focus());
};

const clearResolved = () => {
  resolvedCustomer.value = null;
  resolvedName.value = '';
  lookupSource.value = null;
  lookupError.value = null;
};

// Editar el documento invalida el cliente ya resuelto: si no, se podría emitir a
// nombre de alguien con un número distinto en pantalla.
const onDocumentInput = () => {
  documentNumber.value = documentNumber.value.replace(/\D/g, '');
  if (resolvedCustomer.value) clearResolved();
};

const searchDocument = async () => {
  if (!documentNumber.value || searching.value) return;

  clearResolved();
  const result = await lookupDocument(documentNumber.value, docKind.value);

  if (result.found) {
    resolvedCustomer.value = result.customer;
    resolvedName.value = result.displayName;
    lookupSource.value = result.source;
  }
};

const reset = () => {
  docType.value = props.initialDocumentType === 'factura' ? 'factura' : 'boleta';
  documentNumber.value = (props.initialDocumentNumber || '').replace(/\D/g, '');
  clearResolved();
  error.value = null;
  emitted.value = null;
  processing.value = false;
};

watch(() => props.modelValue, (value) => {
  if (!value) return;

  reset();
  nextTick(() => docInput.value?.focus());

  // Si la venta ya traía documento, resolverlo solo para ahorrarle el paso al cajero
  if (documentNumber.value) searchDocument();
});

const handleCancel = () => {
  if (processing.value) return;
  emit('update:modelValue', false);
};

const handleEmit = async () => {
  if (!canEmit.value || processing.value || !props.orderId) return;

  processing.value = true;
  error.value = null;

  try {
    // Paso 1: fijar el receptor en la venta. Solo si hay datos nuevos que fijar —
    // una boleta a consumidor final se emite con lo que ya tiene la orden.
    if (resolvedCustomer.value) {
      await ordersApi.updateBillingCustomer(props.orderId, {
        documentType: docType.value,
        customer: resolvedCustomer.value
      });
    }

    // Paso 2: emitir. document_type del emit es 1=Factura / 2=Boleta, al revés
    // que documento_id_facturacion en la orden.
    const result = await billingStore.emitDocument({
      order_id: props.orderId,
      document_type: docType.value === 'factura' ? 1 : 2,
      pdf_format: 'TICKET'
    });

    if (!result.success) {
      error.value = result.error || 'No se pudo emitir el comprobante.';
      return;
    }

    emitted.value = {
      serie: result.data?.serie ?? result.data?.series ?? '',
      correlative: result.data?.correlative ?? result.data?.correlativo ?? ''
    };

    emit('emitted', { ...emitted.value, documentType: docType.value, data: result.data });
  } catch (err) {
    error.value = err.response?.data?.message
      || err.response?.data?.messages?.error
      || 'No se pudo emitir el comprobante.';
  } finally {
    processing.value = false;
  }
};
</script>
