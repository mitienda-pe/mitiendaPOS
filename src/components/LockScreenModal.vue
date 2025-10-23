<template>
  <div v-if="modelValue" class="fixed inset-0 z-[9999] overflow-y-auto bg-gray-900 bg-opacity-95">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        <!-- Lock Icon -->
        <div class="flex justify-center mb-6">
          <div class="bg-indigo-100 rounded-full p-6">
            <svg class="w-16 h-16 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-center mb-2 text-gray-900">
          🔒 Caja Bloqueada
        </h2>

        <!-- Cashier Info -->
        <div v-if="cashierInfo" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-800 text-center">
            <strong>{{ cashierInfo.nombre }}</strong>
          </p>
          <p class="text-xs text-blue-600 text-center mt-1">
            {{ cashierInfo.sucursal }} - Caja {{ cashierInfo.cajaNumero }}
          </p>
          <p v-if="lockReason" class="text-xs text-gray-600 text-center mt-2 italic">
            {{ lockReason }}
          </p>
        </div>

        <p class="text-center text-gray-600 mb-6">
          Ingrese su PIN para desbloquear
        </p>

        <!-- PIN Input -->
        <div class="mb-6">
          <input
            ref="pinInput"
            v-model="pin"
            type="password"
            inputmode="numeric"
            pattern="[0-9]{4}"
            maxlength="4"
            required
            autofocus
            class="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-3xl text-center tracking-[1em] font-bold"
            :class="{ 'border-red-500 shake': error }"
            placeholder="••••"
            @keyup.enter="handleUnlock"
          />
          <p class="text-xs text-gray-500 mt-2 text-center">
            Ingrese su PIN de 4 dígitos
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 shake">
          <p class="text-sm text-red-700 text-center font-medium">{{ error }}</p>
        </div>

        <!-- Unlock Button -->
        <button
          @click="handleUnlock"
          :disabled="pin.length !== 4 || loading"
          class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? 'Desbloqueando...' : 'Desbloquear' }}</span>
        </button>

        <!-- Logout Option -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <button
            @click="handleLogout"
            :disabled="loading"
            class="w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useCashierStore } from '../stores/cashier';
import { useAuthStore } from '../stores/auth';
import { posEmpleadosApi } from '../services/posEmpleadosApi';

const props = defineProps({
  modelValue: Boolean,
  cashierInfo: Object,
  lockReason: String
});

const emit = defineEmits(['update:modelValue', 'unlocked']);

const authStore = useAuthStore();
const cashierStore = useCashierStore();

const pin = ref('');
const loading = ref(false);
const error = ref(null);
const pinInput = ref(null);

// Auto-focus when modal opens
watch(() => props.modelValue, (value) => {
  if (value) {
    pin.value = '';
    error.value = null;
    nextTick(() => {
      pinInput.value?.focus();
    });
  }
});

// Auto-submit cuando se completa el PIN
watch(pin, (value) => {
  if (value.length === 4) {
    error.value = null;
    setTimeout(() => {
      if (pin.value.length === 4) {
        handleUnlock();
      }
    }, 300);
  }
});

const handleUnlock = async () => {
  if (pin.value.length !== 4 || loading.value) return;

  error.value = null;
  loading.value = true;

  try {
    const storeId = authStore.selectedStore?.id;
    if (!storeId) throw new Error('No hay tienda seleccionada');

    const response = await posEmpleadosApi.validatePin(storeId, pin.value, true); // Ignorar horario

    if (!response.success) {
      throw new Error(response.message || 'PIN inválido');
    }

    // Verificar que el PIN sea del cajero autenticado
    // Convertir ambos a string para comparar (evitar problemas de tipo)
    const responseEmpleadoId = String(response.data.empleado_id);
    const currentEmpleadoId = String(cashierStore.cashier?.empleado_id);

    if (responseEmpleadoId !== currentEmpleadoId) {
      throw new Error('El PIN no corresponde al cajero autenticado');
    }

    // PIN válido, desbloquear
    emit('unlocked');
    emit('update:modelValue', false);
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'PIN incorrecto';
    pin.value = '';

    // Shake animation
    nextTick(() => {
      pinInput.value?.focus();
    });
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  if (confirm('¿Está seguro que desea cerrar sesión? Se perderá el turno actual.')) {
    authStore.logout();
  }
};
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.shake {
  animation: shake 0.5s;
}
</style>
