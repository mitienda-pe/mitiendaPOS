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
                  @change="handleDocTypeChange"
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                </select>
                <input
                  ref="docInput"
                  v-model="numDoc"
                  type="text"
                  :placeholder="tipoDoc === 'DNI' ? '8 dígitos' : '11 dígitos'"
                  :maxlength="tipoDoc === 'DNI' ? 8 : 11"
                  class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 flex-1"
                  @input="handleDocumentInput"
                  @keyup.enter="searchByDocument"
                />
                <button
                  v-if="numDoc"
                  @click="searchByDocument"
                  :disabled="searching"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ searching ? 'Buscando...' : 'Buscar' }}
                </button>
              </div>

              <!-- Search Results -->
              <div v-if="searchResults.length > 0" class="mb-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Resultados:</h4>
                <div class="overflow-x-auto">
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
                          {{ customer.name || `${customer.nombres || ''} ${customer.apellidos || ''}`.trim() }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          {{ customer.document_type === '1' ? 'DNI' : 'RUC' }}: {{ customer.document_number }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            @click="selectCustomer(customer)"
                            class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- No Results Message -->
              <div v-if="searched && searchResults.length === 0 && !showCreateForm" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-sm text-yellow-800">No se encontraron clientes. Intenta con otro documento o busca en RENIEC/SUNAT.</p>
              </div>

              <!-- Create New Customer Form -->
              <div v-if="showCreateForm" class="mt-4 p-4 border rounded-lg bg-yellow-50">
                <h4 class="text-sm font-medium text-gray-800 mb-2">Cliente no encontrado</h4>
                <p class="text-xs text-gray-600 mb-3">Complete los datos para crear un nuevo cliente:</p>

                <div class="space-y-2">
                  <input
                    v-if="tipoDoc === 'DNI'"
                    v-model="newCustomer.nombres"
                    type="text"
                    placeholder="Nombres"
                    class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                  />
                  <input
                    v-if="tipoDoc === 'DNI'"
                    v-model="newCustomer.apellidos"
                    type="text"
                    placeholder="Apellidos"
                    class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                  />
                  <input
                    v-else
                    v-model="newCustomer.razonSocial"
                    type="text"
                    placeholder="Razón Social"
                    class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                  />
                  <input
                    v-model="newCustomer.correoElectronico"
                    type="email"
                    placeholder="Correo electrónico (opcional)"
                    class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                  />
                  <input
                    v-model="newCustomer.telefono"
                    type="tel"
                    placeholder="Teléfono (opcional)"
                    class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                  />
                  <button
                    @click="createCustomer"
                    :disabled="!isNewCustomerValid"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Crear y Seleccionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { customersApi } from '../services/customersApi';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'select']);

const tipoDoc = ref('DNI');
const numDoc = ref('');
const searchResults = ref([]);
const showCreateForm = ref(false);
const searching = ref(false);
const searched = ref(false);
const lookupData = ref(null);
const docInput = ref(null);

const newCustomer = ref({
  nombres: '',
  apellidos: '',
  razonSocial: '',
  correoElectronico: '',
  telefono: ''
});

// Auto-focus on document input when modal opens
watch(() => props.modelValue, (value) => {
  if (value) {
    nextTick(() => {
      docInput.value?.focus();
    });
  }
});

const isNewCustomerValid = computed(() => {
  if (tipoDoc.value === 'DNI') {
    return newCustomer.value.nombres && newCustomer.value.apellidos;
  } else {
    return newCustomer.value.razonSocial;
  }
});

const handleDocTypeChange = () => {
  numDoc.value = '';
  searchResults.value = [];
  showCreateForm.value = false;
  searched.value = false;
  lookupData.value = null;
};

const handleDocumentInput = () => {
  // Only allow numbers
  numDoc.value = numDoc.value.replace(/\D/g, '');

  // Clear previous results
  searchResults.value = [];
  showCreateForm.value = false;
  searched.value = false;
};

const searchByDocument = async () => {
  if (!numDoc.value) return;

  const expectedLength = tipoDoc.value === 'DNI' ? 8 : 11;
  if (numDoc.value.length !== expectedLength) {
    alert(`El ${tipoDoc.value} debe tener ${expectedLength} dígitos`);
    return;
  }

  searching.value = true;
  searched.value = false;
  lookupData.value = null;

  try {
    // Step 1: Search in our database by document number
    const documentType = tipoDoc.value === 'DNI' ? '1' : '6';
    const searchResponse = await customersApi.searchByDocument(numDoc.value, documentType);
    console.log('Search response:', searchResponse);

    if (searchResponse.success && searchResponse.found) {
      // Customer exists in our database
      console.log('Customer found in DB:', searchResponse.data);
      searchResults.value = [searchResponse.data];
      showCreateForm.value = false;
      searched.value = true;
    } else {
      // Step 2: Customer not found locally, lookup in Decolecta
      const lookupResponse = await customersApi.lookupDocument(
        numDoc.value,
        tipoDoc.value.toLowerCase()
      );

      if (lookupResponse.success) {
        // Found in Decolecta - pre-fill form
        lookupData.value = lookupResponse.data;
        searchResults.value = [];
        showCreateForm.value = true;

        if (tipoDoc.value === 'DNI') {
          newCustomer.value.nombres = lookupData.value.nombres || '';
          newCustomer.value.apellidos = `${lookupData.value.apellidoPaterno || ''} ${lookupData.value.apellidoMaterno || ''}`.trim();
          newCustomer.value.razonSocial = '';
        } else {
          newCustomer.value.razonSocial = lookupData.value.razonSocial || '';
          newCustomer.value.nombres = '';
          newCustomer.value.apellidos = '';
        }
        newCustomer.value.correoElectronico = '';
        newCustomer.value.telefono = '';
      } else {
        // Not found in Decolecta either - show empty form
        searchResults.value = [];
        showCreateForm.value = true;
        newCustomer.value.nombres = '';
        newCustomer.value.apellidos = '';
        newCustomer.value.razonSocial = '';
        newCustomer.value.correoElectronico = '';
        newCustomer.value.telefono = '';
      }
      searched.value = true;
    }
  } catch (error) {
    console.error('Error searching customer:', error);
    alert('Error al buscar el cliente');
    searched.value = true;
  } finally {
    searching.value = false;
  }
};

const selectCustomer = (customer) => {
  emit('select', customer);
  closeModal();
};

const createCustomer = async () => {
  try {
    const customerData = {
      nombres: newCustomer.value.nombres,
      apellidos: newCustomer.value.apellidos,
      razonSocial: newCustomer.value.razonSocial,
      email: newCustomer.value.correoElectronico,
      telefono: newCustomer.value.telefono,
      numeroDocumento: numDoc.value,
      tipoDocumento: tipoDoc.value === 'DNI' ? '1' : '6'
    };

    const response = await customersApi.createCustomer(customerData);
    console.log('Create customer response:', response);

    if (response.success) {
      console.log('Customer data to select:', response.data);
      selectCustomer(response.data);
    } else {
      alert(response.error || 'Error al crear el cliente');
    }
  } catch (error) {
    console.error('Error creating customer:', error);
    alert('Error al crear el cliente');
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
  searching.value = false;
  searched.value = false;
  lookupData.value = null;
  newCustomer.value = {
    nombres: '',
    apellidos: '',
    razonSocial: '',
    correoElectronico: '',
    telefono: ''
  };
};
</script>
