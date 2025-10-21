<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Abrir Turno de Caja
              </h3>

              <div class="mt-2">
                <p class="text-sm text-gray-500 mb-4">
                  Ingrese el monto inicial en efectivo que tiene en caja para iniciar el turno.
                </p>

                <!-- Cash Register Number -->
                <div class="mb-4">
                  <label for="caja-numero" class="block text-sm font-medium text-gray-700 mb-2">
                    Número de Caja (Opcional)
                  </label>
                  <input
                    id="caja-numero"
                    ref="cajaInput"
                    v-model="cajaNumero"
                    type="text"
                    placeholder="Ej: CAJA-01, POS-LIMA-01"
                    maxlength="50"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Deje en blanco si solo tiene una caja. Use identificadores como CAJA-01, POS-LIMA-01 para múltiples cajas.
                  </p>
                </div>

                <!-- Initial Amount -->
                <div class="mb-4">
                  <div class="flex justify-between items-center mb-2">
                    <label for="monto-inicial" class="block text-sm font-medium text-gray-700">
                      Monto Inicial en Efectivo *
                    </label>
                    <button
                      type="button"
                      @click="showBreakdown = !showBreakdown"
                      class="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      {{ showBreakdown ? 'Ocultar' : 'Desglosar' }} denominaciones
                    </button>
                  </div>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">S/</span>
                    <input
                      id="monto-inicial"
                      ref="montoInput"
                      v-model="montoInicial"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      :readonly="showBreakdown"
                      :class="[
                        'pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                        showBreakdown ? 'bg-gray-100 cursor-not-allowed' : ''
                      ]"
                      @keyup.enter="handleOpen"
                    />
                  </div>
                  <p v-if="showBreakdown" class="text-xs text-gray-500 mt-1">
                    El monto se calcula automáticamente del desglose
                  </p>
                </div>

                <!-- Desglose de denominaciones (opcional) -->
                <div v-if="showBreakdown" class="mb-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <h4 class="text-sm font-medium text-gray-700 mb-3">Arqueo - Conteo de denominaciones</h4>

                  <!-- Billetes -->
                  <div class="mb-3">
                    <h5 class="text-xs font-medium text-gray-600 mb-2 uppercase">Billetes</h5>
                    <div class="grid grid-cols-2 gap-2">
                      <div v-for="bill in DENOMINATIONS.bills" :key="bill" class="flex items-center space-x-2">
                        <label class="text-xs font-medium text-gray-700 w-16">S/ {{ bill }}</label>
                        <input
                          type="number"
                          v-model.number="denominationCounts[bill]"
                          min="0"
                          step="1"
                          placeholder="0"
                          class="flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                        />
                        <span class="text-xs text-gray-500 w-16 text-right">
                          S/ {{ (bill * (denominationCounts[bill] || 0)).toFixed(2) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Monedas -->
                  <div>
                    <h5 class="text-xs font-medium text-gray-600 mb-2 uppercase">Monedas</h5>
                    <div class="grid grid-cols-2 gap-2">
                      <div v-for="coin in DENOMINATIONS.coins" :key="coin" class="flex items-center space-x-2">
                        <label class="text-xs font-medium text-gray-700 w-16">S/ {{ coin.toFixed(2) }}</label>
                        <input
                          type="number"
                          v-model.number="denominationCounts[coin]"
                          min="0"
                          step="1"
                          placeholder="0"
                          class="flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                        />
                        <span class="text-xs text-gray-500 w-16 text-right">
                          S/ {{ (coin * (denominationCounts[coin] || 0)).toFixed(2) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Total del desglose -->
                  <div class="mt-3 pt-3 border-t border-gray-300">
                    <div class="flex justify-between items-center">
                      <span class="text-sm font-medium text-gray-700">Total contado:</span>
                      <span class="text-lg font-bold text-gray-900">S/ {{ breakdownTotal.toFixed(2) }}</span>
                    </div>

                    <!-- Diferencia (si la hay) -->
                    <div v-if="Math.abs(breakdownDifference) > 0.01" class="mt-2 p-2 rounded" :class="breakdownMatches ? 'bg-green-50' : 'bg-red-50'">
                      <div class="flex items-center justify-between text-sm">
                        <span :class="breakdownMatches ? 'text-green-700' : 'text-red-700'">
                          {{ breakdownMatches ? '✓ Coincide' : '✗ No coincide' }}
                        </span>
                        <span :class="breakdownMatches ? 'text-green-700 font-medium' : 'text-red-700 font-medium'">
                          Diferencia: S/ {{ Math.abs(breakdownDifference).toFixed(2) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div class="mb-4">
                  <label for="notas" class="block text-sm font-medium text-gray-700 mb-2">
                    Notas (Opcional)
                  </label>
                  <textarea
                    id="notas"
                    v-model="notas"
                    rows="3"
                    placeholder="Ej: Billetes de S/ 100 x 5, Monedas de S/ 1 x 20..."
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <!-- Info Box -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div class="flex">
                    <svg class="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="text-sm text-blue-700">
                      <p class="font-medium">Importante:</p>
                      <p class="mt-1">El monto inicial debe coincidir con el efectivo real que tiene en caja. Este será el punto de partida para el arqueo al cierre del turno.</p>
                    </div>
                  </div>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p class="text-sm text-red-700">{{ error }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            @click="handleOpen"
            :disabled="processing || !isValid"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="processing" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ processing ? 'Abriendo...' : 'Abrir Turno' }}
          </button>
          <button
            @click="handleCancel"
            :disabled="processing"
            class="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { DENOMINATIONS } from '../utils/cashDenominations.js';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'opened']);

const cajaNumero = ref('');
const montoInicial = ref(0);
const notas = ref('');
const processing = ref(false);
const error = ref(null);
const cajaInput = ref(null);
const montoInput = ref(null);

// Toggle para mostrar/ocultar desglose
const showBreakdown = ref(false);

// Contadores por denominación
const denominationCounts = ref({
  // Billetes
  200: 0,
  100: 0,
  50: 0,
  20: 0,
  10: 0,
  // Monedas
  5: 0,
  2: 0,
  1: 0,
  0.50: 0,
  0.20: 0,
  0.10: 0
});

// Calcular total del desglose
const breakdownTotal = computed(() => {
  let total = 0;
  for (const [denomination, count] of Object.entries(denominationCounts.value)) {
    total += parseFloat(denomination) * parseInt(count || 0);
  }
  return Math.round(total * 100) / 100;
});

// Diferencia entre monto declarado y desglose
const breakdownDifference = computed(() => {
  if (!showBreakdown.value) return 0;
  return Math.round((montoInicial.value - breakdownTotal.value) * 100) / 100;
});

// Verificar si el desglose coincide
const breakdownMatches = computed(() => {
  if (!showBreakdown.value) return true; // Si no usa desglose, siempre válido
  return Math.abs(breakdownDifference.value) < 0.01; // Tolerancia de 1 centavo
});

const isValid = computed(() => {
  if (montoInicial.value < 0) return false;
  if (showBreakdown.value && !breakdownMatches.value) return false;
  return true;
});

// Auto-focus on caja input when modal opens
watch(() => props.modelValue, (value) => {
  if (value) {
    nextTick(() => {
      cajaInput.value?.focus();
    });
    // Reset form
    cajaNumero.value = '';
    montoInicial.value = 0;
    notas.value = '';
    error.value = null;
    showBreakdown.value = false;
    // Reset denomination counts
    Object.keys(denominationCounts.value).forEach(key => {
      denominationCounts.value[key] = 0;
    });
  }
});

// Watch desglose para autocompletar monto inicial
watch(breakdownTotal, (newTotal) => {
  if (showBreakdown.value && newTotal > 0) {
    montoInicial.value = newTotal;
  }
});

const handleOpen = async () => {
  if (!isValid.value || processing.value) return;

  error.value = null;
  processing.value = true;

  try {
    const data = {
      cajaNumero: cajaNumero.value.trim() || null,
      montoInicial: parseFloat(montoInicial.value),
      notas: notas.value.trim()
    };

    // Si usó desglose, agregarlo
    if (showBreakdown.value) {
      data.breakdown = { ...denominationCounts.value };
    }

    emit('opened', data);
  } catch (err) {
    error.value = err.message || 'Error al abrir el turno';
  } finally {
    processing.value = false;
  }
};

const handleCancel = () => {
  if (processing.value) return;
  emit('update:modelValue', false);
};
</script>
