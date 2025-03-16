<template>
  <div v-if="modelValue" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Añadir Pago</h3>
                <button 
                  @click="closeModal" 
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- Resumen de la venta -->
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex justify-between mb-2">
                  <span class="font-medium">Total a pagar:</span>
                  <span class="font-bold text-lg">{{ formatCurrency(total) }}</span>
                </div>
                <div class="flex justify-between mb-2">
                  <span class="font-medium">Saldo pendiente:</span>
                  <span class="font-bold text-lg" :class="remainingAmount === 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(remainingAmount) }}
                  </span>
                </div>
                <div v-if="customer" class="text-sm text-gray-600">
                  Cliente: {{ customer.razonSocial || `${customer.nombres} ${customer.apellidos}` }}
                </div>
              </div>
              
              <!-- Selección de método de pago -->
              <div class="mb-4">
                <div class="font-medium mb-2">Método de pago:</div>
                <div class="grid grid-cols-3 gap-3">
                  <button 
                    @click="selectPaymentMethod('efectivo')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                      paymentMethod === 'efectivo' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-100 hover:bg-green-200 text-green-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                      <circle cx="12" cy="12" r="2"></circle>
                      <path d="M6 12h.01M18 12h.01"></path>
                    </svg>
                    Efectivo
                  </button>
                  <button 
                    @click="selectPaymentMethod('tarjeta')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                      paymentMethod === 'tarjeta' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Tarjeta
                  </button>
                  <button 
                    @click="selectPaymentMethod('qr')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                      paymentMethod === 'qr' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <rect x="7" y="7" width="3" height="3"></rect>
                      <rect x="14" y="7" width="3" height="3"></rect>
                      <rect x="7" y="14" width="3" height="3"></rect>
                      <rect x="14" y="14" width="3" height="3"></rect>
                    </svg>
                    QR
                  </button>
                  <button 
                    @click="selectPaymentMethod('credito')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                      paymentMethod === 'credito' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="8" width="18" height="4" rx="1" />
                      <path d="M12 8v13" />
                      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                    </svg>
                    Crédito
                  </button>
                  <button 
                    @click="selectPaymentMethod('giftcard')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                      paymentMethod === 'giftcard' 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-pink-100 hover:bg-pink-200 text-pink-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 12 20 22 4 22 4 12"></polyline>
                      <rect x="2" y="7" width="20" height="5"></rect>
                      <line x1="12" y1="22" x2="12" y2="7"></line>
                    </svg>
                    Gift Card
                  </button>
                  <button 
                    @click="selectPaymentMethod('puntos')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                      paymentMethod === 'puntos' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      <path d="M2 17l10 5 10-5"></path>
                      <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    Puntos
                  </button>
                </div>
              </div>
              
              <div v-if="paymentMethod" class="mb-4 p-3 border rounded-lg">
                <!-- Campos específicos según el método de pago -->
                <div v-if="paymentMethod === 'efectivo'" class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Monto entregado</label>
                  <input 
                    type="number" 
                    v-model="cashAmount" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    step="0.01"
                    @input="calculateChange"
                  />
                  <div class="flex justify-between mt-2">
                    <span class="text-sm font-medium">Cambio:</span>
                    <span class="text-sm font-medium" :class="change >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ formatCurrency(change) }}
                    </span>
                  </div>
                </div>
                
                <div v-if="paymentMethod === 'tarjeta'" class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Monto cargado</label>
                  <input 
                    type="number" 
                    v-model="paymentAmount" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    step="0.01"
                  />
                  <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">Código de autorización</label>
                  <input 
                    type="text" 
                    v-model="cardCode" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                
                <!-- QR -->
                <div v-if="paymentMethod === 'qr'" class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Monto pagado</label>
                  <input 
                    type="number" 
                    v-model="paymentAmount" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    step="0.01"
                  />
                  <div class="text-center mt-3">
                    <div class="mb-2 font-medium">Escanea para pagar</div>
                    <div class="flex justify-center mb-3">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=POS2-Payment" 
                        alt="QR Code" 
                        class="border p-2 rounded-lg"
                      />
                    </div>
                    <div class="text-sm text-gray-600">
                      Este es un QR ficticio para demostración
                    </div>
                  </div>
                </div>
                
                <div v-if="paymentMethod === 'giftcard'" class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Monto a cargar</label>
                  <input 
                    type="number" 
                    v-model="paymentAmount" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    step="0.01"
                  />
                  <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">Código de Gift Card</label>
                  <input 
                    type="text" 
                    v-model="giftCardCode" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              
              <div class="flex flex-col gap-3 mt-6">
                <button 
                  v-if="paymentMethod"
                  @click="addPayment" 
                  :class="[
                    'btn py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center',
                    isPaymentValid
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  ]"
                  :disabled="!isPaymentValid"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                  Añadir Pago
                </button>
                
                <button 
                  @click="closeModal" 
                  class="btn py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors duration-200 flex items-center justify-center"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  total: Number,
  customer: Object,
  items: Array,
  remainingAmount: Number
});

