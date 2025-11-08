<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Mi Turno</h1>
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
      <p class="text-gray-600 mt-4">Cargando información del turno...</p>
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

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- No Active Shift Message -->
      <div v-if="!shiftStore.hasActiveShift" class="bg-white rounded-lg shadow-md p-6">
        <div class="text-center py-12">
          <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 mb-4 inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-yellow-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p class="text-xl font-medium text-yellow-800 mb-2">No hay turno activo</p>
            <p class="text-sm text-yellow-600">Usa el botón "✅ Abrir Turno" en el encabezado para comenzar</p>
          </div>
        </div>
      </div>

      <!-- Active Shift Status -->
      <div v-else class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="8" cy="8" r="6"/>
            <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
            <path d="M7 6h1v4"/>
            <path d="m16.71 13.88.7.71-2.82 2.82"/>
          </svg>
          Estado del Turno
        </h2>

        <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-green-800 mb-1">✅ Turno Abierto</p>
              <p class="text-xs text-green-600">
                Inicio: {{ formatDateTime(shiftStore.activeShift.fecha_apertura) }}
              </p>
              <p class="text-xs text-green-600 mt-1">
                ⏱️ {{ elapsedTime }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-green-700 font-medium mb-1">Monto Inicial</p>
              <p class="text-2xl font-bold text-green-900">
                S/ {{ shiftStore.activeShift.monto_inicial.toFixed(2) }}
              </p>
            </div>
            <div class="ml-4">
              <button
                @click="handleForceRefresh"
                class="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300"
                title="Si ves datos incorrectos, usa esto para forzar recarga">
                🔄 Verificar
              </button>
            </div>
          </div>
        </div>

        <p class="text-xs text-gray-500 mt-4 text-center">
          Usa el botón "🔒 Cerrar Turno" en el encabezado para finalizar tu jornada
        </p>
      </div>

      <!-- Real-time Summary Section (only if shift is active) -->
      <div v-if="shiftStore.hasActiveShift" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          Resumen en Tiempo Real
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Initial Amount -->
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p class="text-xs font-medium text-gray-600 mb-1">💰 Inicial</p>
            <p class="text-2xl font-bold text-gray-900">S/ {{ summary.montoInicial.toFixed(2) }}</p>
          </div>

          <!-- Total Sales -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p class="text-xs font-medium text-blue-700 mb-1">💳 Ventas Total</p>
            <p class="text-2xl font-bold text-blue-900">S/ {{ summary.totalVentas.toFixed(2) }}</p>
            <p class="text-xs text-blue-600 mt-1">{{ summary.numeroVentas }} operaciones</p>
          </div>

          <!-- Cash Sales -->
          <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p class="text-xs font-medium text-emerald-700 mb-1">💵 Efectivo</p>
            <p class="text-2xl font-bold text-emerald-900">S/ {{ summary.totalVentasEfectivo.toFixed(2) }}</p>
            <p class="text-xs text-emerald-600 mt-1">Ventas en caja</p>
          </div>

          <!-- Cash Movements -->
          <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <p class="text-xs font-medium text-amber-700 mb-1">📊 Movimientos</p>
            <p class="text-2xl font-bold" :class="summary.totalMovimientos >= 0 ? 'text-green-900' : 'text-red-900'">
              {{ summary.totalMovimientos >= 0 ? '+' : '' }}S/ {{ summary.totalMovimientos.toFixed(2) }}
            </p>
            <p class="text-xs text-amber-600 mt-1">
              {{ summary.numeroMovimientos }} operaciones
            </p>
          </div>

          <!-- Expected Cash -->
          <div class="bg-green-50 rounded-lg p-4 border border-green-200">
            <p class="text-xs font-medium text-green-700 mb-1">🎯 Esperado en Caja</p>
            <p class="text-2xl font-bold text-green-900">S/ {{ summary.efectivoEsperado.toFixed(2) }}</p>
            <p class="text-xs text-green-600 mt-1">Solo efectivo</p>
          </div>
        </div>
      </div>

      <!-- Cash Movements Section (only if shift is active) -->
      <div v-if="shiftStore.hasActiveShift" class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3v18h18"/>
              <path d="m19 9-5 5-4-4-3 3"/>
            </svg>
            Movimientos de Hoy
          </h2>
          <button
            @click="loadMovements"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium">
            🔄 Actualizar
          </button>
        </div>

        <!-- Movements Loading -->
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

        <!-- Movements List -->
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

      <!-- Link to History -->
      <div class="text-center">
        <router-link
          to="/shifts"
          class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          📚 Ver historial de turnos anteriores
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Modals -->
    <OpenShiftModal
      v-model="showOpenShiftModal"
      @opened="onShiftOpened"
    />
    <CloseShiftModal
      v-model="showCloseShiftModal"
      :shift="shiftStore.activeShift"
      @shift-closed="onShiftClosed"
    />
    <CashierAuthModal
      v-model="showCashierAuthModal"
      :required="true"
      :sucursalId="pendingShiftData?.sucursalId"
      :sucursalInfo="pendingShiftData?.sucursalInfo"
      :cajaNumero="pendingShiftData?.cajaNumero"
      @authenticated="onCashierAuthenticated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useCashierStore } from '@/stores/cashier';
import { useShiftStore } from '@/stores/shift';
import { useAuthStore } from '@/stores/auth';
import cashRegisterShiftsApi from '@/services/cashRegisterShiftsApi';
import OpenShiftModal from '@/components/OpenShiftModal.vue';
import CloseShiftModal from '@/components/CloseShiftModal.vue';
import CashierAuthModal from '@/components/CashierAuthModal.vue';

const authStore = useAuthStore();
const cashierStore = useCashierStore();
const shiftStore = useShiftStore();

const loading = ref(true);
const error = ref(null);
const movements = ref([]);
const loadingMovements = ref(false);
const showOpenShiftModal = ref(false);
const showCloseShiftModal = ref(false);
const showCashierAuthModal = ref(false);
const pendingShiftData = ref(null);

// Real-time summary
const summary = ref({
  montoInicial: 0,
  totalVentas: 0,
  numeroVentas: 0,
  totalVentasEfectivo: 0, // Solo ventas en efectivo
  totalVentasOtros: 0, // Ventas con otros métodos
  totalMovimientos: 0,
  numeroMovimientos: 0,
  efectivoEsperado: 0
});

// Elapsed time
const elapsedTime = ref('');
let elapsedInterval = null;

/**
 * Load shift and movements
 */
const loadShiftData = async () => {
  console.log('📡 [MyShift] loadShiftData() - Iniciando carga...');
  try {
    loading.value = true;
    error.value = null;

    // Load active shift (already in store, but refresh)
    console.log('🔍 [MyShift] Consultando turno activo en el servidor...');
    await shiftStore.fetchActiveShift();

    console.log('📊 [MyShift] Resultado de fetchActiveShift:', {
      hasActiveShift: shiftStore.hasActiveShift,
      shift: shiftStore.activeShift ? {
        id: shiftStore.activeShift.id,
        tienda_id: shiftStore.activeShift.tienda_id,
        usuario_id: shiftStore.activeShift.usuario_id,
        caja_numero: shiftStore.activeShift.caja_numero,
        estado: shiftStore.activeShift.estado,
        monto_inicial: shiftStore.activeShift.monto_inicial,
        fecha_apertura: shiftStore.activeShift.fecha_apertura
      } : null
    });

    // Calculate summary
    if (shiftStore.hasActiveShift) {
      console.log('✅ [MyShift] Turno activo encontrado, cargando movimientos...');
      await loadMovements(); // Primero cargar movimientos
      calculateSummary(); // Luego calcular resumen
      startElapsedTimer();
    } else {
      console.log('❌ [MyShift] No hay turno activo');
    }
  } catch (err) {
    console.error('❌ [MyShift] Error loading shift data:', err);
    error.value = err.response?.data?.message || 'Error al cargar información del turno';
  } finally {
    loading.value = false;
    console.log('✅ [MyShift] loadShiftData() - Finalizado');
  }
};

/**
 * Calculate summary from shift and movements
 */
const calculateSummary = () => {
  const shift = shiftStore.activeShift;
  if (!shift) return;

  summary.value.montoInicial = shift.monto_inicial || 0;

  // Usar los totales del backend que ya separan por método de pago
  summary.value.totalVentas = shift.total_ventas || 0;
  summary.value.numeroVentas = shift.numero_ventas || 0;

  // Total de ventas en efectivo
  summary.value.totalVentasEfectivo = shift.total_efectivo || 0;

  // Total de ventas con otros métodos (tarjeta, yape, plin, transferencia)
  summary.value.totalVentasOtros =
    (shift.total_tarjeta || 0) +
    (shift.total_yape || 0) +
    (shift.total_plin || 0) +
    (shift.total_transferencia || 0);

  // Calculate movements (entries - withdrawals) - solo efectivo
  const entradas = movements.value
    .filter(m => m.tipo === 'entrada' && (!m.metodo_pago || m.metodo_pago.toLowerCase() === 'efectivo'))
    .reduce((sum, m) => sum + parseFloat(m.monto), 0);

  const salidas = movements.value
    .filter(m => m.tipo === 'salida')
    .reduce((sum, m) => sum + parseFloat(m.monto), 0);

  summary.value.totalMovimientos = entradas - salidas;
  summary.value.numeroMovimientos = movements.value.filter(m => m.tipo !== 'venta').length;

  // Expected cash = initial + cash sales + cash entries - cash withdrawals
  // NO incluir ventas con tarjeta/yape/plin/transferencia porque no entran a la caja
  summary.value.efectivoEsperado =
    summary.value.montoInicial +
    summary.value.totalVentasEfectivo +
    summary.value.totalMovimientos;
};

/**
 * Load movements for active shift
 */
const loadMovements = async () => {
  if (!shiftStore.hasActiveShift) return;

  try {
    loadingMovements.value = true;
    console.log('📡 [MyShift] Cargando movimientos para turno:', shiftStore.activeShift.id);
    const response = await cashRegisterShiftsApi.getShiftMovements(shiftStore.activeShift.id);

    console.log('📊 [MyShift] Respuesta de getShiftMovements:', response);

    if (response.data.success) {
      movements.value = response.data.data || [];
      console.log('✅ [MyShift] Movimientos cargados:', movements.value.length, movements.value);
      calculateSummary(); // Recalculate after loading movements
    } else {
      console.warn('⚠️ [MyShift] API retornó success=false');
    }
  } catch (err) {
    console.error('❌ [MyShift] Error loading movements:', err);
  } finally {
    loadingMovements.value = false;
  }
};

/**
 * Start elapsed time timer
 */
const startElapsedTimer = () => {
  stopElapsedTimer(); // Clear any existing timer

  const updateElapsed = () => {
    if (!shiftStore.activeShift?.fecha_apertura) return;

    const start = new Date(shiftStore.activeShift.fecha_apertura);
    const now = new Date();
    const diff = now - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    elapsedTime.value = `${hours}h ${minutes}m`;
  };

  updateElapsed(); // Initial update
  elapsedInterval = setInterval(updateElapsed, 60000); // Update every minute
};

/**
 * Stop elapsed time timer
 */
const stopElapsedTimer = () => {
  if (elapsedInterval) {
    clearInterval(elapsedInterval);
    elapsedInterval = null;
  }
};

/**
 * Force refresh - verify shift actually exists in database
 */
const handleForceRefresh = async () => {
  try {
    loading.value = true;

    // Clear the store first
    shiftStore.clearActiveShift();
    cashierStore.logout();

    // Fetch fresh data from server
    await shiftStore.fetchActiveShift();

    if (!shiftStore.hasActiveShift) {
      alert('✅ Estado limpiado\n\nNo hay turno activo en el servidor.\nPuedes abrir un nuevo turno.');
    } else {
      alert('✅ Estado sincronizado\n\nEl turno está activo en el servidor.');
      loadShiftData();
    }
  } catch (err) {
    console.error('Error force refreshing:', err);
    alert('❌ Error al verificar estado del turno');
  } finally {
    loading.value = false;
  }
};

/**
 * Handle open shift
 */
const handleOpenShift = () => {
  showOpenShiftModal.value = true;
};

/**
 * Handle authenticate cashier (for existing shift without cashier)
 */
const handleAuthenticateCashier = () => {
  // We need to get sucursal info from the shift
  // For now, we'll use a simplified approach
  pendingShiftData.value = {
    sucursalId: null, // Will be filled when we have this data
    sucursalInfo: {
      nombre: 'Sucursal' // Placeholder
    },
    cajaNumero: shiftStore.activeShift?.caja_numero ? parseInt(shiftStore.activeShift.caja_numero.replace('Caja ', '')) : 1,
    shiftId: shiftStore.activeShift?.id
  };

  showCashierAuthModal.value = true;
};

/**
 * Handle close shift
 */
const handleCloseShift = () => {
  console.log('🔒 [MyShift] handleCloseShift() - Botón "Cerrar Turno" presionado', {
    isCashierAuthenticated: cashierStore.isCashierAuthenticated,
    cashier: cashierStore.cashier,
    activeShift: shiftStore.activeShift
  });

  if (!cashierStore.isCashierAuthenticated) {
    console.warn('⚠️ [MyShift] Cajero no autenticado, mostrando alerta');
    alert('⚠️ Debes autenticarte como cajero primero');
    return;
  }

  console.log('✅ [MyShift] Abriendo CloseShiftModal...');
  showCloseShiftModal.value = true;
};

/**
 * On shift opened - handle backend call AFTER cashier auth
 */
const onShiftOpened = async (data) => {
  try {
    showOpenShiftModal.value = false;

    // Guardar datos del turno para crear DESPUÉS de autenticar cajero
    pendingShiftData.value = {
      sucursalId: parseInt(data.sucursalId),
      sucursalInfo: {
        nombre: data.sucursalNombre
      },
      cajaNumero: parseInt(data.cajaNumero),
      montoInicial: data.montoInicial,
      notas: data.notas
    };

    // Abrir modal de autenticación de cajero PRIMERO
    showCashierAuthModal.value = true;
  } catch (err) {
    console.error('Error opening shift:', err);
    error.value = err.message || 'Error al abrir el turno';
  }
};

/**
 * On cashier authenticated - NOW create the shift with empleado_id
 */
const onCashierAuthenticated = async (cashier) => {
  showCashierAuthModal.value = false;

  try {
    // Crear el turno con el empleado_id del cajero autenticado
    const result = await shiftStore.openShift(
      pendingShiftData.value.montoInicial,
      pendingShiftData.value.notas,
      `Caja ${pendingShiftData.value.cajaNumero}`,
      cashier.empleado_id // ← AQUÍ enviamos el empleado_id
    );

    if (result.success) {
      pendingShiftData.value = null;

      // Reload shift data
      loadShiftData();
    } else {
      error.value = result.error || 'Error al abrir el turno';
      // Show error message instead of reopening modal to prevent infinite loop
      const errorMsg = `❌ Error al abrir turno:\n\n${result.error}\n\nSi ya tiene un turno abierto, debe cerrarlo primero.`;
      alert(errorMsg);
      pendingShiftData.value = null;
      // Reload to show current state
      loadShiftData();
    }
  } catch (err) {
    console.error('Error creating shift after cashier auth:', err);
    error.value = err.message || 'Error al crear el turno';
    alert(`❌ Error inesperado:\n\n${err.message}`);
  }
};

/**
 * On shift closed
 */
const onShiftClosed = async (data) => {
  console.log('📥 [MyShift] Evento "shift-closed" recibido', data);

  showCloseShiftModal.value = false;
  stopElapsedTimer();

  console.log('🔒 [MyShift] Llamando al API para cerrar turno...', {
    shiftId: shiftStore.activeShift?.id,
    data
  });

  // Cerrar el turno en el backend
  const result = await shiftStore.closeShift(data.montoReal, data.notas);

  console.log('📡 [MyShift] Respuesta del API:', result);

  if (result.success) {
    console.log('✅ [MyShift] Turno cerrado exitosamente en BD');

    // NO hacer logout del cajero - permitir que abra un nuevo turno sin re-autenticarse
    // Solo limpiar el estado del turno activo

    // Reload shift data
    await loadShiftData();

    console.log('🔄 [MyShift] Estado actualizado:', {
      hasActiveShift: shiftStore.hasActiveShift,
      activeShift: shiftStore.activeShift,
      cashierStillAuthenticated: cashierStore.isCashierAuthenticated
    });
  } else {
    console.error('❌ [MyShift] Error al cerrar turno:', result.error);
    alert(`❌ Error al cerrar turno:\n\n${result.error}`);
  }
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

// Lifecycle
onMounted(() => {
  console.log('🚀 [MyShift] ========== COMPONENTE MONTADO ==========');
  console.log('👤 [MyShift] Usuario:', {
    name: authStore.user?.name,
    email: authStore.user?.email,
    role: authStore.user?.role
  });
  console.log('🏪 [MyShift] Tienda:', {
    id: authStore.store?.id,
    name: authStore.store?.name
  });
  console.log('🧑‍💼 [MyShift] Cajero:', {
    authenticated: cashierStore.isCashierAuthenticated,
    empleado_id: cashierStore.cashier?.empleado_id,
    nombre: cashierStore.cashier?.empleado_nombres
  });
  console.log('📋 [MyShift] Turno actual:', {
    hasActiveShift: shiftStore.hasActiveShift,
    shift: shiftStore.activeShift
  });
  console.log('🔄 [MyShift] Cargando datos del turno...');
  loadShiftData();
});

onUnmounted(() => {
  console.log('👋 [MyShift] ========== COMPONENTE DESMONTADO ==========');
  stopElapsedTimer();
});
</script>
