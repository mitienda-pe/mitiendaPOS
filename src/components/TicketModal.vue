<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4 text-center">
                Ticket de Compra
              </h3>

              <div id="ticket-content" class="bg-white p-4 border border-gray-200 rounded-lg">
                <!-- Store Header -->
                <div class="text-center mb-4 border-b pb-3">
                  <h2 class="text-xl font-bold">{{ store?.razonSocial || store?.name || 'Mi Tienda POS' }}</h2>
                  <p v-if="store?.ruc" class="text-sm text-gray-600">RUC: {{ store.ruc }}</p>
                  <p v-if="store?.direccionCompleta" class="text-sm text-gray-600">{{ store.direccionCompleta }}</p>
                  <p v-else-if="store?.direccion" class="text-sm text-gray-600">{{ store.direccion }}</p>
                  <p v-if="store?.telefono" class="text-sm text-gray-600">Tel: {{ store.telefono }}</p>
                  <p class="text-sm text-gray-600 mt-2">{{ formatDate(new Date()) }}</p>
                </div>

                <!-- Customer Info -->
                <div class="mb-3">
                  <p v-if="customer" class="text-sm">
                    <span class="font-medium">Cliente:</span>
                    {{ customer.name || `${customer.nombres || ''} ${customer.apellidos || ''}`.trim() || 'Cliente General' }}
                  </p>
                  <p v-else class="text-sm"><span class="font-medium">Cliente:</span> Cliente General</p>
                  <p v-if="customer?.document_number" class="text-sm">
                    <span class="font-medium">{{ customer.document_type === '6' ? 'RUC' : 'DNI' }}:</span>
                    {{ customer.document_number }}
                  </p>
                </div>

                <!-- Items Table -->
                <div class="border-t border-b py-2 mb-3">
                  <div class="flex justify-between text-sm font-medium mb-1">
                    <span>Producto</span>
                    <div class="flex">
                      <span class="w-16 text-right">Precio</span>
                      <span class="w-10 text-right">Cant</span>
                      <span class="w-16 text-right">Total</span>
                    </div>
                  </div>

                  <div v-for="(item, index) in items" :key="index" class="flex justify-between text-sm mb-1">
                    <span class="truncate max-w-[150px]">{{ item.nombre }}</span>
                    <div class="flex">
                      <span class="w-16 text-right">{{ formatCurrency(item.precio) }}</span>
                      <span class="w-10 text-right">{{ item.quantity }}</span>
                      <span class="w-16 text-right">{{ formatCurrency(item.precio * item.quantity) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Totals -->
                <div class="mb-3">
                  <div class="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{{ formatCurrency(subtotal) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>IGV (18%):</span>
                    <span>{{ formatCurrency(tax) }}</span>
                  </div>
                  <div class="flex justify-between font-bold text-base mt-1">
                    <span>Total:</span>
                    <span>{{ formatCurrency(total) }}</span>
                  </div>
                </div>

                <!-- Payments -->
                <div v-if="payments && payments.length > 0" class="border-t pt-2 mb-3">
                  <div class="text-sm font-medium mb-1">Pagos realizados:</div>
                  <div v-for="(payment, index) in payments" :key="index" class="flex justify-between text-sm">
                    <span>{{ payment.methodName }}:</span>
                    <span>{{ formatCurrency(payment.amount) }}</span>
                  </div>
                  <div class="flex justify-between font-medium mt-1">
                    <span>Total pagado:</span>
                    <span>{{ formatCurrency(totalPaid) }}</span>
                  </div>
                </div>

                <!-- Footer -->
                <div class="text-center mt-4 border-t pt-3">
                  <p class="text-sm font-medium">¡Gracias por su compra!</p>
                  <p v-if="store?.url" class="text-xs text-gray-600 mt-1">{{ store.url }}</p>
                  <p v-else class="text-xs text-gray-600 mt-1">www.mitienda.pe</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            @click="closeModal"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:w-auto sm:text-sm"
          >
            Cerrar
          </button>
          <button
            @click="printTicket"
            class="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button
            @click="downloadPDF"
            class="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:w-auto sm:text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import jsPDF from 'jspdf';

const authStore = useAuthStore();

const props = defineProps({
  modelValue: Boolean,
  customer: Object,
  items: Array,
  subtotal: Number,
  tax: Number,
  total: Number,
  payments: Array
});

const emit = defineEmits(['update:modelValue']);

const store = computed(() => authStore.selectedStore);

const totalPaid = computed(() => {
  if (!props.payments) return 0;
  return props.payments.reduce((sum, payment) => sum + payment.amount, 0);
});

const closeModal = () => {
  emit('update:modelValue', false);
};

const printTicket = () => {
  window.print();
};

const downloadPDF = () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Ticket size (80mm width)
  });

  let y = 10;
  const lineHeight = 5;
  const maxWidth = 70;

  // Store Header
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  const storeName = store.value?.razonSocial || store.value?.name || 'Mi Tienda POS';
  doc.text(storeName, 40, y, { align: 'center' });
  y += lineHeight;

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');

  if (store.value?.ruc) {
    doc.text(`RUC: ${store.value.ruc}`, 40, y, { align: 'center' });
    y += lineHeight;
  }

  if (store.value?.direccionCompleta) {
    const addressLines = doc.splitTextToSize(store.value.direccionCompleta, maxWidth);
    addressLines.forEach(line => {
      doc.text(line, 40, y, { align: 'center' });
      y += lineHeight;
    });
  }

  if (store.value?.telefono) {
    doc.text(`Tel: ${store.value.telefono}`, 40, y, { align: 'center' });
    y += lineHeight;
  }

  doc.text(formatDate(new Date()), 40, y, { align: 'center' });
  y += lineHeight + 2;

  // Line separator
  doc.line(5, y, 75, y);
  y += lineHeight;

  // Customer
  const customerName = props.customer?.name ||
                       `${props.customer?.nombres || ''} ${props.customer?.apellidos || ''}`.trim() ||
                       'Cliente General';
  doc.text(`Cliente: ${customerName}`, 5, y);
  y += lineHeight;

  if (props.customer?.document_number) {
    const docType = props.customer.document_type === '6' ? 'RUC' : 'DNI';
    doc.text(`${docType}: ${props.customer.document_number}`, 5, y);
    y += lineHeight;
  }

  y += 2;
  doc.line(5, y, 75, y);
  y += lineHeight;

  // Items
  doc.setFont(undefined, 'bold');
  doc.text('Producto', 5, y);
  doc.text('Cant', 50, y);
  doc.text('Total', 70, y, { align: 'right' });
  y += lineHeight;
  doc.setFont(undefined, 'normal');

  doc.line(5, y, 75, y);
  y += lineHeight;

  props.items.forEach(item => {
    const productLines = doc.splitTextToSize(item.nombre, 40);
    productLines.forEach((line, index) => {
      doc.text(line, 5, y);
      if (index === 0) {
        doc.text(item.quantity.toString(), 50, y);
        doc.text(formatCurrency(item.precio * item.quantity), 70, y, { align: 'right' });
      }
      y += lineHeight;
    });
  });

  y += 2;
  doc.line(5, y, 75, y);
  y += lineHeight;

  // Totals
  doc.text('Subtotal:', 5, y);
  doc.text(formatCurrency(props.subtotal), 70, y, { align: 'right' });
  y += lineHeight;

  doc.text('IGV (18%):', 5, y);
  doc.text(formatCurrency(props.tax), 70, y, { align: 'right' });
  y += lineHeight;

  doc.setFont(undefined, 'bold');
  doc.text('TOTAL:', 5, y);
  doc.text(formatCurrency(props.total), 70, y, { align: 'right' });
  y += lineHeight + 2;

  doc.setFont(undefined, 'normal');

  // Payments
  if (props.payments && props.payments.length > 0) {
    doc.line(5, y, 75, y);
    y += lineHeight;

    doc.setFont(undefined, 'bold');
    doc.text('Pagos realizados:', 5, y);
    y += lineHeight;
    doc.setFont(undefined, 'normal');

    props.payments.forEach(payment => {
      doc.text(`${payment.methodName}:`, 5, y);
      doc.text(formatCurrency(payment.amount), 70, y, { align: 'right' });
      y += lineHeight;
    });
  }

  y += 2;
  doc.line(5, y, 75, y);
  y += lineHeight + 2;

  // Footer
  doc.setFontSize(10);
  doc.text('¡Gracias por su compra!', 40, y, { align: 'center' });
  y += lineHeight;

  doc.setFontSize(8);
  const footerUrl = store.value?.url || 'www.mitienda.pe';
  doc.text(footerUrl, 40, y, { align: 'center' });

  // Save PDF
  const fileName = `ticket-${formatDate(new Date()).replace(/[/:]/g, '-')}.pdf`;
  doc.save(fileName);
};

const formatCurrency = (value) => {
  return `S/ ${parseFloat(value).toFixed(2)}`;
};

const formatDate = (date) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('es-PE', options);
};
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #ticket-content, #ticket-content * {
    visibility: visible;
  }
  #ticket-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  /* Hide buttons when printing */
  button {
    display: none !important;
  }
}
</style>
