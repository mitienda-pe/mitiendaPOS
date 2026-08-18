<template>
  <div v-if="modelValue" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Ventas en espera</h3>
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
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venta</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="sale in savedSales" :key="sale.id">
                      <td class="px-4 py-4 text-sm">
                        <div v-if="editingId === sale.id" class="flex items-center gap-1">
                          <input
                            :ref="el => setLabelInput(sale.id, el)"
                            v-model="editingLabel"
                            type="text"
                            maxlength="60"
                            placeholder="Ej. Señora del abrigo rojo"
                            class="w-40 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-primary-500 focus:border-primary-500"
                            @keyup.enter="confirmRename(sale.id)"
                            @keyup.esc="cancelRename"
                          />
                          <button @click="confirmRename(sale.id)" class="text-primary-600 hover:text-primary-800 text-xs font-medium px-1">OK</button>
                          <button @click="cancelRename" class="text-gray-400 hover:text-gray-600 text-xs px-1">✕</button>
                        </div>
                        <div v-else class="flex items-center gap-1">
                          <span :class="sale.label ? 'font-medium text-gray-900' : 'italic text-gray-500'">
                            {{ sale.label || 'Venta sin nombre' }}
                          </span>
                          <button
                            @click="startRename(sale)"
                            class="text-gray-400 hover:text-primary-600"
                            :title="sale.label ? 'Cambiar el nombre' : 'Ponerle un nombre'"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                            </svg>
                          </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(sale.timestamp) }}</p>
                      </td>
                      <td class="px-4 py-4 text-sm truncate max-w-xs">
                        {{ sale.customer ? getCustomerName(sale.customer) : 'Sin cliente' }}
                      </td>
                      <td class="px-4 py-4 text-sm">{{ sale.items.length }} productos</td>
                      <td class="px-4 py-4 whitespace-nowrap text-sm">{{ formatCurrency(sale.total) }}</td>
                      <td class="px-4 py-4 whitespace-nowrap text-sm">
                        <div class="flex space-x-2">
                          <button
                            @click="resumeSale(sale)"
                            class="text-primary-600 hover:text-primary-800 flex items-center"
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
                <p class="text-gray-500">No hay ventas en espera</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="close"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useSavedSalesStore } from '../stores/savedSales';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  // Venta que está abierta en la caja ahora mismo. El autoguardado la persiste
  // igual que las que esperan, pero no tiene sentido listarla ni "retomarla".
  currentSaleId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'resume-sale']);

const savedSalesStore = useSavedSalesStore();
const savedSales = ref([]);

// Renombrado en línea. La venta en espera puede ser anónima; el alias sirve para
// reconocerla cuando hay varias esperando en el mostrador.
const editingId = ref(null);
const editingLabel = ref('');
const labelInputs = {};

function setLabelInput(id, el) {
  if (el) labelInputs[id] = el;
  else delete labelInputs[id];
}

function startRename(sale) {
  editingId.value = sale.id;
  editingLabel.value = sale.label || '';
  nextTick(() => labelInputs[sale.id]?.focus());
}

function confirmRename(id) {
  savedSalesStore.renameSale(id, editingLabel.value);
  refreshSales();
  cancelRename();
}

function cancelRename() {
  editingId.value = null;
  editingLabel.value = '';
}

// Lista de ventas realmente en espera (sin la que está abierta en la caja)
function refreshSales() {
  savedSales.value = savedSalesStore
    .getSavedSales()
    .filter(sale => sale.id !== props.currentSaleId);
}

// Actualizar la lista de ventas guardadas cada vez que se abre el modal
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    refreshSales();
    cancelRename();
  }
});

// Inicializar la lista de ventas guardadas
refreshSales();

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
  if (confirm('¿Está seguro de eliminar esta venta en espera?')) {
    try {
      savedSalesStore.deleteSavedSale(id);
      // Forzar actualización del ref
      refreshSales();
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
