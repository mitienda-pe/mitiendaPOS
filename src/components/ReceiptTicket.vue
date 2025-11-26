<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden border-2 border-gray-200">
    <div class="p-8 font-mono text-sm">
      <!-- Header del Ticket -->
      <div class="text-center mb-4">
        <!-- Logo de la empresa -->
        <div v-if="companyInfo?.logoUrl" class="mb-3 flex justify-center">
          <img :src="companyInfo.logoUrl" :alt="companyInfo.legalName" class="h-16 object-contain" />
        </div>

        <!-- Información de la empresa -->
        <div class="font-bold text-base mb-1">{{ companyInfo?.legalName || 'TICKET DE VENTA' }}</div>
        <div v-if="storeAddress" class="text-xs mb-1">{{ storeAddress }}</div>
        <div v-if="companyInfo?.ruc" class="text-xs mb-1">RUC: {{ companyInfo.ruc }}</div>
        <div v-if="storeName" class="text-xs mb-1">TIENDA {{ storeName.toUpperCase() }}</div>
        <div v-if="storePhone" class="text-xs">TLF.: {{ storePhone }}</div>
      </div>

      <div class="border-t border-dashed border-gray-400 my-3"></div>

      <!-- Información del documento -->
      <div class="text-center mb-3">
        <!-- Tipo de documento (BOLETA/FACTURA ELECTRÓNICA) -->
        <div v-if="billingDocument" class="font-bold text-sm mb-1">
          {{ getDocumentTypeName() }}
        </div>
        <div v-if="billingDocument" class="font-semibold">
          {{ billingDocument.serie }}-{{ billingDocument.correlative }}
        </div>
        <div v-else-if="orderNumber" class="font-semibold">
          Nro: {{ orderNumber }}
        </div>

        <!-- Código NetSuite del cliente (si existe) -->
        <div v-if="netsuiteCustomerCode" class="text-xs mt-1">
          Cliente NetSuite: {{ netsuiteCustomerCode }}
        </div>
      </div>

      <div class="border-t border-dashed border-gray-400 my-3"></div>

      <!-- Información básica -->
      <div class="mb-3">
        <div>Fecha: {{ formatDateSimple(createdAt) }}</div>
        <div>Cliente: {{ customerName || 'Cliente General' }}</div>
        <div v-if="customer?.document_number">
          {{ getDocumentTypeLabel() }}: {{ customer.document_number }}
        </div>
        <div v-if="customer?.email" class="text-xs">
          Email: {{ customer.email }}
        </div>
        <div v-if="customer?.phone" class="text-xs">
          Tel: {{ customer.phone }}
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
          <span>OPERACIONES GRAVADAS:</span>
          <span>S/ {{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span>IGV (18%):</span>
          <span>S/ {{ tax.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between font-bold text-base mt-2">
          <span>TOTAL GENERAL S/:</span>
          <span>S/ {{ total.toFixed(2) }}</span>
        </div>

        <!-- Redondeo (solo si aplica) -->
        <div v-if="roundingAmount !== undefined && roundingAmount !== null && roundingAmount !== 0" class="border-t border-dashed border-gray-400 mt-2 pt-2">
          <div class="flex justify-between text-sm">
            <span>{{ roundingAmount > 0 ? 'Redondeo (+):' : 'Redondeo (-):' }}</span>
            <span :class="roundingAmount > 0 ? 'text-red-600' : 'text-green-600'">
              S/ {{ Math.abs(roundingAmount).toFixed(2) }}
            </span>
          </div>
          <div class="flex justify-between font-bold text-base mt-2">
            <span>TOTAL A PAGAR:</span>
            <span>S/ {{ totalAfterRounding.toFixed(2) }}</span>
          </div>
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

      <!-- Footer con textos legales SUNAT -->
      <div class="text-center mt-4">
        <!-- Textos legales -->
        <div v-if="companyInfo?.sunat" class="text-xs mb-3">
          <div class="mb-1">{{ companyInfo.sunat.authorizationText }}</div>
          <div class="mb-1">{{ companyInfo.sunat.representationText }}</div>
        </div>

        <!-- QR Code para Comprobante Electrónico -->
        <div v-if="billingDocument?.files?.pdf" class="mb-3">
          <div class="flex justify-center">
            <img
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(billingDocument.files.pdf)}`"
              :alt="`QR Comprobante ${billingDocument.serie}-${billingDocument.correlative}`"
              class="w-32 h-32 border border-gray-300 p-1"
            />
          </div>
        </div>

        <!-- Website después del QR -->
        <div v-if="companyInfo.website" class="text-xs mb-3">
          Para más productos visita<br />
          <span class="font-semibold">{{ companyInfo.website }}</span>
        </div>

        <div class="font-semibold mb-2">¡Gracias por su compra!</div>

        <!-- Fecha y hora de emisión -->
        <div class="text-xs mb-1">{{ formatDateSimple(createdAt) }}</div>

        <!-- Cajero -->
        <div v-if="cajeroName" class="text-xs">
          Cajero: {{ cajeroName }}
        </div>

        <div v-if="showReprint" class="text-xs mt-2 font-bold">REIMPRESIÓN</div>
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
  roundingAmount: {
    type: Number,
    default: 0
  },
  totalAfterRounding: {
    type: Number,
    default: null
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

  // Información de la tienda/sucursal (DEPRECATED - usar companyInfo y storeAddress)
  storeInfo: {
    type: Object,
    default: null
    // { business_name, commercial_name, ruc, address, phone }
  },

  // Información de la empresa (hardcoded o desde config)
  companyInfo: {
    type: Object,
    default: () => ({})
    // { legalName, commercialName, ruc, logoUrl, website, sunat: { authorizationText, representationText } }
  },

  // Dirección de la sucursal (dinámico)
  storeAddress: {
    type: String,
    default: null
  },

  // Teléfono de la sucursal (dinámico)
  storePhone: {
    type: String,
    default: null
  },

  // Código NetSuite del cliente (opcional)
  netsuiteCustomerCode: {
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

// Computed para total después de redondeo
const totalAfterRounding = computed(() => {
  // Si se pasó explícitamente, usarlo
  if (props.totalAfterRounding !== null && props.totalAfterRounding !== undefined) {
    return props.totalAfterRounding;
  }
  // Si hay redondeo, calcularlo
  if (props.roundingAmount !== undefined && props.roundingAmount !== null && props.roundingAmount !== 0) {
    return props.total + props.roundingAmount;
  }
  // Si no hay redondeo, usar total normal
  return props.total;
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

// Helper para obtener el nombre del tipo de documento (BOLETA/FACTURA)
const getDocumentTypeName = () => {
  if (!props.billingDocument?.serie) return 'COMPROBANTE ELECTRÓNICO';

  const serie = props.billingDocument.serie.toString().toUpperCase();

  if (serie.startsWith('F')) {
    return 'FACTURA ELECTRÓNICA';
  }

  if (serie.startsWith('B')) {
    return 'BOLETA ELECTRÓNICA';
  }

  return 'COMPROBANTE ELECTRÓNICO';
};

// Helper para tipo de documento del cliente (DNI/RUC)
const getDocumentTypeLabel = () => {
  // Si hay comprobante electrónico, determinar por la serie
  if (props.billingDocument?.serie) {
    const serie = props.billingDocument.serie.toString().toUpperCase();
    // Facturas comienzan con F
    if (serie.startsWith('F')) {
      return 'RUC';
    }
    // Boletas comienzan con B
    if (serie.startsWith('B')) {
      return 'DNI';
    }
  }

  // Si no hay comprobante, usar el tipo de documento del cliente
  if (props.customer?.document_type) {
    const typeStr = props.customer.document_type.toString().toLowerCase();
    if (typeStr === '6' || typeStr === 'ruc') return 'RUC';
    if (typeStr === '1' || typeStr === 'dni') return 'DNI';
  }

  // Por defecto DNI
  return 'DNI';
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
