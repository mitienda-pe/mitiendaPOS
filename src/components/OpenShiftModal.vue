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

                <!-- Sucursal -->
                <div class="mb-4">
                  <label for="sucursal" class="block text-sm font-medium text-gray-700 mb-2">
                    Sucursal *
                  </label>
                  <select
                    id="sucursal"
                    ref="sucursalSelect"
                    v-model="selectedSucursal"
                    @change="loadCajasForSucursal"
                    required
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione una sucursal</option>
                    <option v-for="sucursal in sucursales" :key="sucursal.tiendadireccion_id" :value="sucursal.tiendadireccion_id">
                      {{ sucursal.tiendadireccion_nombresucursal }} ({{ sucursal.tiendadireccion_numero_cajas }} {{ sucursal.tiendadireccion_numero_cajas === 1 ? 'caja' : 'cajas' }})
                    </option>
                  </select>
                </div>

                <!-- Número de Caja -->
                <div class="mb-4">
                  <label for="caja-numero" class="block text-sm font-medium text-gray-700 mb-2">
                    Número de Caja *
                  </label>
                  <select
                    id="caja-numero"
                    ref="cajaSelect"
                    v-model="cajaNumero"
                    :disabled="!selectedSucursal || availableCajas.length === 0"
                    required
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{{ selectedSucursal ? 'Seleccione una caja' : 'Primero seleccione una sucursal' }}</option>
                    <option v-for="caja in availableCajas" :key="caja" :value="caja">
                      Caja {{ caja }}
                    </option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    Seleccione el número de caja física que va a utilizar
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
                <div v-if="showBreakdown" class="mb-4">
                  <CashBreakdownInput
                    v-model="denominationCounts"
                    title="Arqueo - Conteo de denominaciones"
                    total-label="Total contado"
                    @update:total="handleBreakdownTotal"
                  />
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
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { DENOMINATIONS } from '../utils/cashDenominations.js';
import CashBreakdownInput from './CashBreakdownInput.vue';
import { branchesApi } from '../services/branchesApi';
import { useAuthStore } from '../stores/auth';
import { useCashierStore } from '../stores/cashier';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'opened']);

const authStore = useAuthStore();
const cashierStore = useCashierStore();

const selectedSucursal = ref('');
const sucursales = ref([]);
const availableCajas = ref([]);
const cajaNumero = ref('');
const montoInicial = ref(0);
const notas = ref('');
const processing = ref(false);
const error = ref(null);
const sucursalSelect = ref(null);
const cajaSelect = ref(null);
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
  if (!selectedSucursal.value) return false;
  if (!cajaNumero.value) return false;
  if (montoInicial.value < 0) return false;
  if (showBreakdown.value && !breakdownMatches.value) return false;
  return true;
});

// Cargar sucursales con POS (filtradas por las asignadas al cajero)
const loadSucursales = async () => {
  try {
    const storeId = authStore.selectedStore?.id;
    if (!storeId) return;

    const response = await branchesApi.getAll(storeId, true); // con_pos=true
    const todasLasSucursales = response.data || [];

    // Filtrar solo las sucursales asignadas al cajero
    if (cashierStore.cashier?.sucursales_ids && Array.isArray(cashierStore.cashier.sucursales_ids)) {
      const sucursalesAsignadas = cashierStore.cashier.sucursales_ids.map(id => parseInt(id));

      if (sucursalesAsignadas.length > 0) {
        sucursales.value = todasLasSucursales.filter(sucursal =>
          sucursalesAsignadas.includes(sucursal.tiendadireccion_id)
        );

        console.log('🏪 [OpenShiftModal] Sucursales asignadas al cajero:', {
          todas: todasLasSucursales.length,
          asignadas: sucursales.value.length,
          ids: sucursalesAsignadas
        });
      } else {
        sucursales.value = todasLasSucursales;
        console.warn('⚠️ [OpenShiftModal] sucursales_ids está vacío, mostrando todas');
      }
    } else {
      // Si no hay cajero autenticado o no tiene sucursales asignadas, mostrar todas
      // (esto es un fallback, idealmente siempre debería haber cajero autenticado)
      sucursales.value = todasLasSucursales;
      console.warn('⚠️ [OpenShiftModal] No hay cajero autenticado o sin sucursales asignadas, mostrando todas');
    }
  } catch (err) {
    console.error('Error cargando sucursales:', err);
    error.value = 'Error al cargar sucursales';
  }
};

// Generar opciones de cajas según la sucursal seleccionada
const loadCajasForSucursal = () => {
  cajaNumero.value = ''; // Reset caja selection
  availableCajas.value = [];

  if (!selectedSucursal.value) return;

  const sucursal = sucursales.value.find(s => s.tiendadireccion_id === selectedSucursal.value);
  if (sucursal && sucursal.tiendadireccion_numero_cajas > 0) {
    availableCajas.value = Array.from({ length: sucursal.tiendadireccion_numero_cajas }, (_, i) => i + 1);
  }
};

// Auto-focus on sucursal select when modal opens
watch(() => props.modelValue, (value) => {
  if (value) {
    loadSucursales(); // Cargar sucursales al abrir modal
    nextTick(() => {
      sucursalSelect.value?.focus();
    });
    // Reset form
    selectedSucursal.value = '';
    cajaNumero.value = '';
    availableCajas.value = [];
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

const handleBreakdownTotal = (total) => {
  montoInicial.value = total;
};

const handleOpen = async () => {
  if (!isValid.value || processing.value) return;

  error.value = null;
  processing.value = true;

  try {
    const sucursal = sucursales.value.find(s => s.tiendadireccion_id === selectedSucursal.value);

    const data = {
      sucursalId: selectedSucursal.value,
      sucursalNombre: sucursal?.tiendadireccion_nombresucursal || '',
      cajaNumero: parseInt(cajaNumero.value),
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
