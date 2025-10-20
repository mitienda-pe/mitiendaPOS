<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between mb-6">
      <div class="flex-1 min-w-0">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Clientes
        </h2>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <button
          @click="openAddModal"
          class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Cliente
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="p-4 sm:p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Search -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700">Buscar</label>
            <input
              type="text"
              v-model="searchQuery"
              @input="onSearchInput"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Nombre, email, teléfono o documento..."
            />
          </div>

          <!-- Items per page -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Por página</label>
            <select
              v-model="customersStore.filters.limit"
              @change="loadCustomers"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Customers Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre / Razón Social
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registro
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                Cargando...
              </td>
            </tr>
            <tr v-else-if="displayedCustomers.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                No se encontraron clientes
              </td>
            </tr>
            <tr v-else v-for="customer in displayedCustomers" :key="customer.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="font-medium text-gray-900">{{ customer.document_type }}</div>
                <div class="text-gray-500">{{ customer.document_number }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ customer.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="text-gray-900">{{ customer.email || '-' }}</div>
                <div class="text-gray-500">{{ customer.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(customer.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editCustomer(customer)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Editar
                </button>
                <button
                  @click="deleteCustomer(customer)"
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="prevPage"
              :disabled="pagination.page === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              @click="nextPage"
              :disabled="pagination.page === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando
                <span class="font-medium">{{ startItem }}</span>
                -
                <span class="font-medium">{{ endItem }}</span>
                de
                <span class="font-medium">{{ pagination.total }}</span>
                clientes
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="prevPage"
                  :disabled="pagination.page === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  v-for="page in displayedPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    page === pagination.page
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="pagination.page === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="saveCustomer">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  v-model="customerForm.document_type"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                  :disabled="isEditing"
                >
                  <option value="1">DNI</option>
                  <option value="6">RUC</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Número de {{ customerForm.document_type === '1' ? 'DNI' : 'RUC' }}
                </label>
                <div class="flex">
                  <input
                    v-model="customerForm.document_number"
                    type="text"
                    :maxlength="customerForm.document_type === '1' ? 8 : 11"
                    class="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    :disabled="isEditing"
                  >
                  <button
                    v-if="!isEditing"
                    type="button"
                    @click="consultarDocumento"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    :disabled="!isValidDocument || consultingDocument"
                  >
                    {{ consultingDocument ? 'Consultando...' : 'Consultar' }}
                  </button>
                </div>
              </div>

              <template v-if="customerForm.document_type === '1'">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nombres
                  </label>
                  <input
                    v-model="customerForm.nombres"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos
                  </label>
                  <input
                    v-model="customerForm.apellidos"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                </div>
              </template>

              <template v-else>
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social
                  </label>
                  <input
                    v-model="customerForm.razonSocial"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                </div>
              </template>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email (opcional)
                </label>
                <input
                  v-model="customerForm.email"
                  type="email"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  v-model="customerForm.phone"
                  type="tel"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
              </div>
            </div>

            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ isEditing ? 'Actualizar' : 'Guardar' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Eliminar Cliente
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    ¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="confirmDelete"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Eliminar
            </button>
            <button
              type="button"
              @click="closeDeleteModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useCustomersStore } from '../stores/customers';
import { storeToRefs } from 'pinia';

const customersStore = useCustomersStore();
const { customers, loading, pagination } = storeToRefs(customersStore);

// Data
const searchQuery = ref('');
let searchTimeout = null;

// Modal state
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const consultingDocument = ref(false);
const customerForm = ref({
  id: null,
  document_type: '1', // 1=DNI, 6=RUC
  document_number: '',
  nombres: '',
  apellidos: '',
  razonSocial: '',
  email: '',
  phone: ''
});
const customerToDelete = ref(null);

// Computed properties
const displayedCustomers = computed(() => {
  return customers.value.map(customer => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    document_type: customer.document_type === '6' ? 'RUC' : 'DNI',
    document_number: customer.document_number,
    created_at: customer.created_at,
    verified: customer.verified,
    blocked: customer.blocked
  }));
});

const totalPages = computed(() => pagination.value.totalPages);

const startItem = computed(() => {
  return (pagination.value.page - 1) * pagination.value.perPage + 1;
});

const endItem = computed(() => {
  return Math.min(pagination.value.page * pagination.value.perPage, pagination.value.total);
});

const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5;
  const currentPage = pagination.value.page;

  if (totalPages.value <= maxPages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages.value, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  }

  return pages;
});

const isValidDocument = computed(() => {
  if (!customerForm.value.document_number) return false;

  if (customerForm.value.document_type === '1') {
    // DNI: 8 dígitos
    return customerForm.value.document_number.length === 8;
  } else {
    // RUC: 11 dígitos
    return customerForm.value.document_number.length === 11;
  }
});

// Methods
async function loadCustomers() {
  await customersStore.loadCustomers();
}

// Debounced search
function onSearchInput() {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    customersStore.setFilter('search', searchQuery.value);
    customersStore.setPage(1);
    loadCustomers();
  }, 500);
}

