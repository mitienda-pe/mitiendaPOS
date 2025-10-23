<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Menú Principal</h1>


    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 1. Dashboard -->
      <router-link to="/dashboard" class="block">
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full border-l-4 border-orange-500">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-orange-500 mb-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
            <h2 class="text-xl font-medium text-gray-900 mb-2">Dashboard</h2>
            <p class="text-gray-600 text-center">Visualiza indicadores y gráficos</p>
          </div>
        </div>
      </router-link>

      <!-- 2. Turnos de Caja (Caja) - DINÁMICO -->
      <div class="block">
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full"
          :class="shiftStore.hasActiveShift ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg"
              :class="shiftStore.hasActiveShift ? 'text-green-500' : 'text-red-500'" class="h-16 w-16 mb-4"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <circle cx="8" cy="8" r="6"/>
              <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
              <path d="M7 6h1v4"/>
              <path d="m16.71 13.88.7.71-2.82 2.82"/>
            </svg>

            <h2 class="text-xl font-medium text-gray-900 mb-2">Caja</h2>

            <!-- Estado del turno -->
            <div v-if="shiftStore.hasActiveShift" class="w-full mb-3">
              <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                <p class="text-xs font-medium text-green-800 mb-1">Turno Abierto</p>
                <p class="text-sm text-green-700">Inicio: {{ formatTime(shiftStore.activeShift.fecha_apertura) }}</p>
                <p class="text-lg font-bold text-green-900 mt-1">
                  S/ {{ shiftStore.activeShift.monto_inicial.toFixed(2) }}
                </p>
                <p v-if="shiftStore.activeShift.caja_numero" class="text-xs text-green-600 mt-1">
                  {{ shiftStore.activeShift.caja_numero }}
                </p>
              </div>
              <button @click="handleCloseShift"
                class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                Cerrar Turno
              </button>
            </div>

            <div v-else class="w-full">
              <p class="text-gray-600 text-sm mb-3">No hay turno activo</p>
              <button @click="handleOpenShift"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                Abrir Turno
              </button>
            </div>

            <!-- Link al historial -->
            <router-link to="/shifts" class="text-xs text-blue-600 hover:text-blue-800 mt-3 underline">
              Ver historial de turnos
            </router-link>
          </div>
        </div>
      </div>

      <!-- 3. POS -->
      <router-link to="/pos" class="block">
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full border-l-4 border-blue-500">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-blue-500 mb-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <h2 class="text-xl font-medium text-gray-900 mb-2">POS</h2>
            <p class="text-gray-600 text-center">Gestiona ventas y emite comprobantes</p>
          </div>
        </div>
      </router-link>

      <!-- 4. Ventas -->
      <router-link to="/sales" class="block">
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full border-l-4 border-pink-500">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-pink-500 mb-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"></path>
              <path
                d="M18.4 8.64L18.57 8.8a2 2 0 0 1 0 2.83l-8.49 8.48a2 2 0 0 1-2.83 0l-.17-.17a2 2 0 0 1 0-2.83l8.49-8.48a2 2 0 0 1 2.83 0Z">
              </path>
              <path d="M15 8h5v5"></path>
              <path d="M18 11l-7 7"></path>
            </svg>
            <h2 class="text-xl font-medium text-gray-900 mb-2">Ventas</h2>
            <p class="text-gray-600 text-center">Consulta el historial de ventas</p>
          </div>
        </div>
      </router-link>

      <!-- 5. Documentos -->
      <router-link to="/documents" class="block">
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full border-l-4 border-yellow-500">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-yellow-500 mb-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h2 class="text-xl font-medium text-gray-900 mb-2">Documentos</h2>
            <p class="text-gray-600 text-center">Gestiona documentos y comprobantes</p>
          </div>
        </div>
      </router-link>

      <!-- 6. Inventario -->
      <router-link to="/inventory" class="block">
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full border-l-4 border-lime-500">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-lime-500 mb-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
              <path d="m7 16.5-4.74-2.85" />
              <path d="m7 16.5 5-3" />
              <path d="M7 16.5v5.17" />
              <path
                d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
              <path d="m17 16.5-5-3" />
              <path d="m17 16.5 4.74-2.85" />
              <path d="M17 16.5v5.17" />
              <path
                d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
              <path d="M12 8 7.26 5.15" />
              <path d="m12 8 4.74-2.85" />
              <path d="M12 13.5V8" />
            </svg>
            <h2 class="text-xl font-medium text-gray-900 mb-2">Inventario</h2>
            <p class="text-gray-600 text-center">Gestiona productos, stock y categorías</p>
          </div>
        </div>
      </router-link>

      <!-- 7. Descuentos y Promociones -->
      <router-link to="/promotions" class="block">
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full border-l-4 border-rose-500">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-rose-500 mb-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="5" x2="5" y2="19"></line>
              <circle cx="6.5" cy="6.5" r="2.5"></circle>
              <circle cx="17.5" cy="17.5" r="2.5"></circle>
            </svg>
            <h2 class="text-xl font-medium text-gray-900 mb-2">Descuentos y Promociones</h2>
            <p class="text-gray-600 text-center">Gestiona ofertas y promociones</p>
          </div>
        </div>
      </router-link>

      <!-- 8. Vales y Tarjetas de Regalo -->
      <router-link to="/vouchers" class="block">
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full border-l-4 border-amber-500">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-amber-500 mb-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="8" width="18" height="4" rx="1" />
              <path d="M12 8v13" />
              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
              <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
            </svg>
            <h2 class="text-xl font-medium text-gray-900 mb-2">Vales y Tarjetas de Regalo</h2>
            <p class="text-gray-600 text-center">Gestiona vales de consumo y tarjetas de regalo</p>
          </div>
        </div>
      </router-link>

      <!-- 9. Clientes -->
      <router-link to="/customers" class="block">
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full border-l-4 border-purple-500">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-purple-500 mb-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <h2 class="text-xl font-medium text-gray-900 mb-2">Clientes</h2>
            <p class="text-gray-600 text-center">Administra tu cartera de clientes</p>
          </div>
        </div>
      </router-link>

      <!-- 10. Cambios y devoluciones -->
      <router-link to="/returns" class="block">
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full border-l-4 border-cyan-500">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-cyan-500 mb-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
              <path d="M16 16h5v5"></path>
            </svg>
            <h2 class="text-xl font-medium text-gray-900 mb-2">Cambios y devoluciones</h2>
            <p class="text-gray-600 text-center">Gestiona cambios y devoluciones de productos</p>
          </div>
        </div>
      </router-link>

      <!-- 11. Configuración -->
      <router-link to="/settings" class="block">
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full border-l-4 border-gray-500">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-500 mb-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
              </path>
            </svg>
            <h2 class="text-xl font-medium text-gray-900 mb-2">Configuración</h2>
            <p class="text-gray-600 text-center">Preferencias, sucursales y usuarios</p>
          </div>
        </div>
      </router-link>

      <!-- 12. Ayuda -->
      <a href="https://docs.mitienda.pe" target="_blank" class="block">
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full border-l-4 border-sky-500">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-sky-500 mb-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h2 class="text-xl font-medium text-gray-900 mb-2">Ayuda</h2>
            <p class="text-gray-600 text-center">Documentación y soporte</p>
          </div>
        </div>
      </a>

      <!-- Nota: Botón "Cambiar Tienda" eliminado - Para cambiar de tienda, hacer logout -->
    </div>

    <!-- Modals -->
    <OpenShiftModal v-model="showOpenShiftModal" @opened="onShiftOpened" />

    <CloseShiftModal v-model="showCloseShiftModal" :shift="shiftStore.activeShift" @closed="onShiftClosed" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useShiftStore } from '../stores/shift';
