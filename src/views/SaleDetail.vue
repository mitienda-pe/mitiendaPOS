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
            v-if="canShowEmailButton()"
            @click="openEmailModal"
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
        :rounding-amount="getRoundingAmount()"
        :total-after-rounding="getTotalAfterRounding()"
        :cajero-name="order.cajero_nombre"
        :status="order.status"
        :source="order.source"
        :billing-document="getBillingDocument()"
        :company-info="getCompanyInfo()"
        :store-name="getStoreName()"
        :store-address="getStoreAddress()"
        :store-phone="getStorePhone()"
        :netsuite-customer-code="getNetsuiteCustomerCode()"
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

    <!-- Modal para enviar email -->
    <div v-if="showEmailModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeEmailModal"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Enviar factura por email
                </h3>
                <div class="mt-4">
                  <label for="email-input" class="block text-sm font-medium text-gray-700 mb-2">
                    Email del destinatario
                  </label>
                  <input
                    id="email-input"
                    v-model="emailInput"
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    @keyup.enter="confirmSendEmail"
                  />
                  <p v-if="emailInputError" class="mt-2 text-sm text-red-600">{{ emailInputError }}</p>
                  <p v-if="order?.customer?.email" class="mt-2 text-sm text-gray-500">
                    Email registrado: {{ order.customer.email }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="confirmSendEmail"
              :disabled="sendingEmail"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ sendingEmail ? 'Enviando...' : 'Enviar' }}
            </button>
            <button
              type="button"
              @click="closeEmailModal"
              :disabled="sendingEmail"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ordersApi } from '../services/ordersApi';
