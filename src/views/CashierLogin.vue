<template>
  <div class="min-h-screen bg-gray-800 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <img src="@/assets/logo-mitiendapos.svg" alt="MiTiendaPOS" class="h-16 mx-auto mb-4" />
        <h2 class="text-3xl font-extrabold text-white">
          Acceso Rápido Cajeros
        </h2>
        <p class="mt-2 text-gray-300">
          Ingresa tu tienda y PIN para comenzar
        </p>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6 bg-white rounded-2xl shadow-2xl p-8" @submit.prevent="handleLogin">
        <!-- Store ID -->
        <div>
          <label for="store_id" class="block text-sm font-medium text-gray-700 mb-2">
            ID de Tienda
          </label>
          <input
            id="store_id"
            v-model="storeId"
            type="text"
            inputmode="numeric"
            required
            class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
            :disabled="loading"
            @input="storeId = storeId.replace(/\D/g, '')"
          />
          <p class="text-xs text-gray-500 mt-1">Número de tu tienda</p>
        </div>

        <!-- PIN -->
        <div>
          <label for="pin" class="block text-sm font-medium text-gray-700 mb-2">
            PIN de Cajero
          </label>
          <input
            id="pin"
            ref="pinInput"
            v-model="pin"
            type="password"
            inputmode="numeric"
            pattern="[0-9]{4}"
            maxlength="4"
            required
            placeholder="••••"
            autocomplete="off"
            class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-2xl text-center tracking-widest font-bold"
            :disabled="loading"
            @input="pin = pin.replace(/\D/g, '')"
          />
          <p class="text-xs text-gray-500 mt-1 text-center">4 dígitos</p>
        </div>

        <!-- Error -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-red-700 font-medium">{{ error }}</p>
          </div>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading || !isValid"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
        >
          <span v-if="loading" class="flex items-center">
            <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Ingresando...
          </span>
          <span v-else class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
            </svg>
            Ingresar al POS
          </span>
        </button>
      </form>

      <!-- Link a login admin -->
      <div class="text-center">
        <router-link
          to="/login"
          class="text-gray-300 hover:text-white font-medium transition-colors inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          ¿Eres administrador? Ingresa aquí
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCashierStore } from '../stores/cashier';
import { authApi } from '../services/authApi';

const router = useRouter();
const authStore = useAuthStore();
const cashierStore = useCashierStore();

const storeId = ref('');
const pin = ref('');
const loading = ref(false);
const error = ref(null);
const pinInput = ref(null);

const isValid = computed(() => {
  return storeId.value.length > 0 && pin.value.length === 4;
});

const handleLogin = async () => {
  if (!isValid.value || loading.value) return;

  loading.value = true;
  error.value = null;

  try {
    console.log('🔐 [CASHIER LOGIN] Intentando login con store_id + PIN');

    const response = await authApi.cashierLogin(parseInt(storeId.value), pin.value);

    if (!response.success) {
      throw new Error(response.message || 'Error de autenticación');
    }

    const { access_token, empleado, tienda } = response.data;

    console.log('✅ [CASHIER LOGIN] Login exitoso:', {
      empleado: `${empleado.nombres} ${empleado.apellidos}`,
      cajero_id: empleado.id,
      netsuite_id: empleado.netsuite_id || 'No asignado',
      tienda: tienda.nombre,
      tienda_id: tienda.id
    });

    // 1. Guardar token y datos en authStore
    authStore.accessToken = access_token;
    authStore.user = {
      id: null,  // cajeros no tienen user_id
      name: null,  // NO guardar nombre aquí, se muestra desde cashierStore
      email: null,
      role: empleado.rol,
      user_type: 'cashier'
    };
    authStore.selectedStore = {
      id: parseInt(tienda.id),
      name: tienda.nombre,
      ruc: tienda.ruc
    };

    // 2. Guardar en localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(authStore.user));
    localStorage.setItem('selected_store', JSON.stringify(authStore.selectedStore));

    // 3. Auto-autenticar en cashierStore
    cashierStore.cashier = {
      empleado_id: empleado.id,
      empleado_nombres: empleado.nombres,
      empleado_apellidos: empleado.apellidos,
      empleado_rol: empleado.rol,
      empleado_netsuite_id: empleado.netsuite_id || null,
      sucursales_ids: empleado.sucursales_ids || null
    };
    cashierStore.authenticated = true;

    localStorage.setItem('cashier_session', JSON.stringify({
      cashier: cashierStore.cashier,
      authenticatedAt: new Date().toISOString()
    }));

    console.log('✅ [CASHIER LOGIN] Sesiones guardadas, redirigiendo a /menu');

    // 4. Redirigir al menú
    router.push('/menu');

  } catch (err) {
    console.error('❌ [CASHIER LOGIN] Error:', err);
    error.value = err.response?.data?.messages?.error || err.message || 'Error al iniciar sesión';
    pin.value = ''; // Limpiar PIN
    pinInput.value?.focus();
  } finally {
    loading.value = false;
  }
};

// Removido auto-focus automático para permitir IDs de tienda con más de 4 dígitos
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s;
}
</style>
