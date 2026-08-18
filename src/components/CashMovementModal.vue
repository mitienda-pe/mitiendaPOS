<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end sm:items-center justify-center min-h-screen pt-4 px-0 sm:px-4 pb-0 sm:pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="handleCancel">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-white px-4 pt-4 pb-3 sm:p-6 sm:pb-4">
          <h3 class="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-3 sm:mb-4">
            {{ isIncome ? 'Registrar ingreso de efectivo' : 'Registrar retiro de efectivo' }}
          </h3>

          <!-- Tipo -->
          <div class="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              @click="setTipo('entrada')"
              :class="[
                'rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors',
                isIncome
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              ]">
              Ingreso
            </button>
            <button
              type="button"
              @click="setTipo('salida')"
              :class="[
                'rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors',
                !isIncome
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              ]">
              Retiro
            </button>
          </div>

          <!-- Monto -->
          <div class="mb-4">
            <label for="movimiento-monto" class="block text-sm font-medium text-gray-700 mb-2">
              Monto *
            </label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">S/</span>
              </div>
              <input
                id="movimiento-monto"
                ref="montoInput"
                v-model="monto"
                type="number"
                inputmode="decimal"
                min="0"
                step="0.10"
                class="block w-full pl-10 pr-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
            <p v-if="!isIncome && availableCash !== null" class="text-xs text-gray-500 mt-1">
              Disponible en caja: S/ {{ availableCash.toFixed(2) }}
            </p>
          </div>

          <!-- Concepto -->
          <div class="mb-4">
            <label for="movimiento-concepto" class="block text-sm font-medium text-gray-700 mb-2">
              Concepto *
            </label>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <button
                v-for="preset in presets"
                :key="preset"
                type="button"
                @click="concepto = preset"
                :class="[
                  'px-2.5 py-1 rounded-full border text-xs font-medium transition-colors',
                  concepto === preset
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                ]">
                {{ preset }}
              </button>
            </div>
            <input
              id="movimiento-concepto"
              v-model="concepto"
              type="text"
              maxlength="200"
              class="block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Ej. Retiro a bóveda"
            />
          </div>

          <!-- Notas -->
          <div class="mb-4">
            <label for="movimiento-notas" class="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              id="movimiento-notas"
              v-model="notas"
              rows="2"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Nº de operación, a quién se entregó, etc."
            ></textarea>
          </div>

          <div class="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
            <p class="text-sm text-primary-700">
              El movimiento queda registrado a tu nombre y
              {{ isIncome ? 'suma al' : 'resta del' }} efectivo esperado al cierre del turno.
            </p>
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            @click="handleCancel"
            :disabled="processing"
            class="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2.5 sm:py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmit"
            :disabled="processing || !isValid"
            :class="[
              'w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2.5 sm:py-2 text-sm font-medium text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
              isIncome ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
            ]"
          >
            <svg v-if="processing" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ processing ? 'Registrando...' : (isIncome ? 'Registrar ingreso' : 'Registrar retiro') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { cashMovementsApi } from '@/services/cashMovementsApi';

const PRESETS = {
  entrada: ['Fondo de cambio', 'Reposición de sencillo', 'Devolución de préstamo'],
  salida: ['Retiro a bóveda', 'Depósito bancario', 'Pago a proveedor', 'Gasto menor']
};

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  shiftId: { type: [Number, String], default: null },
  // Tipo con el que se abre el modal ('entrada' | 'salida'); se puede cambiar dentro.
  initialTipo: { type: String, default: 'entrada' },
  // Efectivo disponible en caja. Si viene, no se permite retirar más que eso.
  availableCash: { type: Number, default: null }
});

const emit = defineEmits(['update:modelValue', 'registered']);

const tipo = ref(props.initialTipo === 'salida' ? 'salida' : 'entrada');
const monto = ref('');
const concepto = ref('');
const notas = ref('');
const processing = ref(false);
const error = ref(null);
const montoInput = ref(null);

const isIncome = computed(() => tipo.value === 'entrada');
const presets = computed(() => PRESETS[tipo.value]);
const montoNumber = computed(() => {
  const parsed = parseFloat(monto.value);
  return Number.isFinite(parsed) ? parsed : 0;
});

const isValid = computed(() => {
  if (montoNumber.value <= 0) return false;
  if (!concepto.value.trim()) return false;
  if (!props.shiftId) return false;
  return true;
});

const setTipo = (value) => {
  if (tipo.value === value) return;
  tipo.value = value;
  concepto.value = ''; // los presets del otro tipo no aplican
  error.value = null;
};

const reset = () => {
  tipo.value = props.initialTipo === 'salida' ? 'salida' : 'entrada';
  monto.value = '';
  concepto.value = '';
  notas.value = '';
  error.value = null;
  processing.value = false;
};

watch(() => props.modelValue, (value) => {
  if (value) {
    reset();
    nextTick(() => montoInput.value?.focus());
  }
});

const handleCancel = () => {
  if (processing.value) return;
  emit('update:modelValue', false);
};

const handleSubmit = async () => {
  if (!isValid.value || processing.value) return;

  // No se puede sacar de la caja más efectivo del que hay. El backend no lo
  // valida (aceptaría un esperado negativo), así que se corta acá.
  if (!isIncome.value && props.availableCash !== null && montoNumber.value > props.availableCash) {
    error.value = `No puedes retirar más de S/ ${props.availableCash.toFixed(2)}, que es el efectivo disponible en caja.`;
    return;
  }

  processing.value = true;
  error.value = null;

  try {
    const amount = Math.round(montoNumber.value * 100) / 100;
    const trimmedNotes = notas.value.trim() || null;

    const response = isIncome.value
      ? await cashMovementsApi.registerIncome(props.shiftId, amount, concepto.value.trim(), trimmedNotes)
      : await cashMovementsApi.registerWithdrawal(props.shiftId, amount, concepto.value.trim(), trimmedNotes);

    emit('registered', response.data);
    emit('update:modelValue', false);
  } catch (err) {
    error.value = err.response?.data?.message
      || err.response?.data?.messages?.error
      || 'No se pudo registrar el movimiento. Intenta nuevamente.';
  } finally {
    processing.value = false;
  }
};
</script>
