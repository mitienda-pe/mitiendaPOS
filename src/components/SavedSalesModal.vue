<template>
  <div v-if="modelValue" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Ventas Guardadas</h3>
                <button 
                  @click="close" 
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- Ventas guardadas -->
              <div v-if="savedSales.length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">Fecha</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">Cliente</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">Productos</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">Total</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="sale in savedSales" :key="sale.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatDate(sale.timestamp) }}</td>
                      <td class="px-6 py-4 text-sm truncate max-w-xs">
                        {{ sale.customer ? getCustomerName(sale.customer) : 'Sin cliente' }}
                      </td>
                      <td class="px-6 py-4 text-sm">{{ sale.items.length }} productos</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatCurrency(sale.total) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="flex space-x-2">
                          <button
                            @click="resumeSale(sale)"
                            class="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            Retomar
                          </button>
                          <button
                            @click="deleteSale(sale.id)"
                            class="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Mensaje cuando no hay ventas guardadas -->
              <div v-else class="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p class="text-gray-500">No hay ventas guardadas</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="close"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSavedSalesStore } from '../stores/savedSales';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'resume-sale']);

const savedSalesStore = useSavedSalesStore();
const savedSales = ref([]);

// Actualizar la lista de ventas guardadas cada vez que se abre el modal
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    savedSales.value = savedSalesStore.getSavedSales();
  }
});

// Inicializar la lista de ventas guardadas
savedSales.value = savedSalesStore.getSavedSales();

// Formatear fecha
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Formatear moneda
function formatCurrency(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return 'S/ 0.00';
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount);
}

// Obtener nombre del cliente
function getCustomerName(customer) {
  if (!customer) return 'Sin cliente';
  return customer.name || 'Cliente sin nombre';
}

// Retomar una venta guardada
function resumeSale(sale) {
  emit('resume-sale', sale);
  close();
}

// Eliminar una venta guardada
async function deleteSale(id) {
  if (confirm('¿Está seguro de eliminar esta venta guardada?')) {
    try {
      savedSalesStore.deleteSavedSale(id);
      // Forzar actualización del ref
      savedSales.value = savedSalesStore.getSavedSales();
    } catch (error) {
      console.error('Error al eliminar la venta guardada:', error);
      alert('Ocurrió un error al eliminar la venta guardada');
    }
  }
}

// Cerrar modal
function close() {
  emit('update:modelValue', false);
}
</script>
