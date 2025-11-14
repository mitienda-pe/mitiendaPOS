<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden border-2 border-gray-200">
    <div class="p-8 font-mono text-sm">
      <!-- Header del Ticket -->
      <div class="text-center mb-4">
        <div class="font-bold text-lg mb-2">TICKET DE VENTA</div>
        <div v-if="orderNumber" class="font-semibold">Nro: {{ orderNumber }}</div>
        <div v-if="billingDocument" class="mt-1">
          Comprobante: {{ billingDocument.serie }}-{{ billingDocument.correlative }}
        </div>
      </div>

      <div class="border-t border-dashed border-gray-400 my-3"></div>

      <!-- Información básica -->
      <div class="mb-3">
        <div>Fecha: {{ formatDateSimple(createdAt) }}</div>
        <div>Cliente: {{ customerName || 'Cliente General' }}</div>
        <div v-if="customer?.document_number">
          Doc: {{ customer.document_number }}
        </div>
        <div v-if="cajeroName">Cajero: {{ cajeroName }}</div>
      </div>

      <div class="border-t border-dashed border-gray-400 my-3"></div>

      <!-- Productos -->
      <div class="mb-3">
        <div class="font-bold mb-2">PRODUCTOS</div>
        <div class="border-t border-dashed border-gray-400 mb-2"></div>

        <div v-if="items && items.length > 0">
          <div v-for="(item, index) in items" :key="item.id || index" class="mb-2">
            <div>{{ getItemName(item) }}</div>
            <div class="flex justify-between">
              <span>{{ getItemQuantity(item) }} x S/ {{ getItemPrice(item).toFixed(2) }}</span>
              <span>S/ {{ getItemTotal(item).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">
          No hay información de productos disponible
        </div>
      </div>

      <div class="border-t border-dashed border-gray-400 my-3"></div>

      <!-- Totales -->
      <div class="mb-3">
        <div class="flex justify-between">
          <span>Subtotal:</span>
          <span>S/ {{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span>IGV (18%):</span>
          <span>S/ {{ tax.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between font-bold text-base mt-2">
          <span>TOTAL:</span>
          <span>S/ {{ total.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Métodos de Pago -->
      <div v-if="payments && payments.length > 0" class="mb-3">
        <div class="border-t border-dashed border-gray-400 my-3"></div>
        <div class="font-bold mb-2">PAGOS</div>
        <div v-for="(payment, index) in payments" :key="payment.id || index" class="flex justify-between">
          <span>{{ getPaymentMethodName(payment) }}</span>
          <span>S/ {{ getPaymentAmount(payment).toFixed(2) }}</span>
        </div>
      </div>

      <div class="border-t border-dashed border-gray-400 my-3"></div>

      <!-- Footer -->
      <div class="text-center mt-4">
        <div>¡Gracias por su compra!</div>
        <div v-if="showReprint" class="text-xs mt-2">REIMPRESIÓN</div>
      </div>

      <!-- QR Code para Comprobante Electrónico -->
      <div v-if="billingDocument?.files?.pdf" class="text-center mt-4">
        <div class="text-xs mb-2">
          Comprobante Electrónico
          <div class="font-semibold">
            {{ billingDocument.serie }}-{{ billingDocument.correlative }}
          </div>
        </div>
        <div class="flex justify-center">
          <img
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(billingDocument.files.pdf)}`"
            :alt="`QR Comprobante ${billingDocument.serie}-${billingDocument.correlative}`"
            class="w-32 h-32 border border-gray-300 p-1"
          />
        </div>
        <div class="text-xs mt-2 text-gray-600">Escanea para ver el PDF</div>
      </div>

      <!-- Badges de estado (solo si showBadges está activo) -->
      <div v-if="showBadges" class="mt-4 pt-4 border-t border-gray-300">
        <div class="flex items-center gap-2 justify-center flex-wrap">
          <span v-if="status !== undefined" :class="getStatusClass(status)" class="px-2 py-1 text-xs font-semibold rounded-full">
            {{ getStatusText(status) }}
          </span>
          <span v-if="source" :class="getSourceClass(source)" class="px-2 py-1 text-xs font-semibold rounded-full">
            {{ getSourceText(source) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Información básica
  orderNumber: {
    type: [String, Number],
    default: null
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },

  // Cliente
  customer: {
    type: Object,
    default: () => ({})
  },

  // Items/Productos
  items: {
    type: Array,
    default: () => []
  },

  // Pagos
  payments: {
    type: Array,
    default: () => []
  },

  // Totales
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },

  // Información adicional
  cajeroName: {
    type: String,
    default: null
  },
  status: {
    type: [Number, String],
    default: undefined
  },
  source: {
    type: String,
    default: null
  },
  storeName: {
    type: String,
    default: null
  },

  // Comprobante electrónico
  billingDocument: {
    type: Object,
    default: null
    // { serie, correlative, status, billingDate, files: { pdf, xml } }
  },

  // Opciones de visualización
  showBadges: {
    type: Boolean,
    default: true
  },
  showReprint: {
    type: Boolean,
    default: false
  }
});

// Computed para nombre del cliente
const customerName = computed(() => {
  if (props.customer?.business_name) {
    return props.customer.business_name;
  }

  if (props.customer?.name) {
    return props.customer.name;
  }

  // Intentar construir desde nombres/apellidos
  const firstName = props.customer?.nombres || '';
  const lastName = props.customer?.apellidos || '';
  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }

  return 'Cliente General';
});

// Helpers para items (manejar diferentes formatos)
const getItemName = (item) => {
  return item.nombre || item.name || item.tittle || item.product_name || 'Producto';
};

const getItemQuantity = (item) => {
  return item.quantity || item.cantidad || 1;
};

const getItemPrice = (item) => {
  return parseFloat(item.precio || item.price || item.unit_price || 0);
};

const getItemTotal = (item) => {
  if (item.total !== undefined && item.total !== null) {
    return parseFloat(item.total);
  }
  return getItemQuantity(item) * getItemPrice(item);
};

// Helpers para pagos
const getPaymentMethodName = (payment) => {
  return payment.methodName || payment.method_name || payment.metodo || payment.method || 'Pago';
};

const getPaymentAmount = (payment) => {
  return parseFloat(payment.amount || payment.monto || 0);
};

// Formateo simple para el ticket
const formatDateSimple = (dateString) => {
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

// Status helpers
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
</script>

<style scoped>
@media print {
  .print\:p-4 {
    padding: 1rem;
  }
}
</style>
