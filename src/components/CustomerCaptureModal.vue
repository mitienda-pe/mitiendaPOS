<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end sm:items-center justify-center min-h-screen pt-4 px-0 sm:px-4 pb-0 sm:pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="handleCancel">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
        <div class="bg-white px-4 pt-4 pb-3 sm:p-6 sm:pb-4">
          <h3 class="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-1">
            {{ title }}
          </h3>
          <p class="text-sm text-gray-600 mb-4">{{ reason }}</p>

          <div class="mb-4">
            <label for="capture-doc" class="block text-sm font-medium text-gray-700 mb-2">
              {{ resolvedDocKind }} del cliente
            </label>
            <div class="flex gap-2">
              <input
                id="capture-doc"
                ref="docInput"
                v-model="documentNumber"
                type="text"
                inputmode="numeric"
                :maxlength="resolvedDocKind === 'RUC' ? 11 : 8"
                class="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                :placeholder="resolvedDocKind === 'RUC' ? '20123456789' : '12345678'"
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

          <div v-if="resolved" class="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-2">
            <p class="text-xs font-medium text-primary-700 mb-0.5">Cliente</p>
            <p class="text-sm font-semibold text-primary-900">{{ resolved.displayName }}</p>
            <p class="text-xs text-primary-700 mt-0.5">
              {{ resolvedDocKind }} {{ documentNumber }}
              <span v-if="resolved.source === 'sunat'"> · datos de {{ resolvedDocKind === 'RUC' ? 'SUNAT' : 'RENIEC' }}</span>
              <span v-else> · cliente registrado</span>
            </p>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            @click="handleCancel"
            class="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2.5 sm:py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
            Cancelar
          </button>
          <button
            @click="handleConfirm"
            :disabled="!resolved"
            class="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2.5 sm:py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
            Continuar con el cobro
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useDocumentLookup } from '../composables/useDocumentLookup';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // 'RUC' cuando la venta es factura, 'DNI' para boleta ≥ S/700
  docKind: { type: String, default: 'DNI' },
  title: { type: String, default: 'Falta el documento del cliente' },
  reason: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'captured']);

const { searching, error: lookupError, lookupDocument } = useDocumentLookup();

const documentNumber = ref('');
const resolved = ref(null);
const docInput = ref(null);

const resolvedDocKind = computed(() => (props.docKind === 'RUC' ? 'RUC' : 'DNI'));

const onDocumentInput = () => {
  documentNumber.value = documentNumber.value.replace(/\D/g, '');
  // Cambiar el número invalida lo resuelto: si no, se cobraría a nombre de
  // alguien distinto del que muestra la pantalla.
  resolved.value = null;
};

const searchDocument = async () => {
  if (!documentNumber.value || searching.value) return;

  resolved.value = null;
  const result = await lookupDocument(documentNumber.value, resolvedDocKind.value);

  if (result.found) resolved.value = result;
};

watch(() => props.modelValue, (value) => {
  if (!value) return;
  documentNumber.value = '';
  resolved.value = null;
  lookupError.value = null;
  nextTick(() => docInput.value?.focus());
});

const handleCancel = () => emit('update:modelValue', false);

const handleConfirm = () => {
  if (!resolved.value) return;
  emit('captured', resolved.value.record);
  emit('update:modelValue', false);
};
</script>