async function consultarDocumento() {
  if (!isValidDocument.value) {
    alert('Por favor ingrese un número de documento válido');
    return;
  }

  consultingDocument.value = true;

  try {
    // Primero buscar si el cliente ya existe
    const searchResponse = await customersStore.searchByDocument(
      customerForm.value.document_number,
      customerForm.value.document_type
    );

    if (searchResponse.found) {
      // Cliente encontrado en la base de datos
      const customer = searchResponse.data;

      customerForm.value.id = customer.id;
      customerForm.value.nombres = customer.name.split(' ')[0] || '';
      customerForm.value.apellidos = customer.name.split(' ').slice(1).join(' ') || '';
      customerForm.value.email = customer.email || '';
      customerForm.value.phone = customer.phone || '';

      isEditing.value = true;
      alert('Cliente encontrado en la base de datos');
      return;
    }

    // Si no existe, consultar a Decolecta
    const type = customerForm.value.document_type === '1' ? 'dni' : 'ruc';
    const lookupResponse = await customersStore.lookupDocument(
      customerForm.value.document_number,
      type
    );

    if (lookupResponse.success) {
      if (type === 'dni') {
        // Poblar datos de RENIEC
        customerForm.value.nombres = lookupResponse.data.nombres || '';
        customerForm.value.apellidos = `${lookupResponse.data.apellidoPaterno || ''} ${lookupResponse.data.apellidoMaterno || ''}`.trim();
      } else {
        // Poblar datos de SUNAT
        customerForm.value.razonSocial = lookupResponse.data.razonSocial || '';
      }

      alert('Documento encontrado. Complete los datos restantes.');
    } else {
      alert(lookupResponse.error || 'No se pudo consultar el documento');
    }
  } catch (error) {
    console.error('Error consulting document:', error);
    alert('Error al consultar documento');
  } finally {
    consultingDocument.value = false;
  }
}

function openAddModal() {
  customerForm.value = {
    id: null,
    document_type: '1',
    document_number: '',
    nombres: '',
    apellidos: '',
    razonSocial: '',
    email: '',
    phone: ''
  };

  isEditing.value = false;
  showModal.value = true;
}

function editCustomer(customer) {
  customerForm.value = {
    id: customer.id,
    document_type: customer.document_type === 'RUC' ? '6' : '1',
    document_number: customer.document_number,
    nombres: customer.name.split(' ')[0] || '',
    apellidos: customer.name.split(' ').slice(1).join(' ') || '',
    razonSocial: customer.document_type === 'RUC' ? customer.name : '',
    email: customer.email || '',
    phone: customer.phone || ''
  };

  isEditing.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  customerForm.value = {
    id: null,
    document_type: '1',
    document_number: '',
    nombres: '',
    apellidos: '',
    razonSocial: '',
    email: '',
    phone: ''
  };
}

async function saveCustomer() {
  try {
    let result;

    if (isEditing.value && customerForm.value.id) {
      // Actualizar cliente existente
      result = await customersStore.updateCustomer(customerForm.value.id, {
        tiendacliente_nombres: customerForm.value.document_type === '1'
          ? customerForm.value.nombres
          : customerForm.value.razonSocial,
        tiendacliente_apellidos: customerForm.value.document_type === '1'
          ? customerForm.value.apellidos
          : '',
        tiendacliente_correo_electronico: customerForm.value.email,
        tiendacliente_telefono: customerForm.value.phone
      });
    } else {
      // Crear nuevo cliente
      result = await customersStore.createCustomer({
        numeroDocumento: customerForm.value.document_number,
        tipoDocumento: customerForm.value.document_type,
        nombres: customerForm.value.document_type === '1'
          ? customerForm.value.nombres
          : customerForm.value.razonSocial,
        apellidos: customerForm.value.document_type === '1'
          ? customerForm.value.apellidos
          : '',
        email: customerForm.value.email,
        telefono: customerForm.value.phone
      });
    }

    if (result.success) {
      closeModal();
      loadCustomers();
      alert(isEditing.value ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente');
    } else {
      alert(result.error || 'Error al guardar cliente');
    }
  } catch (error) {
    console.error('Error saving customer:', error);
    alert('Error al guardar cliente');
  }
}

function deleteCustomer(customer) {
  customerToDelete.value = customer;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  customerToDelete.value = null;
}

async function confirmDelete() {
  try {
    const result = await customersStore.deleteCustomer(customerToDelete.value.id);

    if (result.success) {
      closeDeleteModal();
      loadCustomers();
      alert('Cliente eliminado correctamente');
    } else {
      alert(result.error || 'Error al eliminar cliente');
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    alert('Error al eliminar cliente');
  }
}

function prevPage() {
  customersStore.prevPage();
  loadCustomers();
}

function nextPage() {
  customersStore.nextPage();
  loadCustomers();
}

function goToPage(page) {
  customersStore.setPage(page);
  loadCustomers();
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Load customers on component mount
onMounted(() => {
  loadCustomers();
});
</script>
