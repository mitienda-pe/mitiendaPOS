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
          <div>
            <label class="block text-sm font-medium text-gray-700">Buscar</label>
            <input
              type="text"
              v-model="filters.search"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Nombre, razón social o documento..."
            />
          </div>

          <!-- Items per page -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Por página</label>
            <select
              v-model="filters.perPage"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>

          <!-- Tipo de documento -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Tipo de documento</label>
            <select
              v-model="filters.tipoDoc"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Todos</option>
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
            </select>
          </div>

          <!-- Número de documento -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Número de documento</label>
            <input
              type="text"
              v-model="filters.numDoc"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Número de documento..."
            />
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
                Dirección
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Compra
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in customers" :key="customer.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="font-medium text-gray-900">{{ customer.tipoDoc }}</div>
                <div class="text-gray-500">{{ customer.numDoc }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ customer.razonSocial || `${customer.nombres} ${customer.apellidos}` }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ customer.direccion }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div>{{ customer.email }}</div>
                <div class="text-gray-500">{{ customer.telefono }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(customer.ultimaCompra) }}
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
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando
                <span class="font-medium">{{ startItem }}</span>
                a
                <span class="font-medium">{{ endItem }}</span>
                de
                <span class="font-medium">{{ totalItems }}</span>
                resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  v-for="page in displayedPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    page === currentPage
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
                  v-model="customerForm.tipoDoc"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Número de {{ customerForm.tipoDoc }}
                </label>
                <div class="flex">
                  <input
                    v-model="customerForm.numDoc"
                    type="text"
                    :maxlength="customerForm.tipoDoc === 'DNI' ? 8 : 11"
                    class="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                  <button
                    type="button"
                    @click="consultarDocumento"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    :disabled="!isValidDocument"
                  >
                    Consultar
                  </button>
                </div>
              </div>

              <template v-if="customerForm.tipoDoc === 'DNI'">
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
                  Dirección
                </label>
                <input
                  v-model="customerForm.direccion"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  v-model="customerForm.email"
                  type="email"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  v-model="customerForm.telefono"
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
import { mockCustomersApi } from '../api/mockCustomers';

// Data
const customers = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const filters = ref({
  search: '',
  tipoDoc: '',
  numDoc: '',
  perPage: 10
});

// Modal state
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const customerForm = ref({
  tipoDoc: 'DNI',
  numDoc: '',
  nombres: '',
  apellidos: '',
  razonSocial: '',
  direccion: '',
  email: '',
  telefono: ''
});
const customerToDelete = ref(null);

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / filters.value.perPage);
});

const startItem = computed(() => {
  return (currentPage.value - 1) * filters.value.perPage + 1;
});

const endItem = computed(() => {
  return Math.min(startItem.value + filters.value.perPage - 1, totalItems.value);
});

const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5;
  
  if (totalPages.value <= maxPages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
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

// Methods
async function loadCustomers() {
  try {
    const response = await mockCustomersApi.getCustomers({
      search: filters.value.search,
      tipoDoc: filters.value.tipoDoc,
      numDoc: filters.value.numDoc
    });
    
    customers.value = response.data;
    totalItems.value = response.data.length;
    
    // Adjust current page if it's now out of bounds
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value;
    }
  } catch (error) {
    console.error('Error loading customers:', error);
  }
}

async function consultarDocumento() {
  if (!customerForm.value.tipoDoc || !customerForm.value.numDoc) {
    return;
  }
  
  try {
    const response = await mockCustomersApi.getCustomerByDoc(
      customerForm.value.tipoDoc,
      customerForm.value.numDoc
    );
    
    if (response.data) {
      // Customer found, populate form
      Object.keys(response.data).forEach(key => {
        if (key !== 'id' && key !== 'ultimaCompra') {
          customerForm.value[key] = response.data[key];
        }
      });
      
      isEditing.value = true;
    }
  } catch (error) {
    console.error('Error consulting document:', error);
  }
}

function openAddModal() {
  customerForm.value = {
    tipoDoc: 'DNI',
    numDoc: '',
    nombres: '',
    apellidos: '',
    razonSocial: '',
    direccion: '',
    email: '',
    telefono: ''
  };
  
  isEditing.value = false;
  showModal.value = true;
}

function editCustomer(customer) {
  customerForm.value = { ...customer };
  isEditing.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  customerForm.value = {
    tipoDoc: 'DNI',
    numDoc: '',
    nombres: '',
    apellidos: '',
    razonSocial: '',
    direccion: '',
    email: '',
    telefono: ''
  };
}

async function saveCustomer() {
  try {
    if (isEditing.value) {
      await mockCustomersApi.updateCustomer(customerForm.value.id, customerForm.value);
    } else {
      await mockCustomersApi.addCustomer(customerForm.value);
    }
    
    closeModal();
    loadCustomers();
  } catch (error) {
    console.error('Error saving customer:', error);
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
    await mockCustomersApi.deleteCustomer(customerToDelete.value.id);
    closeDeleteModal();
    loadCustomers();
  } catch (error) {
    console.error('Error deleting customer:', error);
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function goToPage(page) {
  currentPage.value = page;
}

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

// Watch for changes
watch([filters, currentPage], () => {
  loadCustomers();
}, { deep: true });

// Load customers on component mount
onMounted(() => {
  loadCustomers();
});
</script>
