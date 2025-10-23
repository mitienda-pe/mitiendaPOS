<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-2xl font-semibold mb-4 text-center">🔐 Autenticación de Cajero</h2>
        <p class="text-gray-600 text-center mb-6">Seleccione el cajero e ingrese su PIN de 4 dígitos</p>

        <!-- Sucursal y Caja (info) -->
        <div v-if="sucursalInfo" class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div class="text-sm text-blue-800">
            <p class="font-medium">📍 {{ sucursalInfo.nombre }}</p>
            <p>🖥️ Caja {{ cajaNumero }}</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Selección de Cajero -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Cajero *
            </label>
            <select
              ref="empleadoSelect"
              v-model="selectedEmpleado"
              @change="pinInput?.focus()"
              required
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Seleccione un cajero</option>
              <option
                v-for="empleado in empleados"
                :key="empleado.empleado_id"
                :value="empleado.empleado_id"
              >
                {{ empleado.empleado_nombres }} {{ empleado.empleado_apellidos }} ({{ empleado.empleado_rol }})
              </option>
            </select>
          </div>

          <!-- PIN -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              PIN de 4 dígitos *
            </label>
            <input
              ref="pinInput"
              v-model="pin"
              type="password"
              inputmode="numeric"
              pattern="[0-9]{4}"
              maxlength="4"
              required
              :disabled="!selectedEmpleado"
              name="cashier-pin"
              autocomplete="off"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-2xl text-center tracking-widest disabled:bg-gray-100"
              placeholder="••••"
              @input="handlePinInput"
            />
            <p class="text-xs text-gray-500 mt-1 text-center">
              Ingrese su PIN confidencial
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p class="text-sm text-red-700 text-center">{{ error }}</p>
            <div v-if="scheduleError" class="mt-3 text-xs text-gray-600 space-y-1">
              <p>⏰ Horario: {{ scheduleError.horario_inicio }} - {{ scheduleError.horario_fin }}</p>
              <p>🕐 Hora actual: {{ scheduleError.hora_actual }}</p>
            </div>
            <button
              v-if="scheduleError"
              type="button"
              @click="ignoreScheduleAndRetry"
              class="mt-3 w-full px-3 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded border border-yellow-300 transition-colors"
            >
              ⚠️ Ignorar horario y continuar
            </button>
          </div>

          <!-- Botones -->
          <div class="flex gap-3">
            <button
              v-if="!required"
              type="button"
              @click="handleCancel"
              :disabled="loading"
              class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="!isValid || loading"
              class="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Autenticando...' : 'Autenticar' }}
            </button>
          </div>
        </form>

        <!-- Info Box -->
        <div class="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p class="text-xs text-gray-600 text-center">
            🔒 El PIN es confidencial y personal. No lo comparta con nadie.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { posEmpleadosApi } from '../services/posEmpleadosApi';
import { useAuthStore } from '../stores/auth';
import { useCashierStore } from '../stores/cashier';

const props = defineProps({
  modelValue: Boolean,
  required: {
    type: Boolean,
    default: false
  },
  sucursalId: {
    type: Number,
    default: null
  },
  sucursalInfo: {
    type: Object,
    default: null
  },
  cajaNumero: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'authenticated']);

const authStore = useAuthStore();
const cashierStore = useCashierStore();

const empleados = ref([]);
const selectedEmpleado = ref('');
const pin = ref('');
const lastAttemptPin = ref(''); // Guardar el último PIN intentado para reintento
const loading = ref(false);
const error = ref(null);
const scheduleError = ref(null);
const empleadoSelect = ref(null);
const pinInput = ref(null);

const isValid = computed(() => {
  return selectedEmpleado.value && pin.value.length === 4;
});

// Cargar empleados de la sucursal
const loadEmpleados = async () => {
  try {
    const storeId = authStore.selectedStore?.id;
    if (!storeId) return;

    const response = await posEmpleadosApi.getAll(storeId);
    empleados.value = (response.data || []).filter(emp => emp.empleado_activo == 1);

    // Si solo hay un empleado activo, seleccionarlo automáticamente
    if (empleados.value.length === 1) {
      selectedEmpleado.value = empleados.value[0].empleado_id;
      nextTick(() => {
        pinInput.value?.focus();
      });
    }
  } catch (err) {
    console.error('Error cargando empleados:', err);
    error.value = 'Error al cargar empleados';
  }
};

// Auto-submit cuando el PIN es completado
const handlePinInput = () => {
  if (pin.value.length === 4 && selectedEmpleado.value) {
    // Auto-submit después de un breve delay
    setTimeout(() => {
      if (pin.value.length === 4) {
        handleSubmit();
      }
    }, 300);
  }
};

const handleSubmit = async (ignoreSchedule = false) => {
  if (!isValid.value || loading.value) return;

  // Guardar PIN para posible reintento
  if (!ignoreSchedule) {
    lastAttemptPin.value = pin.value;
  }

  error.value = null;
  scheduleError.value = null;
  loading.value = true;

  try {
    await cashierStore.authenticateCashier(
      parseInt(selectedEmpleado.value),
      ignoreSchedule ? lastAttemptPin.value : pin.value,
      props.sucursalId,
      props.cajaNumero,
      ignoreSchedule
    );

    // Actualizar info de sucursal si está disponible
    if (props.sucursalInfo) {
      cashierStore.setSucursal({
        id: props.sucursalId,
        ...props.sucursalInfo
      });
    }

    emit('authenticated', cashierStore.cashier);
    emit('update:modelValue', false);

    // Reset form
    selectedEmpleado.value = '';
    pin.value = '';
    lastAttemptPin.value = '';
  } catch (err) {
    // Mostrar mensaje del servidor si está disponible
    error.value = err.response?.data?.message || err.message || 'Error al autenticar';
    console.error('❌ Error de autenticación:', err);

    // Si es un error de horario (403), guardar la información adicional
    if (err.response?.status === 403 && err.response?.data?.empleado_horario_inicio) {
      scheduleError.value = {
        horario_inicio: err.response.data.empleado_horario_inicio,
        horario_fin: err.response.data.empleado_horario_fin,
        hora_actual: err.response.data.hora_actual
      };
    }

    pin.value = ''; // Limpiar PIN en caso de error
    nextTick(() => {
      pinInput.value?.focus();
    });
  } finally {
    loading.value = false;
  }
};

const ignoreScheduleAndRetry = () => {
  // Volver a intentar ignorando el horario con el PIN guardado
  handleSubmit(true);
};

const handleCancel = () => {
  if (loading.value) return;
  emit('update:modelValue', false);
};

// Auto-focus y cargar empleados cuando se abre el modal
watch(() => props.modelValue, (value) => {
  if (value) {
    loadEmpleados();
    error.value = null;
    selectedEmpleado.value = '';
    pin.value = '';
    nextTick(() => {
      empleadoSelect.value?.focus();
    });
  }
});

onMounted(() => {
  if (props.modelValue) {
    loadEmpleados();
  }
});
</script>