const emit = defineEmits(['update:modelValue', 'payment-added']);

// Estado del formulario
const paymentMethod = ref('');
const paymentAmount = ref(0);
const cashAmount = ref(0);
const change = ref(0);
const cardCode = ref('');
const giftCardCode = ref('');
const currentReference = ref('');

// Validaciones
const isPaymentValid = computed(() => {
  if (!paymentMethod.value) return false;
  
  // Validar que el monto sea mayor que cero
  if (paymentMethod.value === 'efectivo' && cashAmount.value <= 0) {
    return false;
  }
  
  if (paymentMethod.value !== 'efectivo' && paymentAmount.value <= 0) {
    return false;
  }
  
  // Validar campos específicos por método de pago
  if (paymentMethod.value === 'tarjeta' && !cardCode.value) {
    return false;
  }
  
  if (paymentMethod.value === 'giftcard' && !giftCardCode.value) {
    return false;
  }
  
  return true;
});

// Métodos
const selectPaymentMethod = (method) => {
  paymentMethod.value = method;
  
  // Reiniciar los campos
  paymentAmount.value = 0;
  cashAmount.value = 0;
  change.value = 0;
  currentReference.value = '';
  cardCode.value = '';
  giftCardCode.value = '';
};

const calculateChange = () => {
  // Redondear a 2 decimales
  cashAmount.value = Math.round(cashAmount.value * 100) / 100;
  
  // Para efectivo, el monto del pago es el mismo que el monto entregado menos el cambio
  paymentAmount.value = Math.min(cashAmount.value, props.remainingAmount);
  change.value = Math.round((cashAmount.value - paymentAmount.value) * 100) / 100;
};

const getPaymentMethodName = (method) => {
  const methods = {
    'efectivo': 'Efectivo',
    'tarjeta': 'Tarjeta de crédito/débito',
    'qr': 'Pago con QR',
    'credito': 'Crédito',
    'giftcard': 'Gift Card',
    'puntos': 'Puntos'
  };
  
  return methods[method] || '';
};

const addPayment = () => {
  let reference = '';
  let amount = 0;
  
  switch (paymentMethod.value) {
    case 'efectivo':
      amount = Math.min(cashAmount.value, props.remainingAmount);
      reference = `Cambio: ${formatCurrency(change.value)}`;
      break;
    case 'tarjeta':
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      reference = `Auth: ${cardCode.value}`;
      break;
    case 'qr':
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      reference = 'QR';
      break;
    case 'giftcard':
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      reference = `GC: ${giftCardCode.value}`;
      break;
    default:
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      reference = '';
  }
  
  // Emitir el evento con los datos del pago
  emit('payment-added', {
    method: paymentMethod.value,
    methodName: getPaymentMethodName(paymentMethod.value),
    amount: amount,
    reference: reference
  });
  
  // Cerrar el modal
  closeModal();
};

const closeModal = () => {
  emit('update:modelValue', false);
  resetForm();
};

const resetForm = () => {
  paymentMethod.value = '';
  paymentAmount.value = 0;
  cashAmount.value = 0;
  change.value = 0;
  cardCode.value = '';
  giftCardCode.value = '';
  currentReference.value = '';
};

// Formateo de moneda
const formatCurrency = (amount) => {
  return `S/ ${amount.toFixed(2)}`;
};

// Inicialización
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm();
  }
});
</script>
