<template>
  <div v-if="modelValue" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Iniciar Nueva Venta</h3>
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Document Input -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Información del Cliente (Opcional)
                </label>
                <div class="flex gap-2 items-center">
                  <select
                    v-model="tipoDoc"
                    class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-1/4"
                    @change="handleDocumentChange"
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
                    @keyup.enter="searchCustomer"
                  />
                  <button
                    v-if="numDoc"
                    @click="searchCustomer"
                    :disabled="searching"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {{ searching ? 'Buscando...' : 'Buscar' }}
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Ingrese el documento del cliente o haga clic en "Omitir" para continuar sin cliente
                </p>
              </div>

              <!-- Customer Results -->
              <div v-if="customerFound" class="mb-4 p-4 border rounded-lg bg-green-50">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ customerFound.name || customerFound.razonSocial || `${customerFound.nombres || ''} ${customerFound.apellidos || ''}`.trim() || 'Cliente' }}
                    </p>
                    <p class="text-xs text-gray-600">
                      {{ customerFound.document_type === '1' ? 'DNI' : customerFound.document_type === '6' ? 'RUC' : customerFound.tipoDoc }}: {{ customerFound.document_number || customerFound.numDoc }}
                    </p>
                    <p v-if="customerFound.email || customerFound.correoElectronico" class="text-xs text-gray-600">
                      {{ customerFound.email || customerFound.correoElectronico }}
                    </p>
                    <p v-if="customerFound.phone || customerFound.telefono" class="text-xs text-gray-600">
                      {{ customerFound.phone || customerFound.telefono }}
                    </p>
                  </div>
                  <button
                    @click="clearCustomer"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Not Found - Create New -->
              <div v-if="showCreateForm" class="mb-4 p-4 border rounded-lg bg-yellow-50">
                <h4 class="text-sm font-medium text-gray-800 mb-2">Cliente no encontrado</h4>
                <p class="text-xs text-gray-600 mb-3">Complete los datos para crear un nuevo cliente:</p>

                <div class="space-y-2">
                  <!-- DNI: Nombres y Apellidos -->
                  <template v-if="tipoDoc === 'DNI'">
                    <input
                      v-model="newCustomer.nombres"
                      type="text"
                      placeholder="Nombres"
                      class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                      required
                    />
                    <input
                      v-model="newCustomer.apellidos"
                      type="text"
                      placeholder="Apellidos"
                      class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                      required
                    />
                  </template>

                  <!-- RUC: Razón Social -->
                  <template v-else>
                    <input
                      v-model="newCustomer.razonSocial"
                      type="text"
                      placeholder="Razón Social"
                      class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                      required
                    />

                    <!-- Dirección (solo para RUC) -->
                    <input
                      v-model="newCustomer.direccion"
                      type="text"
                      placeholder="Dirección"
                      class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                    />

                    <!-- Ubigeo (grid de 3 columnas) -->
                    <div class="grid grid-cols-3 gap-2">
                      <input
                        v-model="newCustomer.departamento"
                        type="text"
                        placeholder="Departamento"
                        class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                      />
                      <input
                        v-model="newCustomer.provincia"
                        type="text"
                        placeholder="Provincia"
                        class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                      />
                      <input
                        v-model="newCustomer.distrito"
                        type="text"
                        placeholder="Distrito"
                        class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm"
                      />
                    </div>
                  </template>

                  <!-- Email y Teléfono (para ambos tipos) -->
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
                    @click="createAndSelectCustomer"
                    :disabled="!isNewCustomerValid"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Crear y Continuar
                  </button>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 mt-4">
                <button
                  @click="skipCustomer"
                  class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Omitir
                </button>
                <button
                  v-if="customerFound"
                  @click="startWithCustomer"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Iniciar Venta
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
import { ref, computed, watch, nextTick } from 'vue';
import { customersApi } from '../services/customersApi';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'start']);

const tipoDoc = ref('DNI');
const numDoc = ref('');
const customerFound = ref(null);
const searching = ref(false);
const showCreateForm = ref(false);
const docInput = ref(null);
const lookupData = ref(null); // Store Decolecta lookup data

