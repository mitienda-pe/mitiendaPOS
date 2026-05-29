<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="flex justify-center">
        <img src="@/assets/logo-mitiendapos-wb.svg" alt="MiTiendaPOS Logo" class="h-12" />
      </div>

      <!-- Validando token -->
      <div v-if="validating" class="flex flex-col items-center justify-center py-8">
        <svg class="animate-spin h-10 w-10 text-primary-600" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="mt-4 text-gray-500">Verificando enlace...</p>
      </div>

      <!-- Token inválido -->
      <div v-else-if="tokenInvalid" class="text-center space-y-4">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Enlace inválido</h2>
        <p class="text-gray-500">{{ tokenError }}</p>
        <router-link
          to="/forgot-password"
          class="inline-block py-2 px-4 rounded-md text-white bg-primary-600 hover:bg-primary-700 text-sm font-medium"
        >
          Solicitar nuevo enlace
        </router-link>
      </div>

      <!-- Éxito -->
      <div v-else-if="resetSuccess" class="text-center space-y-4">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Contraseña actualizada</h2>
        <p class="text-gray-500">Tu contraseña se cambió correctamente. Serás redirigido al inicio de sesión.</p>
      </div>

      <!-- Formulario -->
      <div v-else>
        <h2 class="text-center text-2xl font-extrabold text-gray-900 mb-2">Nueva contraseña</h2>
        <p class="text-center text-sm text-gray-500 mb-6">Ingresa tu nueva contraseña.</p>

        <form class="space-y-6" @submit.prevent="handleReset">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <input
              id="password"
              v-model="password"
              type="password"
              :disabled="loading"
              placeholder="Mínimo 8 caracteres"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              :disabled="loading"
              placeholder="Repite tu contraseña"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <div v-if="error" class="text-red-600 text-sm text-center">{{ error }}</div>

          <button
            type="submit"
            :disabled="loading || !password || !confirmPassword"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {{ loading ? 'Guardando...' : 'Cambiar contraseña' }}
          </button>
        </form>
      </div>

      <div v-if="!validating" class="text-center mt-4">
        <router-link to="/login" class="text-sm text-primary-600 hover:text-primary-500 font-medium">
          ← Volver a iniciar sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authApi } from '../services/authApi';

const route = useRoute();
const router = useRouter();

const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);
const validating = ref(true);
const tokenInvalid = ref(false);
const tokenError = ref('');
const resetSuccess = ref(false);

onMounted(async () => {
  token.value = route.query.token || '';

  if (!token.value) {
    tokenInvalid.value = true;
    tokenError.value = 'No se proporcionó un token de restablecimiento.';
    validating.value = false;
    return;
  }

  try {
    const response = await authApi.validateResetToken(token.value);
    if (!(response.success && response.data?.valid)) {
      tokenInvalid.value = true;
      tokenError.value = response.data?.message || 'El enlace ha expirado o ya fue utilizado.';
    }
  } catch {
    tokenInvalid.value = true;
    tokenError.value = 'Error al verificar el enlace. Intenta de nuevo.';
  } finally {
    validating.value = false;
  }
});

const handleReset = async () => {
  error.value = '';

  if (password.value.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres';
    return;
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }

  loading.value = true;
  try {
    const response = await authApi.resetPassword({
      token: token.value,
      password: password.value,
      passwordConfirmation: confirmPassword.value,
    });

    if (response.success) {
      resetSuccess.value = true;
      setTimeout(() => router.push('/login'), 3000);
    } else {
      error.value = response.message || 'Error al cambiar la contraseña';
    }
  } catch (e) {
    error.value = e?.response?.data?.message
      || e?.response?.data?.messages?.error
      || 'Error al cambiar la contraseña. El enlace puede haber expirado.';
  } finally {
    loading.value = false;
  }
};
</script>
