<template>
  <div v-if="modelValue" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Buscar cliente</h3>
                <button 
                  @click="closeModal" 
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <!-- Search and Filters -->
              <div class="mb-4 flex gap-2 items-center">
                <select 
                  v-model="tipoDoc" 
                  class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-1/4"
                  @change="searchCustomer"
                >
                  <option value="RUC">RUC</option>
                  <option value="DNI">DNI</option>
                </select>
                <input
                  v-model="numDoc"
                  type="text"
                  placeholder="Número de documento"
                  class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 flex-1"
                  @input="searchCustomer"
                />
              </div>
              
              <!-- Results Table -->
              <div v-if="searchResults.length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="customer in searchResults" :key="customer.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        {{ customer.razonSocial || `${customer.nombres} ${customer.apellidos}` }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">{{ customer.tipoDoc }}: {{ customer.numDoc }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button @click="selectCustomer(customer)" class="btn btn-sm btn-primary">Seleccionar</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Create New Customer Form -->
              <div v-if="showCreateForm" class="mt-4 p-4 border rounded-lg bg-gray-50">
                <h4 class="text-md font-medium text-gray-800 mb-2">Crear nuevo cliente</h4>
                <input
                  v-model="newCustomer.nombre"
                  type="text"
                  placeholder="Nombre/Razón Social"
                  class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full mb-2"
                />
                <button
                  @click="createCustomer"
                  class="btn btn-success w-full"
                >
                  Crear nuevo cliente
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
import { ref, watch } from 'vue';
import { mockCustomersApi } from '../api/mockCustomers';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'select']);

const tipoDoc = ref('RUC');
const numDoc = ref('');
const searchResults = ref([]);
const showCreateForm = ref(false);
let searchTimeout = null;

const newCustomer = ref({
  nombre: '',
  tipoDocumento: '',
  numeroDocumento: ''
});

const searchCustomer = async () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const response = await mockCustomersApi.getCustomers({
        tipoDoc: tipoDoc.value,
        numDoc: numDoc.value
      });
      
      searchResults.value = response.data;
      showCreateForm.value = response.data.length === 0;
      
      if(showCreateForm.value) {
        newCustomer.value.tipoDocumento = tipoDoc.value;
        newCustomer.value.numeroDocumento = numDoc.value;
      }
    } catch (error) {
      console.error('Error searching customer:', error);
    }
  }, 500);
};

const selectCustomer = (customer) => {
  emit('select', customer);
  closeModal();
};

const createCustomer = async () => {
  try {
    const response = await mockCustomersApi.addCustomer(newCustomer.value);
    selectCustomer(response.data);
  } catch (error) {
    console.error('Error creating customer:', error);
  }
};

const closeModal = () => {
  emit('update:modelValue', false);
  resetForm();
};

const resetForm = () => {
  numDoc.value = '';
  searchResults.value = [];
  showCreateForm.value = false;
  newCustomer.value = {
    nombre: '',
    tipoDocumento: '',
    numeroDocumento: ''
  };
};
</script>
