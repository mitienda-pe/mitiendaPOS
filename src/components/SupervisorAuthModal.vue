<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>

      <!-- Center modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <div class="flex items-center justify-center w-12 h-12 mr-4 bg-yellow-100 rounded-full">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Autorización Requerida</h3>
              <p class="text-sm text-gray-500">PIN de Supervisor</p>
            </div>
          </div>
          <button
            v-if="!required"
            @click="cancel"
            class="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Message -->
        <div class="mb-6">
          <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p class="text-sm text-yellow-800">
              <strong>Acción:</strong> {{ actionMessage }}
            </p>
          </div>
        </div>

        <!-- PIN Input -->
        <div class="mb-6">
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Ingrese PIN de 6 dígitos
          </label>
          <div class="flex gap-2 justify-center mb-2">
            <input
              v-for="i in 6"
              :key="i"
              :ref="el => pinInputs[i-1] = el"
              v-model="pinDigits[i-1]"
              type="password"
              maxlength="1"
              inputmode="numeric"
              pattern="[0-9]"
              :name="`supervisor-pin-${i}`"
              autocomplete="off"
              class="w-12 h-14 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              @input="handleInput(i-1, $event)"
              @keydown="handleKeyDown(i-1, $event)"
              @paste="handlePaste"
            />
          </div>
          <p class="text-xs text-gray-500 text-center">
            Solo supervisores y administradores pueden autorizar esta acción
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6">
          <div class="p-3 bg-red-50 border border-red-200 rounded-md">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            @click="authorize"
            :disabled="!isComplete || loading"
            class="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validando...
            </span>
            <span v-else>Autorizar</span>
          </button>
          <button
            v-if="!required"
            @click="cancel"
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>

        <!-- Attempts counter -->
        <div v-if="attempts > 0" class="mt-4 text-center">
          <p class="text-xs text-gray-500">
            Intentos fallidos: {{ attempts }}/3
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { employeesApi } from '../services/employeesApi';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  action: {
    type: String,
    required: true,
    validator: (value) => [
      'remove_payment',
      'edit_cart_blocked',
      'remove_item_blocked',
      'apply_discount',
      'cancel_sale',
      'open_drawer'
    ].includes(value)
  },
  required: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'authorized', 'cancelled']);

// State
const pinDigits = ref(['', '', '', '', '', '']);
const pinInputs = ref([]);
const error = ref('');
const loading = ref(false);
const attempts = ref(0);

// Computed
const isComplete = computed(() => {
  return pinDigits.value.every(digit => digit !== '');
});

const pin = computed(() => {
  return pinDigits.value.join('');
});

const actionMessage = computed(() => {
  const messages = {
    'remove_payment': 'Eliminar un pago ya registrado',
    'edit_cart_blocked': 'Modificar carrito con pagos registrados',
    'remove_item_blocked': 'Quitar productos del carrito bloqueado',
    'apply_discount': 'Aplicar descuento mayor al permitido',
    'cancel_sale': 'Cancelar una venta con pagos',
    'open_drawer': 'Abrir cajón sin venta'
  };
  return messages[props.action] || 'Esta acción requiere autorización';
});

// Watch for modal open/close
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm();
    nextTick(() => {
      if (pinInputs.value[0]) {
        pinInputs.value[0].focus();
      }
    });
  }
});

// Methods
const handleInput = (index, event) => {
  const value = event.target.value;

  // Solo permitir números
  if (value && !/^\d$/.test(value)) {
    pinDigits.value[index] = '';
    return;
  }

  // Auto-focus siguiente input
  if (value && index < 5) {
    nextTick(() => {
      pinInputs.value[index + 1]?.focus();
    });
  }

  // Auto-submit si se completó el último dígito
  if (value && index === 5 && isComplete.value) {
    nextTick(() => {
      authorize();
    });
  }

  error.value = '';
};

const handleKeyDown = (index, event) => {
  // Backspace: borrar y volver al anterior
  if (event.key === 'Backspace' && !pinDigits.value[index] && index > 0) {
    pinInputs.value[index - 1]?.focus();
  }

  // Arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    pinInputs.value[index - 1]?.focus();
  }
  if (event.key === 'ArrowRight' && index < 5) {
    pinInputs.value[index + 1]?.focus();
  }

  // Enter: intentar autorizar
  if (event.key === 'Enter' && isComplete.value) {
    authorize();
  }

  // Escape: cancelar
  if (event.key === 'Escape' && !props.required) {
    cancel();
  }
};

const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = event.clipboardData.getData('text').trim();

  // Validar que sean 6 dígitos
  if (/^\d{6}$/.test(pastedData)) {
    pinDigits.value = pastedData.split('');
    nextTick(() => {
      pinInputs.value[5]?.focus();
      authorize();
    });
  }
};

const authorize = async () => {
  if (!isComplete.value || loading.value) return;

  console.log('🔐 [AUTH] Attempting authorization:', {
    pin: pin.value,
    action: props.action
  });

  loading.value = true;
  error.value = '';

  try {
    // Llamar al API real de validación de PIN
    const response = await employeesApi.validatePin(pin.value);

    console.log('🔐 [AUTH] API response:', response);

    // Si error === 0, significa éxito
    if (response.error === 0 && response.data) {
      const employee = response.data;

      // Verificar que tenga rol de supervisor o administrador
      if (['supervisor', 'administrador'].includes(employee.role)) {
        const authData = {
          employeeId: employee.id,
          employeeName: employee.name,
          role: employee.role,
          action: props.action,
          timestamp: new Date().toISOString()
        };

        console.log('✅ [AUTH] Authorization successful:', authData);

        emit('authorized', authData);
        emit('update:modelValue', false);
        attempts.value = 0;
      } else {
        // Empleado encontrado pero sin permisos de supervisor
        attempts.value++;
        error.value = `El usuario ${employee.name} no tiene permisos de supervisor`;
        console.warn('⚠️ [AUTH] Employee found but insufficient permissions:', employee.role);
        resetPin();
      }
    } else {
      // PIN incorrecto o empleado no encontrado
      attempts.value++;
      error.value = response.message || 'PIN incorrecto o empleado no encontrado';
      console.warn('⚠️ [AUTH] Invalid PIN or employee not found');

      // Bloquear después de 3 intentos
      if (attempts.value >= 3) {
        error.value = 'Demasiados intentos fallidos. Contacte al administrador.';
        setTimeout(() => {
          cancel();
        }, 3000);
      } else {
        resetPin();
      }
    }
  } catch (err) {
    attempts.value++;
    error.value = 'Error al validar PIN. Verifique su conexión.';
    console.error('❌ [AUTH] Error validating PIN:', err);

    if (attempts.value >= 3) {
      setTimeout(() => {
        cancel();
      }, 3000);
    } else {
      resetPin();
    }
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  emit('cancelled');
  emit('update:modelValue', false);
  attempts.value = 0;
};

const resetPin = () => {
  pinDigits.value = ['', '', '', '', '', ''];
  nextTick(() => {
    pinInputs.value[0]?.focus();
  });
};

const resetForm = () => {
  resetPin();
  error.value = '';
  loading.value = false;
};
</script>

<style scoped>
/* Animación para error shake */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.error-shake {
  animation: shake 0.5s;
}

/* Ocultar los puntos de password en algunos navegadores */
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}
</style>
