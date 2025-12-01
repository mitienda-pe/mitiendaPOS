<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-2xl font-semibold text-gray-900">Historial de Ventas</h1>
          <button
            @click="fetchOrders"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Actualizar
          </button>
        </div>

        <!-- Filtros -->
        <div class="bg-white shadow rounded-lg p-4">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <!-- Buscar -->
            <div class="relative">
              <label class="block text-xs font-medium text-gray-700 mb-1">Buscar</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cliente o número..."
                class="w-full p-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                @input="debouncedSearch"
              >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute right-2 top-9 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Estado</label>
              <select
                v-model="selectedStatus"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                @change="fetchOrders"
              >
                <option value="">Todos</option>
                <option value="1">Aprobado</option>
                <option value="2">Pendiente</option>
                <option value="0">Rechazado</option>
                <option value="9">Creado</option>
              </select>
            </div>

            <!-- Fuente -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Fuente</label>
              <select
                v-model="selectedSource"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                @change="fetchOrders"
              >
                <option value="">Todas</option>
                <option value="pos">POS</option>
                <option value="web">Web</option>
                <option value="api">API</option>
              </select>
            </div>

            <!-- Fecha Desde -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Desde</label>
              <input
                v-model="dateFrom"
                type="date"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                @change="fetchOrders"
              >
            </div>

            <!-- Fecha Hasta -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
              <input
                v-model="dateTo"
                type="date"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                @change="fetchOrders"
              >
            </div>
          </div>

          <!-- Botón limpiar filtros -->
          <div class="mt-3 flex justify-end">
            <button
              @click="clearFilters"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600">Cargando ventas...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-red-500 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 class="text-xl font-medium text-gray-900 mb-2">Error al cargar ventas</h2>
          <p class="text-gray-600 text-center max-w-md mb-4">{{ error }}</p>
          <button
            @click="fetchOrders"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>

      <!-- Orders List -->
      <div v-else-if="orders.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cajero</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ order.order_number || order.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ truncateText(order.customer?.name || 'Cliente General', 36) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ order.cajero_nombre || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {{ formatCurrency(order.total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(order.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getSourceClass(order.source)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getSourceText(order.source) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <router-link
                    :to="`/sales/${order.id}`"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Ver Detalle
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span class="font-medium">{{ filteredOrders.length }}</span>
                ventas
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Anterior</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>

                <!-- Page numbers -->
                <button
                  v-for="page in displayedPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>

                <button
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Siguiente</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-400 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"></path>
            <path d="M7 12h10"></path>
            <path d="M7 16h10"></path>
          </svg>
          <h2 class="text-xl font-medium text-gray-900 mb-2">No hay ventas</h2>
          <p class="text-gray-600 text-center max-w-md">
            Aún no se han registrado ventas. Las ventas aparecerán aquí una vez que se procesen.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ordersApi } from '../services/ordersApi';

// Función para obtener fecha de hoy en formato YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const allOrders = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const selectedSource = ref('pos'); // Default: POS (esta es la aplicación POS)
const selectedStatus = ref('1'); // Default: Aprobado (1)
const dateFrom = ref(''); // Default: Sin filtro de fecha (mostrar todas las ventas)
const dateTo = ref(''); // Default: Sin filtro de fecha (mostrar todas las ventas)

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(20);

let searchTimeout = null;

// Filtrar órdenes en el frontend para la búsqueda y paginar
const filteredOrders = computed(() => {
  if (!searchQuery.value) return allOrders.value;

  const query = searchQuery.value.toLowerCase();
  return allOrders.value.filter(order => {
    const customerName = (order.customer?.name || '').toLowerCase();
    const orderNumber = (order.order_number || '').toString().toLowerCase();
    const orderId = (order.id || '').toString().toLowerCase();

    return customerName.includes(query) ||
           orderNumber.includes(query) ||
           orderId.includes(query);
  });
});

// Paginated orders
const orders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredOrders.value.slice(start, end);
});

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage.value);
});

const startItem = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const endItem = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, filteredOrders.value.length);
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

