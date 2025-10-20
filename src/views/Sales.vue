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

              <!-- Products List -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Productos</h4>
                <div class="border rounded-lg overflow-hidden">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cant.</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">P. Unit.</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-if="selectedOrder._rawDetail?.products && selectedOrder._rawDetail.products.length > 0"
                          v-for="item in selectedOrder._rawDetail.products" :key="item.id">
                        <td class="px-4 py-3 text-sm text-gray-900">{{ item.name || item.producto_nombre }}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ item.quantity || item.cantidad }}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ formatCurrency(item.price || item.precio) }}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {{ formatCurrency((item.quantity || item.cantidad) * (item.price || item.precio)) }}
                        </td>
                      </tr>
                      <tr v-else>
                        <td colspan="4" class="px-4 py-6 text-center text-sm text-gray-500">
                          No hay información de productos disponible
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Payment Methods -->
              <div class="mb-6" v-if="selectedOrder._rawDetail?.payments">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Métodos de Pago</h4>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div v-for="payment in selectedOrder._rawDetail.payments" :key="payment.id"
                       class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">{{ payment.method_name || payment.metodo }}</span>
                    <span class="text-sm font-medium text-gray-900">{{ formatCurrency(payment.amount || payment.monto) }}</span>
                  </div>
                </div>
              </div>

              <!-- Totals Summary -->
              <div class="mb-6 border-t pt-4">
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-medium">{{ formatCurrency(selectedOrder._rawDetail?.subtotal || selectedOrder.total * 0.85) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">IGV (18%):</span>
                    <span class="font-medium">{{ formatCurrency(selectedOrder._rawDetail?.tax || selectedOrder.total * 0.15) }}</span>
                  </div>
                  <div class="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span class="text-blue-600">{{ formatCurrency(selectedOrder.total) }}</span>
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

              <div class="flex justify-end gap-2">
                <button
                  @click="printTicket(selectedOrder)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Reimprimir Ticket
                </button>
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
    // Use the mapped order data (which has the correct structure)
    // but also attach the raw data for the JSON viewer
    selectedOrder.value = {
      ...order, // Has correct structure with created_at, customer, etc.
      _rawDetail: response // Full response for debugging
    };
  } catch (err) {
    console.error('Error fetching order details:', err);
    // Use the mapped order data
    selectedOrder.value = order;
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

const printTicket = (order) => {
  // Generar el contenido del ticket
  const products = order._rawDetail?.products || [];
  const payments = order._rawDetail?.payments || [];

  const ticketHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket de Venta #${order.order_number || order.id}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          margin: 0;
          padding: 10px;
          width: 80mm;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 5px 0; }
        .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
        .total { font-size: 14px; font-weight: bold; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .right { text-align: right; }
      </style>
    </head>
    <body>
      <div class="center bold">TICKET DE VENTA</div>
      <div class="center">Nro: ${order.order_number || order.id}</div>
      <div class="line"></div>

      <div>Fecha: ${formatDate(order.created_at)}</div>
      <div>Cliente: ${order.customer?.name || 'Cliente General'}</div>

      <div class="line"></div>
      <div class="bold">PRODUCTOS</div>
      <div class="line"></div>

      ${products.map(item => `
        <div>
          ${item.name || item.producto_nombre}
          <table>
            <tr>
              <td>${item.quantity || item.cantidad} x ${formatCurrency(item.price || item.precio)}</td>
              <td class="right">${formatCurrency((item.quantity || item.cantidad) * (item.price || item.precio))}</td>
            </tr>
          </table>
        </div>
      `).join('')}

      <div class="line"></div>

      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="right">${formatCurrency(order._rawDetail?.subtotal || order.total * 0.85)}</td>
        </tr>
        <tr>
          <td>IGV (18%):</td>
          <td class="right">${formatCurrency(order._rawDetail?.tax || order.total * 0.15)}</td>
        </tr>
        <tr class="total">
          <td>TOTAL:</td>
          <td class="right">${formatCurrency(order.total)}</td>
        </tr>
      </table>

      ${payments.length > 0 ? `
        <div class="line"></div>
        <div class="bold">PAGOS</div>
        ${payments.map(p => `
          <div class="item-row">
            <span>${p.method_name || p.metodo}</span>
            <span>${formatCurrency(p.amount || p.monto)}</span>
          </div>
        `).join('')}
      ` : ''}

      <div class="line"></div>
      <div class="center">¡Gracias por su compra!</div>
      <div class="center" style="margin-top: 10px; font-size: 10px;">REIMPRESIÓN</div>
    </body>
    </html>
  `;

  // Abrir ventana de impresión
  const printWindow = window.open('', '_blank', 'width=300,height=600');
  printWindow.document.write(ticketHTML);
  printWindow.document.close();

  // Esperar a que se cargue y luego imprimir
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Cerrar la ventana después de imprimir (opcional)
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };
};

onMounted(() => {
  fetchOrders();
});
</script>
