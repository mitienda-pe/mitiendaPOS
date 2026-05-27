<template>
  <div class="max-w-7xl mx-auto py-4 px-3 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4 sm:mb-6">
      <div class="min-w-0 flex-1">
        <h1 class="text-xl sm:text-3xl font-bold text-gray-900">Mi Turno</h1>
        <p v-if="cashierStore.cashier" class="text-xs sm:text-sm text-gray-600 mt-1 truncate">
          {{ cashierStore.cashier.empleado_nombres }} {{ cashierStore.cashier.empleado_apellidos }}
          <span class="hidden sm:inline">• {{ cashierStore.workLocation }}</span>
        </p>
      </div>
      <router-link
        to="/menu"
        class="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ml-2 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span class="hidden sm:inline">Volver al Menú</span>
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-md p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
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
      <div v-if="!shiftStore.hasActiveShift" class="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div class="text-center py-6 sm:py-12">
          <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 sm:p-8 mb-4 inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 sm:h-20 sm:w-20 text-yellow-500 mx-auto mb-3 sm:mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p class="text-lg sm:text-xl font-medium text-yellow-800 mb-2">No hay turno activo</p>
            <p class="text-sm text-yellow-600 mb-4">Presiona el botón para comenzar tu turno</p>
            <button
              v-if="cashierStore.isCashierAuthenticated"
              @click="handleOpenShift"
              class="bg-green-600 text-white hover:bg-green-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Abrir Turno
            </button>
          </div>
        </div>
      </div>

      <!-- Active Shift Status -->
      <div v-else class="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="8" cy="8" r="6"/>
            <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
            <path d="M7 6h1v4"/>
            <path d="m16.71 13.88.7.71-2.82 2.82"/>
          </svg>
          Estado del Turno
        </h2>

        <div class="bg-green-50 border-2 border-green-200 rounded-lg p-3 sm:p-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div class="flex-1">
              <p class="text-sm font-medium text-green-800 mb-1">Turno Abierto</p>
              <p class="text-xs text-green-600">
                Inicio: {{ formatDateTime(shiftStore.activeShift.fecha_apertura) }}
              </p>
              <p class="text-xs text-green-600 mt-1">
                {{ elapsedTime }}
              </p>
            </div>
            <div class="flex items-center justify-between sm:block sm:text-right">
              <div>
                <p class="text-xs text-green-700 font-medium mb-0.5">Monto Inicial</p>
                <p class="text-xl sm:text-2xl font-bold text-green-900">
                  S/ {{ shiftStore.activeShift.monto_inicial.toFixed(2) }}
                </p>
              </div>
              <button
                @click="handleForceRefresh"
                class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 sm:mt-2 sm:ml-0 ml-3"
                title="Si ves datos incorrectos, usa esto para forzar recarga">
                Verificar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Real-time Summary Section (only if shift is active) -->
      <div v-if="shiftStore.hasActiveShift" class="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          Resumen en Tiempo Real
        </h2>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <!-- Initial Amount -->
          <div class="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
            <p class="text-xs font-medium text-gray-600 mb-1">Inicial</p>
            <p class="text-lg sm:text-2xl font-bold text-gray-900">S/ {{ summary.montoInicial.toFixed(2) }}</p>
          </div>

          <!-- Total Sales -->
          <div class="bg-primary-50 rounded-lg p-3 sm:p-4 border border-primary-200">
            <p class="text-xs font-medium text-primary-700 mb-1">Ventas Total</p>
            <p class="text-lg sm:text-2xl font-bold text-primary-900">S/ {{ summary.totalVentas.toFixed(2) }}</p>
            <p class="text-xs text-primary-600 mt-1">{{ summary.numeroVentas }} ops</p>
          </div>

          <!-- Cash Sales -->
          <div class="bg-emerald-50 rounded-lg p-3 sm:p-4 border border-emerald-200">
            <p class="text-xs font-medium text-emerald-700 mb-1">Efectivo</p>
            <p class="text-lg sm:text-2xl font-bold text-emerald-900">S/ {{ summary.totalVentasEfectivo.toFixed(2) }}</p>
            <p class="text-xs text-emerald-600 mt-1">Ventas en caja</p>
          </div>

          <!-- Card Payments -->
          <div class="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
            <p class="text-xs font-medium text-purple-700 mb-1">Tarjeta</p>
            <p class="text-lg sm:text-2xl font-bold text-purple-900">
              S/ {{ summary.totalVentasTarjeta.toFixed(2) }}
            </p>
            <p class="text-xs text-purple-600 mt-1">
              Crédito/Débito
            </p>
          </div>

          <!-- Expected Cash -->
          <div class="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200 col-span-2 sm:col-span-1">
            <p class="text-xs font-medium text-green-700 mb-1">Esperado en Caja</p>
            <p class="text-lg sm:text-2xl font-bold text-green-900">S/ {{ summary.efectivoEsperado.toFixed(2) }}</p>
            <p class="text-xs text-green-600 mt-1">Solo efectivo</p>
          </div>
        </div>
      </div>

      <!-- Cash Movements Section (only if shift is active) -->
      <div v-if="shiftStore.hasActiveShift" class="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3v18h18"/>
              <path d="m19 9-5 5-4-4-3 3"/>
            </svg>
            Movimientos
          </h2>
          <div class="flex gap-2 flex-wrap">
            <button
              @click="downloadCsvReport"
              class="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded font-medium"
              title="Descargar reporte en CSV">
              CSV
            </button>
            <button
              @click="downloadPdfReport"
              class="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded font-medium"
              title="Descargar reporte en PDF">
              PDF
            </button>
            <button
              @click="loadMovements"
              class="text-xs sm:text-sm text-primary-600 hover:text-primary-800 font-medium px-2 py-1">
              Actualizar
            </button>
          </div>
        </div>

        <!-- Movements Loading -->
        <div v-if="loadingMovements" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
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
              <tr v-for="movement in movements" :key="movement.id" class="hover:bg-gray-50" :class="{ 'opacity-50': movement.eliminado }">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {{ formatTime(movement.fecha_registro) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span v-if="movement.eliminado" class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    ANULADO
                  </span>
                  <span v-else class="px-2 py-1 text-xs font-medium rounded-full" :class="getMovementTypeClass(movement.tipo)">
                    {{ getMovementTypeLabel(movement.tipo) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                  <div v-if="movement.tipo === 'venta' && movement.referencia">
                    <router-link
                      :to="`/sales/${movement.referencia.replace('VENTA-', '')}`"
                      class="font-medium" :class="movement.eliminado ? 'text-gray-400 line-through' : 'text-primary-600 hover:text-primary-800'">
                      🛒 Venta #{{ movement.referencia.replace('VENTA-', '') }}
                    </router-link>
                    <p class="text-xs text-gray-500 mt-1">{{ movement.concepto }}</p>
                  </div>
                  <span v-else :class="{ 'line-through': movement.eliminado }">{{ movement.concepto }}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {{ movement.metodo_pago || '-' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium"
                    :class="movement.eliminado ? 'text-gray-400 line-through' : getMovementAmountClass(movement.tipo)">
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
          class="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium">
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useCashierStore } from '@/stores/cashier';
import { useShiftStore } from '@/stores/shift';
import { useAuthStore } from '@/stores/auth';
import cashRegisterShiftsApi from '@/services/cashRegisterShiftsApi';
import OpenShiftModal from '@/components/OpenShiftModal.vue';
import CloseShiftModal from '@/components/CloseShiftModal.vue';
import CashierAuthModal from '@/components/CashierAuthModal.vue';
import { exportShiftReportToCsv } from '@/utils/csvExport';
import { exportShiftReportToPdf } from '@/utils/pdfExport';

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
  totalVentasTarjeta: 0, // Solo ventas con tarjeta
  totalVentasOtros: 0, // Ventas con otros métodos
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

  // Total de efectivo: el backend ya calcula (ventas + entradas - salidas) en efectivo
  // shift.total_efectivo ya incluye TODO el efectivo del turno
  summary.value.totalVentasEfectivo = shift.total_efectivo || 0;

  // Total de ventas con tarjeta
  summary.value.totalVentasTarjeta = shift.total_tarjeta || 0;

  // Total de ventas con otros métodos (yape, plin, transferencia)
  summary.value.totalVentasOtros =
    (shift.total_yape || 0) +
    (shift.total_plin || 0) +
    (shift.total_transferencia || 0);

  // 📝 MEJORAS FUTURAS:
  // 1. Agregar UI para registrar entradas/salidas manuales de efectivo
  //    - Permitir al cajero sacar efectivo a mitad de turno (tipo: 'salida')
  //    - Permitir agregar efectivo de cambio del banco (tipo: 'entrada')
  //    - Ver cashMovementsApi.registerIncome() y .registerWithdrawal()
  //
  // 2. Registrar redondeos como movimientos separados
  //    - Actualmente el redondeo solo se menciona en payment.reference
  //    - Podría ser un movimiento tipo 'ajuste' para trazabilidad
  //
  // 3. Registrar cambio entregado por separado
  //    - Actualmente el cambio solo se extrae del campo 'referencia' con regex
  //    - Ver cart.js totalChange() getter
  //
  // 4. Score card de "Cambio Entregado"
  //    - Extraer cambio de movements.referencia con regex: /Cambio: S\/\s*([\d.]+)/
  //    - Mostrar total de cambio entregado en el turno

  // FIX: Confiar 100% en el backend para el cálculo del efectivo esperado
  // El backend ya calcula correctamente: inicial + total_efectivo (que incluye ventas + entradas - salidas)
  // NO recalcular aquí para evitar doble conteo de movimientos
  summary.value.efectivoEsperado = summary.value.montoInicial + summary.value.totalVentasEfectivo;
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
 * ✅ FIX: Validar preventivamente si ya tiene turno abierto
 */
const handleOpenShift = async () => {
  // Verificar si ya tiene un turno activo
  console.log('🔍 [MyShift] Verificando si hay turno activo antes de abrir modal...');
  await shiftStore.fetchActiveShift();

  if (shiftStore.hasActiveShift) {
    const mensaje = `⚠️ Ya tienes un turno abierto\n\n` +
                   `Debes cerrar el turno actual antes de abrir uno nuevo.\n\n` +
                   `Turno actual:\n` +
                   `• Caja: ${shiftStore.activeShift.caja_numero || 'N/A'}\n` +
                   `• Abierto: ${new Date(shiftStore.activeShift.fecha_apertura).toLocaleString('es-PE')}\n` +
                   `• Monto inicial: S/ ${shiftStore.activeShift.monto_inicial?.toFixed(2) || '0.00'}\n\n` +
                   `Por favor, cierra el turno en la sección "Mi Turno" a continuación.`;

    alert(mensaje);
    // Scroll automático a la sección "Mi Turno" si es necesario
    await loadShiftData();
    return;
  }

  // Si no hay turno activo, permitir abrir
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
      cashier.empleado_id, // ← AQUÍ enviamos el empleado_id
      pendingShiftData.value.sucursalId // ← AQUÍ enviamos el tiendadireccion_id
    );

    if (result.success) {
      pendingShiftData.value = null;

      // Reload shift data
      loadShiftData();
    } else {
      error.value = result.error || 'Error al abrir el turno';

      // ✅ FIX: Detectar si el error es por turno ya abierto
      const errorMessage = result.error || '';
      const hasTurnoAbierto = errorMessage.includes('turno abierto') ||
                              errorMessage.includes('shift') ||
                              errorMessage.includes('Ya tienes');

      if (hasTurnoAbierto) {
        // Ofrecer opciones al usuario
        const mensaje = `⚠️ Ya tienes un turno abierto\n\n${errorMessage}\n\n` +
                       `¿Qué deseas hacer?\n\n` +
                       `• OK: Ir a "Mi Turno" para cerrar el turno anterior\n` +
                       `• Cancelar: Quedarse aquí`;

        const irATurno = confirm(mensaje);

        if (irATurno) {
          // Recargar datos para mostrar el turno activo
          await loadShiftData();
        }
      } else {
        // Error genérico
        alert(`❌ Error al abrir turno:\n\n${errorMessage}`);
      }

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
  console.log('📥 [MyShift] Evento "shift-closed" recibido', {
    ...data,
    pin: data.pin ? '****' : 'N/A',
    data_type: typeof data,
    data_constructor: data?.constructor?.name
  });

  showCloseShiftModal.value = false;
  stopElapsedTimer();

  try {
    // ✅ FIX CRÍTICO: El PIN ya viene como string del modal, solo necesitamos extraerlo
    // No necesitamos toRaw() porque ya es un valor primitivo
    const pinValue = data.pin ? String(data.pin) : null;

    console.log('🔒 [MyShift] Llamando al API para cerrar turno...', {
      shiftId: shiftStore.activeShift?.id,
      montoReal: data.montoReal,
      has_pin: !!pinValue,
      pin_value_preview: pinValue ? '****' : 'null',
      pin_type: typeof pinValue
    });

    // Cerrar el turno en el backend
    // ✅ FIX: Pasar PIN para validación en backend
    const result = await shiftStore.closeShift(data.montoReal, data.notas, pinValue);

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
  } catch (error) {
    console.error('💥 [MyShift] EXCEPTION en onShiftClosed:', error);
    alert(`❌ Error inesperado:\n\n${error.message}`);
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
    'venta': 'bg-primary-100 text-primary-800',
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
 * Download CSV report for current shift
 */
const downloadCsvReport = () => {
  if (!shiftStore.hasActiveShift) {
    alert('No hay un turno activo para exportar');
    return;
  }

  try {
    // Pasar datos del cajero autenticado al CSV
    exportShiftReportToCsv(
      shiftStore.activeShift,
      movements.value,
      cashierStore.cashier
    );
  } catch (err) {
    console.error('Error downloading CSV:', err);
    alert('Error al generar el archivo CSV');
  }
};

/**
 * Download PDF report for current shift
 */
const downloadPdfReport = () => {
  if (!shiftStore.hasActiveShift) {
    alert('No hay un turno activo para exportar');
    return;
  }

  try {
    // Pasar datos del cajero autenticado al PDF
    exportShiftReportToPdf(
      shiftStore.activeShift,
      movements.value,
      cashierStore.cashier
    );
  } catch (err) {
    console.error('Error downloading PDF:', err);
    alert('Error al generar el archivo PDF');
  }
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