const newCustomer = ref({
  nombres: '',
  apellidos: '',
  razonSocial: '',
  correoElectronico: '',
  telefono: '',
  direccion: '',
  departamento: '',
  provincia: '',
  distrito: ''
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

const handleDocumentChange = () => {
  numDoc.value = '';
  customerFound.value = null;
  showCreateForm.value = false;
};

const handleDocumentInput = () => {
  // Only allow numbers
  numDoc.value = numDoc.value.replace(/\D/g, '');

  // Clear previous results
  customerFound.value = null;
  showCreateForm.value = false;
};

const searchCustomer = async () => {
  if (!numDoc.value) return;

  const expectedLength = tipoDoc.value === 'DNI' ? 8 : 11;
  if (numDoc.value.length !== expectedLength) {
    alert(`El ${tipoDoc.value} debe tener ${expectedLength} dígitos`);
    return;
  }

  searching.value = true;
  lookupData.value = null;

  try {
    // Step 1: Search in our database first
    const documentType = tipoDoc.value === 'DNI' ? '1' : '6';
    const searchResponse = await customersApi.searchByDocument(numDoc.value, documentType);

    if (searchResponse.success && searchResponse.found) {
      // Customer exists in our database
      customerFound.value = searchResponse.data;
      showCreateForm.value = false;
    } else {
      // Step 2: Customer not found, lookup in Decolecta API
      const lookupResponse = await customersApi.lookupDocument(
        numDoc.value,
        tipoDoc.value.toLowerCase()
      );

      if (lookupResponse.success) {
        // Found in Decolecta - pre-fill form
        lookupData.value = lookupResponse.data;
        customerFound.value = null;
        showCreateForm.value = true;

        if (tipoDoc.value === 'DNI') {
          newCustomer.value.nombres = lookupData.value.nombres || '';
          newCustomer.value.apellidos = `${lookupData.value.apellidoPaterno || ''} ${lookupData.value.apellidoMaterno || ''}`.trim();
          newCustomer.value.razonSocial = '';
          newCustomer.value.direccion = '';
          newCustomer.value.departamento = '';
          newCustomer.value.provincia = '';
          newCustomer.value.distrito = '';
        } else {
          newCustomer.value.razonSocial = lookupData.value.razonSocial || '';
          newCustomer.value.direccion = lookupData.value.direccion || '';
          newCustomer.value.departamento = lookupData.value.departamento || '';
          newCustomer.value.provincia = lookupData.value.provincia || '';
          newCustomer.value.distrito = lookupData.value.distrito || '';
          newCustomer.value.nombres = '';
          newCustomer.value.apellidos = '';
        }
        newCustomer.value.correoElectronico = '';
        newCustomer.value.telefono = '';
      } else {
        // Not found in Decolecta either - show empty form
        customerFound.value = null;
        showCreateForm.value = true;
        newCustomer.value.nombres = '';
        newCustomer.value.apellidos = '';
        newCustomer.value.razonSocial = '';
        newCustomer.value.correoElectronico = '';
        newCustomer.value.telefono = '';
        newCustomer.value.direccion = '';
        newCustomer.value.departamento = '';
        newCustomer.value.provincia = '';
        newCustomer.value.distrito = '';
      }
    }
  } catch (error) {
    console.error('Error searching customer:', error);
    alert('Error al buscar el cliente');
  } finally {
    searching.value = false;
  }
};

const createAndSelectCustomer = async () => {
  try {
    const customerData = {
      nombres: newCustomer.value.nombres,
      apellidos: newCustomer.value.apellidos,
      razonSocial: newCustomer.value.razonSocial,
      email: newCustomer.value.correoElectronico,
      telefono: newCustomer.value.telefono,
      numeroDocumento: numDoc.value,
      tipoDocumento: tipoDoc.value === 'DNI' ? '1' : '6',
      direccion: newCustomer.value.direccion,
      departamento: newCustomer.value.departamento,
      provincia: newCustomer.value.provincia,
      distrito: newCustomer.value.distrito
    };

    const response = await customersApi.createCustomer(customerData);

    if (response.success) {
      customerFound.value = response.data;
      showCreateForm.value = false;

      // Auto-start sale after creating customer
      startWithCustomer();
    } else {
      alert(response.error || 'Error al crear el cliente');
    }
  } catch (error) {
    console.error('Error creating customer:', error);
    alert('Error al crear el cliente');
  }
};

const clearCustomer = () => {
  customerFound.value = null;
  numDoc.value = '';
  showCreateForm.value = false;
};

const startWithCustomer = () => {
  emit('start', { customer: customerFound.value });
  closeModal();
};

const skipCustomer = () => {
  emit('start', { customer: null });
  closeModal();
};

const closeModal = () => {
  emit('update:modelValue', false);
  resetForm();
};

const resetForm = () => {
  numDoc.value = '';
  customerFound.value = null;
  showCreateForm.value = false;
  searching.value = false;
  newCustomer.value = {
    nombres: '',
    apellidos: '',
    razonSocial: '',
    correoElectronico: '',
    telefono: '',
    direccion: '',
    departamento: '',
    provincia: '',
    distrito: ''
  };
};
</script>
