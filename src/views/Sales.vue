<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Historial de Ventas</h1>
        <div class="flex space-x-2">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por cliente o número..."
              class="p-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500"
              @input="debouncedSearch"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-2 top-2.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <select
            v-model="selectedSource"
            class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            @change="fetchOrders"
          >
            <option value="">Todas las fuentes</option>
            <option value="pos">POS</option>
            <option value="web">Web</option>
            <option value="api">API</option>
          </select>
          <button
            @click="fetchOrders"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Actualizar
          </button>
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
                  {{ order.customer?.name || 'Cliente General' }}
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
                  <button
                    @click="viewOrderDetails(order)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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

  <!-- Order Detail Modal -->
  <div v-if="selectedOrder" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="selectedOrder = null"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Detalle de Venta #{{ selectedOrder.order_number || selectedOrder.id }}</h3>
                <button @click="selectedOrder = null" class="text-gray-400 hover:text-gray-500">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Order Info -->
              <div class="mb-4 p-4 bg-gray-50 rounded-lg">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Fecha</p>
                    <p class="font-medium">{{ formatDate(selectedOrder.created_at) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Cliente</p>
                    <p class="font-medium">{{ selectedOrder.customer?.name || 'Cliente General' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Estado</p>
                    <span :class="getStatusClass(selectedOrder.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getStatusText(selectedOrder.status) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Origen</p>
                    <span :class="getSourceClass(selectedOrder.source)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getSourceText(selectedOrder.source) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Raw JSON for debugging -->
              <div class="mb-4">
                <button
                  @click="showRawData = !showRawData"
                  class="text-sm text-blue-600 hover:text-blue-800 mb-2"
                >
                  {{ showRawData ? 'Ocultar' : 'Mostrar' }} datos completos (JSON)
                </button>
                <pre v-if="showRawData" class="bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs">{{ JSON.stringify(selectedOrder, null, 2) }}</pre>
              </div>

              <div class="flex justify-end">
                <button
                  @click="selectedOrder = null"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cerrar
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
import { ref, onMounted } from 'vue';
import { ordersApi } from '../services/ordersApi';

const orders = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const selectedSource = ref('');
const selectedOrder = ref(null);
const showRawData = ref(false);

let searchTimeout = null;

const fetchOrders = async () => {
  loading.value = true;
  error.value = null;

  try {
    const filters = {
      limit: 50,
      source: selectedSource.value || undefined
    };

    const response = await ordersApi.getOrders(filters);
    console.log('Orders API Response:', response);

    // La respuesta puede venir en diferentes formatos
    if (response.orders) {
      // Mapear campos de BD a formato esperado
      orders.value = response.orders.map((order) => ({
        id: parseInt(order.tiendaventa_id),
        order_number: order.tiendaventa_codigoreferencia,
        customer: {
          name: `${order.tiendaventa_nombres || ''} ${order.tiendaventa_apellidos || ''}`.trim() || 'Cliente General',
          email: order.tiendaventa_correoelectronico,
          phone: order.tiendaventa_telefono
        },
        total: parseFloat(order.tiendaventa_totalpagar || '0'),
        status: order.tiendaventa_pagado, // 0=rechazado, 1=pagado, 2=pendiente
        source: order.tiendaventa_origen || 'web',
        created_at: order.tiendaventa_fecha,
        // Guardar datos raw para modal
        _raw: order
      }));
    } else if (Array.isArray(response)) {
      orders.value = response.map((order) => ({
        id: parseInt(order.tiendaventa_id || order.id),
        order_number: order.tiendaventa_codigoreferencia || order.order_number,
        customer: {
          name: `${order.tiendaventa_nombres || ''} ${order.tiendaventa_apellidos || ''}`.trim() || 'Cliente General'
        },
        total: parseFloat(order.tiendaventa_totalpagar || order.total || '0'),
        status: order.tiendaventa_pagado || order.status,
        source: order.tiendaventa_origen || order.source || 'web',
        created_at: order.tiendaventa_fecha || order.created_at,
        _raw: order
      }));
    } else {
      orders.value = [];
    }

  } catch (err) {
    console.error('Error fetching orders:', err);
    error.value = err.message || 'Error al cargar las ventas';
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchOrders();
  }, 500);
};

const viewOrderDetails = async (order) => {
  try {
    // Fetch full order details
    const response = await ordersApi.getOrder(order.id);
    console.log('Order Detail Response:', response);
    // Use raw data if available, otherwise use response
    selectedOrder.value = order._raw || response || order;
  } catch (err) {
    console.error('Error fetching order details:', err);
    // Use raw data from list
    selectedOrder.value = order._raw || order;
  }
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

onMounted(() => {
  fetchOrders();
});
</script>
