<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Historial de Turnos</h1>
        <p v-if="cashierStore.cashier" class="text-sm text-gray-600 mt-1">
          🧑‍💼 {{ cashierStore.cashier.empleado_nombres }} {{ cashierStore.cashier.empleado_apellidos }}
          • {{ cashierStore.workLocation }}
        </p>
      </div>
      <router-link
        to="/menu"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver al Menú
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-md p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="text-gray-600 mt-4">Cargando historial de turnos...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div class="flex items-center">
        <svg class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-800 font-medium">{{ error }}</p>
      </div>
    </div>

    <!-- Shifts List -->
    <div v-else class="space-y-6">
      <!-- No Shifts Message -->
      <div v-if="shifts.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="text-xl text-gray-600 mb-2">No hay turnos registrados</p>
        <p class="text-sm text-gray-500">Los turnos aparecerán aquí una vez que comiences a trabajar</p>
      </div>

      <!-- Shifts Cards -->
      <div v-else class="grid grid-cols-1 gap-6">
        <router-link
          v-for="shift in shifts"
          :key="shift.id"
          :to="`/shifts/${shift.id}`"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block">

          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200" :class="getShiftHeaderClass(shift)">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold" :class="shift.estado === 'abierto' ? 'text-green-900' : 'text-gray-900'">
                  {{ shift.caja_numero || 'Caja Principal' }}
                  <span v-if="shift.estado === 'abierto'" class="ml-2 text-sm font-normal text-green-700">● Abierto</span>
                  <span v-else class="ml-2 text-sm font-normal text-gray-600">✓ Cerrado</span>
                </h3>
                <div class="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>📅 {{ formatDate(shift.fecha_apertura) }}</span>
                  <span>🕐 {{ formatTime(shift.fecha_apertura) }}</span>
                  <span v-if="shift.fecha_cierre">→ {{ formatTime(shift.fecha_cierre) }}</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Usuario</p>
                <p class="text-sm font-medium text-gray-900">{{ shift.usuario_email || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Summary Stats -->
          <div class="px-6 py-4 bg-gray-50">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <!-- Initial Amount -->
              <div>
                <p class="text-xs text-gray-500 mb-1">💰 Inicial</p>
                <p class="text-lg font-bold text-gray-900">S/ {{ shift.monto_inicial.toFixed(2) }}</p>
              </div>

              <!-- Total Sales -->
              <div>
                <p class="text-xs text-gray-500 mb-1">💳 Ventas</p>
                <p class="text-lg font-bold text-blue-900">S/ {{ shift.total_ventas.toFixed(2) }}</p>
                <p class="text-xs text-gray-600">{{ shift.numero_ventas }} ops</p>
              </div>

              <!-- Expected -->
              <div v-if="shift.estado === 'cerrado'">
                <p class="text-xs text-gray-500 mb-1">📊 Esperado</p>
                <p class="text-lg font-bold text-amber-900">S/ {{ shift.monto_esperado.toFixed(2) }}</p>
              </div>

              <!-- Real Amount -->
              <div v-if="shift.estado === 'cerrado'">
                <p class="text-xs text-gray-500 mb-1">💵 Real</p>
                <p class="text-lg font-bold" :class="getDifferenceClass(shift.diferencia)">
                  S/ {{ shift.monto_real.toFixed(2) }}
                </p>
                <p class="text-xs" :class="getDifferenceClass(shift.diferencia)">
                  {{ shift.diferencia >= 0 ? '+' : '' }}S/ {{ shift.diferencia.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Payment Methods Breakdown (if closed) -->
          <div v-if="shift.estado === 'cerrado' && hasPaymentBreakdown(shift)" class="px-6 py-3 border-t border-gray-200">
            <p class="text-xs font-medium text-gray-700 mb-2">Desglose por método de pago:</p>
            <div class="flex flex-wrap gap-3">
              <div v-if="shift.total_efectivo > 0" class="text-xs bg-green-50 px-2 py-1 rounded">
                💵 Efectivo: S/ {{ shift.total_efectivo.toFixed(2) }}
              </div>
              <div v-if="shift.total_tarjeta > 0" class="text-xs bg-blue-50 px-2 py-1 rounded">
                💳 Tarjeta: S/ {{ shift.total_tarjeta.toFixed(2) }}
              </div>
              <div v-if="shift.total_yape > 0" class="text-xs bg-purple-50 px-2 py-1 rounded">
                📱 Yape: S/ {{ shift.total_yape.toFixed(2) }}
              </div>
              <div v-if="shift.total_plin > 0" class="text-xs bg-indigo-50 px-2 py-1 rounded">
                📱 Plin: S/ {{ shift.total_plin.toFixed(2) }}
              </div>
              <div v-if="shift.total_transferencia > 0" class="text-xs bg-cyan-50 px-2 py-1 rounded">
                🏦 Transferencia: S/ {{ shift.total_transferencia.toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="shift.notas_cierre && shift.estado === 'cerrado'" class="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p class="text-xs font-medium text-gray-700 mb-1">📝 Notas de cierre:</p>
            <p class="text-sm text-gray-600">{{ shift.notas_cierre }}</p>
          </div>

          <!-- Click to view details -->
          <div class="px-6 py-2 bg-gray-100 text-center text-xs text-gray-500">
            Clic para ver detalles →
          </div>
        </router-link>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total_pages > 1" class="bg-white rounded-lg shadow-md p-4">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Página {{ pagination.current_page }} de {{ pagination.total_pages }}
            ({{ pagination.total }} turnos en total)
          </div>
          <div class="flex gap-2">
            <button
              @click="loadPage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              ← Anterior
            </button>
            <button
              @click="loadPage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.total_pages"
              class="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCashierStore } from '@/stores/cashier';
import cashRegisterShiftsApi from '@/services/cashRegisterShiftsApi';

const cashierStore = useCashierStore();

const loading = ref(true);
const error = ref(null);
const shifts = ref([]);
const pagination = ref({
  current_page: 1,
  per_page: 20,
  total: 0,
  total_pages: 0
});

/**
 * Load shifts with pagination
 */
const loadShifts = async (page = 1) => {
  try {
    loading.value = true;
    error.value = null;

    const response = await cashRegisterShiftsApi.getShifts({
      page,
      limit: 20
    });

    if (response.data.success) {
      shifts.value = response.data.data || [];
      pagination.value = response.data.pagination || {};
    } else {
      error.value = 'Error al cargar el historial de turnos';
    }
  } catch (err) {
    console.error('Error loading shifts:', err);
    error.value = err.response?.data?.message || 'Error al cargar el historial';
  } finally {
    loading.value = false;
  }
};

/**
 * Load specific page
 */
const loadPage = (page) => {
  if (page < 1 || page > pagination.value.total_pages) return;
  loadShifts(page);
};

/**
 * Get header class based on shift status
 */
const getShiftHeaderClass = (shift) => {
  return shift.estado === 'abierto'
    ? 'bg-green-50 border-l-4 border-green-500'
    : 'bg-white border-l-4 border-gray-300';
};

/**
 * Get difference class (positive/negative)
 */
const getDifferenceClass = (diferencia) => {
  if (diferencia > 0) return 'text-green-700';
  if (diferencia < 0) return 'text-red-700';
  return 'text-gray-700';
};

/**
 * Check if shift has payment breakdown
 */
const hasPaymentBreakdown = (shift) => {
  return (shift.total_efectivo || 0) > 0 ||
         (shift.total_tarjeta || 0) > 0 ||
         (shift.total_yape || 0) > 0 ||
         (shift.total_plin || 0) > 0 ||
         (shift.total_transferencia || 0) > 0;
};

/**
 * Format date
 */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

/**
 * Format time
 */
const formatTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Lifecycle
onMounted(() => {
  console.log('📚 [Shifts] Componente montado, cargando historial...');
  loadShifts();
});
</script>
