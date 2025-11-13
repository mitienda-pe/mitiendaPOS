<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Cerrar Turno de Caja
              </h3>

              <!-- Step 1: Closing Form (data first, matching opening flow) -->
              <div v-if="currentStep === 'closing' && shift" class="mt-2">
                <!-- Shift Summary -->
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-3">Resumen del Turno</h4>

                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p class="text-xs text-gray-500">Inicio</p>
                      <p class="text-sm font-medium">{{ formatDate(shift.fecha_apertura) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Monto Inicial</p>
                      <p class="text-sm font-medium">{{ formatCurrency(shift.monto_inicial) }}</p>
                    </div>
                  </div>

                  <div class="border-t pt-3">
                    <p class="text-xs text-gray-500 mb-2">Ventas del Turno</p>
                    <div class="space-y-2">
                      <div class="flex justify-between text-sm">
                        <span>Número de ventas:</span>
                        <span class="font-medium">{{ shift.numero_ventas || 0 }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span>Efectivo:</span>
                        <span class="font-medium">{{ formatCurrency(shift.total_efectivo) }}</span>
                      </div>
                      <div class="flex justify-between text-sm text-gray-600">
                        <span>Tarjeta:</span>
                        <span>{{ formatCurrency(shift.total_tarjeta) }}</span>
                      </div>
                      <div class="flex justify-between text-sm text-gray-600">
                        <span>Yape:</span>
                        <span>{{ formatCurrency(shift.total_yape) }}</span>
                      </div>
                      <div class="flex justify-between text-sm text-gray-600">
                        <span>Plin:</span>
                        <span>{{ formatCurrency(shift.total_plin) }}</span>
                      </div>
                      <div class="flex justify-between text-sm text-gray-600">
                        <span>Transferencia:</span>
                        <span>{{ formatCurrency(shift.total_transferencia) }}</span>
                      </div>
                      <div class="flex justify-between text-sm font-medium border-t pt-2">
                        <span>Total Ventas:</span>
                        <span>{{ formatCurrency(shift.total_ventas) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Expected Cash -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="text-sm font-medium text-blue-900">Efectivo Esperado en Caja</p>
                      <p class="text-xs text-blue-700 mt-1">
                        Inicial ({{ formatCurrency(shift.monto_inicial) }}) + Efectivo de ventas ({{ formatCurrency(shift.total_efectivo) }})
                      </p>
                    </div>
                    <p class="text-2xl font-bold text-blue-900">
                      {{ formatCurrency(expectedCash) }}
                    </p>
                  </div>
                </div>

                <!-- Real Cash Count -->
                <div class="mb-4">
                  <div class="flex justify-between items-center mb-2">
                    <label for="monto-real" class="block text-sm font-medium text-gray-700">
                      Efectivo Real Contado *
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
                      id="monto-real"
                      ref="montoInput"
                      v-model="montoReal"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      :readonly="showBreakdown"
                      :class="[
                        'pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-medium',
                        showBreakdown ? 'bg-gray-100 cursor-not-allowed' : ''
                      ]"
                      @input="calculateDifference"
                      @keyup.enter="handleClose"
                    />
                  </div>
                  <p v-if="!showBreakdown" class="text-xs text-gray-500 mt-1">
                    Cuente el efectivo real que tiene en caja y registre el monto exacto
                  </p>
                  <p v-else class="text-xs text-gray-500 mt-1">
                    El monto se calcula automáticamente del desglose
                  </p>
                </div>

                <!-- Desglose de denominaciones (opcional) -->
                <div v-if="showBreakdown" class="mb-4">
                  <CashBreakdownInput
                    v-model="denominationCounts"
                    :expected-amount="expectedCash"
                    title="Arqueo de Cierre - Conteo de denominaciones"
                    total-label="Efectivo Real Contado"
                    @update:total="handleBreakdownTotal"
                  />
                </div>

                <!-- Difference -->
                <div v-if="montoReal !== null && montoReal !== ''" class="mb-4 p-4 rounded-lg"
                     :class="differenceClass">
                  <div class="flex items-center">
                    <svg v-if="difference > 0" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <svg v-else-if="difference < 0" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    <svg v-else class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="flex-1">
                      <p class="text-sm font-medium">
                        {{ differenceLabel }}
                      </p>
                      <p class="text-2xl font-bold mt-1">
                        {{ formatCurrency(Math.abs(difference)) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div class="mb-4">
                  <label for="notas" class="block text-sm font-medium text-gray-700 mb-2">
                    Notas de Cierre (Opcional)
                  </label>
                  <textarea
                    id="notas"
                    v-model="notas"
                    rows="3"
                    placeholder="Ej: Observaciones, incidencias, billetes dañados..."
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p class="text-sm text-red-700">{{ error }}</p>
                </div>
              </div>

              <!-- Step 2: PIN Validation (after entering data) -->
              <div v-else-if="currentStep === 'pin'" class="mt-2">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p class="text-sm text-blue-800">
                    🔐 Confirme el cierre ingresando su PIN
                  </p>
                  <p v-if="cashierStore.cashier" class="text-xs text-blue-600 mt-1">
                    Cajero: {{ cashierStore.cashier.empleado_nombres}} {{ cashierStore.cashier.empleado_apellidos }}
                  </p>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Ingrese su PIN de 4 dígitos *
                  </label>
                  <input
                    ref="pinInput"
                    v-model="pin"
                    type="password"
                    inputmode="numeric"
                    pattern="[0-9]{4}"
                    maxlength="4"
                    required
                    name="close-shift-pin"
                    autocomplete="off"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl text-center tracking-widest"
                    placeholder="••••"
                  />
                  <p class="text-xs text-gray-500 mt-1 text-center">
                    El PIN se validará automáticamente
                  </p>
                </div>

                <!-- PIN Error Message -->
                <div v-if="pinError" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p class="text-sm text-red-700 text-center">{{ pinError }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <!-- Botones para ambos pasos -->
          <button
            @click="handleClose"
            :disabled="processing || (currentStep === 'closing' && !isValid)"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :class="currentStep === 'closing' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'"
          >
            <svg v-if="processing" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{
              processing ? 'Cerrando...' :
              currentStep === 'closing' ? '➡️ Continuar' :
              'Cerrar Turno'
            }}
          </button>

          <!-- Botón cancelar (disponible en ambos pasos) -->
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
import CashBreakdownInput from './CashBreakdownInput.vue';
import { useCashierStore } from '../stores/cashier';
import { useShiftStore } from '../stores/shift';
import { posEmpleadosApi } from '../services/posEmpleadosApi';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  modelValue: Boolean,
  shift: Object
});

const emit = defineEmits(['update:modelValue', 'shift-closed']);

const authStore = useAuthStore();
const cashierStore = useCashierStore();
const shiftStore = useShiftStore();

// Step control: 'closing' or 'pin'
// Start with 'closing' to match the opening flow (data first, then PIN)
const currentStep = ref('closing');
const pin = ref('');
const pinError = ref(null);
const pinInput = ref(null);

const montoReal = ref(null);
const notas = ref('');
const processing = ref(false);
const error = ref(null);
const difference = ref(0);
const montoInput = ref(null);

// Toggle para mostrar/ocultar desglose
const showBreakdown = ref(false);

// Contadores por denominación
const denominationCounts = ref({
  200: 0, 100: 0, 50: 0, 20: 0, 10: 0,
  5: 0, 2: 0, 1: 0, 0.50: 0, 0.20: 0, 0.10: 0
});

const expectedCash = computed(() => {
  if (!props.shift) return 0;
  return props.shift.monto_inicial + props.shift.total_efectivo;
});

const isValid = computed(() => {
  return montoReal.value !== null && montoReal.value >= 0;
});

const differenceClass = computed(() => {
  if (difference.value > 0) return 'bg-green-50 border border-green-200 text-green-700';
  if (difference.value < 0) return 'bg-red-50 border border-red-200 text-red-700';
  return 'bg-blue-50 border border-blue-200 text-blue-700';
});

const differenceLabel = computed(() => {
  if (difference.value > 0) return 'Sobrante';
  if (difference.value < 0) return 'Faltante';
  return 'Cuadrado Perfecto';
});

// Validar PIN del cajero actual
const validatePin = async () => {
  console.log('🔐 [CloseShiftModal] validatePin() llamado', {
    pinLength: pin.value.length,
    processing: processing.value,
    currentStep: currentStep.value
  });

  if (pin.value.length !== 4 || processing.value) return;

  pinError.value = null;
  processing.value = true;

  try {
    const storeId = authStore.selectedStore?.id;
    if (!storeId) throw new Error('No hay tienda seleccionada');

    console.log('📡 [CloseShiftModal] Validando PIN en servidor...', {
      storeId,
      pin: '****'
    });

    const response = await posEmpleadosApi.validatePin(storeId, pin.value);

    if (!response.success) {
      throw new Error(response.message || 'PIN inválido');
    }

    // Verificar que el PIN sea del cajero actualmente autenticado
    // Convertir ambos a string para comparar (evitar problemas de tipo)
    const responseEmpleadoId = String(response.data.empleado_id);
    const currentEmpleadoId = String(cashierStore.cashier?.empleado_id);

    console.log('🔍 [CloseShiftModal] Validando empleado:', {
      responseEmpleadoId,
      currentEmpleadoId,
      cashierStore: cashierStore.cashier,
      response: response.data,
      match: responseEmpleadoId === currentEmpleadoId
    });

    if (responseEmpleadoId !== currentEmpleadoId) {
      throw new Error('Debe usar el PIN del cajero que abrió el turno');
    }

    // PIN válido - AHORA CERRAR EL TURNO
    console.log('✅ [CloseShiftModal] PIN válido, cerrando turno...');

    const data = {
      montoReal: parseFloat(montoReal.value),
      notas: notas.value.trim(),
      pin: pin.value  // ✅ FIX: Incluir PIN para validación en backend
    };

    // Si usó desglose, agregarlo
    if (showBreakdown.value) {
      data.breakdown = { ...denominationCounts.value };
    }

    console.log('📤 [CloseShiftModal] Emitiendo evento "shift-closed"', { ...data, pin: '****' });
    emit('shift-closed', data);

  } catch (err) {
    console.error('❌ [CloseShiftModal] Error al validar PIN:', err);
    pinError.value = err.response?.data?.message || err.message || 'Error al validar PIN';
    pin.value = '';
    nextTick(() => {
      pinInput.value?.focus();
    });
  } finally {
    processing.value = false;
  }
};

// Auto-submit PIN cuando tenga 4 dígitos
watch(pin, (value) => {
  console.log('🔢 [CloseShiftModal] PIN ingresado:', value.length, 'dígitos');
  if (value.length === 4) {
    console.log('⏰ [CloseShiftModal] PIN completo, esperando 300ms para validar...');
    setTimeout(() => {
      if (pin.value.length === 4) {
        console.log('✅ [CloseShiftModal] Llamando validatePin()');
        validatePin();
      }
    }, 300);
  }
});

// Auto-focus and reset when modal opens
watch(() => props.modelValue, async (value) => {
  if (value) {
    console.log('🔔 [CloseShiftModal] Modal ABIERTO', {
      shift: props.shift ? {
        id: props.shift.id,
        tienda_id: props.shift.tienda_id,
        caja_numero: props.shift.caja_numero,
        monto_inicial: props.shift.monto_inicial,
        estado: props.shift.estado
      } : null,
      cashier: cashierStore.cashier ? {
        empleado_id: cashierStore.cashier.empleado_id,
        nombre: cashierStore.cashier.empleado_nombres
      } : null,
      user: authStore.user ? {
        name: authStore.user.name,
        role: authStore.user.role
      } : null,
      store: authStore.store ? {
        id: authStore.store.id,
        name: authStore.store.name
      } : null
    });

    // FIX: Refrescar datos del turno antes de cerrar para evitar trabajar con datos desactualizados
    console.log('🔄 [CloseShiftModal] Refrescando datos del turno activo...');
    await shiftStore.fetchActiveShift();
    console.log('✅ [CloseShiftModal] Datos del turno actualizados');

    // Reset to closing step (data first, matching opening flow)
    currentStep.value = 'closing';
    pin.value = '';
    pinError.value = null;

    console.log('📋 [CloseShiftModal] Estado inicial: paso =', currentStep.value);

    nextTick(() => {
      montoInput.value?.focus();
    });

    // Reset form
    montoReal.value = null;
    notas.value = '';
    error.value = null;
    difference.value = 0;
    showBreakdown.value = false;
    // Reset denomination counts
    Object.keys(denominationCounts.value).forEach(key => {
      denominationCounts.value[key] = 0;
    });
  } else {
    console.log('❌ [CloseShiftModal] Modal CERRADO');
  }
});

const calculateDifference = () => {
  if (montoReal.value !== null && montoReal.value !== '') {
    difference.value = parseFloat(montoReal.value) - expectedCash.value;
  } else {
    difference.value = 0;
  }
};

const handleBreakdownTotal = (total) => {
  montoReal.value = total;
  calculateDifference();
};

const handleClose = async () => {
  console.log('🔘 [CloseShiftModal] Botón presionado', {
    paso_actual: currentStep.value,
    isValid: isValid.value,
    processing: processing.value,
    montoReal: montoReal.value
  });

  if (!isValid.value || processing.value) return;

  // If still on closing step, advance to PIN validation
  if (currentStep.value === 'closing') {
    console.log('➡️ [CloseShiftModal] Avanzando de paso "closing" a "pin"');
    currentStep.value = 'pin';
    await nextTick();
    pinInput.value?.focus();
    console.log('🔑 [CloseShiftModal] Esperando ingreso de PIN...');
    return;
  }

  // If on PIN step (should not reach here, PIN auto-submits)
  console.log('💾 [CloseShiftModal] Procesando cierre final (este código no debería ejecutarse normalmente)');
  error.value = null;
  processing.value = true;

  try {
    const data = {
      montoReal: parseFloat(montoReal.value),
      notas: notas.value.trim(),
      pin: pin.value  // ✅ FIX: Incluir PIN para validación en backend
    };

    // Si usó desglose, agregarlo
    if (showBreakdown.value) {
      data.breakdown = { ...denominationCounts.value };
    }

    console.log('📤 [CloseShiftModal] Emitiendo evento "shift-closed"', { ...data, pin: '****' });
    emit('shift-closed', data);
  } catch (err) {
    console.error('❌ [CloseShiftModal] Error al cerrar:', err);
    error.value = err.message || 'Error al cerrar el turno';
  } finally {
    processing.value = false;
  }
};

const handleCancel = () => {
  console.log('🚫 [CloseShiftModal] Botón CANCELAR presionado');
  if (processing.value) return;
  emit('update:modelValue', false);
};

const formatCurrency = (value) => {
  return `S/ ${parseFloat(value || 0).toFixed(2)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
