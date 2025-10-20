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
              <div v-if="order._rawDetail?.products && order._rawDetail.products.length > 0"
                   v-for="item in order._rawDetail.products"
                   :key="item.id"
                   class="flex justify-between items-start">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ item.name || item.producto_nombre }}</p>
                  <p class="text-sm text-gray-600">
                    {{ item.quantity || item.cantidad }} x {{ formatCurrency(item.price || item.precio) }}
                  </p>
                </div>
                <p class="font-semibold text-gray-900">
                  {{ formatCurrency((item.quantity || item.cantidad) * (item.price || item.precio)) }}
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
              <span class="font-medium">{{ formatCurrency(order._rawDetail?.subtotal || order.total * 0.85) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>IGV (18%):</span>
              <span class="font-medium">{{ formatCurrency(order._rawDetail?.tax || order.total * 0.15) }}</span>
            </div>
            <div class="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
              <span>TOTAL:</span>
              <span class="text-blue-600">{{ formatCurrency(order.total) }}</span>
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
      order.value = {
        id: parseInt(response.tiendaventa_id || orderId),
        order_number: response.tiendaventa_codigoreferencia || orderId,
        customer: {
          name: `${response.tiendaventa_nombres || ''} ${response.tiendaventa_apellidos || ''}`.trim() || 'Cliente General',
          email: response.tiendaventa_correoelectronico,
          phone: response.tiendaventa_telefono
        },
        total: parseFloat(response.tiendaventa_totalpagar || '0'),
        status: response.tiendaventa_pagado,
        source: response.tiendaventa_origen || 'web',
        created_at: response.tiendaventa_fecha,
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

const printTicket = () => {
  const products = order.value._rawDetail?.products || [];
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
          <td class="right">${formatCurrency(order.value._rawDetail?.subtotal || order.value.total * 0.85)}</td>
        </tr>
        <tr>
          <td>IGV (18%):</td>
          <td class="right">${formatCurrency(order.value._rawDetail?.tax || order.value.total * 0.15)}</td>
        </tr>
        <tr class="total">
          <td>TOTAL:</td>
          <td class="right">${formatCurrency(order.value.total)}</td>
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
