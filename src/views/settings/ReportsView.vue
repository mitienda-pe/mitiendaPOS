<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Reportes</h1>
      <p class="text-sm text-gray-500 mt-1">Consulta y exporta tus ventas. La vista previa muestra las primeras filas.</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-4 border-b border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors',
                 activeTab === tab.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700']"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label class="form-label">Desde</label>
          <input v-model="filters.date_from" type="date" class="input-field" />
        </div>
        <div>
          <label class="form-label">Hasta</label>
          <input v-model="filters.date_to" type="date" class="input-field" />
        </div>
        <div>
          <label class="form-label">Estado de pago</label>
          <select v-model="filters.payment_status" class="input-field">
            <option value="">Todos</option>
            <option value="1">Pagado</option>
            <option value="2">Pendiente</option>
            <option value="0">Rechazado</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button class="btn-primary flex-1" :disabled="loading" @click="loadPreview">
            {{ loading ? 'Cargando...' : 'Buscar' }}
          </button>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button class="btn-secondary" :disabled="exporting" @click="handleExport('CSV')">Exportar CSV</button>
        <button class="btn-secondary" :disabled="exporting" @click="handleExport('XLSX')">Exportar Excel</button>
      </div>
    </div>

    <div v-if="message" :class="['rounded-md px-4 py-3 text-sm mb-4', messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700']">
      {{ message }}
    </div>

    <!-- Resultados -->
    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="rows.length === 0" class="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500">
      No hay datos para los filtros seleccionados.
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th v-for="col in columns" :key="col" class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
              {{ humanize(col) }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="(row, idx) in rows" :key="idx">
            <td v-for="col in columns" :key="col" class="px-3 py-2 text-gray-700 whitespace-nowrap">{{ row[col] }}</td>
          </tr>
        </tbody>
      </table>
      <div class="px-3 py-2 text-xs text-gray-400 border-t">Vista previa: {{ rows.length }} fila(s). Usa “Exportar” para el detalle completo.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import reportsApi from '../../services/reportsApi';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

// Costo y ganancia son sensibles: solo el dueño/admin los ve, no los cajeros.
const PROFIT_KEYS = ['product_unit_cost', 'product_cost_subtotal', 'product_profit', 'product_margin_pct'];

const tabs = [
  { key: 'orders', label: 'Ventas' },
  { key: 'product-sales', label: 'Productos vendidos' },
];

const activeTab = ref('orders');
const loading = ref(false);
const exporting = ref(false);
const rows = ref([]);
const message = ref('');
const messageType = ref('success');

const filters = reactive({
  date_from: '',
  date_to: '',
  payment_status: '',
});

const columns = computed(() => (rows.value.length ? Object.keys(rows.value[0]) : []));

const humanize = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const showMessage = (text, type = 'error') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 4000);
};

const loadPreview = async () => {
  loading.value = true;
  message.value = '';
  try {
    let data = activeTab.value === 'orders'
      ? await reportsApi.getOrdersPreview(filters)
      : await reportsApi.getProductSalesPreview(filters);
    // Ocultar columnas de costo/ganancia a quien no es dueño/admin.
    if (!authStore.isAdmin && Array.isArray(data)) {
      data = data.map((row) => {
        const clone = { ...row };
        PROFIT_KEYS.forEach((k) => delete clone[k]);
        return clone;
      });
    }
    rows.value = data;
  } catch (e) {
    rows.value = [];
    showMessage('No se pudo cargar el reporte.');
  } finally {
    loading.value = false;
  }
};

const switchTab = (key) => {
  if (activeTab.value === key) return;
  activeTab.value = key;
  rows.value = [];
};

const handleExport = async (format) => {
  exporting.value = true;
  message.value = '';
  try {
    const blob = activeTab.value === 'orders'
      ? await reportsApi.exportOrders(filters, format)
      : await reportsApi.exportProductSales(filters, format);
    const ext = format === 'XLSX' ? 'xlsx' : 'csv';
    const stamp = new Date().toISOString().slice(0, 10);
    reportsApi.downloadFile(blob, `reporte-${activeTab.value}-${stamp}.${ext}`);
  } catch (e) {
    showMessage('No se pudo exportar el reporte.');
  } finally {
    exporting.value = false;
  }
};
</script>
