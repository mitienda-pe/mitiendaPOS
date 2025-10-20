<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">Cargando detalle de venta...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md">
        <svg class="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Error al cargar la venta</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <router-link
          to="/sales"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver al Historial
        </router-link>
      </div>
    </div>

    <!-- Ticket View -->
    <div v-else-if="order" class="max-w-2xl mx-auto py-8 px-4">
      <!-- Header con botón volver -->
      <div class="mb-6 flex items-center justify-between">
        <router-link
          to="/sales"
          class="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Historial
        </router-link>

        <button
          @click="printTicket"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Reimprimir
        </button>
      </div>

      <!-- Ticket Container -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden border-2 border-gray-200">
        <div class="p-8">
          <!-- Header del Ticket -->
          <div class="text-center mb-6 pb-6 border-b-2 border-dashed border-gray-300">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">COMPROBANTE DE VENTA</h1>
            <p class="text-lg font-semibold text-gray-700">Nro: {{ order.order_number }}</p>
            <p class="text-sm text-gray-500 mt-2">{{ formatDate(order.created_at) }}</p>
          </div>

          <!-- Información del Cliente -->
          <div class="mb-6 pb-6 border-b-2 border-dashed border-gray-300">
            <h2 class="text-sm font-semibold text-gray-600 uppercase mb-3">Datos del Cliente</h2>
            <div class="space-y-1">
              <p class="text-gray-900"><span class="font-medium">Nombre:</span> {{ order.customer?.name || 'Cliente General' }}</p>
              <p v-if="order.customer?.email" class="text-gray-900"><span class="font-medium">Email:</span> {{ order.customer.email }}</p>
              <p v-if="order.customer?.phone" class="text-gray-900"><span class="font-medium">Teléfono:</span> {{ order.customer.phone }}</p>
              <p v-if="order.cajero_nombre" class="text-gray-900"><span class="font-medium">Atendido por:</span> {{ order.cajero_nombre }}</p>
            </div>
            <div class="mt-3 flex items-center gap-4">
              <span :class="getStatusClass(order.status)" class="px-3 py-1 text-xs font-semibold rounded-full">
                {{ getStatusText(order.status) }}
              </span>
              <span :class="getSourceClass(order.source)" class="px-3 py-1 text-xs font-semibold rounded-full">
                {{ getSourceText(order.source) }}
              </span>
            </div>
          </div>

          <!-- Productos -->
          <div class="mb-6 pb-6 border-b-2 border-dashed border-gray-300">
            <h2 class="text-sm font-semibold text-gray-600 uppercase mb-3">Productos</h2>
            <div class="space-y-3">
              <div v-if="getProducts().length > 0"
                   v-for="item in getProducts()"
                   :key="item.id"
                   class="flex justify-between items-start">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ item.name }}</p>
                  <p class="text-sm text-gray-600">
                    {{ item.quantity }} x {{ formatCurrency(item.price) }}
                  </p>
                </div>
                <p class="font-semibold text-gray-900">
                  {{ formatCurrency(item.total) }}
                </p>
              </div>
              <div v-else class="text-center py-4 text-gray-500">
                No hay información de productos disponible
              </div>
            </div>
          </div>

          <!-- Métodos de Pago -->
          <div v-if="order._rawDetail?.payments && order._rawDetail.payments.length > 0"
               class="mb-6 pb-6 border-b-2 border-dashed border-gray-300">
            <h2 class="text-sm font-semibold text-gray-600 uppercase mb-3">Métodos de Pago</h2>
            <div class="space-y-2">
              <div v-for="payment in order._rawDetail.payments"
                   :key="payment.id"
                   class="flex justify-between items-center">
                <span class="text-gray-700">{{ payment.method_name || payment.metodo }}</span>
                <span class="font-medium text-gray-900">{{ formatCurrency(payment.amount || payment.monto) }}</span>
              </div>
            </div>
          </div>

          <!-- Totales -->
          <div class="space-y-2">
            <div class="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span class="font-medium">{{ formatCurrency(getSubtotal()) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>IGV (18%):</span>
              <span class="font-medium">{{ formatCurrency(getTax()) }}</span>
            </div>
            <div class="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
              <span>TOTAL:</span>
              <span class="text-blue-600">{{ formatCurrency(getTotal()) }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-8 pt-6 border-t-2 border-dashed border-gray-300 text-center">
            <p class="text-gray-600">¡Gracias por su compra!</p>
          </div>
        </div>
      </div>

      <!-- Debug Info (Collapsible) -->
      <div class="mt-6">
        <button
          @click="showDebug = !showDebug"
          class="text-sm text-gray-500 hover:text-gray-700"
        >
          {{ showDebug ? 'Ocultar' : 'Mostrar' }} datos técnicos (JSON)
        </button>
        <pre v-if="showDebug" class="mt-2 bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs">{{ JSON.stringify(order, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ordersApi } from '../services/ordersApi';

const route = useRoute();
const router = useRouter();

const order = ref(null);
const loading = ref(false);
const error = ref(null);
const showDebug = ref(false);

const loadOrderDetail = async () => {
  loading.value = true;
  error.value = null;

  try {
    const orderId = route.params.id;
    const response = await ordersApi.getOrder(orderId);

    console.log('Order Detail Response:', response);

    // Mapear la respuesta al formato esperado
    if (response) {
      // Intentar obtener datos del cliente desde diferentes fuentes
      let customerName = 'Cliente General';
      let customerEmail = '';
      let customerPhone = '';

      // Prioridad 1: Campos directos de la tabla
      if (response.tiendaventa_nombres || response.tiendaventa_apellidos) {
        customerName = `${response.tiendaventa_nombres || ''} ${response.tiendaventa_apellidos || ''}`.trim();
        customerEmail = response.tiendaventa_correoelectronico || '';
        customerPhone = response.tiendaventa_telefono || '';
      }
      // Prioridad 2: billing_info (ventas web antiguas)
      else if (response.billing_info) {
        const billing = response.billing_info;
        customerName = `${billing.name || ''} ${billing.last_name || ''}`.trim() || 'Cliente General';
        customerEmail = billing.email || '';
        customerPhone = billing.phone_number || '';
      }

      order.value = {
        id: parseInt(response.tiendaventa_id || orderId),
        order_number: response.tiendaventa_codigoreferencia || response.code || orderId,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        cajero_nombre: response.cajero_nombre || null,
        total: parseFloat(response.tiendaventa_totalpagar || response.total_amount || '0'),
        status: response.tiendaventa_pagado || response.status,
        source: response.tiendaventa_origen || 'web',
        created_at: response.tiendaventa_fecha || response.date_created,
        _rawDetail: response
      };
    } else {
      error.value = 'No se encontró la venta';
    }
  } catch (err) {
    console.error('Error loading order:', err);
    error.value = err.message || 'Error al cargar el detalle de la venta';
  } finally {
    loading.value = false;
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

// Función para obtener productos desde diferentes estructuras de datos
const getProducts = () => {
  if (!order.value || !order.value._rawDetail) return [];

  // Intentar obtener desde order_items (formato web antiguo)
  if (order.value._rawDetail.order_items && Array.isArray(order.value._rawDetail.order_items)) {
    return order.value._rawDetail.order_items.map(item => ({
      id: item.id,
      name: item.tittle || item.name || 'Producto',
      quantity: item.quantity || 1,
      price: parseFloat(item.price || 0),
      total: parseFloat(item.total || 0)
    }));
  }

  // Intentar obtener desde products (formato POS nuevo)
  if (order.value._rawDetail.products && Array.isArray(order.value._rawDetail.products)) {
    return order.value._rawDetail.products.map(item => ({
      id: item.id,
      name: item.name || item.producto_nombre || 'Producto',
      quantity: item.quantity || item.cantidad || 1,
      price: parseFloat(item.price || item.precio || 0),
      total: parseFloat(item.total || ((item.quantity || item.cantidad) * (item.price || item.precio)) || 0)
    }));
  }

  return [];
};

// Función para calcular subtotal
const getSubtotal = () => {
  if (!order.value) return 0;

  // Si viene en el _rawDetail, usarlo
  if (order.value._rawDetail?.subtotal) {
    return parseFloat(order.value._rawDetail.subtotal);
  }

  // Calcular desde total_amount si existe
  const total = getTotal();
  return total / 1.18; // Quitar el 18% de IGV
};

// Función para calcular IGV
const getTax = () => {
  if (!order.value) return 0;

  // Si viene en el _rawDetail, usarlo
  if (order.value._rawDetail?.tax) {
    return parseFloat(order.value._rawDetail.tax);
  }

  // Calcular como 18% del total
  const total = getTotal();
  return total - (total / 1.18);
};

// Función para obtener el total
const getTotal = () => {
  if (!order.value) return 0;

  // Prioridad: total_amount del _rawDetail
  if (order.value._rawDetail?.total_amount) {
    return parseFloat(order.value._rawDetail.total_amount);
  }

  // Luego el total mapeado
  if (order.value.total) {
    return parseFloat(order.value.total);
  }

  return 0;
};

const printTicket = () => {
  const products = getProducts();
  const payments = order.value._rawDetail?.payments || [];

  const ticketHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket de Venta #${order.value.order_number}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
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
      <div class="center">Nro: ${order.value.order_number}</div>
      <div class="line"></div>
      <div>Fecha: ${formatDate(order.value.created_at)}</div>
      <div>Cliente: ${order.value.customer?.name || 'Cliente General'}</div>
      <div class="line"></div>
      <div class="bold">PRODUCTOS</div>
      <div class="line"></div>
      ${products.map(item => `
        <div>
          ${item.name}
          <table>
            <tr>
              <td>${item.quantity} x ${formatCurrency(item.price)}</td>
              <td class="right">${formatCurrency(item.total)}</td>
            </tr>
          </table>
        </div>
      `).join('')}
      <div class="line"></div>
      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="right">${formatCurrency(getSubtotal())}</td>
        </tr>
        <tr>
          <td>IGV (18%):</td>
          <td class="right">${formatCurrency(getTax())}</td>
        </tr>
        <tr class="total">
          <td>TOTAL:</td>
          <td class="right">${formatCurrency(getTotal())}</td>
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

  const printWindow = window.open('', '_blank', 'width=300,height=600');
  printWindow.document.write(ticketHTML);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 1000);
  };
};

onMounted(() => {
  loadOrderDetail();
});
</script>
