<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4 text-center">
                Ticket de Compra
              </h3>
              
              <div class="bg-white p-4 border border-gray-200 rounded-lg">
                <div class="text-center mb-4">
                  <h2 class="text-xl font-bold">Mi Tienda POS</h2>
                  <p class="text-sm text-gray-600">Av. Principal 123, Lima</p>
                  <p class="text-sm text-gray-600">RUC: 20123456789</p>
                  <p class="text-sm text-gray-600">Tel: (01) 123-4567</p>
                  <p class="text-sm text-gray-600">{{ formatDate(new Date()) }}</p>
                </div>
                
                <div class="mb-3">
                  <p v-if="customer" class="text-sm"><span class="font-medium">Cliente:</span> {{ customer.nombre }}</p>
                  <p v-else class="text-sm"><span class="font-medium">Cliente:</span> Cliente General</p>
                </div>
                
                <div class="border-t border-b py-2 mb-3">
                  <div class="flex justify-between text-sm font-medium mb-1">
                    <span>Producto</span>
                    <div class="flex">
                      <span class="w-16 text-right">Precio</span>
                      <span class="w-10 text-right">Cant</span>
                      <span class="w-16 text-right">Total</span>
                    </div>
                  </div>
                  
                  <div v-for="(item, index) in items" :key="index" class="flex justify-between text-sm mb-1">
                    <span class="truncate max-w-[150px]">{{ item.nombre }}</span>
                    <div class="flex">
                      <span class="w-16 text-right">{{ formatCurrency(item.precio) }}</span>
                      <span class="w-10 text-right">{{ item.quantity }}</span>
                      <span class="w-16 text-right">{{ formatCurrency(item.precio * item.quantity) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <div class="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{{ formatCurrency(subtotal) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>IGV (18%):</span>
                    <span>{{ formatCurrency(tax) }}</span>
                  </div>
                  <div class="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{{ formatCurrency(total) }}</span>
                  </div>
                </div>
                
                <!-- Pagos realizados -->
                <div v-if="payments && payments.length > 0" class="border-t pt-2 mb-3">
                  <div class="text-sm font-medium mb-1">Pagos realizados:</div>
                  <div v-for="(payment, index) in payments" :key="index" class="flex justify-between text-sm">
                    <span>{{ payment.methodName }}:</span>
                    <span>{{ formatCurrency(payment.amount) }}</span>
                  </div>
                  <div class="flex justify-between font-medium mt-1">
                    <span>Total pagado:</span>
                    <span>{{ formatCurrency(totalPaid) }}</span>
                  </div>
                </div>
                
                <div class="text-center mt-4">
                  <p class="text-sm">¡Gracias por su compra!</p>
                  <p class="text-xs text-gray-600 mt-1">www.mitiendapos.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="closeModal" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cerrar
          </button>
          <button 
            @click="printTicket" 
            class="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  customer: Object,
  items: Array,
  subtotal: Number,
  tax: Number,
  total: Number,
  payments: Array
});

const emit = defineEmits(['update:modelValue']);

const totalPaid = computed(() => {
  if (!props.payments) return 0;
  return props.payments.reduce((sum, payment) => sum + payment.amount, 0);
});

const closeModal = () => {
  emit('update:modelValue', false);
};

const printTicket = () => {
  window.print();
};

const formatCurrency = (value) => {
  return `S/ ${parseFloat(value).toFixed(2)}`;
};

const formatDate = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('es-PE', options);
};
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  .modal-content, .modal-content * {
    visibility: visible;
  }
  .modal-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
