<template>
  <div class="min-h-screen bg-gray-100">
    <template v-if="authStore.isAuthenticated">
      <!-- Navigation -->
      <nav class="bg-gray-800 flex-shrink-0">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-14 md:h-16">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <img src="@/assets/logo-mitiendapos.svg" alt="MiTiendaPOS Logo" class="h-7 md:h-8" />
              </div>
              <!-- Desktop menu link -->
              <div class="hidden md:block">
                <div class="ml-10 flex items-baseline space-x-4">
                  <router-link
                    v-if="showMenuButton && ['cajero', 'supervisor', 'administrador'].includes(authStore.userRole)"
                    to="/menu"
                    class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    active-class="bg-gray-900 text-white">
                    Menú Principal
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Mobile: compact action buttons -->
            <div class="flex items-center space-x-2 md:hidden">
              <!-- Open/Close Shift -->
              <button
                v-if="cashierStore.isCashierAuthenticated && !shiftStore.hasActiveShift"
                @click="handleOpenShift"
                class="bg-green-600 text-white hover:bg-green-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                title="Abrir turno">
                Abrir Turno
              </button>
              <button
                v-else-if="cashierStore.isCashierAuthenticated && shiftStore.hasActiveShift"
                @click="handleCloseShift"
                class="bg-red-600 text-white hover:bg-red-700 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                title="Cerrar turno">
                Cerrar
              </button>
              <!-- Mobile hamburger -->
              <button
                @click="mobileMenuOpen = !mobileMenuOpen"
                class="text-gray-300 hover:text-white p-1.5 rounded-md"
                title="Menú">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Desktop: full action bar -->
            <div class="hidden md:flex items-center space-x-4">
              <!-- Store and User Info -->
              <div class="text-right">
                <p class="text-gray-300 text-sm font-medium">
                  {{ authStore.selectedStore?.name || 'Sin tienda' }}
                  <span
                    v-if="authStore.tokenTiendaId != null"
                    :class="authStore.tokenStoreMismatch ? 'text-red-400 font-bold' : 'text-gray-500'"
                    :title="authStore.tokenStoreMismatch ? 'El token JWT apunta a una tienda distinta a la seleccionada' : 'tienda_id activo en el token'"
                  >
                    (#{{ authStore.tokenTiendaId }})
                  </span>
                  <span v-if="authStore.user?.name" class="text-gray-400">• {{ authStore.user.name }}</span>
                </p>
                <p v-if="cashierStore.isCashierAuthenticated" class="text-green-400 text-xs">
                  {{ cashierStore.cashierName }}
                </p>
                <p v-if="shiftStore.hasActiveShift" class="text-primary-400 text-xs">
                  <span v-if="sucursalNombre && sucursalNombre !== 'Sucursal'">{{ sucursalNombre }} • </span>Caja {{ cajaNumero }}
                </p>
                <p v-else-if="!cashierStore.isCashierAuthenticated" class="text-gray-500 text-xs italic">Sin cajero autenticado</p>
              </div>
              <!-- Open/Close Shift Button -->
              <button
                v-if="cashierStore.isCashierAuthenticated && !shiftStore.hasActiveShift"
                @click="handleOpenShift"
                class="bg-green-600 text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                title="Abrir turno">
                Abrir Turno
              </button>
              <button
                v-else-if="cashierStore.isCashierAuthenticated && shiftStore.hasActiveShift"
                @click="handleCloseShift"
                class="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                title="Cerrar turno">
                Cerrar Turno
              </button>
              <!-- Lock Button -->
              <button
                v-if="cashierStore.isCashierAuthenticated"
                @click="handleLock"
                class="bg-gray-700 text-gray-300 hover:bg-yellow-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                title="Bloquear caja">
                Bloquear
              </button>
              <!-- Logout Button -->
              <button @click="authStore.logout"
                class="bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile dropdown menu -->
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-700">
          <div class="px-3 py-3 space-y-2">
            <!-- Store info -->
            <div class="text-sm text-gray-300 px-2 pb-2 border-b border-gray-700">
              <p class="font-medium">{{ authStore.selectedStore?.name || 'Sin tienda' }}</p>
              <p v-if="cashierStore.isCashierAuthenticated" class="text-green-400 text-xs mt-0.5">
                {{ cashierStore.cashierName }}
              </p>
              <p v-if="shiftStore.hasActiveShift" class="text-primary-400 text-xs mt-0.5">
                <span v-if="sucursalNombre && sucursalNombre !== 'Sucursal'">{{ sucursalNombre }} • </span>Caja {{ cajaNumero }}
              </p>
            </div>
            <!-- Menu link -->
            <router-link
              v-if="showMenuButton && ['cajero', 'supervisor', 'administrador'].includes(authStore.userRole)"
              to="/menu"
              @click="mobileMenuOpen = false"
              class="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Menú Principal
            </router-link>
            <!-- Lock -->
            <button
              v-if="cashierStore.isCashierAuthenticated"
              @click="handleLock(); mobileMenuOpen = false"
              class="w-full text-left text-gray-300 hover:bg-yellow-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Bloquear Caja
            </button>
            <!-- Logout -->
            <button
              @click="authStore.logout(); mobileMenuOpen = false"
              class="w-full text-left text-gray-300 hover:bg-red-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <!-- Banner de sesión cruzada: el JWT apunta a una tienda distinta -->
      <div
        v-if="authStore.tokenStoreMismatch"
        class="bg-red-600 text-white px-4 py-3 flex items-center justify-between"
        role="alert"
      >
        <div class="text-sm">
          <strong>⚠️ Sesión cruzada detectada.</strong>
          La tienda seleccionada es
          <strong>{{ authStore.selectedStore?.name }} (#{{ authStore.selectedStore?.id }})</strong>
          pero el token activo pertenece a la tienda <strong>#{{ authStore.tokenTiendaId }}</strong>.
          Las ventas se procesarán contra la tienda del token. Cierra sesión y vuelve a entrar.
        </div>
        <button
          @click="authStore.logout"
          class="ml-4 bg-white text-red-700 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap"
        >
          Cerrar sesión
        </button>
      </div>
    </template>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
        <svg class="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <span class="text-gray-700">Cargando...</span>
      </div>
    </div>

    <!-- Lock Screen Modal -->
    <LockScreenModal
      v-model="showLockScreen"
      :cashierInfo="lockScreenInfo"
      :lockReason="cashierStore.lockReason"
      @unlocked="handleUnlock"
    />

    <!-- Open Shift Modal -->
    <OpenShiftModal
      v-model="showOpenShiftModal"
      @opened="onShiftOpened"
    />

    <!-- Close Shift Modal -->
    <CloseShiftModal
      v-model="showCloseShiftModal"
      :shift="shiftStore.activeShift"
      @shift-closed="onShiftClosed"
    />

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden">
      <router-view v-if="!isLoading"></router-view>
    </main>

    <!-- Global Error Handler -->
    <div v-if="errorMessage"
      class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
      <span class="block sm:inline">{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="absolute top-0 bottom-0 right-0 px-4 py-3">
        <span class="sr-only">Cerrar</span>
        <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useAuthStore } from './stores/auth';
import { useCashierStore } from './stores/cashier';
import { useShiftStore } from './stores/shift';
import { useRouter, useRoute } from 'vue-router';
import LockScreenModal from './components/LockScreenModal.vue';
import OpenShiftModal from './components/OpenShiftModal.vue';
import CloseShiftModal from './components/CloseShiftModal.vue';

const authStore = useAuthStore();
const cashierStore = useCashierStore();
const shiftStore = useShiftStore();
const router = useRouter();
const route = useRoute();
const errorMessage = ref('');
const isLoading = ref(true);
const showLockScreen = ref(false);
const showOpenShiftModal = ref(false);
const showCloseShiftModal = ref(false);
const pendingShiftData = ref(null);
const mobileMenuOpen = ref(false);

// Configuración de inactividad
const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutos en milisegundos
let inactivityTimer = null;
let lastActivity = Date.now();

// Info para el lock screen
const lockScreenInfo = computed(() => {
  if (!cashierStore.cashier) return null;
  return {
    nombre: cashierStore.cashierName,
    sucursal: cashierStore.sucursal?.nombre || cashierStore.sucursal?.tiendadireccion_nombresucursal || 'Sucursal',
    cajaNumero: cashierStore.cajaNumero
  };
});

// Computed para ocultar botón "Menú Principal" cuando ya estás en el menú
const showMenuButton = computed(() => route.path !== '/menu');

// Close mobile menu on navigation
watch(() => route.path, () => { mobileMenuOpen.value = false; });

// Computed para mostrar sucursal y caja del turno activo
const sucursalNombre = computed(() => {
  if (!shiftStore.activeShift) return 'Sucursal';

  // Intentar obtener el nombre de la sucursal desde diferentes fuentes
  if (cashierStore.sucursal?.nombre) {
    return cashierStore.sucursal.nombre;
  }
  if (cashierStore.sucursal?.tiendadireccion_nombresucursal) {
    return cashierStore.sucursal.tiendadireccion_nombresucursal;
  }
  if (shiftStore.activeShift.sucursal_nombre) {
    return shiftStore.activeShift.sucursal_nombre;
  }
  return 'Sucursal';
});

const cajaNumero = computed(() => {
  if (!shiftStore.activeShift) return 1;

  // El campo caja_numero puede venir como "Caja 1" o simplemente "1"
  const cajaNum = shiftStore.activeShift.caja_numero;
  if (!cajaNum) return 1;

  // Si es string tipo "Caja 1", extraer el número
  if (typeof cajaNum === 'string') {
    const match = cajaNum.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  }

  return cajaNum;
});

// Bloqueo manual
const handleLock = () => {
  cashierStore.lock('Bloqueo manual');
  showLockScreen.value = true;
};

// Desbloqueo
const handleUnlock = async () => {
  cashierStore.unlock();
  resetInactivityTimer();

  // ✅ FIX: Refrescar estado del turno después de desbloquear
  // Esto asegura que los botones "Abrir Turno" / "Cerrar Turno" reflejen el estado correcto
  await shiftStore.fetchActiveShift();
  console.log('🔄 [APP] Estado del turno actualizado después de desbloquear:', {
    hasActiveShift: shiftStore.hasActiveShift,
    shiftId: shiftStore.activeShift?.id
  });
};

// Handle open shift
const handleOpenShift = () => {
  showOpenShiftModal.value = true;
};

// Handle close shift
const handleCloseShift = () => {
  if (!cashierStore.isCashierAuthenticated) {
    alert('⚠️ Debes autenticarte como cajero primero');
    return;
  }
  showCloseShiftModal.value = true;
};

// On shift opened
const onShiftOpened = async (data) => {
  showOpenShiftModal.value = false;

  // Guardar información de sucursal y caja en el cashier store
  cashierStore.setSucursal({
    id: data.sucursalId,
    nombre: data.sucursalNombre,
    tiendadireccion_nombresucursal: data.sucursalNombre
  });
  cashierStore.setCajaNumero(data.cajaNumero);

  // Guardar datos para crear turno
  pendingShiftData.value = {
    montoInicial: data.montoInicial,
    notas: data.notas,
    cajaNumero: data.cajaNumero
  };

  try {
    const result = await shiftStore.openShift(
      data.montoInicial,
      data.notas,
      `Caja ${data.cajaNumero}`,
      cashierStore.cashier.empleado_id,
      data.sucursalId // tiendadireccion_id
    );

    if (result.success) {
      // Refrescar estado
      await shiftStore.fetchActiveShift();
      pendingShiftData.value = null;
    } else {
      alert(`❌ Error al abrir turno:\n\n${result.error}`);
    }
  } catch (err) {
    console.error('Error opening shift:', err);
    alert(`❌ Error inesperado:\n\n${err.message}`);
  }
};

// On shift closed
const onShiftClosed = async (data) => {
  console.log('📥 [APP] Evento "shift-closed" recibido', { ...data, pin: data.pin ? '****' : 'N/A' });

  showCloseShiftModal.value = false;

  // ✅ FIX: Pasar PIN para validación en backend
  const result = await shiftStore.closeShift(data.montoReal, data.notas, data.pin);

  if (result.success) {
    // Refrescar estado
    await shiftStore.fetchActiveShift();

    // Redirigir al menú si está en módulo POS
    if (route.path === '/pos') {
      router.push('/menu');
    }
  } else {
    alert(`❌ Error al cerrar turno:\n\n${result.error}`);
  }
};

// Resetear timer de inactividad
const resetInactivityTimer = () => {
  lastActivity = Date.now();

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  // Solo activar timer si hay cajero autenticado y no está bloqueado
  if (cashierStore.isCashierAuthenticated && !cashierStore.locked) {
    inactivityTimer = setTimeout(() => {
      // Bloquear por inactividad
      cashierStore.lock('Inactividad detectada');
      showLockScreen.value = true;
      console.log('⏱️ [APP] Caja bloqueada por inactividad');
    }, INACTIVITY_TIMEOUT);
  }
};

// Detectar actividad del usuario
const handleUserActivity = () => {
  // Solo resetear si hay cajero autenticado y no está bloqueado
  if (cashierStore.isCashierAuthenticated && !cashierStore.locked) {
    resetInactivityTimer();
  }
};

// Watch para mostrar lock screen cuando se bloquea
watch(() => cashierStore.locked, (isLocked) => {
  showLockScreen.value = isLocked;

  if (isLocked) {
    // Detener el timer cuando se bloquea
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  } else {
    // Reiniciar timer cuando se desbloquea
    resetInactivityTimer();
  }
});

// Watch para iniciar/detener timer cuando cambia autenticación
watch(() => cashierStore.isCashierAuthenticated, (isAuth) => {
  if (isAuth) {
    resetInactivityTimer();
  } else {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  }
});

// Global error handler
window.onerror = (message) => {
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = '';
  }, 5000);
};