const fetchOrders = async () => {
  loading.value = true;
  error.value = null;
  currentPage.value = 1; // Reset to first page when fetching

  try {
    const filters = {
      limit: 1000 // Cargar más registros para paginar en frontend
    };

    // Agregar filtros solo si tienen valor
    if (selectedSource.value) filters.source = selectedSource.value;
    if (selectedStatus.value) filters.status = selectedStatus.value;
    if (dateFrom.value) filters.date_from = dateFrom.value;
    if (dateTo.value) filters.date_to = dateTo.value;

    console.log('📡 [Sales] Fetching orders with filters:', filters);
    const response = await ordersApi.getOrders(filters);
    console.log('📥 [Sales] Orders API Response:', response);
    console.log('📊 [Sales] Number of orders received:', response.orders?.length || 0);

    // El backend retorna { orders: [...] } con OrderTransformer
    if (response.orders) {
      console.log('✅ [Sales] Using response.orders branch');
      console.log('📋 [Sales] Raw orders before mapping:', response.orders);
      // El OrderTransformer del backend ya transformó los datos
      allOrders.value = response.orders.map((order) => ({
        id: Number(order.id) || 0,
        order_number: order.code,
        customer: {
          name: `${order.billing_info?.name || ''} ${order.billing_info?.last_name || ''}`.trim() || 'Cliente General',
          email: order.billing_info?.email,
          phone: order.billing_info?.phone_number
        },
        cajero_nombre: order.cajero_nombre || null,
        total: parseFloat(order.total_amount || '0'),
        status: order.status, // Ya viene mapeado por el backend
        source: order.tiendaventa_origen || 'web',
        created_at: order.date_created,
        // Guardar datos raw para modal
        _raw: order
      }));

      console.log('🗂️ [Sales] Mapped orders:', allOrders.value);
      console.log('🔍 [Sales] First order sample:', allOrders.value[0]);
    } else if (Array.isArray(response)) {
      allOrders.value = response.map((order) => ({
        id: parseInt(order.tiendaventa_id || order.id),
        order_number: order.tiendaventa_codigoreferencia || order.order_number,
        customer: {
          name: `${order.tiendaventa_nombres || ''} ${order.tiendaventa_apellidos || ''}`.trim() || 'Cliente General'
        },
        cajero_nombre: order.cajero_nombre || null,
        total: parseFloat(order.tiendaventa_totalpagar || order.total || '0'),
        status: order.tiendaventa_pagado || order.status,
        source: order.tiendaventa_origen || order.source || 'web',
        created_at: order.tiendaventa_fecha || order.created_at,
        _raw: order
      }));
    } else {
      allOrders.value = [];
    }

  } catch (err) {
    console.error('Error fetching orders:', err);
    error.value = err.message || 'Error al cargar las ventas';
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = () => {
  // Resetear a la página 1 cuando se busca
  currentPage.value = 1;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) return 'S/ 0.00';
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount);
};

const getStatusText = (status) => {
  const statusMap = {
    0: 'Rechazado',
    1: 'Aprobado',
    2: 'Pendiente',
    9: 'Creado'
  };
  return statusMap[status] || 'Desconocido';
};

const getStatusClass = (status) => {
  const classMap = {
    0: 'bg-red-100 text-red-800',
    1: 'bg-green-100 text-green-800',
    2: 'bg-yellow-100 text-yellow-800',
    9: 'bg-gray-100 text-gray-800'
  };
  return classMap[status] || 'bg-gray-100 text-gray-800';
};

const getSourceText = (source) => {
  const sourceMap = {
    'pos': 'POS',
    'web': 'Web',
    'api': 'API'
  };
  return sourceMap[source] || source || 'Web';
};

const getSourceClass = (source) => {
  const classMap = {
    'pos': 'bg-purple-100 text-purple-800',
    'web': 'bg-blue-100 text-blue-800',
    'api': 'bg-indigo-100 text-indigo-800'
  };
  return classMap[source] || 'bg-blue-100 text-blue-800';
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedSource.value = 'web';
  selectedStatus.value = '1';
  dateFrom.value = getTodayDate();
  dateTo.value = getTodayDate();
  currentPage.value = 1;
  fetchOrders();
};

// Pagination functions
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (page) => {
  currentPage.value = page;
};

onMounted(() => {
  fetchOrders();
});
</script>