import { useAuthStore } from '../stores/auth';
import OpenShiftModal from '../components/OpenShiftModal.vue';
import CloseShiftModal from '../components/CloseShiftModal.vue';

const shiftStore = useShiftStore();
const authStore = useAuthStore();
const showOpenShiftModal = ref(false);
const showCloseShiftModal = ref(false);

onMounted(async () => {
  // Load active shift on mount
  await shiftStore.fetchActiveShift();
});

const handleOpenShift = () => {
  showOpenShiftModal.value = true;
};

const handleCloseShift = () => {
  showCloseShiftModal.value = true;
};

const onShiftOpened = async (data) => {
  const result = await shiftStore.openShift(data.montoInicial, data.notas, data.cajaNumero);

  if (result.success) {
    showOpenShiftModal.value = false;
    const mensajeBase = 'Turno abierto exitosamente';
    const mensajeCaja = data.cajaNumero ? `\nCaja: ${data.cajaNumero}` : '';
    alert(mensajeBase + mensajeCaja);
  } else {
    alert(result.error || 'Error al abrir el turno');
  }
};

const onShiftClosed = async (data) => {
  const result = await shiftStore.closeShift(data.montoReal, data.notas);

  if (result.success) {
    showCloseShiftModal.value = false;
    const shift = result.data;
    const diferencia = shift.diferencia;

    let mensaje = 'Turno cerrado exitosamente\n\n';
    mensaje += `Esperado: S/ ${shift.monto_esperado.toFixed(2)}\n`;
    mensaje += `Real: S/ ${shift.monto_real.toFixed(2)}\n`;

    if (diferencia > 0) {
      mensaje += `\nSobrante: S/ ${diferencia.toFixed(2)}`;
    } else if (diferencia < 0) {
      mensaje += `\nFaltante: S/ ${Math.abs(diferencia).toFixed(2)}`;
    } else {
      mensaje += `\n¡Cuadrado perfecto! ✓`;
    }

    alert(mensaje);
  } else {
    alert(result.error || 'Error al cerrar el turno');
  }
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  });
};

</script>