// Check session on app initialization
onMounted(async () => {
  try {
    await authStore.checkSession();

    // Restaurar sesión de cajero desde localStorage
    console.log('🔄 [APP] Intentando restaurar sesión de cajero...');
    const cashierRestored = cashierStore.restoreSession();
    if (cashierRestored) {
      console.log('✅ [APP] Sesión de cajero restaurada:', cashierStore.cashierName);

      // ✅ FIX: Cargar estado del turno después de restaurar cajero
      // Esto asegura que los botones muestren el estado correcto después de un hard refresh
      await shiftStore.fetchActiveShift();
      console.log('🔄 [APP] Estado del turno cargado en inicialización:', {
        hasActiveShift: shiftStore.hasActiveShift,
        shiftId: shiftStore.activeShift?.id
      });
    } else {
      console.log('ℹ️ [APP] No hay sesión de cajero para restaurar');
    }

    // Configurar listeners de actividad
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Iniciar timer si hay cajero autenticado
    if (cashierStore.isCashierAuthenticated) {
      resetInactivityTimer();
    }
  } catch (error) {
    console.error('Error checking session:', error);
    errorMessage.value = 'Error al verificar la sesión';
  } finally {
    isLoading.value = false;
  }
});

// Cleanup
onBeforeUnmount(() => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  // Remover listeners
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  events.forEach(event => {
    document.removeEventListener(event, handleUserActivity, true);
  });
});
</script>

<style>
/* Tailwind CSS */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
</style>
