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

        <div class="flex gap-3">
          <button
            v-if="canSendEmail()"
            @click="sendEmail"
            :disabled="sendingEmail"
            class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="!sendingEmail" class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <svg v-else class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ sendingEmail ? 'Enviando...' : 'Enviar Email' }}
          </button>

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
      </div>

      <!-- Notificación de éxito -->
      <div v-if="emailSuccess" class="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div class="flex">
          <svg class="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-green-700">{{ emailSuccess }}</p>
        </div>
      </div>

      <!-- Notificación de error -->
      <div v-if="emailError" class="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div class="flex">
          <svg class="h-5 w-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-700">{{ emailError }}</p>
        </div>
      </div>

      <!-- Notificación al ERP -->
      <div v-if="showErpNotification()" class="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div class="flex">
          <svg class="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-medium text-blue-800 mb-1">Notificación al ERP</p>
            <p class="text-blue-700 text-sm">{{ order._rawDetail.tiendaventa_mensaje_notif_erp || 'Se intentó notificar al ERP' }}</p>
          </div>
        </div>
      </div>

      <!-- Componente de Ticket Reutilizable -->
      <ReceiptTicket
        :order-number="order.order_number"
        :created-at="order.created_at"
        :customer="order.customer"
        :items="getProducts()"
        :payments="order._rawDetail?.payments || []"
        :subtotal="getSubtotal()"
        :tax="getTax()"
        :total="getTotal()"
        :cajero-name="order.cajero_nombre"
        :status="order.status"
        :source="order.source"
        :billing-document="getBillingDocument()"
        :store-info="getStoreInfo()"
        :show-badges="true"
        :show-reprint="true"
      />

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
import ReceiptTicket from '../components/ReceiptTicket.vue';

const route = useRoute();
const router = useRouter();

const order = ref(null);
const loading = ref(false);
const error = ref(null);
const showDebug = ref(false);
const sendingEmail = ref(false);
const emailSuccess = ref(null);
const emailError = ref(null);

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
      let customerDocumentNumber = '';
      let customerDocumentType = '';

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

      // Obtener información del documento si existe
      if (response.customer) {
        customerDocumentNumber = response.customer.document_number || '';
        customerDocumentType = response.customer.document_type || '';
      }

      order.value = {
        id: parseInt(response.tiendaventa_id || orderId),
        order_number: response.tiendaventa_codigoreferencia || response.code || orderId,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          document_number: customerDocumentNumber,
          document_type: customerDocumentType
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

// Función para obtener información del comprobante electrónico
const getBillingDocument = () => {
  if (!order.value?._rawDetail?.billing_info?.['e-billing']) {
    return null;
  }

  const eBilling = order.value._rawDetail.billing_info['e-billing'];
  return {
    serie: eBilling.serie,
    correlative: eBilling.correlative,
    status: eBilling.status,
    billingDate: eBilling.billing_date,
    files: {
      pdf: eBilling.url_pdf,
      xml: eBilling.url_xml
    }
  };
};

// Función para obtener información de la tienda
const getStoreInfo = () => {
  // TODO: Esta información debería venir de la API o del store de autenticación
  // Por ahora retornamos null, pero puedes configurarla manualmente aquí
  // o cuando tengamos un endpoint que la proporcione

  // Ejemplo de cómo se vería:
  // return {
  //   business_name: 'RAZÓN SOCIAL DE LA EMPRESA S.A.C.',
  //   commercial_name: 'Nombre Comercial - Sucursal Centro',
  //   ruc: '20123456789',
  //   address: 'Av. Principal 123, Lima, Perú',
  //   phone: '(01) 234-5678'
  // };

  return null;
};

const printTicket = () => {
  const products = getProducts();
  const payments = order.value._rawDetail?.payments || [];
  const billingDoc = getBillingDocument();

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
      ${billingDoc ? `<div class="center">Comprobante: ${billingDoc.serie}-${billingDoc.correlative}</div>` : ''}
      <div class="line"></div>
      <div>Fecha: ${formatDate(order.value.created_at)}</div>
      <div>Cliente: ${order.value.customer?.name || 'Cliente General'}</div>
      ${order.value.customer?.document_number ? `<div>Doc: ${order.value.customer.document_number}</div>` : ''}
      <div class="line"></div>
      <div class="bold">PRODUCTOS</div>
      <div class="line"></div>
      ${products.map(item => `
        <div>
          ${item.name}
          <table>
            <tr>
              <td>${item.quantity} x S/ ${item.price.toFixed(2)}</td>
              <td class="right">S/ ${item.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
      `).join('')}
      <div class="line"></div>
      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="right">S/ ${getSubtotal().toFixed(2)}</td>
        </tr>
        <tr>
          <td>IGV (18%):</td>
          <td class="right">S/ ${getTax().toFixed(2)}</td>
        </tr>
        <tr class="total">
          <td>TOTAL:</td>
          <td class="right">S/ ${getTotal().toFixed(2)}</td>
        </tr>
      </table>
      ${payments.length > 0 ? `
        <div class="line"></div>
        <div class="bold">PAGOS</div>
        ${payments.map(p => `
          <div class="item-row">
            <span>${p.method_name || p.metodo}</span>
            <span>S/ ${parseFloat(p.amount || p.monto || 0).toFixed(2)}</span>
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

const sendEmail = async () => {
  // Validar que hay email
  if (!order.value?.customer?.email) {
    emailError.value = 'Esta venta no tiene un email de cliente asociado';
    setTimeout(() => emailError.value = null, 5000);
    return;
  }

  // Validar formato de email
  if (!order.value.customer.email.includes('@')) {
    emailError.value = 'El email del cliente no es válido';
    setTimeout(() => emailError.value = null, 5000);
    return;
  }

  try {
    sendingEmail.value = true;
    emailSuccess.value = null;
    emailError.value = null;

    const response = await ordersApi.resendInvoiceEmail(order.value.id);

    if (response.error === 0) {
      emailSuccess.value = `Factura enviada a ${order.value.customer.email}`;
      setTimeout(() => emailSuccess.value = null, 5000);
    } else {
      throw new Error(response.message || 'Error al enviar el email');
    }
  } catch (err) {
    console.error('Error sending email:', err);
    emailError.value = err.message || 'No se pudo enviar el email. Verifica que la venta tenga factura emitida.';
    setTimeout(() => emailError.value = null, 5000);
  } finally {
    sendingEmail.value = false;
  }
};

const canSendEmail = () => {
  // Puede enviar email si:
  // - La orden está aprobada (status = 1)
  // - Tiene email válido
  return order.value &&
         order.value.status == 1 &&
         order.value.customer?.email &&
         order.value.customer.email.includes('@');
};

const showErpNotification = () => {
  // Mostrar notificación si se intentó notificar al ERP
  return order.value?._rawDetail?.tiendaventa_estado_notif_erp == 1;
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

onMounted(() => {
  loadOrderDetail();
});
</script>