import ReceiptTicket from '../components/ReceiptTicket.vue';
import { COMPANY_CONFIG } from '../config/companyConfig';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const order = ref(null);
const loading = ref(false);
const error = ref(null);
const showDebug = ref(false);
const sendingEmail = ref(false);
const emailSuccess = ref(null);
const emailError = ref(null);
const showEmailModal = ref(false);
const emailInput = ref('');
const emailInputError = ref(null);

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
      let customerNetsuiteCode = '';
      if (response.customer) {
        customerDocumentNumber = response.customer.document_number || '';
        customerDocumentType = response.customer.document_type || '';
        customerNetsuiteCode = response.customer.netsuite_code || '';
      }

      order.value = {
        id: parseInt(response.tiendaventa_id || orderId),
        order_number: response.tiendaventa_codigoreferencia || response.code || orderId,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          document_number: customerDocumentNumber,
          document_type: customerDocumentType,
          netsuite_code: customerNetsuiteCode
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

// Función para obtener el monto de redondeo
const getRoundingAmount = () => {
  if (!order.value) return 0;

  // Buscar el redondeo en _rawDetail
  if (order.value._rawDetail?.rounding_amount !== undefined && order.value._rawDetail?.rounding_amount !== null) {
    return parseFloat(order.value._rawDetail.rounding_amount);
  }

  return 0;
};

// Función para obtener el total después del redondeo
const getTotalAfterRounding = () => {
  if (!order.value) return 0;

  // Buscar el total después de redondeo en _rawDetail
  if (order.value._rawDetail?.total_after_rounding !== undefined && order.value._rawDetail?.total_after_rounding !== null) {
    return parseFloat(order.value._rawDetail.total_after_rounding);
  }

  // Si no existe, calcularlo
  const roundingAmount = getRoundingAmount();
  if (roundingAmount !== 0) {
    return getTotal() + roundingAmount;
  }

  return getTotal();
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

// Función para obtener información de la empresa (hardcoded)
const getCompanyInfo = () => {
  return COMPANY_CONFIG;
};

// Función para obtener la dirección de la sucursal
const getStoreAddress = () => {
  // Intentar obtener desde la respuesta de la orden
  if (order.value?._rawDetail?.store_address) {
    return order.value._rawDetail.store_address;
  }

  // Intentar obtener desde authStore
  if (authStore.selectedStore?.address) {
    return authStore.selectedStore.address;
  }

  // TODO: Si no está disponible en la API, deberá agregarse
  // Por ahora retornar null
  return null;
};

// Función para obtener el teléfono de la sucursal
const getStorePhone = () => {
  // Intentar obtener desde la respuesta de la orden
  if (order.value?._rawDetail?.store_phone) {
    return order.value._rawDetail.store_phone;
  }

  // Intentar obtener desde authStore
  if (authStore.selectedStore?.phone) {
    return authStore.selectedStore.phone;
  }

  // TODO: Si no está disponible, deberá agregarse al API
  return null;
};

// Función para obtener el nombre de la tienda/sucursal
const getStoreName = () => {
  // Intentar obtener desde authStore
  if (authStore.selectedStore?.name) {
    return authStore.selectedStore.name;
  }

  // Intentar obtener desde la respuesta de la orden
  if (order.value?._rawDetail?.store_name) {
    return order.value._rawDetail.store_name;
  }

  return 'LIMA'; // Default
};

// Función para obtener código NetSuite del cliente
const getNetsuiteCustomerCode = () => {
  // Prioridad 1: Desde el objeto customer mapeado
  if (order.value?.customer?.netsuite_code) {
    return order.value.customer.netsuite_code;
  }

  // Prioridad 2: Desde _rawDetail (respuesta completa del API)
  if (order.value?._rawDetail?.customer?.netsuite_code) {
    return order.value._rawDetail.customer.netsuite_code;
  }

  return null;
};

// Función para obtener información de la tienda (DEPRECATED - mantener por compatibilidad)
const getStoreInfo = () => {
  return null;
};

const printTicket = () => {
  const products = getProducts();
  const payments = order.value._rawDetail?.payments || [];
  const billingDoc = getBillingDocument();
  const companyInfo = getCompanyInfo();
  const storeName = getStoreName();
  const storeAddress = getStoreAddress();
  const storePhone = getStorePhone();

  // Determinar tipo de documento
  let docType = 'COMPROBANTE ELECTRÓNICO';
  if (billingDoc?.serie) {
    const serie = billingDoc.serie.toString().toUpperCase();
    if (serie.startsWith('F')) docType = 'FACTURA ELECTRÓNICA';
    else if (serie.startsWith('B')) docType = 'BOLETA ELECTRÓNICA';
  }

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
          font-size: 11px;
          margin: 0;
          padding: 10px;
          width: 80mm;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 5px 0; }
        .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
        .total { font-size: 13px; font-weight: bold; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .right { text-align: right; }
        .small { font-size: 9px; }
        img { max-width: 60px; height: auto; }
      </style>
    </head>
    <body>
      <!-- Header -->
      ${companyInfo.logoUrl ? `<div class="center"><img src="${companyInfo.logoUrl}" alt="Logo" /></div>` : ''}
      <div class="center bold">${companyInfo.legalName || 'TICKET DE VENTA'}</div>
      ${storeAddress ? `<div class="center small">${storeAddress}</div>` : ''}
      ${companyInfo.ruc ? `<div class="center small">RUC: ${companyInfo.ruc}</div>` : ''}
      ${storeName ? `<div class="center small">TIENDA ${storeName.toUpperCase()}</div>` : ''}
      ${storePhone ? `<div class="center small">TLF.: ${storePhone}</div>` : ''}
      <div class="line"></div>

      <!-- Información del Documento -->
      ${billingDoc ? `
        <div class="center bold">${docType}</div>
        <div class="center bold">${billingDoc.serie}-${billingDoc.correlative}</div>
      ` : `
        <div class="center bold">Nro: ${order.value.order_number}</div>
      `}
      <div class="line"></div>

      <!-- Información General -->
      <div>Fecha: ${formatDate(order.value.created_at)}</div>
      <div>Cliente: ${order.value.customer?.name || 'Cliente General'}</div>
      ${order.value.customer?.document_number ? `<div>Doc: ${order.value.customer.document_number}</div>` : ''}
      <div class="line"></div>

      <!-- Productos -->
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

      <!-- Totales -->
      <table>
        <tr>
          <td>OPERACIONES GRAVADAS:</td>
          <td class="right">S/ ${getSubtotal().toFixed(2)}</td>
        </tr>
        <tr>
          <td>IGV (18%):</td>
          <td class="right">S/ ${getTax().toFixed(2)}</td>
        </tr>
        <tr class="total">
          <td>TOTAL GENERAL S/:</td>
          <td class="right">S/ ${getTotal().toFixed(2)}</td>
        </tr>
      </table>

      <!-- Pagos -->
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

      <!-- Footer Legal -->
      ${companyInfo.sunat ? `
        <div class="center small" style="margin-bottom: 5px;">
          ${companyInfo.sunat.authorizationText}
        </div>
        <div class="center small" style="margin-bottom: 10px;">
          ${companyInfo.sunat.representationText}
        </div>
      ` : ''}

      <!-- QR Code (si hay comprobante electrónico) -->
      ${billingDoc?.files?.pdf ? `
        <div class="center" style="margin: 10px 0;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(billingDoc.files.pdf)}" alt="QR Comprobante" style="width: 120px; height: 120px; border: 1px solid #ccc; padding: 4px;" />
        </div>
      ` : ''}

      <!-- Website después del QR -->
      ${companyInfo.website ? `
        <div class="center small" style="margin-bottom: 10px;">
          Para más productos visita<br />
          <span class="bold">${companyInfo.website}</span>
        </div>
      ` : ''}

      <div class="center bold">¡Gracias por su compra!</div>
      <div class="center small">${formatDate(order.value.created_at)}</div>
      ${order.value.cajero_nombre ? `<div class="center small">Cajero: ${order.value.cajero_nombre}</div>` : ''}
      <div class="center small bold" style="margin-top: 10px;">REIMPRESIÓN</div>
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

const openEmailModal = () => {
  // Pre-cargar el email del cliente si existe
  emailInput.value = order.value?.customer?.email || '';
  emailInputError.value = null;
  showEmailModal.value = true;
};

const closeEmailModal = () => {
  if (!sendingEmail.value) {
    showEmailModal.value = false;
    emailInput.value = '';
    emailInputError.value = null;
  }
};

const confirmSendEmail = async () => {
  // Limpiar errores previos
  emailInputError.value = null;
  emailSuccess.value = null;
  emailError.value = null;

  // Validar que se ingresó un email
  if (!emailInput.value || emailInput.value.trim() === '') {
    emailInputError.value = 'Por favor ingresa un email';
    return;
  }

  // Validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value.trim())) {
    emailInputError.value = 'El formato del email no es válido';
    return;
  }

  try {
    sendingEmail.value = true;

    const response = await ordersApi.resendInvoiceEmail(order.value.id, emailInput.value.trim());

    if (response.error === 0) {
      emailSuccess.value = `Factura enviada exitosamente a ${emailInput.value.trim()}`;
      setTimeout(() => emailSuccess.value = null, 5000);
      closeEmailModal();
    } else {
      throw new Error(response.message || 'Error al enviar el email');
    }
  } catch (err) {
    console.error('Error sending email:', err);
    emailError.value = err.message || 'No se pudo enviar el email. Verifica que la venta tenga factura emitida.';
    setTimeout(() => emailError.value = null, 8000);
    closeEmailModal();
  } finally {
    sendingEmail.value = false;
  }
};

const canShowEmailButton = () => {
  // Mostrar botón si la orden está aprobada (status = 1) y tiene factura
  return order.value && order.value.status == 1;
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
