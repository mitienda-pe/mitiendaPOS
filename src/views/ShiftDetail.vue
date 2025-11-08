<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Detalle del Turno</h1>
        <p v-if="shift" class="text-sm text-gray-600 mt-1">
          {{ shift.caja_numero || 'Caja Principal' }} • {{ formatDate(shift.fecha_apertura) }}
        </p>
      </div>
      <router-link
        to="/shifts"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver al Historial
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-md p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="text-gray-600 mt-4">Cargando detalles del turno...</p>
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

    <!-- Shift Details -->
    <div v-else-if="shift" class="space-y-6">
      <!-- Status Card -->
      <div class="bg-white rounded-lg shadow-md p-6" :class="shift.estado === 'abierto' ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-300'">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-semibold" :class="shift.estado === 'abierto' ? 'text-green-900' : 'text-gray-900'">
              {{ shift.caja_numero || 'Caja Principal' }}
              <span v-if="shift.estado === 'abierto'" class="ml-2 text-sm font-normal text-green-700">● Turno Abierto</span>
              <span v-else class="ml-2 text-sm font-normal text-gray-600">✓ Turno Cerrado</span>
            </h2>
            <div class="mt-2 space-y-1 text-sm text-gray-600">
              <p>📅 Apertura: {{ formatDateTime(shift.fecha_apertura) }}</p>
              <p v-if="shift.fecha_cierre">🔒 Cierre: {{ formatDateTime(shift.fecha_cierre) }}</p>
              <p v-if="shift.fecha_cierre">⏱️ Duración: {{ calculateDuration(shift.fecha_apertura, shift.fecha_cierre) }}</p>
              <p>👤 Usuario: {{ shift.usuario_email || 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Summary -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Resumen Financiero</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Initial Amount -->
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p class="text-xs font-medium text-gray-600 mb-1">💰 Monto Inicial</p>
            <p class="text-2xl font-bold text-gray-900">S/ {{ shift.monto_inicial.toFixed(2) }}</p>
          </div>

          <!-- Total Sales -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p class="text-xs font-medium text-blue-700 mb-1">💳 Ventas Totales</p>
            <p class="text-2xl font-bold text-blue-900">S/ {{ shift.total_ventas.toFixed(2) }}</p>
            <p class="text-xs text-blue-600 mt-1">{{ shift.numero_ventas }} operaciones</p>
          </div>

          <!-- Expected Amount -->
          <div v-if="shift.estado === 'cerrado'" class="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <p class="text-xs font-medium text-amber-700 mb-1">📊 Monto Esperado</p>
            <p class="text-2xl font-bold text-amber-900">S/ {{ shift.monto_esperado.toFixed(2) }}</p>
          </div>

          <!-- Real Amount -->
          <div v-if="shift.estado === 'cerrado'" class="rounded-lg p-4 border" :class="getDifferenceBoxClass(shift.diferencia)">
            <p class="text-xs font-medium mb-1">💵 Monto Real</p>
            <p class="text-2xl font-bold">S/ {{ shift.monto_real.toFixed(2) }}</p>
            <p class="text-xs mt-1">
              Diferencia: {{ shift.diferencia >= 0 ? '+' : '' }}S/ {{ shift.diferencia.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Payment Methods Breakdown -->
      <div v-if="shift.estado === 'cerrado'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Desglose por Método de Pago</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div v-if="shift.total_efectivo > 0" class="bg-green-50 rounded-lg p-4 border border-green-200">
            <p class="text-xs font-medium text-green-700 mb-1">💵 Efectivo</p>
            <p class="text-xl font-bold text-green-900">S/ {{ shift.total_efectivo.toFixed(2) }}</p>
          </div>
          <div v-if="shift.total_tarjeta > 0" class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p class="text-xs font-medium text-blue-700 mb-1">💳 Tarjeta</p>
            <p class="text-xl font-bold text-blue-900">S/ {{ shift.total_tarjeta.toFixed(2) }}</p>
          </div>
          <div v-if="shift.total_yape > 0" class="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p class="text-xs font-medium text-purple-700 mb-1">📱 Yape</p>
            <p class="text-xl font-bold text-purple-900">S/ {{ shift.total_yape.toFixed(2) }}</p>
          </div>
          <div v-if="shift.total_plin > 0" class="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <p class="text-xs font-medium text-indigo-700 mb-1">📱 Plin</p>
            <p class="text-xl font-bold text-indigo-900">S/ {{ shift.total_plin.toFixed(2) }}</p>
          </div>
          <div v-if="shift.total_transferencia > 0" class="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <p class="text-xs font-medium text-cyan-700 mb-1">🏦 Transferencia</p>
            <p class="text-xl font-bold text-cyan-900">S/ {{ shift.total_transferencia.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <!-- Movements List -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Movimientos del Turno</h2>
          <button
            @click="loadMovements"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium">
            🔄 Actualizar
          </button>
        </div>

        <!-- Loading Movements -->
        <div v-if="loadingMovements" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="text-gray-600 text-sm mt-2">Cargando movimientos...</p>
        </div>

        <!-- No Movements -->
        <div v-else-if="movements.length === 0" class="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p class="text-gray-600">No hay movimientos registrados en este turno</p>
        </div>

        <!-- Movements Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código/Concepto</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="movement in movements" :key="movement.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {{ formatTime(movement.fecha_registro) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getMovementTypeClass(movement.tipo)">
                    {{ getMovementTypeLabel(movement.tipo) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                  <div v-if="movement.tipo === 'venta' && movement.referencia">
                    <router-link
                      :to="`/order/${movement.referencia}`"
                      class="text-blue-600 hover:text-blue-800 font-medium">
                      🛒 Venta #{{ movement.referencia }}
                    </router-link>
                    <p class="text-xs text-gray-500 mt-1">{{ movement.concepto }}</p>
                  </div>
                  <span v-else>{{ movement.concepto }}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {{ movement.metodo_pago || '-' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium"
                    :class="getMovementAmountClass(movement.tipo)">
                  {{ getMovementSign(movement.tipo) }}S/ {{ parseFloat(movement.monto).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Notes Section -->
      <div v-if="shift.notas_apertura || shift.notas_cierre" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Notas</h2>
        <div class="space-y-4">
          <div v-if="shift.notas_apertura" class="bg-blue-50 rounded-lg p-4">
            <p class="text-sm font-medium text-blue-900 mb-1">📝 Notas de Apertura</p>
            <p class="text-sm text-blue-800">{{ shift.notas_apertura }}</p>
          </div>
          <div v-if="shift.notas_cierre" class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm font-medium text-gray-900 mb-1">📝 Notas de Cierre</p>
            <p class="text-sm text-gray-700">{{ shift.notas_cierre }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import cashRegisterShiftsApi from '@/services/cashRegisterShiftsApi';

const route = useRoute();

const loading = ref(true);
const error = ref(null);
const shift = ref(null);
const movements = ref([]);
const loadingMovements = ref(false);

/**
 * Load shift details
 */
const loadShift = async () => {
  try {
    loading.value = true;
    error.value = null;

    const shiftId = route.params.id;
    const response = await cashRegisterShiftsApi.getShift(shiftId);

    if (response.data.success) {
      shift.value = response.data.data;
      await loadMovements();
    } else {
      error.value = 'Error al cargar el turno';
    }
  } catch (err) {
    console.error('Error loading shift:', err);
    error.value = err.response?.data?.message || 'Error al cargar el detalle del turno';
  } finally {
    loading.value = false;
  }
};

/**
 * Load movements for this shift
 */
const loadMovements = async () => {
  if (!shift.value) return;

  try {
    loadingMovements.value = true;
    const response = await cashRegisterShiftsApi.getShiftMovements(shift.value.id);

    if (response.data.success) {
      movements.value = response.data.data || [];
    }
  } catch (err) {
    console.error('Error loading movements:', err);
  } finally {
    loadingMovements.value = false;
  }
};

/**
 * Calculate duration between two dates
 */
const calculateDuration = (start, end) => {
  if (!start || !end) return '-';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate - startDate;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

/**
 * Get difference box class
 */
const getDifferenceBoxClass = (diferencia) => {
  if (diferencia > 0) return 'bg-green-50 border-green-200 text-green-700';
  if (diferencia < 0) return 'bg-red-50 border-red-200 text-red-700';
  return 'bg-gray-50 border-gray-200 text-gray-700';
};

/**
 * Get movement type label
 */
const getMovementTypeLabel = (tipo) => {
  const labels = {
    'venta': '💳 Venta',
    'entrada': '📥 Ingreso',
    'salida': '📤 Retiro',
    'ajuste': '⚙️ Ajuste'
  };
  return labels[tipo] || tipo;
};

/**
 * Get movement type class
 */
const getMovementTypeClass = (tipo) => {
  const classes = {
    'venta': 'bg-blue-100 text-blue-800',
    'entrada': 'bg-green-100 text-green-800',
    'salida': 'bg-red-100 text-red-800',
    'ajuste': 'bg-yellow-100 text-yellow-800'
  };
  return classes[tipo] || 'bg-gray-100 text-gray-800';
};

/**
 * Get movement amount class
 */
const getMovementAmountClass = (tipo) => {
  if (tipo === 'entrada' || tipo === 'venta') {
    return 'text-green-700';
  }
  if (tipo === 'salida') {
    return 'text-red-700';
  }
  return 'text-gray-900';
};

/**
 * Get movement sign
 */
const getMovementSign = (tipo) => {
  if (tipo === 'entrada' || tipo === 'venta') {
    return '+';
  }
  if (tipo === 'salida') {
    return '-';
  }
  return '';
};

/**
 * Format date
 */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });
};

/**
 * Format date time
 */
const formatDateTime = (dateString) => {
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

/**
 * Format time only
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
  console.log('📄 [ShiftDetail] Componente montado, cargando turno:', route.params.id);
  loadShift();
});
</script>
